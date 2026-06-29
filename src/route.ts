export type Section =
  | 'global'
  | 'role'
  | 'domain'
  | 'initiative'
  | 'project'
  | 'memory';

export const SECTION_TIER_ORDER: Section[] = [
  'global',
  'role',
  'domain',
  'initiative',
  'project',
  'memory',
];

export const SECTION_HEADINGS: Record<Section, string> = {
  global: '## Global Context',
  role: '## Role Context',
  domain: '## Domain Context',
  initiative: '## Initiative Context',
  project: '## Project Context',
  memory: '## Relevant Memory',
};

export interface RouteResult {
  section: Section;
  warning?: string;
}

/**
 * Route a `.contextspec/`-relative path to its pack section per spec §5.7.
 *
 * - `fromContextIncludes`: if the path was reached via `context.includes`,
 *   it routes to `global` regardless of where the file lives. This matches
 *   §5.7 row 1.
 */
export function routePath(relPath: string, fromContextIncludes: boolean): RouteResult {
  if (fromContextIncludes) return { section: 'global' };

  if (relPath.startsWith('roles/')) return { section: 'role' };
  if (relPath.startsWith('domains/')) return { section: 'domain' };
  if (relPath.startsWith('initiatives/')) return { section: 'initiative' };
  if (relPath.startsWith('projects/')) return { section: 'project' };
  if (relPath.startsWith('memory/')) return { section: 'memory' };
  if (relPath.startsWith('sources/')) return { section: 'initiative' };

  return {
    section: 'role',
    warning: `Unrouted path '${relPath}' falls back to Role Context`,
  };
}
