---
contextspec_version: "0.1"
role: engineer
task: review
initiative: finish-line
project: cli
generated_at: 2026-05-13T09:39:28.716Z
sources:
  - context.md
  - principles.md
  - glossary.md
  - constraints.md
  - roles/engineer.md
  - initiatives/finish-line/brief.md
  - initiatives/finish-line/context-map.md
  - initiatives/finish-line/plan.md
  - initiatives/finish-line/tasks.md
  - initiatives/finish-line/acceptance.md
  - initiatives/finish-line/decisions.md
  - projects/cli.md
  - memory/anti-patterns.md
---

# Context Pack

## Global Context

### context.md

# Product Context

ContextSpec is a file-based protocol plus a CLI that gives coding agents (Claude Code, Codex) role-specific, task-scoped context — the way humans onboard a new teammate, not the way RAG retrieves chunks.

## What we build

- A **protocol**: `.contextspec/` directory layout, `registry.yaml` schema, and rules for compiling a context pack out of curated Markdown.
- A **CLI** (`contextspec`): `init`, `create initiative`, `pack`, `generate claude`, `generate codex`. The CLI is intentionally a thin, deterministic compiler — no LLM in the hot path, no cloud, no daemon.
- An **integration surface** with Claude Code (slash commands) and Codex (`AGENTS.md`) so the protocol shows up at the agent's surface area, not as a separate tool the user has to invoke.

The user owns the source files in git. The CLI is a renderer over those files.

## Stage

Early prototype. v0.1 is a personal build — used to validate that the protocol's loop (curate → compile pack → run agent → retro → update memory) is worth shipping at all. There are no other users, no telemetry, no published package yet.

## Target user

Solo founders and small teams who:

- already use Claude Code or Codex for non-trivial work
- have hit the wall where pasting context into prompts is the bottleneck
- write enough Markdown that a file-based protocol feels native, not bureaucratic
- value reproducibility (git diffs, byte-stable output) over slick UX

Not for: agencies running dozens of client repos, organizations with formal docs systems they cannot replace, teams whose context lives in tickets and Slack rather than Markdown.

## What we are optimizing right now

**Founder usability.** v0.1 is the version the founder uses themselves. If running `init` → `create initiative` → `pack` → `/<role>-review` doesn't feel obviously better than pasting context into a prompt, the protocol is wrong, not the implementation. Everything else (publish, CI, validate, GUI, sync) waits until that loop has landed.

### principles.md

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

### glossary.md

# Glossary

Terms with a specific meaning inside ContextSpec. Use this to keep specs, role files, and packs aligned.

- **Initiative** — a unit of work scoped tightly enough that one role can review it in one sitting. Each initiative has its own directory under `initiatives/<id>/`. Not the same as an "epic" or a "project".

- **Role** — a perspective + an output contract, declared in `registry.yaml.roles.<id>` and described in `roles/<id>.md`. v0.1 ships with PM, Growth, Engineer (QA is in spec §10 but not pre-scaffolded by `init`). Roles are not job titles; they're decision frames.

- **Domain** — a business area whose context is stable across initiatives (e.g. "onboarding", "billing"). Domains are optional. Use them when the same flows/metrics get loaded into many initiatives.

- **Project** — a deployable / repo-scoped engineering context. Projects describe a stack and conventions. An initiative may attach 0..N projects.

- **Pack** — a Markdown file at `initiatives/<id>/packs/<role>-<task>.md` produced by `contextspec pack`. The pack is the canonical task input for a coding agent in that role for that initiative. Generated, not edited.

- **`source://<id>/<path>`** — a URI for external knowledge that's referenced but not imported. `<id>` matches a key under `registry.yaml.sources`; `<path>` is validated against that source's `include`/`exclude` globs. Listed in pack `## Sources`, never inlined.

- **Curated knowledge** — knowledge that lives inside `.contextspec/` (memory, principles, decisions). Reviewed, append-only, small. Distinct from **raw knowledge** which lives outside (notes, transcripts, journals).

