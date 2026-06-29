import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { compilePack, loadRegistry } from '../src/index.js';

/**
 * Dogfood tests: compile a pack against the repo's own `.contextspec/`. These
 * fail when the live registry references files that no longer exist, when a
 * role is removed without updating the registry, or when a generator's output
 * shape changes incompatibly with the committed AGENTS.md / .claude/commands/.
 *
 * The fixture is the project itself, so any drift surfaces here before
 * shipping.
 */

const REPO_ROOT = resolve(__dirname, '..');
const CONTEXT_ROOT = resolve(REPO_ROOT, '.contextspec');
const REGISTRY_PATH = resolve(CONTEXT_ROOT, 'registry.yaml');
const FIXED_TS = '2026-05-08T00:00:00Z';

describe('live .contextspec/ (dogfood)', () => {
  it('registry.yaml loads and declares the cli project + finish-line initiative', () => {
    const reg = loadRegistry(REGISTRY_PATH);
    expect(reg.version).toBe('0.1');
    expect(Object.keys(reg.roles).sort()).toEqual([
      'engineer',
      'growth',
      'pm',
      'qa',
    ]);
    expect(reg.projects?.cli?.includes).toContain('projects/cli.md');
    expect(reg.initiatives?.['finish-line']).toBeDefined();
    expect(reg.initiatives!['finish-line']!.path).toBe(
      'initiatives/finish-line',
    );
    expect(reg.initiatives!['finish-line']!.projects).toEqual(['cli']);
  });

  it('compiles a pack for engineer/finish-line with no warnings or skipped files', () => {
    const reg = loadRegistry(REGISTRY_PATH);
    const r = compilePack({
      registry: reg,
      contextRoot: CONTEXT_ROOT,
      role: 'engineer',
      initiative: 'finish-line',
      task: 'review',
      generatedAt: FIXED_TS,
    });
    expect(r.warnings).toEqual([]);
    expect(r.skipped).toEqual([]);
    expect(r.text).toContain('### roles/engineer.md');
    expect(r.text).toContain('### initiatives/finish-line/brief.md');
    expect(r.text).toContain('### projects/cli.md');
    expect(r.text).toContain('### memory/anti-patterns.md');
  });

  it('compiles cleanly for every declared role', () => {
    const reg = loadRegistry(REGISTRY_PATH);
    for (const role of Object.keys(reg.roles)) {
      const r = compilePack({
        registry: reg,
        contextRoot: CONTEXT_ROOT,
        role,
        initiative: 'finish-line',
        task: 'review',
        generatedAt: FIXED_TS,
      });
      expect(r.warnings, `role ${role} should compile clean`).toEqual([]);
      expect(r.skipped, `role ${role} should not skip files`).toEqual([]);
    }
  });

  it('every committed slash command is present', () => {
    const expected = [
      'pm-review.md',
      'growth-review.md',
      'engineer-handoff.md',
      'engineer-review.md',
      'context-status.md',
      'context-retro.md',
    ];
    for (const name of expected) {
      const p = resolve(REPO_ROOT, '.claude', 'commands', name);
      expect(existsSync(p), `${name} should exist`).toBe(true);
    }
  });

  it('AGENTS.md exists and contains the managed contextspec block', () => {
    const p = resolve(REPO_ROOT, 'AGENTS.md');
    expect(existsSync(p)).toBe(true);
    const text = readFileSync(p, 'utf8');
    expect(text).toContain('<!-- contextspec:begin -->');
    expect(text).toContain('<!-- contextspec:end -->');
    expect(text).toContain('## ContextSpec');
    expect(text).toContain('contextspec pack');
  });
});
