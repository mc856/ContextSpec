import { describe, expect, it, beforeEach } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRole } from '../src/createRole.js';
import { generateClaude } from '../src/generateClaude.js';
import { initContextSpec } from '../src/init.js';
import { loadRegistry } from '../src/registry.js';
import { ROLE_QA_MD } from '../src/templates.js';

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'cs-create-role-test-'));
}

describe('createRole', () => {
  let dir: string;
  beforeEach(() => {
    dir = freshDir();
    initContextSpec({ cwd: dir });
  });

  const registryPath = () => join(dir, '.contextspec', 'registry.yaml');
  const rolePath = (id: string) =>
    join(dir, '.contextspec', 'roles', `${id}.md`);

  it('rejects invalid role ids', () => {
    expect(() => createRole({ cwd: dir, id: 'Bad ID' })).toThrow(/kebab-case/);
    expect(() => createRole({ cwd: dir, id: 'qa.lead' })).toThrow(/kebab-case/);
    expect(() => createRole({ cwd: dir, id: '1qa' })).toThrow(/kebab-case/);
  });

  it('writes the curated preset when the id is in the lens library', () => {
    const r = createRole({ cwd: dir, id: 'qa' });
    expect(r.warnings).toEqual([]);
    expect(r.written).toEqual(['roles/qa.md']);
    expect(r.skipped).toEqual([]);
    expect(readFileSync(rolePath('qa'), 'utf8')).toBe(ROLE_QA_MD);
    const reg = loadRegistry(registryPath());
    expect(reg.roles['qa']?.file).toBe('roles/qa.md');
    expect(reg.roles['qa']?.includes ?? []).toEqual([]);
    // empty includes renders inline, matching the skeleton template style
    expect(readFileSync(registryPath(), 'utf8')).toContain('includes: []');
  });

  it("--from clones the project's current on-disk role file with a retitled H1", () => {
    writeFileSync(
      rolePath('engineer'),
      readFileSync(rolePath('engineer'), 'utf8') + '\nCUSTOM-MARKER\n',
    );
    const r = createRole({ cwd: dir, id: 'designer', from: 'engineer' });
    expect(r.written).toEqual(['roles/designer.md']);
    const body = readFileSync(rolePath('designer'), 'utf8');
    expect(body.startsWith('# Role: Designer\n')).toBe(true);
    expect(body).toContain('CUSTOM-MARKER');
  });

  it('falls back to the structured skeleton for unknown ids', () => {
    createRole({ cwd: dir, id: 'data' });
    const body = readFileSync(rolePath('data'), 'utf8');
    expect(body.startsWith('# Role: Data\n')).toBe(true);
    expect(body).toContain('<one or two sentences');
    expect(body).toContain('## Output Contract');
    expect(body).toContain('## Cannot Decide');
  });

  it('preserves registry comments and existing entries', () => {
    createRole({ cwd: dir, id: 'qa' });
    const text = readFileSync(registryPath(), 'utf8');
    expect(text).toContain('# ContextSpec registry');
    expect(text).toContain('# Files loaded for every role');
    const reg = loadRegistry(registryPath());
    expect(Object.keys(reg.roles).sort()).toEqual([
      'engineer',
      'growth',
      'pm',
      'qa',
    ]);
    expect(reg.roles['engineer']?.includes).toEqual([
      'memory/anti-patterns.md',
    ]);
  });

  it('refuses to overwrite without --force and leaves the registry untouched', () => {
    createRole({ cwd: dir, id: 'qa' });
    const before = readFileSync(registryPath(), 'utf8');
    expect(() => createRole({ cwd: dir, id: 'qa' })).toThrow(/already exists/);
    expect(readFileSync(registryPath(), 'utf8')).toBe(before);
  });

  it('--force re-runs are byte-stable for registry and role file', () => {
    createRole({ cwd: dir, id: 'qa' });
    const reg1 = readFileSync(registryPath(), 'utf8');
    const file1 = readFileSync(rolePath('qa'), 'utf8');
    createRole({ cwd: dir, id: 'qa', force: true });
    expect(readFileSync(registryPath(), 'utf8')).toBe(reg1);
    expect(readFileSync(rolePath('qa'), 'utf8')).toBe(file1);
  });

  it('warns when --from shadows a curated preset', () => {
    const r = createRole({ cwd: dir, id: 'qa', from: 'engineer' });
    expect(r.warnings.some((w) => w.includes('curated preset'))).toBe(true);
  });

  it('falls back to the skeleton for prototype-chain ids like `constructor`', () => {
    createRole({ cwd: dir, id: 'constructor' });
    const body = readFileSync(rolePath('constructor'), 'utf8');
    expect(body.startsWith('# Role: Constructor\n')).toBe(true);
    expect(body).toContain('## Output Contract');
  });

  it('rejects a --from value that is not a kebab-case role id', () => {
    const before = readFileSync(registryPath(), 'utf8');
    expect(() =>
      createRole({ cwd: dir, id: 'foo', from: '../context' }),
    ).toThrow(/kebab-case/);
    expect(readFileSync(registryPath(), 'utf8')).toBe(before);
  });

  it('errors without side effects when the --from source does not exist', () => {
    const before = readFileSync(registryPath(), 'utf8');
    expect(() =>
      createRole({ cwd: dir, id: 'designer', from: 'ghost' }),
    ).toThrow(/does not exist/);
    expect(readFileSync(registryPath(), 'utf8')).toBe(before);
  });

  it('errors if registry.yaml does not exist', () => {
    const empty = freshDir();
    expect(() => createRole({ cwd: empty, id: 'qa' })).toThrow(
      /registry\.yaml/,
    );
  });

  it('generate-claude emits qa-review.md once qa is registered', () => {
    createRole({ cwd: dir, id: 'qa' });
    const reg = loadRegistry(registryPath());
    const r = generateClaude({ cwd: dir, registry: reg });
    expect(r.written).toContain('qa-review.md');
    const body = readFileSync(
      join(dir, '.claude', 'commands', 'qa-review.md'),
      'utf8',
    );
    expect(body).toContain('--role qa');
    expect(body).toContain('--task review');
  });
});