- **Output contract** — the per-role section in `roles/<id>.md` that specifies what shape a response from that role takes. Slash commands and AGENTS.md tell the agent to follow it; the user enforces it during review.

- **Byte-stable** — same inputs + same `generated_at` produce identical bytes. A property of `pack`, `generate codex`, and `generate claude` outputs. Verified by tests.

- **Managed section** — the block in `AGENTS.md` between `<!-- contextspec:begin -->` and `<!-- contextspec:end -->`. Owned by the CLI; everything else in the file is owned by the user.

### constraints.md

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

## Role Context

### roles/engineer.md

# Role: Engineer

## Mission

Ship the smallest correct change that lands the next ContextSpec slice, leaves the codebase easier to extend, and keeps the protocol's invariants (byte-stability, no-LLM-in-pack, file-as-source-of-truth) intact.

## Owns

- the TypeScript implementation under `src/` and tests under `test/`
- the `.contextspec/` skeleton templates in `src/templates.ts`
- the CLI surface (cac wiring, argv preprocessing, exit codes)
- engineering decisions recorded in `decisions.md` for the active initiative

## Needs

- pm for what each slice should do and what's intentionally out of scope
- growth for whether a heuristic (e.g. default-task-per-role, source link validation) actually serves users

## Reviews

- technical plans before implementation begins
- changes that touch the registry schema, the pack section routing rules, or the AGENTS.md managed-block format (these are public protocol surface)

## Output Contract

When asked for a handoff or technical plan, return:
- problem and constraints in one paragraph (cite the relevant spec section if applicable)
- chosen approach and one rejected alternative (with reason)
- a sequence of reversible commits — small enough that each could ship alone
- test plan, including what fixture or live `.contextspec/` validates the change
- risks and mitigations, especially around byte-stability and backward-compatibility of generated files

When asked to review a PR or pack, return:
- the assumption set you read from
- specific file paths from `## Sources` for any non-trivial claim
- risks the author may not have surfaced (regressions, undocumented coupling, hidden work)

## Cannot Decide

- scope or what counts as a v0.x acceptance (PM)
- whether a heuristic resonates with target users (Growth)
- whether to accept a runtime-dependency or external-service constraint break (joint with PM)

## Checklist

- is the smallest reversible step shipping first?
- is byte-stability still asserted by a test?
- is the spec section that justifies the change cited in the PR description?
- if the change adds a new generated file, is the path covered by a test that asserts both creation and idempotent re-generation?
- is there a test against the live `.contextspec/` (the dogfood) that would catch a future regression?

## Common Mistakes

- inlining LLM calls into pack compilation "just to make the output nicer"
- regenerating `AGENTS.md` whole-file instead of replacing only the managed section
- assuming `cac` accepts multi-word command names — it doesn't; preprocess argv at the entry point
- splitting on `## Sources` as a substring without anchoring on the heading (file content can contain inline `\`## Sources\`` references)

## Suggested Memory Updates

After a significant slice ships, propose entries in:
- `memory/anti-patterns.md` — concrete bug + the rule it taught us
- `memory/experiment-results.md` — only when we ran a usability experiment with real outcomes

## Domain Context

_(empty)_

## Initiative Context

### initiatives/finish-line/brief.md

# finish-line

Get ContextSpec v0.1 from "the founder runs it from a local checkout" to "a stranger can `npm i -g contextspec`, run `init`, and have a working setup in under five minutes". Three v0.1 slices already shipped (pack, init/create-initiative, generate). What's missing is the trust glue: dogfood, validate, publish, CI.

## Why now

