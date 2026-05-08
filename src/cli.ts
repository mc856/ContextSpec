import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, resolve as resolvePath } from 'node:path';
import { cac } from 'cac';
import { compilePack } from './compile.js';
import { loadRegistry } from './registry.js';

const cli = cac('contextspec');

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

    const projectRoot = options.cwd
      ? isAbsolute(options.cwd)
        ? options.cwd
        : resolvePath(process.cwd(), options.cwd)
      : process.cwd();
    const contextRoot = resolvePath(projectRoot, '.contextspec');
    const registryPath = resolvePath(contextRoot, 'registry.yaml');

    if (!existsSync(registryPath)) {
      console.error(
        `error: no registry.yaml found at ${registryPath}. ` +
          `Run from a project containing .contextspec/, or pass --cwd.`,
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
cli.version(getVersion());
cli.parse();

interface PackOptions {
  role?: string;
  initiative?: string;
  task?: string;
  project?: string;
  cwd?: string;
  stdout?: boolean;
}

function getVersion(): string {
  return '0.1.0';
}
