import { describe, expect, it, beforeEach } from 'vitest';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import {
  compilePack,
  createInitiative,
  initContextSpec,
  loadRegistry,
} from '../src/index.js';

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'cs-init-test-'));
}

describe('initContextSpec', () => {
  let dir: string;
  beforeEach(() => {
    dir = freshDir();
  });

  it('writes the v0.1 skeleton in an empty directory', () => {
    const r = initContextSpec({ cwd: dir });
    expect(r.contextRoot).toBe(resolve(dir, '.contextspec'));
    expect(r.skipped).toEqual([]);
    expect(r.written).toContain('registry.yaml');
    expect(r.written).toContain('roles/pm.md');
    expect(r.written).toContain('roles/growth.md');
    expect(r.written).toContain('roles/engineer.md');
    expect(r.written).toContain('memory/anti-patterns.md');
    for (const f of r.written) {
      expect(existsSync(join(r.contextRoot, f))).toBe(true);
    }
  });

  it('produces a registry that loads and validates', () => {
    initContextSpec({ cwd: dir });
    const reg = loadRegistry(join(dir, '.contextspec', 'registry.yaml'));
    expect(reg.version).toBe('0.1');
    expect(Object.keys(reg.roles).sort()).toEqual([
      'engineer',
      'growth',
      'pm',
    ]);
    expect(reg.context.includes).toContain('context.md');
    expect(reg.initiatives).toEqual({});
  });

  it('refuses to overwrite existing registry without --force', () => {
    initContextSpec({ cwd: dir });
    expect(() => initContextSpec({ cwd: dir })).toThrow(/already exists/);
  });

  it('--force overwrites; user edits to non-skeleton files are clobbered', () => {
    initContextSpec({ cwd: dir });
    const ctxPath = join(dir, '.contextspec', 'context.md');
    writeFileSync(ctxPath, '# Custom context');
    initContextSpec({ cwd: dir, force: true });
    expect(readFileSync(ctxPath, 'utf8')).not.toBe('# Custom context');
  });
});

describe('createInitiative', () => {
  let dir: string;
  beforeEach(() => {
    dir = freshDir();
    initContextSpec({ cwd: dir });
  });

  it('writes initiative templates and registers in registry.yaml', () => {
    const r = createInitiative({ cwd: dir, id: 'q2-onboarding-pulse' });
    expect(r.warnings).toEqual([]);
    expect(r.written).toEqual([
      'initiatives/q2-onboarding-pulse/brief.md',
      'initiatives/q2-onboarding-pulse/context-map.md',
      'initiatives/q2-onboarding-pulse/plan.md',
      'initiatives/q2-onboarding-pulse/tasks.md',
      'initiatives/q2-onboarding-pulse/acceptance.md',
      'initiatives/q2-onboarding-pulse/decisions.md',
    ]);

    const reg = loadRegistry(join(dir, '.contextspec', 'registry.yaml'));
    const decl = reg.initiatives?.['q2-onboarding-pulse'];
    expect(decl).toBeDefined();
    expect(decl!.path).toBe('initiatives/q2-onboarding-pulse');
    // default roles = all roles in the registry
    expect(decl!.roles?.sort()).toEqual(['engineer', 'growth', 'pm']);
    expect(decl!.domains).toBeUndefined();
    expect(decl!.projects).toBeUndefined();
  });

  it('preserves comments and existing entries when registering a second initiative', () => {
    createInitiative({ cwd: dir, id: 'one' });
    createInitiative({
      cwd: dir,
      id: 'two',
      roles: ['pm', 'engineer'],
    });
    const text = readFileSync(
      join(dir, '.contextspec', 'registry.yaml'),
      'utf8',
    );
    // skeleton comments survive
    expect(text).toContain('# ContextSpec registry');
    expect(text).toContain('# Files loaded for every role');
    // both initiatives are present
    expect(text).toContain('one:');
    expect(text).toContain('two:');
    const reg = loadRegistry(join(dir, '.contextspec', 'registry.yaml'));
    expect(Object.keys(reg.initiatives!).sort()).toEqual(['one', 'two']);
    expect(reg.initiatives!['two']!.roles?.sort()).toEqual([
      'engineer',
      'pm',
    ]);
  });

  it('rejects invalid initiative ids', () => {
    expect(() => createInitiative({ cwd: dir, id: 'Bad ID' })).toThrow(
      /kebab-case/,
    );
    expect(() => createInitiative({ cwd: dir, id: '-leading-hyphen' })).toThrow(
      /kebab-case/,
    );
    expect(() => createInitiative({ cwd: dir, id: '1starts-with-digit' })).toThrow(
      /kebab-case/,
    );
  });

  it('refuses to re-register an existing initiative without --force', () => {
    createInitiative({ cwd: dir, id: 'foo' });
    expect(() => createInitiative({ cwd: dir, id: 'foo' })).toThrow(
      /already exists/,
    );
  });

  it('--force re-registers and overwrites templates', () => {
    createInitiative({ cwd: dir, id: 'foo' });
    const briefPath = join(
      dir,
      '.contextspec',
      'initiatives',
      'foo',
      'brief.md',
    );
    writeFileSync(briefPath, '# Custom brief');
    const r = createInitiative({
      cwd: dir,
      id: 'foo',
      roles: ['pm'],
      force: true,
    });
    expect(r.skipped).toEqual([]);
    expect(readFileSync(briefPath, 'utf8')).not.toBe('# Custom brief');
    const reg = loadRegistry(join(dir, '.contextspec', 'registry.yaml'));
    expect(reg.initiatives!['foo']!.roles).toEqual(['pm']);
  });

  it('warns but proceeds when domain/project are not declared', () => {
    const r = createInitiative({
      cwd: dir,
      id: 'with-attachments',
      domains: ['onboarding'],
      projects: ['web-app'],
    });
    expect(r.warnings.some((w) => w.includes("domain 'onboarding'"))).toBe(true);
    expect(r.warnings.some((w) => w.includes("project 'web-app'"))).toBe(true);
    const reg = loadRegistry(join(dir, '.contextspec', 'registry.yaml'));
    expect(reg.initiatives!['with-attachments']!.domains).toEqual(['onboarding']);
    expect(reg.initiatives!['with-attachments']!.projects).toEqual(['web-app']);
  });

  it('errors if registry.yaml does not exist', () => {
    const empty = freshDir();
    expect(() => createInitiative({ cwd: empty, id: 'x' })).toThrow(
      /registry\.yaml/,
    );
  });
});

describe('init + create-initiative + compilePack chain', () => {
  it('produces a compilable pack from a freshly initialized project', () => {
    const dir = freshDir();
    initContextSpec({ cwd: dir });
    createInitiative({ cwd: dir, id: 'sample-initiative' });

    const reg = loadRegistry(join(dir, '.contextspec', 'registry.yaml'));
    const r = compilePack({
      registry: reg,
      contextRoot: join(dir, '.contextspec'),
      role: 'engineer',
      initiative: 'sample-initiative',
      task: 'review',
      generatedAt: '2026-05-08T00:00:00Z',
    });

    expect(r.warnings).toEqual([]);
    expect(r.skipped).toEqual([]);
    expect(r.text).toContain('## Global Context');
    expect(r.text).toContain('### roles/engineer.md');
    expect(r.text).toContain('### initiatives/sample-initiative/brief.md');
    expect(r.text).toContain('## Relevant Memory');
    expect(r.text).toContain('### memory/anti-patterns.md');
    expect(r.outputRelPath).toBe(
      'initiatives/sample-initiative/packs/engineer-review.md',
    );
  });
});