- Spec §12 acceptance is met by the three merged PRs (#4, #7, #8). Functionally, v0.1 works. But there is no published artifact, no CI gate, no `validate` for users to discover broken state, and no live-fixture test ensuring the project's own `.contextspec/` stays consistent with the code.
- Without dogfood, the templates get stale silently — `init` ships role/context content that nobody actually reads.
- Without `validate`, the first time a user mistypes a path in `registry.yaml`, they get a `compilePack` warning buried in `--stdout` output. That's a bad first impression for a protocol that wants to be "obviously correct".

The total scope is small (a few hundred lines + config) and it's the last thing keeping v0.1 from being a real release.

## Hypotheses

1. **Dogfooding will surface at least one template gap.** — falsified if the live `.contextspec/` compiles cleanly with no rewrites of `init` templates and no need to add a new top-level concept.
2. **`contextspec validate` is the smallest useful safety net before publishing.** — falsified if early users hit problems that `validate` would not have caught (e.g. they need a watcher, not a checker).
3. **GitHub Actions CI on every PR is enough; release-on-tag for npm.** — falsified if the matrix needs Windows or multiple Node versions to ship usefully (would push us toward something heavier).

## Out of scope

- Browser/web UI of any kind.
- A daemon or watcher process.
- Cloud sync, multi-machine state, or telemetry.
- A v0.2 feature backlog. Anything not on the path to "first stranger can install and use" goes in `decisions.md` as deferred.
- Rewriting any of the three already-shipped slices (#4, #7, #8). Bug fixes only.

### initiatives/finish-line/context-map.md

# Context Map

Pointers into the rest of `.contextspec/` for this initiative. Roles read this first when picking up the work.

## Domains

- _none_ — ContextSpec doesn't have business domains in the traditional sense; the spec sections themselves are the closest analog. Use `CONTEXTSPEC_V0_1_SPEC.md` directly when in doubt.

## Projects

- `cli` — the Node + TypeScript package that is this repo. See `projects/cli.md`.

## Memory

- `memory/anti-patterns.md` — concrete pitfalls hit while building the v0.1 slices. Reread before designing anything that touches pack compilation, AGENTS.md generation, or CLI argv handling.
- `memory/experiment-results.md` — empty by intent. We have no usability experiments yet (no users).

## Spec sections that bind this work

- §9 CLI command set — `validate` is mentioned in §9.1 deferred commands; this initiative may promote it.
- §11 Codex integration — any change to `AGENTS.md` shape lands in the managed-block format and must stay back-compatible with already-generated files.
- §12 acceptance criteria — already met by #4/#7/#8; this initiative adds non-functional acceptance (publishability, drift detection).

## External sources

None for this initiative. There is no personal knowledge base attached to the project.

### initiatives/finish-line/plan.md

# Plan

Four small phases, each its own PR, each independently revertible.

## Phase 1 — Dogfood (this PR)

- change: populate `.contextspec/` for this repo using the v0.1 CLI itself; commit the output of `generate claude` + `generate codex`; add a live-fixture test that fails when the dogfood drifts from the code.
- experiment: founder uses `/engineer-handoff finish-line` once and writes down whether the resulting pack would have replaced a hand-written prompt.
- decision rule: if the founder would not have used the pack, treat it as falsifying hypothesis 1 and pause to fix the templates before continuing.

## Phase 2 — `contextspec validate`

- change: implement `contextspec validate` (deferred command from §9.1, promoted by this initiative). Checks: every `roles.<id>.file` exists; every `<role>.includes`, `<domain>.includes`, `<project>.includes` resolve; every initiative's `path` exists; every `source://` reference passes its registry's include/exclude; pack files in `packs/` either have a matching live source set or are flagged stale.
- experiment: run `validate` against the repo's `.contextspec/` and against the example fixture; assert green on both.
- decision rule: if `validate` finds nothing actionable on either, the design is too lenient — tighten it. If it produces false positives, ship anyway with a `--strict` toggle for the noisy checks.

## Phase 3 — Publish to npm

- change: prepare for `npm publish` — verify `package.json` `name` is available, add `prepublishOnly` script, ensure `dist/` and `bin/` are in `files`, write a short CHANGELOG.md anchored at v0.1.0. Publish manually for the first release; automate later.
- experiment: do a dry-run `npm publish --dry-run` and inspect the tarball.
- decision rule: if the package name is taken, scope under `@contextspec/cli` and update README + AGENTS.md template.

## Phase 4 — CI

- change: GitHub Actions on PRs running `npm ci && npm run build && npm test` on Node 20 + 22, Linux only. A separate workflow runs on tag `v*.*.*`: build, test, and `npm publish` with `NODE_AUTH_TOKEN`.
- experiment: open a throwaway PR that breaks a test; verify CI catches it; verify `main` is green.
- decision rule: if the build matrix takes more than 2 minutes per leg, drop to single-Node and revisit when there's a real reason for multi-version.

### initiatives/finish-line/tasks.md

# Tasks

Concrete units of work, sized in hours, not days. Strikethrough = done.

## Phase 1 — Dogfood (this PR)

- [x] `contextspec init` in repo root
- [x] customize `context.md`, `principles.md`, `glossary.md`, `constraints.md` for the ContextSpec project
- [x] customize `roles/{pm,engineer}.md` (Growth left at template — no growth motion yet)
- [x] add `projects/cli.md` and register `cli` project in `registry.yaml`
- [x] write real entries in `memory/anti-patterns.md` (`## Sources` split bug, multi-word command names, flow→block YAML, managed-block AGENTS.md)
- [x] `contextspec create initiative finish-line --project cli`
- [x] populate brief / context-map / plan / tasks / acceptance / decisions
- [x] `contextspec generate claude` → commit `.claude/commands/`
- [x] `contextspec generate codex` → commit `AGENTS.md`
- [ ] add `test/dogfood.test.ts`: compile a pack against the live `.contextspec/` and assert no warnings, no skipped files
- [ ] commit + open PR

## Phase 2 — `contextspec validate`

- [ ] `src/validate.ts`: gather all referenced paths from registry; check existence; check `source://` against include/exclude; flag stale packs
- [ ] CLI subcommand `contextspec validate` with `--strict` and `--quiet`
- [ ] tests: validate against the example fixture (must pass) + against a tampered fixture with a missing file (must fail with the right message)
- [ ] update README usage section

## Phase 3 — Publish

- [ ] verify `contextspec` package name on npm; if taken, switch to `@contextspec/cli` and update README + AGENTS.md template
- [ ] add `prepublishOnly` build hook; verify `npm pack` tarball contents
- [ ] add `CHANGELOG.md` with v0.1.0 entry
- [ ] manual `npm publish` for v0.1.0; verify install path with `npm i -g`

## Phase 4 — CI

- [ ] `.github/workflows/test.yml`: lint + build + test on Node 20 and 22, ubuntu-latest, on PR + push to main
- [ ] `.github/workflows/release.yml`: on tag `v*.*.*`, build + test + `npm publish` with `NODE_AUTH_TOKEN`
- [ ] verify with a synthetic-failure PR

### initiatives/finish-line/acceptance.md

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

## Cross-cutting

- The CLI continues to compile cleanly under `tsc` strict mode with no `any`-using ergonomic shortcuts.
- All three v0.1 invariants hold across all phases:
  - byte-stable pack output (same inputs + `generated_at` ⇒ identical bytes)
  - no LLM in pack compilation
  - no writes to user-authored files (`memory/`, `roles/`, top-level context, AGENTS.md outside the managed block)

### initiatives/finish-line/decisions.md

# Decisions

Initiative-scoped decisions that bind the rest of `finish-line`.

## 2026-05-08 — Dogfood lives in `main`, committed as the first real `.contextspec/` content

- decision: this repo's `.contextspec/` is checked in (not generated at build time) and is the canonical example of a curated v0.1 setup.
- alternative: keep the example-only fixture under `examples/` and don't dogfood. Rejected — without the live fixture, template drift (a role file ships from `init` that nobody actually reads) goes unnoticed.
- impact: any change to `init` templates or to the registry schema must keep the live `.contextspec/` valid. The `dogfood.test.ts` test enforces this.

## 2026-05-08 — Initiative ids are kebab-case only; no dots, no underscores

- decision: keep the existing `^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$` validator unchanged. The first attempted id `v0.1-finish-line` was rejected; renamed to `finish-line` and put the version in the brief.
- alternative: relax the regex to allow `.` for version-like names. Rejected — initiative ids become directory names and YAML keys; dots there are ambiguous (file extensions, `.` / `..`) and add no real expressivity.
- impact: future initiatives that want to embed a version use `-` (e.g. `v0-2-validate`) or lift the version into the brief. Documented in `memory/anti-patterns.md` if a contributor hits the same wall.

## 2026-05-08 — Growth role left at template default

- decision: `roles/growth.md` keeps the generic v0.1 template body. Not customized for this project.
- alternative: customize Growth for "founder usability experiments" or remove it from the dogfood registry entirely. Rejected — there's no real growth motion yet, so customization would be fiction; removing it from the dogfood would diverge the live registry from what `init` produces by default. Keeping the default also tests that the default doesn't break the live pack.
- impact: `/growth-review finish-line` is still wired up but produces a pack against the generic Growth contract. Reasonable for v0.1.

## 2026-05-08 — `contextspec validate` is in scope, even though §9.1 listed it as deferred

- decision: promote `validate` from §9.1 deferred into this initiative.
- alternative: ship v0.1 without `validate` and rely on `compilePack` warnings. Rejected — first-time users will hit "why is the pack missing my domain?" and have nowhere to look. `validate` makes the registry-reality gap explicit.
- impact: spec §9.1 should drop `validate` when this lands. Tracked in tasks.md Phase 2.

## 2026-05-08 — npm package name decision deferred until publish phase

- decision: don't pre-claim the name. Verify availability during Phase 3 and decide between `contextspec` and `@contextspec/cli` then.
- alternative: claim the name now to avoid risk. Rejected — pre-claiming a name without publishing pollutes npm namespace and is mildly antisocial. The cost of renaming README + AGENTS.md template if claimed-elsewhere is small.
- impact: README and AGENTS.md template currently say `contextspec`; one find-and-replace if we move to a scoped name.

## Project Context

### projects/cli.md

# Project: cli

The `contextspec` CLI (this repo). Single Node + TypeScript package, ESM only, distributed via npm.

## Repo

- single repo, single package
- entry point: `bin/contextspec.js` (shebang) → `dist/cli.js` (built)
- library exports: `src/index.ts` re-exports `compilePack`, `initContextSpec`, `createInitiative`, `generateClaude`, `generateCodex`, `loadRegistry`, types

## Stack

- Node 20+
- TypeScript 5.6+, target ES2022, module NodeNext
- Strict mode + `noUncheckedIndexedAccess` + `noImplicitOverride`
- ESM only (`"type": "module"`)
- Build: `npm run build` → `tsc` → `dist/`
- Tests: `npm test` → `vitest run`

## Runtime dependencies

Two only:
- `yaml` — registry parsing and structured editing (preserves comments via `parseDocument`)
- `cac` — CLI parsing. Caveat: cac treats command names as single tokens, so `create initiative` and `generate claude` are collapsed to `create-initiative` / `generate-claude` in `preprocessArgv` before cac sees them.

Adding a runtime dependency is a registry-affecting decision and requires a `decisions.md` entry.

## Conventions

- One module per concern: `registry.ts`, `route.ts`, `resolve.ts`, `compile.ts`, `sources.ts`, `init.ts`, `createInitiative.ts`, `generateClaude.ts`, `generateCodex.ts`, `templates.ts`, `cli.ts`.
- All paths inside `.contextspec/` are stored as POSIX-style relative strings; only the resolver converts to absolute paths.
- Routing is path-based, not config-based. Section assignment is in `src/route.ts`. Don't add config knobs that override this.
- Templates are TS string constants in `src/templates.ts`. They ship in the published `dist/` (no separate template directory needed at runtime).

## Test approach

- Unit-ish: `pack.test.ts` runs the example fixture (`examples/improve-team-invite-conversion/`) through `compilePack` end-to-end; asserts ordering, byte-stability, routing edge cases, source-link validation. The fixture is the spec executable.
- Workflow: `init.test.ts`, `generate.test.ts` use `mkdtempSync` to sandbox each test in a fresh temp directory.
- Live dogfood: `dogfood.test.ts` compiles a pack against this repo's own `.contextspec/`; protects against drift when files referenced in the registry get renamed or deleted.
- Always assert byte-stability on generated output (pack, AGENTS.md, slash commands).

## Out of scope for this project

- A bundler (`tsc` is enough).
- A CommonJS build. ESM only; if a downstream needs CJS, they can wrap.
- A REPL / watch mode. v0.1 is one-shot CLI.
- Cross-platform smoke tests beyond Linux + macOS. Windows support is best-effort until a user asks.

## Active feature flags / guardrails

None. The CLI has no flags or branches keyed off env. If we add one, document it here.

## Relevant Memory

### memory/anti-patterns.md

# Anti-Patterns

Append-only. Each entry: short title, one-paragraph case, and the rule it taught us.

## 2026-05-08 — Splitting on a Markdown heading by substring

**Case.** The pack-test fixture extracted the trailing `## Sources` source list with `text.split('## Sources', 2)[1]`. It silently failed on a fixture where `context-map.md` legitimately mentioned the heading inside a backtick: `before listing it in \`## Sources\``. The split landed inside the prose, not at the heading, and 75% of the body got matched as sources.

**Rule.** Anchor on heading position with a regex that requires start-of-line: `/(?:^|\n)## Sources\n/`. Markdown heading parsing is not a substring search. This applies to any code that "looks for a heading" — pack compilation, future `validate`, anything walking generated output.

## 2026-05-08 — Assuming `cac` parses multi-word command names

**Case.** Spec §1 documents the CLI as `contextspec create initiative <name>` and `contextspec generate claude`. The first instinct was to register `'create initiative <name>'` as a cac command name. cac splits the command name string on spaces and treats only the first token as the command — so `create initiative <name>` would have parsed as command `create` with positional `initiative` and `<name>`. The two-word form would have silently resolved to the wrong handler.

**Rule.** Any CLI parsing library that treats the command name as a single token cannot directly serve a spec that uses multi-word commands. Collapse the spec form to a single token at the entry point (`preprocessArgv` in `src/cli.ts`) so both forms work, and document both in `--help`.

## 2026-05-08 — Empty flow-style YAML mappings spread to children

**Case.** `init`'s registry template ends with `initiatives: {}`. When `create-initiative` parsed and edited it, the new entries inherited flow style: `{ q2-onboarding: { path: ..., roles: [pm, growth, engineer] } }`. Valid YAML, but every diff after that point would re-format the flow on add/remove, making review noisy.

**Rule.** When converting an empty flow-style container to a populated one via the YAML AST, set `node.flow = false` on the container *and* on every newly created child node before stringifying. The `forceBlockStyle` helper in `src/createInitiative.ts` walks a created subtree to enforce this.

## 2026-05-08 — Regenerating user-shared files whole-file

**Case.** First sketch of `generate codex` would have written `AGENTS.md` from a fixed template every run. AGENTS.md is a shared surface — humans add team rules, internal coding conventions, links. A whole-file rewrite would clobber that on every regeneration.

**Rule.** Any generator that writes to a file the user also writes to must own only a marked block of that file (HTML comments work in Markdown), preserve everything outside the markers, and be byte-stable when only the managed block is in scope. Tested on insertion (no markers yet), update (markers present), and idempotent re-run.

## Sources

- `context.md`
- `principles.md`
- `glossary.md`
- `constraints.md`
- `roles/engineer.md`
- `initiatives/finish-line/brief.md`
- `initiatives/finish-line/context-map.md`
- `initiatives/finish-line/plan.md`
- `initiatives/finish-line/tasks.md`
- `initiatives/finish-line/acceptance.md`
- `initiatives/finish-line/decisions.md`
- `projects/cli.md`
- `memory/anti-patterns.md`
