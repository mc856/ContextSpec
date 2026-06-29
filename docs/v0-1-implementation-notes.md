# ContextSpec v0.1 — Implementation Notes

A reviewer's map of the v0.1 CLI. For each module: what it does, the spec sections it implements, the design choices made during implementation that aren't obvious from the code, and where to find the tests.

This document is meant to be read **alongside** the code, not as a replacement. Skim a section, then open the matching file.

## How to use this document

- **Reviewing a PR**: find the modules it touches in [Module reference](#module-reference), check the listed spec sections + tests, then read the diff.
- **Adding a feature**: read [Cross-cutting invariants](#cross-cutting-invariants) and the matching module section before writing code; update this doc in the same PR.
- **Catching up on history**: PRs [#4](https://github.com/mc856/contextspec/pull/4), [#7](https://github.com/mc856/contextspec/pull/7), [#8](https://github.com/mc856/contextspec/pull/8), [#9](https://github.com/mc856/contextspec/pull/9) are the four v0.1 slices. Their PR bodies are the narrative; this doc is the cross-cut.

When you change architecture, update both this doc and `.contextspec/initiatives/<active>/decisions.md`. The `decisions.md` records what was decided for that initiative; this doc records what's *currently true* across the codebase. They will sometimes overlap; that's fine.

---

## Architecture at a glance

```
                          cli.ts
                             │
   ┌─────────┬──────────┬─────────┬───────────┬───────────┬───────────┬───────────┬─────────┐
   │         │          │         │           │           │           │           │
 init     create     create    validate    compile     generate    generate    registry
  .ts   Initiative   Role.ts  Command.ts     .ts        Claude.ts   Codex.ts      .ts
   │        .ts         │         │           │            │           │
templates    │      templates  validate   resolve.ts   registry    (none)
  .ts        │         .ts       .ts          │           .ts
        templates.ts yamlEdit  registry    route.ts
        registry.ts     .ts      .ts       sources.ts
        yamlEdit.ts                        registry.ts
```

**Layering rule**: lower modules don't import higher ones. `cli.ts` is the only thing that imports commands; commands import their helpers; helpers (`registry.ts`, `route.ts`, `sources.ts`, `templates.ts`, `yamlEdit.ts`) are leaf modules with no internal dependencies (except `yamlEdit.ts` → the `yaml` package).

**File counts** (production code):

| Module | Lines |
|---|---|
| `cli.ts` | 320 |
| `compile.ts` | 179 |
| `createInitiative.ts` | 155 |
| `createRole.ts` | 116 |
| `generateClaude.ts` | 132 |
| `generateCodex.ts` | 72 |
| `index.ts` | 55 |
| `init.ts` | 69 |
| `registry.ts` | 76 |
| `resolve.ts` | 179 |
| `route.ts` | 53 |
| `sources.ts` | 78 |
| `templates.ts` | 521 |
| `validate.ts` | 238 |
| `validateCommand.ts` | 57 |
| `yamlEdit.ts` | 45 |

Templates dominate by line count but contain no logic. The validate surface is now split between `validate` (core checks) and `validateCommand` (CLI-safe orchestration).

---

## Module reference

### `src/registry.ts`

**Purpose.** Parse `registry.yaml` into a typed `Registry` object. Validation is intentionally light — just enough to fail with a useful message before the rest of the pipeline gets a malformed value.

**Public API.** `loadRegistry(path) -> Registry` and the `Registry`, `RoleDecl`, `DomainDecl`, `ProjectDecl`, `InitiativeDecl`, `SourceDecl` types.

**Spec sections.** §4 (registry schema).

**Design notes.**
- We accept both string `"0.1"` and number `0.1` for `version` because YAML can quote-strip it. We always normalize to `"0.1"` in the returned object.
- The validator throws on missing `context.includes` and missing `roles`; everything else is lenient. This is deliberate — `compilePack` produces actionable warnings later, and v0.2's `validate` command will tighten this.
- We don't validate that `roles[id].file` exists on disk here; that happens in `resolvePackFiles` so error reporting can locate "this role declared this missing file".

**Tests.** `pack.test.ts:registry loader` (3 cases) — version, role keys, initiative keys.

**Open questions.** Should `loadRegistry` ever reject undeclared initiative attachments (`roles`, `domains`, `projects`) up front now that `validate` exists, or is the split between "load loosely, validate explicitly" the right long-term UX?

---

### `src/route.ts`

**Purpose.** Map a `.contextspec/`-relative path to its target pack section.

**Public API.** `routePath(path, fromContextIncludes) -> { section, warning? }`. The `Section` union, the `SECTION_TIER_ORDER` array, and the `SECTION_HEADINGS` map.

**Spec sections.** §5.7 (path-based routing) and §5.3 (tier ordering).

**Design notes.**
- Routing is **path-based, not config-based**. A file at `memory/anti-patterns.md` always lands in `## Relevant Memory` regardless of which include list referenced it (see `pack.test.ts:routes memory files into ## Relevant Memory regardless of include origin`). This was an explicit principle — see `principles.md:Path-based routing beats config-based routing` after PR #9 lands.
- `fromContextIncludes` is the one origin-based override: paths reached via `context.includes` route to `global` regardless of where the file lives. This matches §5.7 row 1.
- Unrouted paths (anything not under `roles/`, `domains/`, `initiatives/`, `projects/`, `memory/`, `sources/`) fall through to `role` with a warning. This is the safety net for top-level files like `context.md` referenced through `context.includes` (which are routed to `global` first by the override) — and for misfiled user-added files.

**Tests.** `pack.test.ts:routes memory files into ## Relevant Memory regardless of include origin`, `pack.test.ts:orders sources by §5.3 tier`.

**Open questions.** None. The routing table is small enough to be self-evident.

---

### `src/resolve.ts`

**Purpose.** Walk the registry + on-disk initiative directory and produce the ordered, deduplicated list of files for a pack.

**Public API.** `resolvePackFiles(opts) -> ResolvedFile[]`, `discoverInitiativeFiles(initAbs, attachedRoles) -> string[]`.

**Spec sections.** §3.1 (path resolution), §4.5 (additive includes + dedup), §5.3 (loading order), §5.7 rule 2 (`packs/` exclusion) and rule 3 (initiative file ordering).

**Design notes.**
- The walk follows §5.3 logical order: `context.includes` → `role.file` → `role.includes` → `domain.includes` (per attached domain) → discovered initiative files → `project.includes` (per attached project, possibly filtered by `--project`).
- Dedup is by **resolved absolute path**. First encounter wins, which preserves walk order when a file is referenced multiple times. See the `seen: Set<string>` in `addPath`.
- The result is a flat list, but each file carries its `section`. After collection, `tierSort` re-orders by §5.3 tier while preserving walk order within a tier. This separation makes the dedup step independent of the tier rules.
- `discoverInitiativeFiles` hardcodes the §5.7 rule 3 order: `brief → context-map → plan → tasks → acceptance → decisions → other top-level alphabetical → reviews/<role>.md per attached-role order → retro`. `packs/` and `reviews/` directories are NOT walked recursively; we hand-pick `reviews/<role>.md`.
- `--project <p>` validation: if the project isn't attached to the initiative, we throw rather than silently skip. This is a CLI ergonomics call: a typo in `--project` should be loud.

**Tests.** `pack.test.ts` covers tier ordering, initiative file order (the full §5.7 sequence), `packs/` exclusion, and the role-file-before-role-includes rule. `init.test.ts:init + create-initiative + compilePack chain` and `dogfood.test.ts` exercise the full walker against real registries.

**Open questions.**
- Should `resolvePackFiles` also dedup project includes when a single project is attached more than once? Currently it can't happen because attached projects come from a list (no double-attach in practice), but if `domains` ever does the same we should be defensive.
- The `--project` filter accepts at most one project. Multi-project filtering (`--project a --project b`) is straightforward to add but spec doesn't require it.

---

### `src/sources.ts`

**Purpose.** Extract `source://<id>/<path>` URIs from curated content and validate each against `registry.sources.<id>.{include,exclude}` globs.

**Public API.** `scanSourceLinks(text) -> SourceLink[]`, `validateSourceLink(link, sources) -> { ok, reason? }`, `globToRegex(glob)` (exported for tests, also useful as a debug helper).

**Spec sections.** §5.4 (allow-listing), §5.5 (link parsing).

**Design notes.**
- The regex `/source:\/\/([a-zA-Z_][a-zA-Z0-9_]*)\/([^\s)`"]+)/g` deliberately stops at whitespace, `)`, backtick, and `"`. This is enough to handle Markdown links `[label](source://id/path.md)`, inline code `` `source://id/path.md` ``, plain-text references, and bare links — without trying to fully parse Markdown.
- `globToRegex` is a tiny custom matcher (~25 lines) supporting `**` (any path segments, including zero), `*` (any chars except `/`), `?` (one char except `/`), and escapes regex metachars. We didn't pull in `picomatch` or `minimatch`; the surface is small enough that a hand-written matcher is auditable. Worth revisiting if we ever need brace expansion.
- Validation order: `exclude` is checked before `include` (§5.4 says exclude wins). Both are optional; if neither is set, all paths under that source are accepted.

**Tests.** `pack.test.ts:only includes source:// links allowed by registry.sources include/exclude` end-to-ends the full pipeline. `globToRegex` and `scanSourceLinks` don't have isolated unit tests because the fixture exercises every interesting code path.

**Open questions.**
- Should `validateSourceLink` distinguish between "no `sources` map at all" and "unknown source id"? Currently both return the same `ok: false` with reason `unknown source id`. Probably fine; the warning message is unambiguous.
- If `sources.<id>.path` resolves under `~`, we don't actually expand `~` here because we never read external files in the compiler. Path expansion lives in the future external-fetch pipeline (post-v0.1).

---

### `src/validate.ts` + `src/validateCommand.ts`

**Purpose.** Validate that a `.contextspec/` tree is internally consistent before a user generates or reviews packs, and provide a CLI-safe wrapper that turns registry-load failures into concise user-facing diagnostics.

**Public API.** `validateContextSpec(opts) -> ValidateResult` plus `ValidationIssue`; `runValidateCommand(opts) -> { exitCode }`.

**Spec sections.** §3.1 (path resolution), §4 (registry references), §5.4 / §5.5 (`source://` allow-listing), §5.7 rule 2 (`packs/` are generated output), and the `finish-line` initiative's Phase 2 acceptance.

**Design notes.**
- Validation is a separate pass, not a stricter `loadRegistry`. This keeps `compilePack` and scaffolding flows tolerant while giving users one explicit command to surface all drift.
- Default mode checks registry-referenced files, initiative attachment ids (`roles`, `domains`, `projects`), initiative paths, and every `source://` link found in curated Markdown under `.contextspec/` (excluding generated `packs/`).
- `--strict` enables stale-pack checks. This is intentionally opt-in because committed example packs may lag the live sources; surfacing that drift is useful, but too noisy for the default "is my registry sane?" pass.
- Stale-pack detection compares the committed pack frontmatter `sources` list against a freshly compiled pack for the same `role` / `task` / `initiative`. We compare source sets, not full bytes, so `generated_at` churn doesn't matter.
- Issues are returned as structured `{ key, path?, message }` objects, but CLI output is one line per issue with no stack traces. The human-facing contract is concise diagnostics first.
- The CLI-facing wrapper catches malformed `registry.yaml` errors from `loadRegistry()` and rewrites them as a single `error: failed to load ...` line instead of leaking a parser stack trace. This keeps the Phase 2 acceptance contract true even on broken YAML.

**Tests.** `validate.test.ts` covers green paths for the example fixture and live dogfood, a missing referenced file, an invalid `source://` link, an unknown initiative role attachment, strict-mode stale-pack detection, and malformed-registry CLI formatting.

**Open questions.**
- Should strict mode also surface `compilePack` warnings (for example unrouted files) as validation issues, or is that a separate linting concern?
- If users want machine-readable output, should we add `--json` here or keep v0.1 purely text-first?

---

### `src/compile.ts`

**Purpose.** Assemble the final pack: read each file, scan for `source://` links, render frontmatter + body, return the text.

**Public API.** `compilePack(opts) -> CompileResult`.

**Spec sections.** §5.6 (concatenation), §5.7 (section routing — applied via `resolve.ts`), §5.8 (frontmatter `sources` and `## Sources` parity).

**Design notes.**
- **Byte-stable for fixed `generated_at`**. Same registry + same source files + same `generatedAt` produces identical bytes. Asserted by `pack.test.ts:byte-stable for identical inputs`. The only varying field on real CLI runs is `generated_at`, which the user can pin via the option for tests or CI.
- Frontmatter is YAML stringified through `yaml.stringify`, then trimmed and wrapped in `---\n…\n---\n\n`. We don't hand-write YAML.
- The body uses §5.6 rule 3: section heading, blank line, then for each file `### <relPath>`, blank line, file body, blank line. Empty sections render as `_(empty)_`.
- File body normalization: only trailing whitespace is stripped (`/\s+$/`). Internal content is preserved verbatim — including the file's own H1, which means a pack contains both `## Section Name` (from the compiler) and `# File Title` (from the source file). This is a deliberate spec choice (§5.6 rule 1: "Headings inside a file are preserved as-is"); demoting them would change semantics.
- Source-link scanning walks the **resolved-and-included** files in §5.3 order, not the registry. This is important: a file dropped via dedup is not scanned twice, and the order in which `## Sources` appears matches the order in which the agent will encounter the link as it reads the pack top-down.
- `outputRelPath` is computed from `registry.initiatives[id].path` + `packs/<role>-<task>.md`. We always honor whatever the registry says about the initiative path (which lets a user move an initiative directory and update only one place).

**Tests.** `pack.test.ts` is the spec executable for this module — 16 cases against `examples/improve-team-invite-conversion/.contextspec/`. Key invariants:
- byte-stability
- frontmatter `sources` ↔ body `## Sources` parity (count + order)
- §5.3 tier ordering on the source list
- distinct output for `growth/review` vs `engineer/handoff`

**Open questions.**
- The `## Sources` body section uses backtick-wrapped paths. The first version of the test naively split on `## Sources` substring and accidentally matched inline-code `` `## Sources` `` in `context-map.md`. Fixed by anchoring the split on `(?:^|\n)## Sources\n`. Recorded in `memory/anti-patterns.md:2026-05-08 — Splitting on a Markdown heading by substring`. **Lesson**: any future code that "looks for a heading" must anchor on start-of-line, not substring.
- The body skip-list (`_skipped:_`) is appended in italic. This is intentional but ugly; revisit when we have a real user complaint.

---

### `src/init.ts` + `src/templates.ts`

**Purpose.** Scaffold a fresh `.contextspec/` directory.

**Public API.** `initContextSpec(opts) -> InitResult`. Templates are TS string constants in `templates.ts`.

**Spec sections.** §3 (file layout), §4 (registry shape), §6 (role files), §8 (memory).

**Design notes.**
- Templates ship as TS string constants, not as a separate `templates/` directory. This means published artifacts include the templates inline in `dist/`; no resource-loading step at runtime, no relative-path surprises when installed via `npm i -g`.
- `init` refuses to overwrite an existing `registry.yaml` without `--force`. Within a run, files that already exist are skipped (reported in `result.skipped`); only `--force` overwrites. This makes `init` re-runnable to "fill in missing pieces".
- Template content is intentionally **opinionated, not blank**. Each role file has Mission / Owns / Needs / Reviews / Output Contract / Cannot Decide / Checklist / Common Mistakes / Suggested Memory Updates. A blank file teaches nothing about the protocol. (See `principles.md:Templates are opinionated, not blank`.)
- The default `init` writes three roles: `pm`, `growth`, `engineer`. QA is in spec §10 but not pre-scaffolded — users add it with `contextspec create-role qa`. This is one less file in the new-project surface area.
- `templates.ts` also exports the **lens library** (`LENS_LIBRARY`: id → curated preset, currently `pm`/`growth`/`engineer`/`qa`) and `ROLE_SKELETON_MD(id)` (the structured-skeleton fallback). These are `createRole`'s template sources; `init` itself still writes the fixed three. The library/enabled-set split is recorded in `lower-cold-start/decisions.md`.
- Role checklists include a "have claims framed as 'decided' or 'historical' been re-verified" item — harvested from the PR #9 trial's negative finding (`docs/notes/trials/2026-05-13-pr9-review-trial.md`, "Symmetric observation").
- `memory/anti-patterns.md` and `memory/experiment-results.md` ship as near-empty files (one-line "append-only" hint), not as full templates. They're meant to grow over time.

**Tests.** `init.test.ts:initContextSpec` (4 cases) — write contents, registry validates, refuse-without-force, force-overwrites.

**Open questions.**
- Should we emit a `.gitignore` that excludes `**/packs/`? Currently the user adds it themselves. A common-case helper would be nice, but `.gitignore` is so user-specific that we hesitated. Worth raising in v0.2.

---

### `src/createInitiative.ts`

**Purpose.** Scaffold an initiative directory and register it in `registry.yaml` **in place**, preserving comments and unrelated entries.

**Public API.** `createInitiative(opts) -> CreateInitiativeResult`.

**Spec sections.** §7 (initiative shape).

**Design notes.**
- The kebab-case validator is `^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$`. No dots, no underscores, no leading digit. Initiative ids become directory names and YAML keys; dots in either are confusing (file-extension look, `.` / `..` semantics). A real user (the founder, dogfooding in PR #9) hit this when trying `v0.1-finish-line` — fixed by renaming to `finish-line` and recording the rule in `decisions.md`.
- Editing `registry.yaml` uses `yaml.parseDocument` (the AST API) rather than `yaml.parse` + re-stringify. This preserves comments and key ordering. Adding a runtime dependency on a different YAML library would break this.
- The initial registry template has `initiatives: {}` — a flow-style empty mapping. After we add a child, we set `initiativesNode.flow = false` AND walk newly created subtrees with `forceBlockStyle` to convert them to block style. Without this, the file would render as `initiatives:\n  { foo: { path: ..., roles: [pm, growth, engineer] } }` — valid, but git-noisy on subsequent edits. Recorded in `memory/anti-patterns.md:Empty flow-style YAML mappings spread to children`.
- Unknown role/domain/project names produce **warnings, not errors**. This is deliberate: users may register an initiative before fully fleshing out the registry. `compilePack` later catches the gap with its own warning, and the planned `validate` command will give a single point to find them.
- `packs/` is always created (empty directory) so users can find the pack output destination without running `pack` first.

**Tests.** `init.test.ts:createInitiative` (8 cases) — id validation, registration, registry comments + ordering preserved, `--force` behavior, undeclared-attachment warnings, missing-registry error.

**Open questions.**
- Should we surface a "did you mean…" suggestion when a role isn't declared? Levenshtein distance is small to implement, but not v0.1 scope.

---

### `src/createRole.ts`

**Purpose.** Register a role in `registry.yaml` **in place** (comment-preserving) and write `roles/<id>.md` from one of three template sources.

**Public API.** `createRole(opts) -> CreateRoleResult`.

**Spec sections.** §4 (registry shape), §6 (role files).

**Design notes.**
- Mirrors `createInitiative`: same kebab-case id validator, same `parseDocument` + `forceBlockStyle` editing path (now shared via `yamlEdit.ts`), same `--force` semantics, byte-stable on `--force` re-runs.
- Template sources, in order: explicit `--from <role>` (clones the project's **current on-disk** `roles/<role>.md` with a retitled H1 — explicit flag beats implicit library match, with a warning when it shadows a curated preset); id in `LENS_LIBRARY` → curated preset; otherwise `ROLE_SKELETON_MD(id)`.
- The registry entry is always `{file: roles/<id>.md, includes: []}` — memory wiring is a curated user choice, so presets don't presume it (`lower-cold-start/decisions.md`).
- No `--task` flag: `RoleDecl` has no task field and `generateClaude`'s `DEFAULT_ROLE_TASK` already maps the built-ins; a custom default task would be a registry schema change (`lower-cold-start/decisions.md`).
- If the role file already exists and `--force` is not set, the file is **adopted** (registered, listed in `skipped`, left untouched) rather than overwritten.
- The template body is resolved before the registry is touched, so a missing `--from` source fails without side effects.

**Tests.** `createRole.test.ts` (11 cases) — id validation, preset path, `--from` clone, skeleton fallback, comment preservation, refuse-without-force, byte-stable `--force` re-run, preset-shadow warning, missing `--from` source, missing registry, and `generate-claude` emitting `qa-review.md` once `qa` is registered.

**Open questions.**
- Should `--from` also copy the source role's registry `includes`? Currently it clones only the file; the empty-includes rule wins. Revisit if cloning for variation (rather than bootstrapping) turns out to be the common case.

---

### `src/yamlEdit.ts`

**Purpose.** Shared leaf helpers for comment-preserving `registry.yaml` AST edits: `forceBlockStyle`, `ensureMapping`, `mappingKeys`. Extracted from `createInitiative.ts` when `createRole.ts` needed the same trio — one copy, because risk #4 below (dependence on the `yaml` package's AST surface) is bad enough without drift between two copies.

**Tests.** Covered through `init.test.ts:createInitiative` and `createRole.test.ts` (comment-preservation and block-style assertions).

---

### `src/generateClaude.ts`

**Purpose.** Emit Markdown slash commands under `.claude/commands/` for Claude Code.

**Public API.** `generateClaude(opts) -> GenerateClaudeResult`.

**Spec sections.** §10 (Claude Code integration).

**Design notes.**
- Per role, we emit `<role>-<task>.md` where `<task>` is the role's default task: `pm/growth/qa → review`, `engineer → handoff`. This matches the literal examples in §10 (which lists `pm-review.md`, `growth-review.md`, `engineer-handoff.md`, `qa-review.md`).
- Engineer additionally gets `engineer-review.md` because reviewing a plan is as common as handoff. This is the one place we add beyond the spec literal.
- Plus utility commands: `context-status.md`, `context-retro.md`. Bodies are static prompts, not parameterized by registry contents (they tell the agent to read files, not embed them).
- Each per-role command body:
  - has YAML frontmatter with `description` and `argument-hint: <initiative-id>`
  - embeds the matching `contextspec pack` invocation literally
  - points the agent at `.contextspec/roles/<role>.md` and demands following its Output Contract
  - forbids writes to `.contextspec/`; memory updates may only be **proposed**
- Idempotent by default. `force: true` overwrites; `force: false` skips existing files (reported in `result.skipped`). Default is `true` because slash commands are pure derivatives of the registry — we want re-runs to refresh them.

**Tests.** `generate.test.ts:generateClaude` (4 cases) — file count + names, embedded pack invocation, byte-stable on re-run, `--no-force` preserves edits.

**Open questions.**
- We don't currently generate a `<role>-handoff.md` for non-engineer roles. If users want PM handoff or Growth handoff, they manually copy `engineer-handoff.md` and edit it. Cheap to extend; not requested.
- The slash command body assumes `contextspec` is on PATH. When we add npm publish, this will become true; for local dev (the dogfood case), the user can either `npm link` or replace `contextspec` with `node ./bin/contextspec.js`. We could detect this and template differently, but that's overengineering for v0.1.

---

### `src/generateCodex.ts`

**Purpose.** Emit or update `AGENTS.md` at the project root, replacing only a managed block delimited by HTML comments.

**Public API.** `generateCodex(opts) -> GenerateCodexResult` where `action` is `'created' | 'inserted' | 'updated'`.

**Spec sections.** §11 (Codex integration).

**Design notes.**
- The managed block is delimited by `<!-- contextspec:begin -->` and `<!-- contextspec:end -->`. Everything outside the markers is preserved unconditionally. This is the **single most important property** of this module — `AGENTS.md` is a shared surface that humans write to, and a whole-file rewrite would be hostile.
- Three action modes:
  - `created`: no AGENTS.md existed — write `# AGENTS.md\n\n` + managed section
  - `inserted`: AGENTS.md existed without our markers — append managed section after existing content
  - `updated`: markers present — replace between them in place
- All three are **byte-stable on identical inputs**. Asserted by `generate.test.ts:is idempotent: re-running produces byte-identical AGENTS.md`.
- The body matches §11 literally: read context/principles/glossary/constraints, follow the role Output Contract, read initiative files in §5.7 order, prefer running `contextspec pack`, treat memory and `registry.yaml` as user-confirmation surfaces.

**Tests.** `generate.test.ts:generateCodex` (4 cases) — created when absent, inserted after existing user content, updated in place with content above + below preserved, byte-stability.

**Open questions.**
- The body is a static string. If the registry adds a new section (e.g. `domains/`), the user has to know to read those files; we don't enumerate them in `AGENTS.md`. This is intentional — the body is the protocol's contract, not a registry mirror.
- We don't currently support multiple managed sections (e.g. one for ContextSpec, one for another tool). The marker namespace is `contextspec:*`, so other tools using HTML-comment markers won't collide. If we ever ship a v0.2 with sub-sections, we'll need a versioning rule on the markers.

---

### `src/cli.ts`

**Purpose.** CLI entry point. Seven subcommands: `init`, `create-initiative`, `create-role`, `validate`, `pack`, `generate-claude`, `generate-codex`.

**Public API.** Side-effecting; `cli.parse(preprocessArgv(process.argv))` runs the dispatcher.

**Design notes.**
- **`cac` doesn't accept multi-word command names.** Spec uses `create initiative <name>` and `generate claude`. cac treats command names as single tokens (it splits on space and treats the first token as the command), so registering `'create initiative <name>'` would parse it as command `create` with positional `initiative` + `<name>`. We work around this in `preprocessArgv`: it scans argv (from index 2) for any adjacent known pair — `create initiative`, `create role`, `generate claude`, `generate codex` — and collapses the first hit to the single-token form before cac sees it. The scan is position-independent, so leading flags (`contextspec --cwd foo create role bar`) work; locked by `test/cli.test.ts`, which spawns the real bin. Recorded in `memory/anti-patterns.md:Assuming \`cac\` parses multi-word command names`.
- **All side-effecting output goes to stderr; pack output goes to stdout** (when `--stdout` is set). This makes `contextspec pack ... --stdout > pack.md` work as expected. Warnings, "wrote X" notices, etc. are stderr.
- Exit codes: `0` success, `1` user-correctable error (missing registry, file not found), `2` argument error (missing required flag). Not strictly POSIX but consistent.
- `--cwd` defaults to `process.cwd()`. When set, it's resolved relative to `process.cwd()` if not absolute. This matters for tests that `cd` between commands.

**Tests.** `test/cli.test.ts` spawns the real bin via `child_process` (note: it runs `bin/contextspec.js` → `dist/cli.js`, so it needs a fresh `npm run build`; CI builds before testing). It covers the spec-form commands with and without leading flags. The underlying functions are additionally exercised by `generate.test.ts` / `init.test.ts` / `createRole.test.ts`.

**Open questions.**
- We currently don't print a stack trace on `(err as Error).message` errors; we just exit with the message. For unexpected errors (programming bugs) this loses info. Revisit when we add a `--debug` flag.

---

## Cross-cutting invariants

These hold across all modules. Adding a feature must not break any of them; tests assert most.

### 1. Byte-stable output on fixed inputs

For `compilePack`, `generateCodex`, and `generateClaude`, identical inputs produce identical bytes. `generated_at` is the only knob the user controls per run; everything else is deterministic.

**How it's enforced.**
- `pack.test.ts:byte-stable for identical inputs` runs `compile()` twice with the same fixed `generatedAt` and asserts byte-equality.
- `generate.test.ts:is idempotent` runs each generator twice and asserts byte-identical output.

**Why it matters.** Generated files live in PRs (slash commands, AGENTS.md). If they vary between runs, every PR has noise from unrelated regenerations. If a future change introduces nondeterminism (e.g. iterating a `Set`), the test catches it.

### 2. No LLM in the hot path

`compilePack` is pure string manipulation. No model calls, no embeddings, no fetch. Same for the generators. The only I/O is `fs.readFileSync` and `fs.writeFileSync`.

**How it's enforced.** Code review. There's no automated check; if we accidentally `await fetch(...)` somewhere in `compile.ts`, no test will catch it. Worth adding a CI lint rule that bans `fetch` and HTTP imports in `src/`.

### 3. CLI never writes to user-authored files

Targets the CLI may write to:
- `initiatives/<id>/packs/<role>-<task>.md` (pack output — generated)
- `.claude/commands/*.md` (slash commands — generated)
- The managed block of `AGENTS.md` (HTML-comment delimited)
- Files created during `init`, `create-initiative`, and `create-role`, where "created" means "didn't exist or `--force` is set"

Files the CLI will **not** write to:
- `.contextspec/{context,principles,glossary,constraints}.md` after `init`
- `.contextspec/roles/*.md` after `init`
- `.contextspec/memory/*.md` after `init`
- Any file under `.contextspec/initiatives/<id>/` other than `packs/` after `create-initiative`
- AGENTS.md content outside the managed block

**How it's enforced.** Tests assert idempotency on managed files (which means user edits to non-managed regions can't be touched). Additional protection lives in command logic: each writer checks `existsSync` and respects `--force`.

### 4. Path-based routing wins over config-based routing

A file's location determines its pack section, not the registry entry that referenced it. A file at `memory/x.md` always lands in `## Relevant Memory`, even if listed under `roles.engineer.includes`.

**How it's enforced.** `route.ts` is the single source of truth. The only special case is the `fromContextIncludes` flag for `context.includes`, which routes to `global` regardless of file location. Tested by `pack.test.ts:routes memory files into ## Relevant Memory regardless of include origin`.

---

## Design choices not tied to one module

### Argv preprocessing for multi-word commands

See [src/cli.ts](#srcclits) above. We collapse spec-form `create initiative <id>` → `create-initiative <id>` and `generate claude` → `generate-claude` in `preprocessArgv` before cac parses. Both forms work; help text shows the spec form.

### YAML AST editing for in-place registry updates

`createInitiative` and `createRole` use `yaml.parseDocument` (returns `Document` with comments + key ordering preserved) instead of `yaml.parse` + `yaml.stringify` (which loses comments). The cost: two extra lines to call `forceBlockStyle` on newly created subtrees so they don't render as flow-style. The shared helpers live in `src/yamlEdit.ts`.

### Custom mini-glob matcher in `sources.ts`

Hand-written ~25 lines. Supports `**`, `*`, `?`, escapes regex metachars. We didn't pull in `picomatch` (8 deps transitively) or `minimatch` (one dep but larger surface). Worth revisiting if we ever need brace expansion.

### Templates as TS string constants

`src/templates.ts` is 395 lines of exported string constants. They ship in the published `dist/` automatically — no resource-loading step at runtime, no relative-path surprises when installed via `npm i -g`. The cost is that every template change requires a recompile.

### Stderr for notices, stdout for `--stdout`

All "wrote X" / "warning: Y" goes to stderr. Pack content (when `--stdout`) goes to stdout. This makes piping work cleanly.

### Pack output is gitignored, generators' output is committed

`.contextspec/initiatives/*/packs/` is gitignored: `generated_at` varies per run. `.claude/commands/` and `AGENTS.md` are committed: byte-stable derivatives of the registry. Documented in `.gitignore` and in dogfood PR #9.

---

## Test architecture

### Files

| File | Lines | Cases | Strategy |
|---|---|---|---|
| `test/pack.test.ts` | 232 | 16 | Fixture-based: `examples/improve-team-invite-conversion/.contextspec/` is the spec executable. |
| `test/init.test.ts` | 208 | 12 | Sandbox-based: each test creates a fresh `mkdtempSync` directory. |
| `test/createRole.test.ts` | 129 | 11 | Sandbox-based: `init` then `create-role`, asserting registry preservation + byte-stability. |
| `test/generate.test.ts` | 169 | 8 | Sandbox-based, plus snapshot helpers for re-run idempotency. |
| `test/dogfood.test.ts` | 96 | 5 | Live-fixture: compiles a pack against the repo's own `.contextspec/`. |
| `test/validate.test.ts` | 233 | 7 | Hybrid: validates the example fixture, the live dogfood, temp-cloned tampered fixtures, and CLI-safe malformed-registry output. |
| `test/cli.test.ts` | 55 | 2 | Spawned-bin: argv preprocessing against the real `bin/contextspec.js` (requires a fresh build). |
| `test/package.test.ts` | 83 | 3 | Publish contract: `npm publish --dry-run --json` payload + lifecycle hook. |
| `test/ci.test.ts` | 103 | 3 | Workflow contract: step ordering + release auth/config shape of the GitHub Actions YAML. |
| `test/ci-synthetic-failure.test.ts` | 86 | 1 | Red-path simulation: injects a failing test in a temp repo copy and runs the shipped `npm test`. |

Total: 68 cases. Run time ~4 seconds locally (the publish dry-run and red-path simulation dominate).

### Patterns

- **Fixtures over inline strings.** `pack.test.ts` reads from a real fixture; we don't construct fake registries inline. The fixture is shared with the dogfood test, which means a change to the example fixture is caught by both — protection against accidental fixture rot.
- **`mkdtempSync` for sandboxed tests.** Each `init.test.ts` and `generate.test.ts` case starts in a fresh temp directory. No cross-test contamination, no need for `beforeEach` cleanup.
- **Byte-stability assertions.** Both `pack.test.ts` and `generate.test.ts` have explicit "run twice, compare bytes" cases. This is the canary for nondeterminism creeping in.
- **Live fixture.** `dogfood.test.ts` (PR #9) compiles a pack against `.contextspec/` in the repo. If anyone renames a registry-referenced file without updating the registry, this test fails before the user sees it.

---

## Known issues & deferred

### From spec §9.1

These are documented as deferred in the spec; some are tracked in active initiatives:

- `contextspec status` — deferred indefinitely.
- `contextspec handoff <from> <to>` — deferred indefinitely.
- `contextspec retro <initiative>` — deferred; the slash command `context-retro` covers most of the value.

### Architectural

- **`memory/anti-patterns.md`** is the canonical record of bugs hit during v0.1 build. Read it before designing anything that touches the same module.

### Implementation risks (open, ranked by leverage)

These are issues identified during the post-v0.1 review — concrete failure modes, not vague worries. Risks 1–3 from that review are resolved: CI shipped (`finish-line` Phase 4: `test.yml` runs lint/build/test on Node 20+22), the package published unscoped as `contextspec` so no command regeneration was forced (`finish-line` Phase 3), and `preprocessArgv` is now position-independent and locked by the spawned-bin `test/cli.test.ts` (`lower-cold-start` Phase 1).

1. **`forceBlockStyle` depends on the `yaml` library's AST internals.**
   - Failure mode: a `yaml` v3 release that renames `YAMLMap` / `YAMLSeq`, drops the `.flow` field, or changes `Pair.value` shape would break `createInitiative` and `createRole` silently — the function would no-op, and registry edits would silently emit flow-style YAML again. The comment-preservation tests would catch the regression, but only on diff inspection.
   - Code: `src/yamlEdit.ts:forceBlockStyle` (one shared copy, by design — see the module section above).
   - Cost to address: pin `yaml` to a minor version range (`"yaml": "~2.6.0"` instead of `^2.6.0`). Optionally, narrow the function with a runtime check (`if (!('flow' in node)) return;`) so we fail-soft on shape change.
   - Where to address: any time; small and testable.

### Reviewer's checklist for any future PR

When opening a PR, confirm in the PR description:

- which spec sections are exercised (cite e.g. §5.7 rule 3)
- which existing tests cover it; which new tests are added
- whether it preserves byte-stability on existing generated outputs (run `pack` twice with fixed `generated_at`, diff)
- whether it preserves the four [Cross-cutting invariants](#cross-cutting-invariants)
- whether `docs/v0-1-implementation-notes.md` was updated (this file)

---

## Update protocol

When you change the codebase:

1. **New module**: add a section under [Module reference](#module-reference). Match the existing format (purpose, public API, spec sections, design notes, tests, open questions).
2. **Behavior change in an existing module**: update its design notes. Strike or remove obsolete bullets — don't accumulate.
3. **New invariant**: add a section under [Cross-cutting invariants](#cross-cutting-invariants) and explain how it's enforced.
4. **New design choice**: if it's narrow to one module, put it in that module's design notes; if it spans modules, put it under [Design choices not tied to one module](#design-choices-not-tied-to-one-module).
5. **Same PR.** This document drifts unless updated alongside the code. Treat it as part of the diff, not a follow-up.

When you change `.contextspec/initiatives/<active>/decisions.md`, consider whether the decision affects what's *currently true* in the codebase. If yes, mirror the relevant point here. If no (it's a one-time scope decision), it stays in `decisions.md` only.
