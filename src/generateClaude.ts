import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve as resolvePath } from 'node:path';
import type { Registry } from './registry.js';

export interface GenerateClaudeOptions {
  /** project root */
  cwd: string;
  /** parsed registry */
  registry: Registry;
  /** if true, overwrite existing files; default true (commands are pure
   *  derivatives of the registry, so re-running should refresh them) */
  force?: boolean;
}

export interface GenerateClaudeResult {
  commandsDir: string;
  written: string[];
  skipped: string[];
}

/**
 * Default task per role for the per-role slash command. Spec §10 names
 * `pm-review`, `growth-review`, `engineer-handoff`, `qa-review`. Anything
 * else defaults to `review`. Engineers also get an extra `engineer-review`
 * because reviewing a plan is equally common.
 */
const DEFAULT_ROLE_TASK: Record<string, string> = {
  pm: 'review',
  growth: 'review',
  qa: 'review',
  engineer: 'handoff',
};

const ENGINEER_EXTRA_TASK = 'review';

export function generateClaude(opts: GenerateClaudeOptions): GenerateClaudeResult {
  const force = opts.force ?? true;
  const commandsDir = resolvePath(opts.cwd, '.claude', 'commands');
  mkdirSync(commandsDir, { recursive: true });

  const written: string[] = [];
  const skipped: string[] = [];

  const writeCmd = (name: string, body: string) => {
    const abs = join(commandsDir, `${name}.md`);
    if (existsSync(abs) && !force) {
      skipped.push(name + '.md');
      return;
    }
    writeFileSync(abs, body);
    written.push(name + '.md');
  };

  for (const role of Object.keys(opts.registry.roles)) {
    const task = DEFAULT_ROLE_TASK[role] ?? 'review';
    writeCmd(`${role}-${task}`, roleCommand(role, task));
    if (role === 'engineer') {
      writeCmd(`engineer-${ENGINEER_EXTRA_TASK}`, roleCommand(role, ENGINEER_EXTRA_TASK));
    }
  }

  writeCmd('context-status', contextStatusCommand());
  writeCmd('context-retro', contextRetroCommand());

  return { commandsDir, written, skipped };
}

function roleCommand(role: string, task: string): string {
  return `---
description: ${capitalize(task)} the named initiative as the ${role} role.
argument-hint: <initiative-id>
---

You are acting as the **${role}** role for this project, performing a **${task}**.

1. Compile a fresh context pack by running:

   \`\`\`bash
   contextspec pack --role ${role} --initiative $ARGUMENTS --task ${task}
   \`\`\`

   The pack will be written to \`.contextspec/initiatives/$ARGUMENTS/packs/${role}-${task}.md\`.

2. Read the pack in full before answering. Ground your response only in the pack and the files referenced under \`## Sources\`.

3. Follow the **Output Contract** in \`.contextspec/roles/${role}.md\` exactly. Always include:
   - assumptions you made
   - risks and open questions
   - explicit links back to specific source paths for any non-trivial claim

4. Do not modify files under \`.contextspec/\`. If you spot an obvious gap (missing file, stale decision, contradiction), report it; do not edit. Memory updates may be **proposed** but require explicit user confirmation before any write.
`;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s[0]!.toUpperCase() + s.slice(1);
}

function contextStatusCommand(): string {
  return `---
description: Summarize the current ContextSpec state of this project.
---

Read \`.contextspec/registry.yaml\` and report:

- declared roles
- declared initiatives, with their attached roles, domains, and projects
- for each initiative, which packs already exist under \`packs/\` and their \`generated_at\` timestamps from the pack frontmatter
- any obvious inconsistencies (e.g. an initiative attaches a domain that has no \`domains/<id>/\` directory)

Do not modify any files. Output as a short bulleted summary.
`;
}

function contextRetroCommand(): string {
  return `---
description: Drive a retrospective for the named initiative and propose memory updates.
argument-hint: <initiative-id>
---

You are running a retrospective for initiative \`$ARGUMENTS\`.

1. Read \`.contextspec/initiatives/$ARGUMENTS/retro.md\`. If it does not exist, report that and stop.
2. Read \`.contextspec/initiatives/$ARGUMENTS/{brief,plan,tasks,acceptance,decisions}.md\` and any \`reviews/*.md\` for context.
3. Identify candidate updates to:
   - \`memory/anti-patterns.md\` — engineering pitfalls observed
   - \`memory/experiment-results.md\` — confirmed wins, losses, and nulls
   - \`principles.md\` — only when a stable principle has been established
   - \`constraints.md\` — only when a hard constraint has been newly discovered
4. Print each proposed update as a diff-style block. **Do not write anything to disk.** Wait for the user to apply the updates manually or confirm before writing.
`;
}
