# Principles

Stable, opinionated rules that bias every decision in ContextSpec. Each one was used at least once to settle a design call.

- **Files are the source of truth.** Everything in `.contextspec/` is hand-written Markdown or YAML the user owns and diffs in git. The CLI never writes to user-authored files (memory, roles, context). It only writes generated artifacts (packs, slash commands, the managed AGENTS.md block) — and those carry explicit markers or live under `packs/`.

- **No LLM in the hot path.** Pack compilation is pure string concatenation routed by path. Same input + same `generated_at` → byte-identical output. This makes packs diff-able, cache-able, and reviewable without rerunning a model.

- **Byte-stability is a feature.** Two runs of `pack` with identical inputs (or `generate codex` with no upstream change) must produce identical bytes. Tests assert this. It's the cheapest way to keep generated files reviewable in PRs.

- **Templates are opinionated, not blank.** Every scaffolded file ships with structure (H2 headers, output contracts, checklists) that nudges the user toward the protocol's intended shape. A blank file teaches nothing; a structured stub teaches the protocol.

- **Path-based routing beats config-based routing.** A file's location determines its pack section. The same file landing in `roles/` vs `memory/` is not a config knob — it's a refactor. This keeps the registry tiny and the structure self-evident.

- **Idempotent generators by default.** `generate claude` and `generate codex` re-run safely. User edits to pure-derivative files (slash commands) get clobbered with a clear flag (`--no-force` to opt out); user edits outside the managed AGENTS.md section are preserved unconditionally.

- **`source://` is a reference, not an import.** External knowledge bases stay external. The pack lists `source://<id>/<path>` URIs the agent can resolve, validated against `registry.sources.<id>.{include,exclude}`. We never copy raw notes into `.contextspec/`.

- **Do not bypass user confirmation for memory.** Generators may *propose* memory updates in retro flows. They never write to `memory/`. Memory is curated knowledge — that's the contract.
