# Tasks

Sized in days, not weeks. Each task is independently revertible.

## Phase 1 — `create-role` + QA preset

- [x] author `ROLE_QA_MD` in `src/templates.ts` — Mission / Owns / Needs / Reviews / Output Contract / Cannot Decide / Checklist / Common Mistakes / Suggested Memory Updates. Anchor in spec §10 and the example fixture's QA touchpoints; opinionated, not generic. Checklist items phrased as "verify still true," not "already addressed" (anchor: `docs/notes/trials/2026-05-13-pr9-review-trial.md`, negative example).
- [x] add `ROLE_SKELETON_MD` in `src/templates.ts` — the third template source for genuine custom roles. Sections only, `<placeholder>` markers; honest about being a shape, not a claim.
- [x] add `LENS_LIBRARY: Record<string, string>` in `src/templates.ts` — id → preset constant for `pm` / `growth` / `engineer` / `qa`. Deterministic, no logic.
- [x] reword existing role templates' checklist framings to "verify still true" style where the trial lesson applies (`ROLE_PM_MD`, `ROLE_GROWTH_MD`, `ROLE_ENGINEER_MD`), and **propose** the mirrored edits to this repo's `.contextspec/roles/*.md` — dogfood role files are user-authored surface, so the mirror lands only on user confirmation. *(mirror applied 2026-06-12 with user confirmation)*
- [x] implement `src/createRole.ts` mirroring `createInitiative.ts`: kebab-case id validation; `parseDocument` + `forceBlockStyle` edit on `roles:`; write `roles/<id>.md` from preset / `--from` (clone of the project's current on-disk file) / skeleton; registry entry `{file, includes: []}`; honor `--force`; return `{written, skipped, warnings}`. Reread `memory/anti-patterns.md` (flow-style mapping trap) first. *(shared helpers extracted to `src/yamlEdit.ts`; empty collections render inline)*
- [x] wire `cli.ts`: `create-role <id>` + spec form `create role <id>`; make `preprocessArgv` position-independent (scan for adjacent token pairs anywhere, not at fixed `argv[2..3]`) — closes implementation-notes open risk #2.
- [x] tests: `test/createRole.test.ts` — ≥6 cases: id validation; library preset path; `--from` clone of the current on-disk file; skeleton fallback; comment-preserving registry edit (mirror `init.test.ts:preserves comments and existing entries`); refuse-without-force; byte-stable `--force` re-run. *(11 cases landed)*
- [x] tests: `test/cli.test.ts` — first spawned-bin test: `contextspec --cwd <dir> create role <id>` exercises the spec form with a leading flag.
- [x] update `docs/v0-1-implementation-notes.md` in the same PR: new `createRole.ts` module section; strike open risk #2; refresh the file-count table.
- [x] **propose** (user-confirmed, per AGENTS.md item 6) adding `qa` to this repo's `registry.yaml`; if accepted, run `generate-claude` and assert `.claude/commands/` byte-stability on re-run. *(confirmed and applied 2026-06-12 via `create-role qa`; `/qa-review` emitted, re-run byte-stable)*

## Cross-cutting

- [x] each PR: `npm run lint` + `npm run build` + `npm test`; no byte-stability regressions on `pack` / `generate-claude` / `generate-codex` against existing fixtures. *(held for the shipped PRs `e524469` + `c21e83a`; 70 tests green, byte-stability of `/qa-review` re-run confirmed in `retro.md`.)*
- [x] dogfood experiment at close: `/qa-review lower-cold-start` vs `/engineer-review lower-cold-start` on the Phase 1 PR; record QA-only comments as the hypothesis-2 readout. *(done — see `reviews/qa.md` and `reviews/engineer.md`; readout in `retro.md` "Hypothesis 2", noted as smoke-level not trial-grade.)*
- [x] retro at close: H-05 `untested` → `partial-evidence` only if `create-role` demonstrably removes the registry hand-edit; record the hypothesis-2 readout; update the re-parked entries in `docs/v0-2-backlog.md` with anything learned. *(retro shipped 2026-06-12; H-05 readout in `retro.md` "Hypothesis 1"; backlog update tracked there.)*
