# Product Context

ContextSpec is a file-based protocol plus a CLI that gives coding agents (Claude Code, Codex) role-specific, task-scoped context — the way humans onboard a new teammate, not the way RAG retrieves chunks.

## What we build

- A **protocol**: `.contextspec/` directory layout, `registry.yaml` schema, and rules for compiling a context pack out of curated Markdown.
- A **CLI** (`contextspec`): `init`, `create initiative`, `pack`, `generate claude`, `generate codex`. The CLI is intentionally a thin, deterministic compiler — no LLM in the hot path, no cloud, no daemon.
- An **integration surface** with Claude Code (slash commands) and Codex (`AGENTS.md`) so the protocol shows up at the agent's surface area, not as a separate tool the user has to invoke.

The protocol is the product's canonical layer. Commands, AGENTS instructions, and future skills are adapter outputs, not the source of truth. They may vary by host tool; the underlying role and context files should not.

The user owns the source files in git. The CLI is a renderer over those files.

## Stage

Early prototype. v0.1 is a personal build — used to validate that the protocol's loop (curate → compile pack → run agent → retro → update memory) is worth shipping at all. There are no other users, no telemetry, no published package yet.

## Target user

Solo founders, one-person companies, and small teams who:

- already use Claude Code or Codex for non-trivial work
- have hit the wall where pasting context into prompts is the bottleneck
- write enough Markdown that a file-based protocol feels native, not bureaucratic
- value reproducibility (git diffs, byte-stable output) over slick UX

Not for: agencies running dozens of client repos, organizations with formal docs systems they cannot replace, teams whose context lives in tickets and Slack rather than Markdown.

## What we are optimizing right now

**Solo-founder usability.** v0.1 is the version the founder uses themselves. If running `init` → `create initiative` → `pack` → `/<role>-review` doesn't feel obviously better than pasting context into a prompt, the protocol is wrong, not the implementation. Everything else (publish, CI, validate, GUI, sync) waits until that loop has landed.

The intended use case is not "replace the company with agents." It is "help one founder preserve product, growth, engineering, and QA context across repeated AI sessions without rebuilding that context from scratch every time."
