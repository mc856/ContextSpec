import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import { parseDocument } from 'yaml';
import { LENS_LIBRARY, ROLE_SKELETON_MD, roleDisplayName } from './templates.js';
import { ensureMapping, forceBlockStyle } from './yamlEdit.js';

export interface CreateRoleOptions {
  /** project root containing `.contextspec/` */
  cwd: string;
  /** role id; must be a kebab-case slug */
  id: string;
  /** clone the project's current `roles/<from>.md` as the starting point */
  from?: string;
  /** if true, overwrite an existing role file and re-register */
  force?: boolean;
}

export interface CreateRoleResult {
  /** absolute path to `roles/<id>.md` */
  roleFile: string;
  written: string[];
  skipped: string[];
  warnings: string[];
}

const ID_RE = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

/**
 * Register a role in `registry.yaml` (comment-preserving, in place) and
 * write `roles/<id>.md`. Template sources, in order: explicit `--from`
 * clone of the project's current on-disk role file; curated preset from
 * the lens library; structured skeleton.
 *
 * The registry entry is `{file, includes: []}` — memory wiring is a
 * curated user choice, so presets do not presume it.
 */
export function createRole(opts: CreateRoleOptions): CreateRoleResult {
  if (!ID_RE.test(opts.id)) {
    throw new Error(
      `invalid role id '${opts.id}': use kebab-case (lowercase letters, digits, hyphens)`,
    );
  }

  const contextRoot = resolvePath(opts.cwd, '.contextspec');
  const registryPath = join(contextRoot, 'registry.yaml');
  if (!existsSync(registryPath)) {
    throw new Error(
      `${registryPath} not found. Run \`contextspec init\` first.`,
    );
  }

  const warnings: string[] = [];

  // Resolve the template body before touching the registry, so a missing
  // --from source fails without side effects.
  let body: string;
  if (opts.from) {
    // Same slug rule as the id: also keeps the path join below confined
    // to .contextspec/roles/ (no traversal).
    if (!ID_RE.test(opts.from)) {
      throw new Error(
        `invalid --from role '${opts.from}': use kebab-case (lowercase letters, digits, hyphens)`,
      );
    }
    const fromAbs = join(contextRoot, 'roles', `${opts.from}.md`);
    if (!existsSync(fromAbs)) {
      throw new Error(
        `cannot clone from '${opts.from}': ${fromAbs} does not exist`,
      );
    }
    if (Object.hasOwn(LENS_LIBRARY, opts.id)) {
      warnings.push(
        `role '${opts.id}' has a curated preset; cloning from '${opts.from}' as requested`,
      );
    }
    body = retitleH1(readFileSync(fromAbs, 'utf8'), opts.id);
  } else if (Object.hasOwn(LENS_LIBRARY, opts.id)) {
    body = LENS_LIBRARY[opts.id]!;
  } else {
    body = ROLE_SKELETON_MD(opts.id);
  }

  const yamlText = readFileSync(registryPath, 'utf8');
  const doc = parseDocument(yamlText);
  const rolesNode = ensureMapping(doc, 'roles');
  if (rolesNode.has(opts.id) && !opts.force) {
    throw new Error(
      `role '${opts.id}' already exists in registry.yaml. Pass --force to overwrite.`,
    );
  }

  const entryNode = doc.createNode({
    file: `roles/${opts.id}.md`,
    includes: [],
  });
  forceBlockStyle(entryNode);
  rolesNode.set(opts.id, entryNode);
  rolesNode.flow = false;
  writeFileSync(registryPath, String(doc));

  const roleFile = join(contextRoot, 'roles', `${opts.id}.md`);
  const written: string[] = [];
  const skipped: string[] = [];
  if (existsSync(roleFile) && !opts.force) {
    // Adopt an existing hand-written file: register it, leave it alone.
    skipped.push(`roles/${opts.id}.md`);
  } else {
    mkdirSync(dirname(roleFile), { recursive: true });
    writeFileSync(roleFile, body);
    written.push(`roles/${opts.id}.md`);
  }

  return { roleFile, written, skipped, warnings };
}

function retitleH1(body: string, id: string): string {
  const lines = body.split('\n');
  if (lines[0]?.startsWith('# ')) {
    lines[0] = `# Role: ${roleDisplayName(id)}`;
    return lines.join('\n');
  }
  return `# Role: ${roleDisplayName(id)}\n\n${body}`;
}
