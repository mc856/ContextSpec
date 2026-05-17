# ContextSpec

Portable role-context protocol for coding agents.

ContextSpec helps AI-native solo founders, one-person companies, and small teams turn product, business, engineering, QA, and decision knowledge into structured context packs for coding agents.

It is especially useful when one founder works across many roles and keeps hitting the same problem: the hard part is not only execution, but preserving the right context across repeated AI sessions without re-explaining everything from scratch.

## Status

ContextSpec is currently in product and protocol design. The next implementation target is the v0.1 local file protocol and context pack compiler described in [`CONTEXTSPEC_V0_1_SPEC.md`](CONTEXTSPEC_V0_1_SPEC.md).

## Product shape

ContextSpec has three layers:

```text
canonical docs -> CLI compiler/manager -> host-specific adapters
```

- The canonical layer is `.contextspec/`: roles, initiatives, memory, and `registry.yaml`.
- The CLI (`contextspec`) initializes and compiles that protocol.
- Host adapters expose the same protocol through the surfaces each tool understands today, such as Claude commands and Codex `AGENTS.md`.

Future skills fit naturally as another adapter output. They are a good portable document shape, but they are not the source of truth; the protocol files are.

## Why ContextSpec

Instead of repeating the same background in every AI session, you define your context once:

- product context
- role responsibilities
- domain knowledge
- active initiatives
- project constraints
- lessons and decisions

Then use role-based commands like:

```text
/pm-review improve-invite-flow
/growth-review improve-invite-flow
/engineer-handoff improve-invite-flow
/qa-review improve-invite-flow
```

## Knowledge base boundary

ContextSpec is not a project management tool or a knowledge base.
It is a local-first context layer for AI coding workflows.

It is also not a promise that one founder plus AI replaces an entire company. Its narrower claim is stronger: it helps preserve product, growth, engineering, and QA context across repeated agent sessions.

Personal knowledge bases store raw knowledge. ContextSpec curates agent-ready context.
It can reference or distill notes, docs, customer feedback, and decisions from tools like Obsidian, Notion, Logseq, or local Markdown, but its source of truth is reviewed, task-relevant context that can be compiled into role-based context packs.

## Context layers

ContextSpec treats knowledge as a pipeline:

```text
raw knowledge -> curated knowledge -> structured context -> task context -> context pack
```

Raw knowledge stays in existing tools. ContextSpec stores reviewed, structured context and compiles only task-relevant context into packs. See [`CONTEXTSPEC_V0_1_SPEC.md`](CONTEXTSPEC_V0_1_SPEC.md) for the full taxonomy and placement rules.

## CLI (v0.1, in progress)

```bash
# 1. Create a new .contextspec/ skeleton.
contextspec init

# 2. Create an initiative and register it in registry.yaml.
contextspec create initiative q2-onboarding-pulse \
  --domain onboarding --project web-app

# 3. Compile a context pack for a role.
contextspec pack --role engineer --initiative q2-onboarding-pulse --task review

# 4. Validate registry references before generating or reviewing output.
contextspec validate
contextspec validate --strict   # also checks whether committed packs are stale

# 5. Wire the project up to your coding agent.
contextspec generate claude   # writes .claude/commands/<role>-<task>.md
contextspec generate codex    # creates or updates AGENTS.md in place
```

`pack` reads `.contextspec/registry.yaml`, resolves includes per spec §5.3, routes files to pack sections per §5.7, and writes to `.contextspec/initiatives/<name>/packs/<role>-<task>.md`. Pass `--stdout` to print to stdout instead.

`create initiative` (or `create-initiative`) preserves comments and existing entries in `registry.yaml`.

`validate` checks that registry-referenced files exist, initiative attachments point at declared roles/domains/projects, and every `source://` link is allowed by `registry.sources`. Add `--strict` to also flag stale generated pack files under `initiatives/*/packs/`. Use `--quiet` when you only care about the exit code.

Try it on the example fixture:

```bash
contextspec pack \
  --cwd examples/improve-team-invite-conversion \
  --role growth \
  --initiative improve-team-invite-conversion \
  --task review \
  --stdout
```

This repo dogfoods itself: `.contextspec/` is checked in, and `test/dogfood.test.ts` compiles a pack against it on every CI run, so template drift surfaces as a failing test before it surfaces to a user. The active initiative is `finish-line` — see `.contextspec/initiatives/finish-line/` for the v0.1 release plan.

Development:

```bash
npm install
npm run build
npm test
```

For a reviewer's map of the v0.1 implementation — module-by-module purpose, design choices, test coverage, and open questions — see [`docs/v0-1-implementation-notes.md`](docs/v0-1-implementation-notes.md).

`generate claude` writes idempotent slash commands per role (`pm-review`, `growth-review`, `engineer-handoff`, `engineer-review`, plus `context-status` and `context-retro`). `generate codex` writes a managed `## ContextSpec` section into `AGENTS.md`, marked with HTML comments so user-authored content above and below it survives subsequent regenerations.

## Planned v0.1

- `.contextspec/` file protocol
- `registry.yaml` schema
- PM, Growth, Engineer, and QA role templates
- initiative templates
- Markdown context pack generation
- Claude Code slash command generation
- Codex `AGENTS.md` generation

Likely adapter outputs after v0.1:

- skill exports
- additional prompt / command exports for other coding-agent hosts

Deferred until after the context pack compiler works:

- UI
- cloud sync
- vector search
- personal knowledge base sync
- large-scale document import
- multi-agent orchestration
