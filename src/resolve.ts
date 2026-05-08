import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve as resolvePath, join as joinPath } from 'node:path';
import type { Registry } from './registry.js';
import { routePath, type Section } from './route.js';

export interface ResolvedFile {
  /** path relative to `.contextspec/`, e.g. `roles/growth.md` */
  relPath: string;
  /** absolute path on disk */
  absPath: string;
  /** target section per §5.7 */
  section: Section;
  /** true if file did not exist on disk */
  missing: boolean;
  /** non-fatal warning produced during routing */
  warning?: string;
}

export interface ResolveOptions {
  registry: Registry;
  /** absolute path to `.contextspec/` */
  contextRoot: string;
  role: string;
  initiative: string;
  /** if set, restrict to only this project's includes */
  project?: string;
}

/**
 * Build the ordered, deduplicated list of files for a pack, per spec §5.3 +
 * §4.5 + §5.7. Files are tier-sorted by section; within a tier, the order is
 * the walk order, which is the registry's declaration order.
 *
 * Dedup is by resolved absolute path: first encounter wins.
 */
export function resolvePackFiles(opts: ResolveOptions): ResolvedFile[] {
  const { registry, contextRoot, role, initiative, project } = opts;

  const roleDecl = registry.roles[role];
  if (!roleDecl) {
    throw new Error(`role '${role}' not found in registry`);
  }
  const initiativeDecl = registry.initiatives?.[initiative];
  if (!initiativeDecl) {
    throw new Error(`initiative '${initiative}' not found in registry`);
  }

  const seen = new Set<string>();
  const collected: ResolvedFile[] = [];

  const addPath = (relPath: string, fromContextIncludes: boolean) => {
    const absPath = resolvePath(contextRoot, relPath);
    if (seen.has(absPath)) return;
    seen.add(absPath);
    const route = routePath(relPath, fromContextIncludes);
    collected.push({
      relPath,
      absPath,
      section: route.section,
      missing: !existsSync(absPath),
      warning: route.warning,
    });
  };

  // 1. Global context
  for (const p of registry.context.includes) addPath(p, true);

  // 2. Role file
  addPath(roleDecl.file, false);

  // 3. Role includes
  for (const p of roleDecl.includes ?? []) addPath(p, false);

  // 4. Domain includes (only domains attached to this initiative)
  for (const did of initiativeDecl.domains ?? []) {
    const dom = registry.domains?.[did];
    if (!dom) continue;
    for (const p of dom.includes ?? []) addPath(p, false);
  }

  // 5. Initiative files (auto-discovered from disk)
  const initRel = initiativeDecl.path;
  const initAbs = resolvePath(contextRoot, initRel);
  if (existsSync(initAbs)) {
    for (const f of discoverInitiativeFiles(initAbs, initiativeDecl.roles ?? [])) {
      addPath(joinPath(initRel, f), false);
    }
  }

  // 6. Project includes (filter by --project if provided)
  const projectIds = project
    ? (initiativeDecl.projects ?? []).filter((p) => p === project)
    : (initiativeDecl.projects ?? []);
  if (project && !projectIds.includes(project)) {
    throw new Error(
      `project '${project}' not attached to initiative '${initiative}'`,
    );
  }
  for (const pid of projectIds) {
    const proj = registry.projects?.[pid];
    if (!proj) continue;
    for (const p of proj.includes ?? []) addPath(p, false);
  }

  return tierSort(collected);
}

const KNOWN_INITIATIVE_FILES = [
  'brief.md',
  'context-map.md',
  'plan.md',
  'tasks.md',
  'acceptance.md',
  'decisions.md',
];

/**
 * Discover initiative-directory files in §5.7 order. Returns paths relative
 * to the initiative directory itself.
 *
 * - `packs/` is excluded (§5.7 rule 2).
 * - `reviews/<role>.md` for each attached role, in registry order.
 * - `retro.md` always last.
 */
export function discoverInitiativeFiles(
  initAbs: string,
  attachedRoles: string[],
): string[] {
  const order: string[] = [];

  for (const name of KNOWN_INITIATIVE_FILES) {
    if (existsSync(joinPath(initAbs, name))) order.push(name);
  }

  const entries = readdirSync(initAbs, { withFileTypes: true });
  const otherTopLevel = entries
    .filter(
      (e) =>
        e.isFile() &&
        e.name.endsWith('.md') &&
        !KNOWN_INITIATIVE_FILES.includes(e.name) &&
        e.name !== 'retro.md',
    )
    .map((e) => e.name)
    .sort();
  order.push(...otherTopLevel);

  const reviewsDir = joinPath(initAbs, 'reviews');
  if (existsSync(reviewsDir) && statSync(reviewsDir).isDirectory()) {
    for (const role of attachedRoles) {
      const rel = joinPath('reviews', `${role}.md`);
      if (existsSync(joinPath(initAbs, rel))) order.push(rel);
    }
  }

  if (existsSync(joinPath(initAbs, 'retro.md'))) order.push('retro.md');

  return order;
}

import { SECTION_TIER_ORDER } from './route.js';

/**
 * Stable sort by §5.3 tier order; preserves walk order within a tier.
 */
function tierSort(files: ResolvedFile[]): ResolvedFile[] {
  const byTier: Record<Section, ResolvedFile[]> = {
    global: [],
    role: [],
    domain: [],
    initiative: [],
    project: [],
    memory: [],
  };
  for (const f of files) byTier[f.section].push(f);
  const out: ResolvedFile[] = [];
  for (const t of SECTION_TIER_ORDER) out.push(...byTier[t]);
  return out;
}
