import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseDocument } from 'yaml';
import { describe, expect, it } from 'vitest';

type PackageJson = {
  scripts?: Record<string, string>;
};

type WorkflowStep = Record<string, unknown>;

type Workflow = {
  on?: Record<string, unknown>;
  jobs?: Record<string, { strategy?: { matrix?: Record<string, unknown> }; steps?: WorkflowStep[] }>;
};

const REPO_ROOT = resolve(__dirname, '..');
const PACKAGE_JSON_PATH = resolve(REPO_ROOT, 'package.json');
const TEST_WORKFLOW_PATH = resolve(REPO_ROOT, '.github', 'workflows', 'test.yml');
const RELEASE_WORKFLOW_PATH = resolve(REPO_ROOT, '.github', 'workflows', 'release.yml');

function loadPackageJson(): PackageJson {
  return JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8')) as PackageJson;
}

function loadWorkflow(path: string): Workflow {
  return parseDocument(readFileSync(path, 'utf8')).toJS() as Workflow;
}

function getRunSteps(steps: WorkflowStep[] | undefined): string[] {
  return (steps ?? [])
    .map((step) => step.run)
    .filter((step): step is string => typeof step === 'string');
}

function findUsesStep(steps: WorkflowStep[] | undefined, uses: string): WorkflowStep | undefined {
  return (steps ?? []).find((step) => step.uses === uses);
}

describe('CI workflows', () => {
  it('defines a lint script for CI to run before build and tests', () => {
    const pkg = loadPackageJson();

    expect(pkg.scripts?.lint).toBe('tsc -p tsconfig.json --noEmit');
  });

  it('commits the pull-request workflow for push/main and pull_request on Node 20 and 22', () => {
    expect(existsSync(TEST_WORKFLOW_PATH)).toBe(true);

    const workflow = loadWorkflow(TEST_WORKFLOW_PATH);
    const testJob = workflow.jobs?.test;

    expect(workflow.on).toMatchObject({
      pull_request: {},
      push: {
        branches: ['main'],
      },
    });
    expect(testJob?.strategy?.matrix?.node).toEqual([20, 22]);
    expect(getRunSteps(testJob?.steps)).toEqual([
      'npm ci',
      'npm run lint',
      'npm run build',
      'npm test',
    ]);
  });

  it('commits the release workflow for version tags and npm publish', () => {
    expect(existsSync(RELEASE_WORKFLOW_PATH)).toBe(true);

    const workflow = loadWorkflow(RELEASE_WORKFLOW_PATH);
    const publishJob = workflow.jobs?.publish;

    expect(workflow.on).toMatchObject({
      push: {
        tags: ['v*.*.*'],
      },
    });

    const setupNodeStep = findUsesStep(publishJob?.steps, 'actions/setup-node@v4');
    const publishStep = (publishJob?.steps ?? []).find((step) => step.run === 'npm publish');

    expect(setupNodeStep).toMatchObject({
      with: {
        'node-version': 22,
        cache: 'npm',
        'registry-url': 'https://registry.npmjs.org',
      },
    });
    expect(getRunSteps(publishJob?.steps)).toEqual([
      'npm ci',
      'npm run lint',
      'npm run build',
      'npm test',
      'npm publish',
    ]);
    expect(publishStep).toMatchObject({
      env: {
        NODE_AUTH_TOKEN: '${{ secrets.NODE_AUTH_TOKEN }}',
      },
    });
  });
});
