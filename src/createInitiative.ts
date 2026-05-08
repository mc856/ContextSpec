import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { parseDocument, YAMLMap, YAMLSeq } from 'yaml';
import {
  INITIATIVE_ACCEPTANCE_MD,
  INITIATIVE_BRIEF_MD,
  INITIATIVE_CONTEXT_MAP_MD,
  INITIATIVE_DECISIONS_MD,
  INITIATIVE_PLAN_MD,
  INITIATIVE_TASKS_MD,
} from './templates.js';

export interface CreateInitiativeOptions {
  /** project root containing `.contextspec/` */
  cwd: string;
  /** initiative id; must be a kebab-case slug */
  id: string;
  /** roles attached to the initiative; defaults to all roles in the registry */
  roles?: string[];
  /** domain ids attached to the initiative */
  domains?: string[];
  /** project ids attached to the initiative */
  projects?: string[];
  /** if true, overwrite existing initiative files and re-register */
  force?: boolean;
}

export interface CreateInitiativeResult {
  initiativeRoot: string;
  written: string[];
  skipped: string[];
  warnings: string[];
}

const ID_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

const INITIATIVE_FILES = (id: string): Array<{ rel: string; body: string }> => [
  { rel: 'brief.md', body: INITIATIVE_BRIEF_MD(id) },
  { rel: 'context-map.md', body: INITIATIVE_CONTEXT_MAP_MD },
  { rel: 'plan.md', body: INITIATIVE_PLAN_MD },
  { rel: 'tasks.md', body: INITIATIVE_TASKS_MD },
  { rel: 'acceptance.md', body: INITIATIVE_ACCEPTANCE_MD },
  { rel: 'decisions.md', body: INITIATIVE_DECISIONS_MD },
];

export function createInitiative(
  opts: CreateInitiativeOptions,
): CreateInitiativeResult {
  if (!ID_RE.test(opts.id)) {
    throw new Error(
      `invalid initiative id '${opts.id}': use kebab-case (lowercase letters, digits, hyphens)`,
    );
  }

  const contextRoot = resolvePath(opts.cwd, '.contextspec');
  const registryPath = join(contextRoot, 'registry.yaml');
  if (!existsSync(registryPath)) {
    throw new Error(
      `${registryPath} not found. Run \`contextspec init\` first.`,
    );
  }

  const yamlText = readFileSync(registryPath, 'utf8');
  const doc = parseDocument(yamlText);

  const declaredRoles = roleIdsOf(doc);
  if (declaredRoles.length === 0) {
    throw new Error('registry.yaml has no roles declared');
  }
  const roles = opts.roles ?? declaredRoles;

  const warnings: string[] = [];
  for (const r of roles) {
    if (!declaredRoles.includes(r)) {
      warnings.push(
        `role '${r}' is not declared in registry.yaml; pack compilation will fail until added`,
      );
    }
  }
  for (const d of opts.domains ?? []) {
    if (!hasMappingKey(doc, 'domains', d)) {
      warnings.push(
        `domain '${d}' is not declared in registry.yaml; pack will skip it until added`,
      );
    }
  }
  for (const p of opts.projects ?? []) {
    if (!hasMappingKey(doc, 'projects', p)) {
      warnings.push(
        `project '${p}' is not declared in registry.yaml; pack will skip it until added`,
      );
    }
  }

  const initiativesNode = ensureMapping(doc, 'initiatives');
  const exists = initiativesNode.has(opts.id);
  if (exists && !opts.force) {
    throw new Error(
      `initiative '${opts.id}' already exists in registry.yaml. Pass --force to overwrite.`,
    );
  }

  const declPlain: Record<string, unknown> = {
    path: `initiatives/${opts.id}`,
    roles,
  };
  if (opts.domains?.length) declPlain.domains = opts.domains;
  if (opts.projects?.length) declPlain.projects = opts.projects;
  const entryNode = doc.createNode(declPlain);
  forceBlockStyle(entryNode);
  initiativesNode.set(opts.id, entryNode);
  // The original `initiatives: {}` is parsed as a flow-style empty map.
  // After adding entries we want block style so the file stays diff-friendly.
  initiativesNode.flow = false;

  writeFileSync(registryPath, String(doc));

  const initiativeRoot = join(contextRoot, 'initiatives', opts.id);
  const written: string[] = [];
  const skipped: string[] = [];
  for (const f of INITIATIVE_FILES(opts.id)) {
    const abs = join(initiativeRoot, f.rel);
    if (existsSync(abs) && !opts.force) {
      skipped.push(`initiatives/${opts.id}/${f.rel}`);
      continue;
    }
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, f.body);
    written.push(`initiatives/${opts.id}/${f.rel}`);
  }
  // Always create packs/ so users can find the output destination.
  const packsDir = join(initiativeRoot, 'packs');
  if (!existsSync(packsDir)) mkdirSync(packsDir, { recursive: true });

  return { initiativeRoot, written, skipped, warnings };
}

function roleIdsOf(doc: ReturnType<typeof parseDocument>): string[] {
  const roles = doc.get('roles');
  if (!(roles instanceof YAMLMap)) return [];
  return roles.items
    .map((it) => (it.key as { value?: unknown })?.value)
    .filter((k): k is string => typeof k === 'string');
}

function hasMappingKey(
  doc: ReturnType<typeof parseDocument>,
  parent: string,
  key: string,
): boolean {
  const node = doc.get(parent);
  return node instanceof YAMLMap && node.has(key);
}

function forceBlockStyle(node: unknown): void {
  if (node instanceof YAMLMap || node instanceof YAMLSeq) {
    node.flow = false;
    for (const it of node.items) {
      if (node instanceof YAMLMap) {
        forceBlockStyle((it as { value?: unknown }).value);
      } else {
        forceBlockStyle(it);
      }
    }
  }
}

function ensureMapping(
  doc: ReturnType<typeof parseDocument>,
  key: string,
): YAMLMap {
  const node = doc.get(key);
  if (node instanceof YAMLMap) return node;
  const empty = new YAMLMap();
  doc.set(key, empty);
  return empty;
}
