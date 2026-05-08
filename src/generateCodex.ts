import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

export interface GenerateCodexOptions {
  /** project root in which `AGENTS.md` will be created or updated */
  cwd: string;
}

export interface GenerateCodexResult {
  agentsPath: string;
  /** 'created' if no AGENTS.md existed, 'updated' if the section was
   *  replaced, 'inserted' if AGENTS.md existed without our section */
  action: 'created' | 'inserted' | 'updated';
}

const BEGIN_MARKER = '<!-- contextspec:begin -->';
const END_MARKER = '<!-- contextspec:end -->';

const SECTION_BODY = `## ContextSpec

This repository uses [ContextSpec](https://github.com/mc856/codex) v0.1 to manage role-specific agent context. Before making non-trivial changes:

1. Read \`.contextspec/context.md\`, \`.contextspec/principles.md\`, \`.contextspec/glossary.md\`, and \`.contextspec/constraints.md\` for product-wide framing and limits.
2. Read the relevant role file under \`.contextspec/roles/\` (e.g. \`roles/engineer.md\`) and treat its **Output Contract** as the format for your response.
3. If the user names an initiative, read everything under \`.contextspec/initiatives/<id>/\` in this order: \`brief.md\`, \`context-map.md\`, \`plan.md\`, \`tasks.md\`, \`acceptance.md\`, \`decisions.md\`, then any \`reviews/*.md\`, then \`retro.md\`. The \`packs/\` subdirectory holds compiled output and is generated, not edited.
4. If the \`contextspec\` CLI is available, prefer running it to compile a fresh task-scoped context pack:

   \`\`\`bash
   contextspec pack --role <role> --initiative <id> --task <task>
   \`\`\`

   The compiled pack at \`.contextspec/initiatives/<id>/packs/<role>-<task>.md\` is the canonical task context. Use it instead of re-reading every input file ad hoc.
5. Memory under \`.contextspec/memory/\` is curated, append-only knowledge. You may **propose** updates during retro work, but do not write to \`memory/\` without explicit user confirmation.
6. \`.contextspec/registry.yaml\` is the source of truth for roles, domains, projects, and initiatives. Adding to it is a scope change; surface it to the user rather than editing silently.`;

function buildSection(): string {
  return `${BEGIN_MARKER}\n${SECTION_BODY}\n${END_MARKER}\n`;
}

export function generateCodex(opts: GenerateCodexOptions): GenerateCodexResult {
  const agentsPath = resolvePath(opts.cwd, 'AGENTS.md');
  const section = buildSection();

  if (!existsSync(agentsPath)) {
    const body = `# AGENTS.md\n\n${section}`;
    writeFileSync(agentsPath, body);
    return { agentsPath, action: 'created' };
  }

  const existing = readFileSync(agentsPath, 'utf8');
  const beginIdx = existing.indexOf(BEGIN_MARKER);
  const endIdx = existing.indexOf(END_MARKER);

  if (beginIdx >= 0 && endIdx > beginIdx) {
    // Replace existing managed section in place.
    const before = existing.slice(0, beginIdx);
    const after = existing.slice(endIdx + END_MARKER.length);
    const replaced = before + section.trimEnd() + after;
    writeFileSync(agentsPath, ensureTrailingNewline(replaced));
    return { agentsPath, action: 'updated' };
  }

  // AGENTS.md exists but has no managed section yet — append.
  const sep = existing.endsWith('\n') ? '\n' : '\n\n';
  const inserted = existing + sep + section;
  writeFileSync(agentsPath, ensureTrailingNewline(inserted));
  return { agentsPath, action: 'inserted' };
}

function ensureTrailingNewline(s: string): string {
  return s.endsWith('\n') ? s : s + '\n';
}
