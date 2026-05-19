# Plan

Four small phases, each independently revertible. Phases 1 and 2 are already in the repo; Phase 3 manual publish remains outstanding, and the current repo-scoped implementation slice is Phase 4 CI.

## Phase 1 — Dogfood (shipped)

- change: populate `.contextspec/` for this repo using the v0.1 CLI itself; commit the output of `generate claude` + `generate codex`; add a live-fixture test that fails when the dogfood drifts from the code.
- experiment: founder uses `/engineer-handoff finish-line` once and writes down whether the resulting pack would have replaced a hand-written prompt.
- decision rule: if the founder would not have used the pack, treat it as falsifying hypothesis 1 and pause to fix the templates before continuing.

## Phase 2 — `contextspec validate` (shipped)

- change: implement `contextspec validate` (deferred command from §9.1, promoted by this initiative). Checks: every `roles.<id>.file` exists; every `<role>.includes`, `<domain>.includes`, `<project>.includes` resolve; every initiative's `path` exists; every `source://` reference passes its registry's include/exclude; pack files in `packs/` either have a matching live source set or are flagged stale.
- experiment: run `validate` against the repo's `.contextspec/` and against the example fixture; assert green on both.
- decision rule: if `validate` finds nothing actionable on either, the design is too lenient — tighten it. If it produces false positives, ship anyway with a `--strict` toggle for the noisy checks.

## Phase 3 — Publish to npm

- change: prepare for `npm publish` — verify `package.json` `name` is available, add `prepublishOnly` script, ensure `dist/` and `bin/` are in `files`, write a short CHANGELOG.md anchored at v0.1.0. Publish manually for the first release; automate later.
- experiment: do a dry-run `npm publish --dry-run` and inspect the tarball that would actually ship, including publish-time lifecycle hooks.
- decision rule: if the package name is taken, scope under `@contextspec/cli` and update README + AGENTS.md template.
- status: the publish hardening work is in-repo and covered; the actual first `npm publish` plus install-path verification still require a human release environment and remain intentionally open.

## Phase 4 — CI

- change: GitHub Actions on PRs running `npm ci && npm run build && npm test` on Node 20 + 22, Linux only. A separate workflow runs on tag `v*.*.*`: build, test, and `npm publish` with `NODE_AUTH_TOKEN`.
- experiment: open a throwaway PR that breaks a test; verify CI catches it; verify `main` is green.
- decision rule: if the build matrix takes more than 2 minutes per leg, drop to single-Node and revisit when there's a real reason for multi-version.
- status: the current worktree carries the workflow files plus offline CI evidence: `test/ci.test.ts` asserts the repo-side workflow contract, and `test/ci-synthetic-failure.test.ts` proves locally that an injected failing test drives the shipped `npm test` path red. The live GitHub acceptance item still remains open until a real throwaway PR is pushed and observed failing in Actions.
