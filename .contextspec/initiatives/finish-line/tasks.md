# Tasks

Concrete units of work, sized in hours, not days. Strikethrough = done.

## Phase 1 — Dogfood (shipped)

- [x] `contextspec init` in repo root
- [x] customize `context.md`, `principles.md`, `glossary.md`, `constraints.md` for the ContextSpec project
- [x] customize `roles/{pm,engineer}.md` (Growth left at template — no growth motion yet)
- [x] add `projects/cli.md` and register `cli` project in `registry.yaml`
- [x] write real entries in `memory/anti-patterns.md` (`## Sources` split bug, multi-word command names, flow→block YAML, managed-block AGENTS.md)
- [x] `contextspec create initiative finish-line --project cli`
- [x] populate brief / context-map / plan / tasks / acceptance / decisions
- [x] `contextspec generate claude` → commit `.claude/commands/`
- [x] `contextspec generate codex` → commit `AGENTS.md`
- [x] add `test/dogfood.test.ts`: compile a pack against the live `.contextspec/` and assert no warnings, no skipped files
- [x] commit + open PR

Note: `initiatives/<id>/packs/` remains generated output. The live dogfood test compiles packs in memory; committed pack files are not required for Phase 1 to count as shipped.

## Phase 2 — `contextspec validate`

- [x] `src/validate.ts`: gather all referenced paths from registry; check existence; check `source://` against include/exclude; flag stale packs
- [x] CLI subcommand `contextspec validate` with `--strict` and `--quiet`
- [x] tests: validate against the example fixture (must pass) + against a tampered fixture with a missing file (must fail with the right message)
- [x] update README usage section

## Phase 3 — Publish

- [x] verify `contextspec` package name on npm; if taken, switch to `@contextspec/cli` and update README + AGENTS.md template
- [x] add `prepublishOnly` build hook; verify the real publish payload with `npm publish --dry-run` coverage in `test/package.test.ts`
- [x] add `CHANGELOG.md` with v0.1.0 entry
- [x] manual `npm publish` for v0.1.0; verify install path with `npm i -g` — published 2026-05-25; `npm i -g contextspec` → working `contextspec/0.1.0` on PATH

## Phase 4 — CI

- [x] `.github/workflows/test.yml`: lint + build + test on Node 20 and 22, ubuntu-latest, on PR + push to main
- [x] `.github/workflows/release.yml`: on tag `v*.*.*`, build + test + `npm publish` with `NODE_AUTH_TOKEN`
- [x] add repo-side synthetic-failure simulation coverage so a local test proves the shipped CI test suite goes red when a failing test is introduced
- [ ] verify with a synthetic-failure PR
