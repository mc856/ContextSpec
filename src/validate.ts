import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs';
import { join as joinPath, relative, resolve as resolvePath } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { compilePack } from './compile.js';
import type { Registry } from './registry.js';
import { scanSourceLinks, validateSourceLink } from './sources.js';

export interface ValidationIssue {
  key: string;
  message: string;
  path?: string;
}

export interface ValidateOptions {
  registry: Registry;
  /** absolute path to `.contextspec/` */
  contextRoot: string;
  /** enable stale-pack checks */
  strict?: boolean;
}

export interface ValidateResult {
  issues: ValidationIssue[];
}

export function validateContextSpec(opts: ValidateOptions): ValidateResult {
  const { registry, contextRoot, strict = false } = opts;
  const issues: ValidationIssue[] = [];

  const addIssue = (key: string, message: string, path?: string) => {
    issues.push({ key, message, path });
  };

  const checkRelPath = (key: string, relPath: string) => {
    const absPath = resolvePath(contextRoot, relPath);
    if (!existsSync(absPath)) {
      addIssue(key, `${key}: missing path '${relPath}'`, relPath);
    }
  };

  for (let i = 0; i < registry.context.includes.length; i++) {
    checkRelPath(`context.includes[${i}]`, registry.context.includes[i]!);
  }

  for (const [roleId, roleDecl] of Object.entries(registry.roles)) {
    checkRelPath(`roles.${roleId}.file`, roleDecl.file);
    for (let i = 0; i < (roleDecl.includes ?? []).length; i++) {
      checkRelPath(`roles.${roleId}.includes[${i}]`, roleDecl.includes![i]!);
    }
  }

  for (const [domainId, domainDecl] of Object.entries(registry.domains ?? {})) {
    for (let i = 0; i < (domainDecl.includes ?? []).length; i++) {
      checkRelPath(`domains.${domainId}.includes[${i}]`, domainDecl.includes![i]!);
    }
  }

  for (const [projectId, projectDecl] of Object.entries(registry.projects ?? {})) {
    for (let i = 0; i < (projectDecl.includes ?? []).length; i++) {
      checkRelPath(`projects.${projectId}.includes[${i}]`, projectDecl.includes![i]!);
    }
  }

  for (const [initiativeId, initiativeDecl] of Object.entries(registry.initiatives ?? {})) {
    const initKey = `initiatives.${initiativeId}.path`;
    const initAbs = resolvePath(contextRoot, initiativeDecl.path);
    if (!existsSync(initAbs)) {
      addIssue(initKey, `${initKey}: missing path '${initiativeDecl.path}'`, initiativeDecl.path);
      continue;
    }

    for (let i = 0; i < (initiativeDecl.roles ?? []).length; i++) {
      const roleId = initiativeDecl.roles![i]!;
      if (!registry.roles[roleId]) {
        addIssue(
          `initiatives.${initiativeId}.roles[${i}]`,
          `initiatives.${initiativeId}.roles[${i}]: unknown role '${roleId}'`,
        );
      }
    }

    for (let i = 0; i < (initiativeDecl.domains ?? []).length; i++) {
      const domainId = initiativeDecl.domains![i]!;
      if (!registry.domains?.[domainId]) {
        addIssue(
          `initiatives.${initiativeId}.domains[${i}]`,
          `initiatives.${initiativeId}.domains[${i}]: unknown domain '${domainId}'`,
        );
      }
    }

    for (let i = 0; i < (initiativeDecl.projects ?? []).length; i++) {
      const projectId = initiativeDecl.projects![i]!;
      if (!registry.projects?.[projectId]) {
        addIssue(
          `initiatives.${initiativeId}.projects[${i}]`,
          `initiatives.${initiativeId}.projects[${i}]: unknown project '${projectId}'`,
        );
      }
    }

    if (strict) {
      validatePacksForInitiative({
        registry,
        contextRoot,
        initiativeId,
        initiativePath: initiativeDecl.path,
        addIssue,
      });
    }
  }

  for (const relPath of discoverCuratedMarkdownFiles(contextRoot)) {
    const absPath = resolvePath(contextRoot, relPath);
    const text = readFileSync(absPath, 'utf8');
    for (const link of scanSourceLinks(text)) {
      const validation = validateSourceLink(link, registry.sources);
      if (!validation.ok) {
        addIssue(
          relPath,
          `${relPath}: invalid source link '${link.raw}' (${validation.reason})`,
          relPath,
        );
      }
    }
  }

  return { issues };
}

