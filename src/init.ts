import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve as resolvePath } from 'node:path';
import {
  CONSTRAINTS_MD,
  CONTEXT_MD,
  GLOSSARY_MD,
  MEMORY_ANTI_PATTERNS_MD,
  MEMORY_EXPERIMENT_RESULTS_MD,
  MEMORY_README_MD,
  PRINCIPLES_MD,
  REGISTRY_YAML,
  ROLE_ENGINEER_MD,
  ROLE_GROWTH_MD,
  ROLE_PM_MD,
} from './templates.js';

export interface InitOptions {
  /** project root in which `.contextspec/` will be created */
  cwd: string;
  /** if true, overwrite existing files; default false */
  force?: boolean;
}

export interface InitResult {
  contextRoot: string;
  written: string[];
  /** files left untouched because they already existed (and --force was not set) */
  skipped: string[];
}

const FILES: Array<{ rel: string; body: string }> = [
  { rel: 'registry.yaml', body: REGISTRY_YAML },
  { rel: 'context.md', body: CONTEXT_MD },
  { rel: 'principles.md', body: PRINCIPLES_MD },
  { rel: 'glossary.md', body: GLOSSARY_MD },
  { rel: 'constraints.md', body: CONSTRAINTS_MD },
  { rel: 'roles/pm.md', body: ROLE_PM_MD },
  { rel: 'roles/growth.md', body: ROLE_GROWTH_MD },
  { rel: 'roles/engineer.md', body: ROLE_ENGINEER_MD },
  { rel: 'memory/README.md', body: MEMORY_README_MD },
  { rel: 'memory/anti-patterns.md', body: MEMORY_ANTI_PATTERNS_MD },
  { rel: 'memory/experiment-results.md', body: MEMORY_EXPERIMENT_RESULTS_MD },
];

export function initContextSpec(opts: InitOptions): InitResult {
  const contextRoot = resolvePath(opts.cwd, '.contextspec');
  const registryPath = join(contextRoot, 'registry.yaml');

  if (existsSync(registryPath) && !opts.force) {
    throw new Error(
      `${registryPath} already exists. Pass --force to overwrite.`,
    );
  }

  const written: string[] = [];
  const skipped: string[] = [];
  for (const f of FILES) {
    const abs = join(contextRoot, f.rel);
    if (existsSync(abs) && !opts.force) {
      skipped.push(f.rel);
      continue;
    }
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, f.body);
    written.push(f.rel);
  }

  return { contextRoot, written, skipped };
}
