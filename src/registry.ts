import { readFileSync } from 'node:fs';
import { parse as parseYaml } from 'yaml';

export interface SourceDecl {
  type: string;
  path: string;
  include?: string[];
  exclude?: string[];
  mode?: 'reference_only';
}

export interface RoleDecl {
  file: string;
  includes?: string[];
}

export interface DomainDecl {
  includes?: string[];
}

export interface ProjectDecl {
  repo?: string;
  includes?: string[];
}

export interface InitiativeDecl {
  path: string;
  roles?: string[];
  domains?: string[];
  projects?: string[];
}

export interface Registry {
  version: string;
  context: { includes: string[] };
  sources?: Record<string, SourceDecl>;
  roles: Record<string, RoleDecl>;
  domains?: Record<string, DomainDecl>;
  projects?: Record<string, ProjectDecl>;
  initiatives?: Record<string, InitiativeDecl>;
}

export function loadRegistry(path: string): Registry {
  const text = readFileSync(path, 'utf8');
  const data = parseYaml(text) as unknown;
  return validateRegistry(data);
}

function validateRegistry(data: unknown): Registry {
  if (!data || typeof data !== 'object') {
    throw new Error('registry.yaml must be a YAML mapping');
  }
  const r = data as Record<string, unknown>;
  if (r.version !== '0.1' && r.version !== 0.1) {
    throw new Error(`registry.yaml: unsupported version '${String(r.version)}', v0.1 expected`);
  }
  if (!r.context || typeof r.context !== 'object') {
    throw new Error('registry.yaml: missing required field `context`');
  }
  const ctx = r.context as Record<string, unknown>;
  if (!Array.isArray(ctx.includes)) {
    throw new Error('registry.yaml: `context.includes` must be a list');
  }
  if (!r.roles || typeof r.roles !== 'object') {
    throw new Error('registry.yaml: missing required field `roles`');
  }
  return {
    version: '0.1',
    context: { includes: ctx.includes as string[] },
    sources: (r.sources as Registry['sources']) ?? undefined,
    roles: r.roles as Registry['roles'],
    domains: r.domains as Registry['domains'],
    projects: r.projects as Registry['projects'],
    initiatives: r.initiatives as Registry['initiatives'],
  };
}
