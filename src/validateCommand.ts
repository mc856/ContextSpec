import { existsSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import { loadRegistry } from './registry.js';
import { validateContextSpec } from './validate.js';

export interface RunValidateCommandOptions {
  projectRoot: string;
  strict?: boolean;
  quiet?: boolean;
  writeLine?: (line: string) => void;
}

export interface RunValidateCommandResult {
  exitCode: number;
}

export function runValidateCommand(
  options: RunValidateCommandOptions,
): RunValidateCommandResult {
  const contextRoot = resolvePath(options.projectRoot, '.contextspec');
  const registryPath = resolvePath(contextRoot, 'registry.yaml');
  const writeLine = options.writeLine ?? (() => {});

  if (!existsSync(registryPath)) {
    writeLine(
      `error: no registry.yaml found at ${registryPath}. ` +
        'Run `contextspec init` first, or pass --cwd.',
    );
    return { exitCode: 1 };
  }

  let registry;
  try {
    registry = loadRegistry(registryPath);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    writeLine(`error: failed to load ${registryPath}: ${message}`);
    return { exitCode: 1 };
  }

  const result = validateContextSpec({
    registry,
    contextRoot,
    strict: options.strict ?? false,
  });

  if (result.issues.length > 0) {
    for (const issue of result.issues) writeLine(issue.message);
    return { exitCode: 1 };
  }

  if (!options.quiet) {
    writeLine(`validated ${contextRoot}`);
  }

  return { exitCode: 0 };
}
