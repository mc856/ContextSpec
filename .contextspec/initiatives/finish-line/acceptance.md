# Acceptance

Observable outcomes. Each phase is independently shippable.

## Per-phase

### Phase 1 — Dogfood

- A user cloning this repo can run `node bin/contextspec.js pack --role engineer --initiative finish-line --task review` and get a non-empty pack with no warnings.
- The repo's own `.contextspec/registry.yaml` declares the `cli` project, the `finish-line` initiative, and references no missing files.
- A test (`test/dogfood.test.ts`) fails when any registry-referenced file is removed or renamed without updating the registry.
- `AGENTS.md` exists at the repo root, contains a managed `<!-- contextspec:begin -->` … `<!-- contextspec:end -->` block, and survives a re-run of `generate codex` byte-identical.
- `.claude/commands/` contains six markdown files; each per-role command embeds the matching `contextspec pack` invocation.

### Phase 2 — `contextspec validate`

- `contextspec validate` exits 0 on the example fixture and on the live `.contextspec/`.
- `contextspec validate` exits non-zero with a one-line-per-issue report when: a referenced file is missing, a `source://` URI fails its include/exclude, an initiative attaches a role that isn't declared.
- The error messages name the file path and the offending line/key (no hex addresses, no stack traces in the default output).

### Phase 3 — Publish

- `npm i -g contextspec` (or `@contextspec/cli`, depending on naming) places `contextspec` on PATH.
- A first-time user can run `mkdir foo && cd foo && contextspec init && contextspec create initiative demo && contextspec pack --role engineer --initiative demo` and get a pack file in under five minutes.
- `CHANGELOG.md` records the v0.1.0 release with a one-line summary per shipped slice (#4, #7, #8, this initiative).

### Phase 4 — CI

- A PR that introduces a failing test cannot be merged into `main` (CI red).
- A push of tag `v0.1.0` produces a published artifact on npm, automatically.

Current status: the current worktree now has offline evidence for the first bullet (`test/ci.test.ts` + `test/ci-synthetic-failure.test.ts`), but the actual GitHub-side PR run and npm publish still require a real remote environment and remain open.

## Cross-cutting

- The CLI continues to compile cleanly under `tsc` strict mode with no `any`-using ergonomic shortcuts.
- All three v0.1 invariants hold across all phases:
  - byte-stable pack output (same inputs + `generated_at` ⇒ identical bytes)
  - no LLM in pack compilation
  - no writes to user-authored files (`memory/`, `roles/`, top-level context, AGENTS.md outside the managed block)
