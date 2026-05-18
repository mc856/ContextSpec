import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve as resolvePath } from 'node:path';
import { cac } from 'cac';
import { compilePack } from './compile.js';
import { createInitiative } from './createInitiative.js';
import { generateClaude } from './generateClaude.js';
import { generateCodex } from './generateCodex.js';
import { initContextSpec } from './init.js';
import { loadRegistry } from './registry.js';
import { runValidateCommand } from './validateCommand.js';

/**
 * Allow the spec-form `contextspec create initiative <name>` in addition
 * to `contextspec create-initiative <name>`. cac treats command names as
 * single tokens, so we collapse the two-word form here before parsing.
 */
function preprocessArgv(argv: string[]): string[] {
  const out = argv.slice();
  // argv[0] = node, argv[1] = bin entry; user tokens start at index 2.
  if (out[2] === 'create' && out[3] === 'initiative') {
    out.splice(2, 2, 'create-initiative');
  }
  if (out[2] === 'generate' && out[3] === 'claude') {
    out.splice(2, 2, 'generate-claude');
  }
  if (out[2] === 'generate' && out[3] === 'codex') {
    out.splice(2, 2, 'generate-codex');
  }
  return out;
}

const cli = cac('contextspec');

cli
  .command('init', 'Create a new `.contextspec/` skeleton in the current directory.')
  .option('--cwd <path>', 'project root (default: current directory)')
  .option('--force', 'overwrite existing files', { default: false })
  .action(async (options: InitCmdOptions) => {
    const projectRoot = resolveCwd(options.cwd);
    try {
      const r = initContextSpec({ cwd: projectRoot, force: options.force });
      for (const f of r.written) console.error(`wrote ${f}`);
      for (const f of r.skipped) console.error(`skipped (already exists): ${f}`);
      console.error(`\ncontextspec initialized at ${r.contextRoot}`);
    } catch (err) {
      console.error(`error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

cli
  .command(
    'create-initiative <id>',
    'Create an initiative skeleton and register it in registry.yaml.',
  )
  .option('--cwd <path>', 'project root (default: current directory)')
  .option(
    '--role <role>',
    'role attached to the initiative (repeatable; default: all roles)',
  )
  .option('--domain <domain>', 'domain id attached to the initiative (repeatable)')
  .option('--project <project>', 'project id attached to the initiative (repeatable)')
  .option('--force', 'overwrite existing initiative files', { default: false })
  .action(async (id: string, options: CreateInitiativeCmdOptions) => {
    const projectRoot = resolveCwd(options.cwd);
    try {
      const r = createInitiative({
        cwd: projectRoot,
        id,
        roles: toArray(options.role),
        domains: toArray(options.domain),
        projects: toArray(options.project),
        force: options.force,
      });
      for (const f of r.written) console.error(`wrote ${f}`);
      for (const f of r.skipped) console.error(`skipped (already exists): ${f}`);
      for (const w of r.warnings) console.error(`warning: ${w}`);
      console.error(`\ninitiative '${id}' created at ${r.initiativeRoot}`);
    } catch (err) {
      console.error(`error: ${(err as Error).message}`);
      process.exit(1);
    }
  });

cli
  .command(
    'generate-claude',
    'Generate Claude Code slash commands under .claude/commands/.',
  )
  .option('--cwd <path>', 'project root (default: current directory)')
  .option('--no-force', 'skip files that already exist instead of overwriting')
  .action(async (options: GenerateClaudeCmdOptions) => {
    const projectRoot = resolveCwd(options.cwd);
    const registryPath = resolvePath(projectRoot, '.contextspec', 'registry.yaml');
    if (!existsSync(registryPath)) {
      console.error(
        `error: no registry.yaml found at ${registryPath}. ` +
          `Run \`contextspec init\` first.`,
      );
      process.exit(1);
    }
    const registry = loadRegistry(registryPath);
    const r = generateClaude({
      cwd: projectRoot,
      registry,
      force: options.force ?? true,
    });
    for (const f of r.written) console.error(`wrote .claude/commands/${f}`);
    for (const f of r.skipped) console.error(`skipped (already exists): .claude/commands/${f}`);
    console.error(`\nClaude Code slash commands written to ${r.commandsDir}`);
  });

