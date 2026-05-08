import { readFileSync } from 'node:fs';
import { stringify as stringifyYaml } from 'yaml';
import type { Registry } from './registry.js';
import { resolvePackFiles, type ResolvedFile } from './resolve.js';
import {
  SECTION_HEADINGS,
  SECTION_TIER_ORDER,
  type Section,
} from './route.js';
import {
  scanSourceLinks,
  validateSourceLink,
  type SourceLink,
} from './sources.js';

export interface CompileOptions {
  registry: Registry;
  contextRoot: string;
  role: string;
  initiative: string;
  project?: string;
  task?: string;
  /** ISO timestamp; if omitted defaults to `new Date().toISOString()`. */
  generatedAt?: string;
}

export interface CompileResult {
  /** the full pack markdown */
  text: string;
  /** target output path relative to `.contextspec/` */
  outputRelPath: string;
  /** non-fatal warnings produced during compilation */
  warnings: string[];
  /** files that were referenced but missing on disk */
  skipped: string[];
}

interface ResolvedSourceRef {
  /** `source://<id>/<path>` */
  uri: string;
  /** path of the curated file that referenced it (rel to .contextspec/) */
  fromFile: string;
}

export function compilePack(opts: CompileOptions): CompileResult {
  const task = opts.task ?? 'review';
  const generatedAt = opts.generatedAt ?? new Date().toISOString();

  const files = resolvePackFiles({
    registry: opts.registry,
    contextRoot: opts.contextRoot,
    role: opts.role,
    initiative: opts.initiative,
    project: opts.project,
  });

  const warnings: string[] = [];
  for (const f of files) {
    if (f.warning) warnings.push(f.warning);
  }

  // Read each file's contents (or mark skipped).
  const present: { file: ResolvedFile; body: string }[] = [];
  const skipped: string[] = [];
  for (const f of files) {
    if (f.missing) {
      skipped.push(f.relPath);
      warnings.push(`missing file: ${f.relPath}`);
      continue;
    }
    present.push({ file: f, body: readFileSync(f.absPath, 'utf8') });
  }

  // Scan curated files for source:// links in §5.3 walk order.
  const seenUris = new Set<string>();
  const sourceRefs: ResolvedSourceRef[] = [];
  for (const { file, body } of present) {
    for (const link of scanSourceLinks(body)) {
      const result = validateSourceLink(link, opts.registry.sources);
      if (!result.ok) {
        warnings.push(
          `source link dropped: ${link.raw} in ${file.relPath} (${result.reason})`,
        );
        continue;
      }
      if (seenUris.has(link.raw)) continue;
      seenUris.add(link.raw);
      sourceRefs.push({ uri: link.raw, fromFile: file.relPath });
    }
  }

  // Frontmatter sources list: tier-ordered file paths, then source:// URIs.
  const frontmatterSources: string[] = [
    ...present.map((p) => p.file.relPath),
    ...sourceRefs.map((r) => r.uri),
  ];

  const frontmatter = {
    contextspec_version: '0.1',
    role: opts.role,
    task,
    initiative: opts.initiative,
    project: opts.project ?? defaultProject(opts.registry, opts.initiative),
    generated_at: generatedAt,
    sources: frontmatterSources,
  };

  const body = renderBody(present, sourceRefs, skipped);

  const text =
    '---\n' + stringifyYaml(frontmatter).trimEnd() + '\n---\n\n' + body;

  const outputRelPath = `${opts.registry.initiatives![opts.initiative]!.path}/packs/${opts.role}-${task}.md`;

  return { text, outputRelPath, warnings, skipped };
}

function defaultProject(registry: Registry, initiative: string): string | null {
  const init = registry.initiatives?.[initiative];
  const list = init?.projects ?? [];
  return list.length === 1 ? list[0]! : null;
}

function renderBody(
  present: { file: ResolvedFile; body: string }[],
  sourceRefs: ResolvedSourceRef[],
  skipped: string[],
): string {
  const bySection: Record<Section, { file: ResolvedFile; body: string }[]> = {
    global: [],
    role: [],
    domain: [],
    initiative: [],
    project: [],
    memory: [],
  };
  for (const item of present) bySection[item.file.section].push(item);

  const parts: string[] = ['# Context Pack', ''];

  for (const section of SECTION_TIER_ORDER) {
    parts.push(SECTION_HEADINGS[section], '');
    const items = bySection[section];
    if (items.length === 0) {
      parts.push('_(empty)_', '');
      continue;
    }
    for (const item of items) {
      parts.push(`### ${item.file.relPath}`, '');
      parts.push(normalizeFileBody(item.body));
      parts.push('');
    }
  }

  parts.push('## Sources', '');
  for (const item of present) {
    parts.push(`- \`${item.file.relPath}\``);
  }
  for (const ref of sourceRefs) {
    parts.push(`- \`${ref.uri}\``);
  }
  if (skipped.length > 0) {
    parts.push('');
    parts.push('_skipped:_');
    for (const s of skipped) parts.push(`- \`${s}\``);
  }
  parts.push('');

  return parts.join('\n');
}

/**
 * Strip trailing whitespace/newlines so file bodies join cleanly without
 * varying numbers of blank lines between files. Content is preserved
 * verbatim; only the final whitespace is normalized.
 */
function normalizeFileBody(body: string): string {
  return body.replace(/\s+$/, '');
}
