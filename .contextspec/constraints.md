# Constraints

Hard constraints that bound every plan. If a constraint is broken, the decision must be explicit and documented in `decisions.md`.

## Business

- Solo project, no budget, no team. Timeline is "until the founder uses it daily, then ship publicly".
- No external runtime dependencies on paid services for v0.x. The CLI must work fully offline.
- No telemetry. The CLI must not phone home, ever.

## Technical

- Node 20+, TypeScript, ESM. No CommonJS, no transpiler beyond `tsc`.
- Runtime dependencies stay minimal: `yaml` and `cac` only for v0.1. Adding a runtime dep requires a `decisions.md` entry.
- Pack compilation is deterministic and free of LLM calls. Same inputs + same `generated_at` ⇒ byte-identical output.
- No daemon, no background process, no file watchers in v0.1. Every command is a one-shot CLI invocation.
- Tests run with `vitest` against the `examples/improve-team-invite-conversion/` fixture and the live `.contextspec/` (the dogfood). Fixture-driven tests are preferred over inline string comparisons.

## Product

- Generated files are inspectable in git. No binary outputs, no opaque caches.
- The CLI must not modify user-authored files (memory, roles, top-level context). It only writes to: `initiatives/<id>/packs/`, `.claude/commands/`, and the managed section of `AGENTS.md`.
- v0.1 prioritizes Claude Code; Codex `AGENTS.md` is supported but is the secondary surface.
- Every spec section that introduces a CLI behavior must have at least one test in this repo asserting that behavior on the example fixture.

## Out of scope (v0.1)

- GUI / web UI / TUI
- Cloud sync, multi-machine state
- Vector search, embeddings, retrieval over `.contextspec/`
- Multi-repo orchestration
- Personal knowledge base ingestion (only `source://` references, no copying)
- Auto-applying memory updates without user confirmation
- A `validate` command (deferred to v0.2)