cli
  .command(
    'generate-codex',
    'Generate or update AGENTS.md for Codex.',
  )
  .option('--cwd <path>', 'project root (default: current directory)')
  .action(async (options: GenerateCodexCmdOptions) => {
    const projectRoot = resolveCwd(options.cwd);
    if (!existsSync(resolvePath(projectRoot, '.contextspec', 'registry.yaml'))) {
      console.error(
        `error: no .contextspec/registry.yaml found in ${projectRoot}. ` +
          `Run \`contextspec init\` first.`,
      );
      process.exit(1);
    }
    const r = generateCodex({ cwd: projectRoot });
    console.error(`${r.action} ${r.agentsPath}`);
  });

cli
  .command(
    'validate',
    'Validate registry references and optional generated-pack freshness.',
  )
  .option('--cwd <path>', 'project root containing .contextspec/ (default: current directory)')
  .option('--strict', 'also flag stale pack files in initiatives/*/packs/', {
    default: false,
  })
  .option('--quiet', 'suppress success output', { default: false })
  .action(async (options: ValidateCmdOptions) => {
    const projectRoot = resolveCwd(options.cwd);
    const result = runValidateCommand({
      projectRoot,
      strict: options.strict ?? false,
      quiet: options.quiet ?? false,
      writeLine: (line) => console.error(line),
    });
    if (result.exitCode !== 0) {
      process.exit(result.exitCode);
    }
  });

cli
  .command(
    'pack',
    'Compile a context pack for the given role + initiative.',
  )
  .option('--role <role>', 'role id (required)')
  .option('--initiative <name>', 'initiative id (required)')
  .option('--task <task>', 'task name', { default: 'review' })
  .option('--project <project>', 'restrict to a single attached project')
  .option(
    '--cwd <path>',
    'project root containing .contextspec/ (default: current directory)',
  )
  .option(
    '--stdout',
    'write the compiled pack to stdout instead of a file',
    { default: false },
  )
  .action(async (options: PackOptions) => {
    if (!options.role) {
      console.error('error: --role is required');
      process.exit(2);
    }
    if (!options.initiative) {
      console.error('error: --initiative is required');
      process.exit(2);
    }

    const projectRoot = resolveCwd(options.cwd);
    const contextRoot = resolvePath(projectRoot, '.contextspec');
    const registryPath = resolvePath(contextRoot, 'registry.yaml');

    if (!existsSync(registryPath)) {
      console.error(
        `error: no registry.yaml found at ${registryPath}. ` +
          `Run \`contextspec init\` first, or pass --cwd.`,
      );
      process.exit(1);
    }

    const registry = loadRegistry(registryPath);
    const result = compilePack({
      registry,
      contextRoot,
      role: options.role,
      initiative: options.initiative,
      project: options.project,
      task: options.task,
    });

    for (const w of result.warnings) {
      console.error(`warning: ${w}`);
    }

    if (options.stdout) {
      process.stdout.write(result.text);
      return;
    }

    const outAbs = resolvePath(contextRoot, result.outputRelPath);
    mkdirSync(dirname(outAbs), { recursive: true });
    writeFileSync(outAbs, result.text);
    console.error(`wrote ${result.outputRelPath}`);
  });

cli.help();
cli.version('0.1.0');
cli.parse(preprocessArgv(process.argv));

function resolveCwd(cwd?: string): string {
  if (!cwd) return process.cwd();
  return isAbsolute(cwd) ? cwd : resolvePath(process.cwd(), cwd);
}

function toArray(v: string | string[] | undefined): string[] | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v : [v];
}

interface InitCmdOptions {
  cwd?: string;
  force?: boolean;
}

interface CreateInitiativeCmdOptions {
  cwd?: string;
  role?: string | string[];
  domain?: string | string[];
  project?: string | string[];
  force?: boolean;
}

interface GenerateClaudeCmdOptions {
  cwd?: string;
  force?: boolean;
}

interface GenerateCodexCmdOptions {
  cwd?: string;
}

interface PackOptions {
  role?: string;
  initiative?: string;
  task?: string;
  project?: string;
  cwd?: string;
  stdout?: boolean;
}

interface ValidateCmdOptions {
  cwd?: string;
  strict?: boolean;
  quiet?: boolean;
}
