import { describe, expect, it, beforeEach } from 'vitest';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  generateClaude,
  generateCodex,
  initContextSpec,
  loadRegistry,
} from '../src/index.js';

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'cs-gen-test-'));
}

describe('generateClaude', () => {
  let dir: string;
  beforeEach(() => {
    dir = freshDir();
    initContextSpec({ cwd: dir });
  });

  it('writes one slash command per role plus utility commands', () => {
    const reg = loadRegistry(join(dir, '.contextspec', 'registry.yaml'));
    const r = generateClaude({ cwd: dir, registry: reg });
    expect(r.commandsDir).toBe(resolve(dir, '.claude', 'commands'));
    // pm-review + growth-review + engineer-handoff + engineer-review +
    // context-status + context-retro = 6
    expect(r.written.sort()).toEqual([
      'context-retro.md',
      'context-status.md',
      'engineer-handoff.md',
      'engineer-review.md',
      'growth-review.md',
      'pm-review.md',
    ]);
    for (const f of r.written) {
      expect(existsSync(join(r.commandsDir, f))).toBe(true);
    }
  });

  it('per-role command embeds the matching pack invocation and role file path', () => {
    const reg = loadRegistry(join(dir, '.contextspec', 'registry.yaml'));
    generateClaude({ cwd: dir, registry: reg });
    const cmd = readFileSync(
      join(dir, '.claude', 'commands', 'engineer-handoff.md'),
      'utf8',
    );
    expect(cmd).toContain(
      'contextspec pack --role engineer --initiative $ARGUMENTS --task handoff',
    );
    expect(cmd).toContain('.contextspec/roles/engineer.md');
    expect(cmd).toContain('argument-hint: <initiative-id>');
  });

  it('is idempotent by default: re-running produces byte-identical files', () => {
    const reg = loadRegistry(join(dir, '.contextspec', 'registry.yaml'));
    generateClaude({ cwd: dir, registry: reg });
    const before = snapshot(join(dir, '.claude', 'commands'));
    generateClaude({ cwd: dir, registry: reg });
    const after = snapshot(join(dir, '.claude', 'commands'));
    expect(after).toEqual(before);
  });

  it('with --no-force, leaves existing files untouched', () => {
    const reg = loadRegistry(join(dir, '.contextspec', 'registry.yaml'));
    generateClaude({ cwd: dir, registry: reg });
    const path = join(dir, '.claude', 'commands', 'pm-review.md');
    writeFileSync(path, '# my override\n');
    const r = generateClaude({ cwd: dir, registry: reg, force: false });
    expect(r.skipped).toContain('pm-review.md');
    expect(readFileSync(path, 'utf8')).toBe('# my override\n');
  });
});

describe('generateCodex', () => {
  let dir: string;
  beforeEach(() => {
    dir = freshDir();
    initContextSpec({ cwd: dir });
  });

  it("creates AGENTS.md with the managed section when none exists", () => {
    const r = generateCodex({ cwd: dir });
    expect(r.action).toBe('created');
    const text = readFileSync(r.agentsPath, 'utf8');
    expect(text).toMatch(/^# AGENTS\.md\n/);
    expect(text).toContain('<!-- contextspec:begin -->');
    expect(text).toContain('## ContextSpec');
    expect(text).toContain('<!-- contextspec:end -->');
    expect(text).toContain('contextspec pack');
  });

  it('appends the managed section to an existing AGENTS.md without our markers', () => {
    const path = join(dir, 'AGENTS.md');
    writeFileSync(path, '# AGENTS.md\n\n## Team rules\n\n- always use vitest\n');
    const r = generateCodex({ cwd: dir });
    expect(r.action).toBe('inserted');
    const text = readFileSync(path, 'utf8');
    expect(text).toContain('## Team rules');
    expect(text).toContain('always use vitest');
    expect(text).toContain('<!-- contextspec:begin -->');
    expect(text).toContain('<!-- contextspec:end -->');
    // user content stays before the managed section
    expect(text.indexOf('always use vitest')).toBeLessThan(
      text.indexOf('<!-- contextspec:begin -->'),
    );
  });

  it('replaces the managed section in place on re-run; user content above and below survives', () => {
    const path = join(dir, 'AGENTS.md');
    writeFileSync(
      path,
      [
        '# AGENTS.md',
        '',
        '## Top notes',
        '',
        '- top',
        '',
        '<!-- contextspec:begin -->',
        '## ContextSpec',
        'old stale body',
        '<!-- contextspec:end -->',
        '',
        '## Bottom notes',
        '',
        '- bottom',
        '',
      ].join('\n'),
    );
    const r = generateCodex({ cwd: dir });
    expect(r.action).toBe('updated');
    const text = readFileSync(path, 'utf8');
    expect(text).toContain('## Top notes');
    expect(text).toContain('## Bottom notes');
    expect(text).not.toContain('old stale body');
    expect(text).toContain('contextspec pack');
    // top notes still above, bottom still below
    expect(text.indexOf('## Top notes')).toBeLessThan(
      text.indexOf('<!-- contextspec:begin -->'),
    );
    expect(text.indexOf('<!-- contextspec:end -->')).toBeLessThan(
      text.indexOf('## Bottom notes'),
    );
  });

  it('is idempotent: re-running produces byte-identical AGENTS.md', () => {
    generateCodex({ cwd: dir });
    const a = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
    generateCodex({ cwd: dir });
    const b = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
    expect(b).toBe(a);
  });
});

function snapshot(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of readdirSync(dir).sort()) {
    out[name] = readFileSync(join(dir, name), 'utf8');
  }
  return out;
}
