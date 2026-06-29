import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { initContextSpec } from '../src/init.js';

/**
 * Spawned-bin tests for argv preprocessing. These exercise the real
 * `bin/contextspec.js`, which imports `dist/cli.js` — run `npm run build`
 * first (CI does; `npm test` alone against a stale dist will mislead).
 */
const BIN = fileURLToPath(new URL('../bin/contextspec.js', import.meta.url));

function run(args: string[]): string {
  // Notices go to stderr by design; capture both, return stderr for asserts.
  try {
    execFileSync(process.execPath, [BIN, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return '';
  } catch (err) {
    throw new Error(
      `bin exited non-zero for: ${args.join(' ')}\n${(err as { stderr?: string }).stderr ?? ''}`,
    );
  }
}

describe('cli (spawned bin)', () => {
  it('collapses spec-form `create role` even after a leading flag', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cs-cli-test-'));
    initContextSpec({ cwd: dir });
    // The regression this locks: preprocessArgv used to check fixed argv
    // positions, so a leading --cwd broke every spec-form command.
    run(['--cwd', dir, 'create', 'role', 'qa']);
    expect(existsSync(join(dir, '.contextspec', 'roles', 'qa.md'))).toBe(true);
    const registry = readFileSync(
      join(dir, '.contextspec', 'registry.yaml'),
      'utf8',
    );
    expect(registry).toContain('qa:');
    expect(registry).toContain('file: roles/qa.md');
  });

  it('collapses spec-form commands at the front as before', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cs-cli-test-'));
    initContextSpec({ cwd: dir });
    run(['create', 'role', 'data', '--cwd', dir]);
    expect(existsSync(join(dir, '.contextspec', 'roles', 'data.md'))).toBe(
      true,
    );
  });
});
