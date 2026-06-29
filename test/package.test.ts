import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type PackageJson = {
  files?: string[];
  scripts?: Record<string, string>;
};

const PACKAGE_JSON_PATH = resolve(process.cwd(), 'package.json');

function loadPackageJson(): PackageJson {
  return JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8')) as PackageJson;
}

type PublishDryRunFile = {
  path: string;
  mode: number;
};

type PublishDryRunResult = {
  files: PublishDryRunFile[];
};

function runPublishDryRun(): { output: string; result: PublishDryRunResult } {
  const cacheDir = mkdtempSync(resolve(tmpdir(), 'contextspec-npm-cache-'));
  const run = spawnSync('npm', ['publish', '--dry-run', '--json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: {
      ...process.env,
      npm_config_cache: cacheDir,
    },
  });
  const stdout = run.stdout ?? '';
  const stderr = run.stderr ?? '';
  const output = `${stdout}${stderr}`;

  expect(run.status).toBe(0);

  const jsonStart = stdout.lastIndexOf('\n{');
  const jsonText = (jsonStart === -1 ? stdout : stdout.slice(jsonStart + 1)).trim();

  return {
    output,
    result: JSON.parse(jsonText) as PublishDryRunResult,
  };
}

describe('release package metadata', () => {
  it('builds before publish', () => {
    const pkg = loadPackageJson();
    expect(pkg.scripts?.prepublishOnly).toBe('npm run build');
  });

  it('includes the release artifacts and release notes in the npm package', () => {
    const pkg = loadPackageJson();
    expect(pkg.files).toEqual(
      expect.arrayContaining(['bin', 'dist', 'README.md', 'CHANGELOG.md']),
    );
  });

  it('verifies the real publish dry-run payload and publish hook', () => {
    const { output, result } = runPublishDryRun();
    const files = result.files.map((file) => file.path);
    const binEntry = result.files.find((file) => file.path === 'bin/contextspec.js');

    expect(output).toContain('prepublishOnly');
    expect(files).toEqual(
      expect.arrayContaining([
        'CHANGELOG.md',
        'README.md',
        'bin/contextspec.js',
        'dist/cli.js',
        'dist/index.js',
        'package.json',
      ]),
    );
    expect(binEntry?.mode).toBe(0o755);
  });
});
