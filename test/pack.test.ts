import { describe, expect, it } from 'vitest';
import { resolve as resolvePath } from 'node:path';
import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';
import { compilePack, loadRegistry } from '../src/index.js';

const FIXTURE_ROOT = resolvePath(
  __dirname,
  '..',
  'examples',
  'improve-team-invite-conversion',
  '.contextspec',
);
const REGISTRY_PATH = resolvePath(FIXTURE_ROOT, 'registry.yaml');
const FIXED_TS = '2026-05-08T00:00:00Z';

function compile(role: string, task = 'review') {
  return compilePack({
    registry: loadRegistry(REGISTRY_PATH),
    contextRoot: FIXTURE_ROOT,
    role,
    initiative: 'improve-team-invite-conversion',
    task,
    generatedAt: FIXED_TS,
  });
}

function parseFrontmatter(text: string): Record<string, unknown> {
  const m = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!m) throw new Error('no frontmatter');
  return parseYaml(m[1]!) as Record<string, unknown>;
}

function bodySources(text: string): string[] {
  // Anchor on the heading at start-of-line so we don't match inline code
  // like `## Sources` that may appear in file content.
  const m = text.match(/(?:^|\n)## Sources\n([\s\S]*)$/);
  const sec = m?.[1] ?? '';
  const stop = sec.indexOf('\n_skipped:_');
  const target = stop >= 0 ? sec.slice(0, stop) : sec;
  return [...target.matchAll(/`([^`]+)`/g)].map((m) => m[1]!);
}

describe('compilePack against the example fixture', () => {
  it('byte-stable for identical inputs', () => {
    const a = compile('growth').text;
    const b = compile('growth').text;
    expect(a).toBe(b);
  });

  it('emits a valid YAML frontmatter with required fields', () => {
    const { text } = compile('growth');
    const fm = parseFrontmatter(text);
    expect(fm.contextspec_version).toBe('0.1');
    expect(fm.role).toBe('growth');
    expect(fm.task).toBe('review');
    expect(fm.initiative).toBe('improve-team-invite-conversion');
    expect(fm.project).toBe('web-app');
    expect(fm.generated_at).toBe(FIXED_TS);
    expect(Array.isArray(fm.sources)).toBe(true);
  });

  it('frontmatter sources match ## Sources in the body, in the same order', () => {
    const { text } = compile('growth');
    const fmSources = (parseFrontmatter(text).sources as string[]) ?? [];
    expect(bodySources(text)).toEqual(fmSources);
  });

  it('orders sources by §5.3 tier: global → role → domain → initiative → project → memory → source://', () => {
    const { text } = compile('growth');
    const sources = (parseFrontmatter(text).sources as string[]) ?? [];
    const tier = (s: string): number => {
      if (s.startsWith('source://')) return 6;
      if (s.startsWith('memory/')) return 5;
      if (s.startsWith('projects/')) return 4;
      if (s.startsWith('initiatives/')) return 3;
      if (s.startsWith('domains/')) return 2;
      if (s.startsWith('roles/')) return 1;
      return 0; // top-level files routed via context.includes
    };
    let last = -1;
    for (const s of sources) {
      const t = tier(s);
      expect(t).toBeGreaterThanOrEqual(last);
      last = t;
    }
  });

  it('routes memory files into ## Relevant Memory regardless of include origin', () => {
    const { text } = compile('growth');
    // memory/experiment-results.md is in roles.growth.includes per registry
    // but should appear under ## Relevant Memory, not ## Role Context.
    const memSection = text.split('## Relevant Memory', 2)[1] ?? '';
    const stop = memSection.indexOf('\n## ');
    const memOnly = stop >= 0 ? memSection.slice(0, stop) : memSection;
    expect(memOnly).toContain('### memory/experiment-results.md');

    const roleSection = text.split('## Role Context', 2)[1] ?? '';
    const roleStop = roleSection.indexOf('\n## ');
    const roleOnly = roleStop >= 0 ? roleSection.slice(0, roleStop) : roleSection;
    expect(roleOnly).not.toContain('### memory/experiment-results.md');
  });

  it('omits initiative `packs/` from the included files', () => {
    const { text } = compile('growth');
    const sources = (parseFrontmatter(text).sources as string[]) ?? [];
    expect(sources.some((s) => s.includes('/packs/'))).toBe(false);
  });

  it('writes role file before its other role/-prefixed includes', () => {
    const { text } = compile('growth');
    const sources = (parseFrontmatter(text).sources as string[]) ?? [];
    const roleFileIdx = sources.indexOf('roles/growth.md');
    expect(roleFileIdx).toBeGreaterThanOrEqual(0);
    const otherRolePrefixed = sources.findIndex(
      (s, i) => i !== roleFileIdx && s.startsWith('roles/'),
    );
    if (otherRolePrefixed !== -1) {
      expect(roleFileIdx).toBeLessThan(otherRolePrefixed);
    }
  });

  it('orders initiative files: brief → context-map → plan → tasks → acceptance → decisions → reviews/<role>.md → retro', () => {
    const { text } = compile('growth');
    const sources = (parseFrontmatter(text).sources as string[]) ?? [];
    const initFiles = sources.filter((s) =>
      s.startsWith('initiatives/improve-team-invite-conversion/'),
    );
    const expected = [
      'initiatives/improve-team-invite-conversion/brief.md',
      'initiatives/improve-team-invite-conversion/context-map.md',
      'initiatives/improve-team-invite-conversion/plan.md',
      'initiatives/improve-team-invite-conversion/tasks.md',
      'initiatives/improve-team-invite-conversion/acceptance.md',
      'initiatives/improve-team-invite-conversion/decisions.md',
      'initiatives/improve-team-invite-conversion/reviews/growth.md',
      'initiatives/improve-team-invite-conversion/retro.md',
    ];
    expect(initFiles).toEqual(expected);
  });

  it('only includes source:// links allowed by registry.sources include/exclude', () => {
    const { text } = compile('growth');
    const sources = (parseFrontmatter(text).sources as string[]) ?? [];
    const links = sources.filter((s) => s.startsWith('source://'));
    // All four hand-written links in the fixture are under Customers/, Decisions/,
    // or Product/ — all allowed. None under Daily/ or Private/.
    for (const link of links) {
      expect(link.startsWith('source://personal_knowledge_base/')).toBe(true);
      expect(link).not.toContain('/Daily/');
      expect(link).not.toContain('/Private/');
    }
    expect(links.length).toBeGreaterThan(0);
  });

  it('renders every non-empty section with at least one ### file separator', () => {
    const { text } = compile('growth');
    const sectionsExpected = [
      '## Global Context',
      '## Role Context',
      '## Domain Context',
      '## Initiative Context',
      '## Project Context',
      '## Relevant Memory',
    ];
    for (const heading of sectionsExpected) {
      const idx = text.indexOf(heading);
      expect(idx, `${heading} present`).toBeGreaterThanOrEqual(0);
      const next = text.indexOf('\n## ', idx + heading.length);
      const slice = next >= 0 ? text.slice(idx, next) : text.slice(idx);
      expect(slice, `${heading} non-empty`).toContain('### ');
    }
  });

  it('produces a different output for engineer/handoff than growth/review', () => {
    const a = compile('growth', 'review').text;
    const b = compile('engineer', 'handoff').text;
    expect(a).not.toBe(b);
    const fmA = parseFrontmatter(a);
    const fmB = parseFrontmatter(b);
    expect(fmA.role).toBe('growth');
    expect(fmB.role).toBe('engineer');
    expect(fmA.task).toBe('review');
    expect(fmB.task).toBe('handoff');
  });

  it('targets the correct output path under initiatives/<id>/packs/', () => {
    const r1 = compile('growth', 'review');
    expect(r1.outputRelPath).toBe(
      'initiatives/improve-team-invite-conversion/packs/growth-review.md',
    );
    const r2 = compile('engineer', 'handoff');
    expect(r2.outputRelPath).toBe(
      'initiatives/improve-team-invite-conversion/packs/engineer-handoff.md',
    );
  });
});

describe('registry loader', () => {
  it('reads version, roles, and initiatives from the example', () => {
    const reg = loadRegistry(REGISTRY_PATH);
    expect(reg.version).toBe('0.1');
    expect(Object.keys(reg.roles).sort()).toEqual([
      'engineer',
      'growth',
      'pm',
    ]);
    expect(Object.keys(reg.initiatives ?? {})).toEqual([
      'improve-team-invite-conversion',
    ]);
  });
});

describe('compile produces no warnings on the clean fixture', () => {
  it('growth review', () => {
    const r = compile('growth');
    expect(r.warnings).toEqual([]);
    expect(r.skipped).toEqual([]);
  });
  it('engineer handoff', () => {
    const r = compile('engineer', 'handoff');
    expect(r.warnings).toEqual([]);
    expect(r.skipped).toEqual([]);
  });
});

// Ensure the fixture itself is reachable so failures are diagnosable.
describe('fixture sanity', () => {
  it('registry.yaml exists', () => {
    expect(() => readFileSync(REGISTRY_PATH, 'utf8')).not.toThrow();
  });
});