function discoverCuratedMarkdownFiles(contextRoot: string): string[] {
  const out: string[] = [];
  walkMarkdown(contextRoot, '', out, false);
  return out;
}

function walkMarkdown(
  absDir: string,
  relDir: string,
  out: string[],
  underPacks: boolean,
) {
  for (const entry of readdirSync(absDir, { withFileTypes: true })) {
    const relPath = relDir ? joinPath(relDir, entry.name) : entry.name;
    const absPath = joinPath(absDir, entry.name);
    if (entry.isDirectory()) {
      walkMarkdown(absPath, relPath, out, underPacks || entry.name === 'packs');
      continue;
    }
    if (!underPacks && entry.isFile() && entry.name.endsWith('.md')) {
      out.push(relPath);
    }
  }
}

function validatePacksForInitiative(opts: {
  registry: Registry;
  contextRoot: string;
  initiativeId: string;
  initiativePath: string;
  addIssue: (key: string, message: string, path?: string) => void;
}) {
  const packsDir = resolvePath(opts.contextRoot, opts.initiativePath, 'packs');
  if (!existsSync(packsDir) || !statSync(packsDir).isDirectory()) return;

  for (const entry of readdirSync(packsDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue;
    const packAbs = joinPath(packsDir, entry.name);
    const packRel = relative(opts.contextRoot, packAbs);
    const key = `initiatives.${opts.initiativeId}.packs.${entry.name}`;
    const parsed = parsePackFrontmatter(readFileSync(packAbs, 'utf8'));
    if (!parsed) {
      opts.addIssue(key, `${key}: stale pack '${packRel}' has no readable frontmatter`, packRel);
      continue;
    }
    const role = typeof parsed.role === 'string' ? parsed.role : undefined;
    const task = typeof parsed.task === 'string' ? parsed.task : undefined;
    const initiative = typeof parsed.initiative === 'string' ? parsed.initiative : opts.initiativeId;
    const existingSources = Array.isArray(parsed.sources)
      ? parsed.sources.filter((v): v is string => typeof v === 'string')
      : undefined;

    if (!role || !task || !existingSources) {
      opts.addIssue(
        key,
        `${key}: stale pack '${packRel}' is missing role, task, or sources frontmatter`,
        packRel,
      );
      continue;
    }

    let liveSources: string[];
    try {
      const compiled = compilePack({
        registry: opts.registry,
        contextRoot: opts.contextRoot,
        role,
        initiative,
        task,
      });
      liveSources = extractSourcesFromPack(compiled.text);
    } catch (err) {
      opts.addIssue(key, `${key}: stale pack '${packRel}' could not be recompiled: ${(err as Error).message}`, packRel);
      continue;
    }

    if (!sameStringArray(existingSources, liveSources)) {
      opts.addIssue(key, `${key}: stale pack '${packRel}' source set does not match live inputs`, packRel);
    }
  }
}

function parsePackFrontmatter(text: string): Record<string, unknown> | undefined {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!match) return undefined;
  return parseYaml(match[1]!) as Record<string, unknown>;
}

function extractSourcesFromPack(text: string): string[] {
  const frontmatter = parsePackFrontmatter(text);
  const sources = frontmatter?.sources;
  return Array.isArray(sources)
    ? sources.filter((value): value is string => typeof value === 'string')
    : [];
}

function sameStringArray(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
