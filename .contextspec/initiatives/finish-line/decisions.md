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

## 2026-05-18 — keep the unscoped `contextspec` package name for v0.1.0

- decision: keep `package.json.name` as `contextspec`.
- alternative: switch now to `@contextspec/cli`. Rejected — a live npm registry check on 2026-05-18 returned `404 Not Found` for both `contextspec` and `@contextspec/cli`, so there is no current name collision forcing a scoped package.
- impact: no README or AGENTS template rename is needed for Phase 3; the remaining publish work is manual `npm publish` plus install-path verification.

## 2026-05-18 — Phase 3 publish verification uses `npm publish --dry-run`, not metadata-only checks

- decision: treat `npm publish --dry-run --json` as the canonical Phase 3 verification path and keep it covered by `test/package.test.ts`.
- alternative: stop at asserting `package.json.files` / `prepublishOnly`, or use `npm pack --dry-run` only. Rejected — metadata-only tests miss packlist regressions, and `npm pack` does not exercise the publish-time lifecycle hook that Phase 3 is explicitly hardening.
- impact: release-hardening coverage now checks both the shipped file list and that the publish hook actually runs, matching the plan's publish experiment more closely.

## 2026-05-18 — CI lint step uses TypeScript no-emit checking

- decision: define `npm run lint` as `tsc -p tsconfig.json --noEmit` and use that in GitHub Actions.
- alternative: add ESLint before v0.1. Rejected — Phase 4 needs a lightweight CI gate for a small TypeScript-only CLI, and introducing another tool plus config would add setup surface without changing the release risk materially.
- impact: CI now has distinct static-check, build, and test phases without adding new dependencies; a richer lint stack can still be added later without changing the workflow shape.

## 2026-05-18 — Phase 4 repo-side verification asserts workflow behavior, not file existence alone

- decision: keep the CI workflow files and `test/ci.test.ts` landing together, and make the test assert step ordering plus release auth/config shape.
- alternative: rely on code review of YAML files or only assert that the workflow files exist and mention `npm publish`. Rejected — that leaves easy regressions undetected, such as publishing before tests or dropping the npm token wiring while the static existence checks still pass.
- impact: local verification for Phase 4 now checks the concrete repo-side contract we can enforce offline, while the synthetic-failure PR remains a separate acceptance item that still needs a live GitHub run.

## 2026-05-19 — offline synthetic-failure simulation is evidence, not acceptance

- decision: add `test/ci-synthetic-failure.test.ts` to simulate a throwaway failing test in a temporary repo copy, temporarily park the self-referential simulation test to avoid recursion, and then run the shipped `npm test` command so the red-path evidence follows the same local entrypoint CI uses.
- alternative: mark Phase 4 complete based only on the workflow YAML plus `test/ci.test.ts`, keep using a hand-assembled test-file list, or attempt to fake a PR result without GitHub tooling/auth. Rejected — the first leaves the red-path unexercised, the second drifts from the actual CI command path, and the third would blur the line between local evidence and actual remote verification.
- impact: the current worktree now carries the strongest offline proof available in this environment while still matching the repo's real `npm test` entrypoint as closely as possible; the remaining live GitHub action and npm release checks stay explicitly open.
