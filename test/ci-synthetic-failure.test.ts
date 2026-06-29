import {
  cpSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  renameSync,
  writeFileSync,
} from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

const REPO_ROOT = resolve(__dirname, '..');
const NODE_MODULES_PATH = resolve(REPO_ROOT, 'node_modules');

const cleanup: string[] = [];

function freshDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'contextspec-ci-red-'));
  cleanup.push(dir);
  return dir;
}

function copyRepoForCiSimulation(): string {
  const dir = freshDir();
  cpSync(REPO_ROOT, dir, {
    recursive: true,
    filter(source) {
      const rel = source.slice(REPO_ROOT.length).replace(/^\/+/, '');
      if (rel === '') return true;
      return !rel.startsWith('.git/') && rel !== '.git' && !rel.startsWith('node_modules/') && rel !== 'node_modules' && !rel.startsWith('dist/') && rel !== 'dist';
    },
  });
  symlinkSync(NODE_MODULES_PATH, resolve(dir, 'node_modules'));
  return dir;
}

afterEach(() => {
  while (cleanup.length > 0) {
    rmSync(cleanup.pop()!, { recursive: true, force: true });
  }
});

describe('synthetic CI failure simulation', () => {
  it('fails the shipped npm test path when an injected red test is present', () => {
    const dir = copyRepoForCiSimulation();
    const failingTestPath = resolve(dir, 'test', 'synthetic-red.test.ts');
    const selfTestPath = resolve(dir, 'test', 'ci-synthetic-failure.test.ts');
    const parkedSelfTestPath = resolve(dir, 'test', 'ci-synthetic-failure.test.skip');

    // Avoid recursively re-entering this test in the copied repo while still
    // exercising the shipped `npm test` command and its normal discovery path.
    renameSync(selfTestPath, parkedSelfTestPath);

    writeFileSync(
      failingTestPath,
      [
        "import { describe, expect, it } from 'vitest';",
        '',
        "describe('synthetic red', () => {",
        "  it('fails on purpose', () => {",
        '    expect(1).toBe(2);',
        '  });',
        '});',
        '',
      ].join('\n'),
    );

    const run = spawnSync(
      'npm',
      ['test'],
      {
        cwd: dir,
        encoding: 'utf8',
        timeout: 120_000,
      },
    );
    const output = `${run.stdout ?? ''}${run.stderr ?? ''}`;

    expect(run.status).not.toBe(0);
    expect(output).toContain('test/package.test.ts');
    expect(output).toContain('synthetic-red.test.ts');
    expect(output).toContain('expected 1 to be 2');
  });
});
