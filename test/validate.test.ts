import { beforeEach, describe, expect, it } from 'vitest';
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve as resolvePath } from 'node:path';
import {
  loadRegistry,
  runValidateCommand,
  validateContextSpec,
} from '../src/index.js';

const EXAMPLE_PROJECT_ROOT = resolvePath(
  __dirname,
  '..',
  'examples',
  'improve-team-invite-conversion',
);
const EXAMPLE_CONTEXT_ROOT = resolvePath(EXAMPLE_PROJECT_ROOT, '.contextspec');
const DOGFOOD_PROJECT_ROOT = resolvePath(__dirname, '..');
const DOGFOOD_CONTEXT_ROOT = resolvePath(DOGFOOD_PROJECT_ROOT, '.contextspec');

function freshDir(): string {
  return mkdtempSync(join(tmpdir(), 'cs-validate-test-'));
}

function cloneExample(): string {
  const dir = freshDir();
  cpSync(EXAMPLE_PROJECT_ROOT, dir, { recursive: true });
  return dir;
}

describe('validateContextSpec', () => {
  const cleanup: string[] = [];

  beforeEach(() => {
    while (cleanup.length > 0) {
      const dir = cleanup.pop()!;
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns no issues for the example fixture', () => {
    const registry = loadRegistry(resolvePath(EXAMPLE_CONTEXT_ROOT, 'registry.yaml'));
    const result = validateContextSpec({
      registry,
      contextRoot: EXAMPLE_CONTEXT_ROOT,
    });

    expect(result.issues).toEqual([]);
  });

  it('returns no issues for the live dogfood context', () => {
    const registry = loadRegistry(resolvePath(DOGFOOD_CONTEXT_ROOT, 'registry.yaml'));
    const result = validateContextSpec({
      registry,
      contextRoot: DOGFOOD_CONTEXT_ROOT,
    });

    expect(result.issues).toEqual([]);
  });

  it('reports a missing referenced file with the offending key', () => {
    const dir = cloneExample();
    cleanup.push(dir);

    rmSync(
      resolvePath(dir, '.contextspec', 'projects', 'web-app.md'),
      { force: true },
    );

    const contextRoot = resolvePath(dir, '.contextspec');
    const registry = loadRegistry(resolvePath(contextRoot, 'registry.yaml'));
    const result = validateContextSpec({
      registry,
      contextRoot,
    });

    expect(result.issues).toEqual([
      expect.objectContaining({
        key: 'projects.web-app.includes[0]',
        path: 'projects/web-app.md',
      }),
    ]);
    expect(result.issues[0]!.message).toContain('projects.web-app.includes[0]');
    expect(result.issues[0]!.message).toContain('projects/web-app.md');
  });

  it('reports an invalid source link with the offending file path', () => {
    const dir = cloneExample();
    cleanup.push(dir);

    const contextMapPath = resolvePath(
      dir,
      '.contextspec',
      'initiatives',
      'improve-team-invite-conversion',
      'context-map.md',
    );
    const original = readFileSync(contextMapPath, 'utf8');
    writeFileSync(
      contextMapPath,
      original.replace(
        'source://personal_knowledge_base/Customers/2025-Q3-onboarding-review.md',
        'source://personal_knowledge_base/Daily/secret.md',
      ),
    );

    const contextRoot = resolvePath(dir, '.contextspec');
    const registry = loadRegistry(resolvePath(contextRoot, 'registry.yaml'));
    const result = validateContextSpec({
      registry,
      contextRoot,
    });

    expect(result.issues).toContainEqual(
      expect.objectContaining({
        key: 'initiatives/improve-team-invite-conversion/context-map.md',
        path: 'initiatives/improve-team-invite-conversion/context-map.md',
      }),
    );
    expect(
      result.issues.some((issue) => issue.message.includes('invalid source link')),
    ).toBe(true);
  });

  it('reports an initiative attachment to an unknown role', () => {
    const dir = cloneExample();
    cleanup.push(dir);

    const registryPath = resolvePath(dir, '.contextspec', 'registry.yaml');
    const original = readFileSync(registryPath, 'utf8');
    writeFileSync(
      registryPath,
      original.replace(
        '    roles:\n      - pm\n      - growth\n      - engineer\n',
        '    roles:\n      - pm\n      - growth\n      - engineer\n      - qa\n',
      ),
    );

    const contextRoot = resolvePath(dir, '.contextspec');
    const registry = loadRegistry(resolvePath(contextRoot, 'registry.yaml'));
    const result = validateContextSpec({
      registry,
      contextRoot,
    });

    expect(result.issues).toContainEqual(
      expect.objectContaining({
        key: 'initiatives.improve-team-invite-conversion.roles[3]',
      }),
    );
    expect(
      result.issues.some((issue) => issue.message.includes("unknown role 'qa'")),
    ).toBe(true);
  });

  it('flags a stale committed pack when its source set no longer matches live inputs', () => {
    const dir = cloneExample();
    cleanup.push(dir);

    const packPath = resolvePath(
      dir,
      '.contextspec',
      'initiatives',
      'improve-team-invite-conversion',
      'packs',
      'growth-review.md',
    );
    const original = readFileSync(packPath, 'utf8');
    writeFileSync(
      packPath,
      original.replace(
        '  - source://personal_knowledge_base/Customers/2025-Q3-onboarding-review.md\n',
        '',
      ),
    );

    const contextRoot = resolvePath(dir, '.contextspec');
    const registry = loadRegistry(resolvePath(contextRoot, 'registry.yaml'));
    const result = validateContextSpec({
      registry,
      contextRoot,
      strict: true,
    });

    expect(result.issues).toContainEqual(
      expect.objectContaining({
        key: 'initiatives.improve-team-invite-conversion.packs.growth-review.md',
        path: 'initiatives/improve-team-invite-conversion/packs/growth-review.md',
      }),
    );
    expect(
      result.issues.some((issue) => issue.message.includes('stale')),
    ).toBe(true);
  });
});

describe('runValidateCommand', () => {
  const cleanup: string[] = [];

  beforeEach(() => {
    while (cleanup.length > 0) {
      const dir = cleanup.pop()!;
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns a concise error for malformed registry yaml', () => {
    const dir = cloneExample();
    cleanup.push(dir);

    const registryPath = resolvePath(dir, '.contextspec', 'registry.yaml');
    writeFileSync(registryPath, 'version: [\n');

    const lines: string[] = [];
    const result = runValidateCommand({
      projectRoot: dir,
      writeLine: (line) => lines.push(line),
    });

    expect(result.exitCode).toBe(1);
    expect(lines).toHaveLength(1);
    expect(lines[0]).toContain('error:');
    expect(lines[0]).toContain('registry.yaml');
    expect(lines[0]).not.toContain('YAMLParseError:');
    expect(lines[0]).not.toContain('at Composer.onError');
  });
});
