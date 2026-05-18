import { readFileSync } from 'node:fs';
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
});
