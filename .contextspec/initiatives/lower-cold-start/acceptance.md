# Acceptance

What "done" means, at the level of observable behavior.

## Phase 1 — `create-role` + QA preset

- `contextspec create-role qa` on a fresh `init`: writes `roles/qa.md` from `ROLE_QA_MD`, adds `roles.qa` (`file: roles/qa.md`, `includes: []`) to `registry.yaml` with comments and key order preserved, exits 0.
- `contextspec create-role designer --from engineer`: writes `roles/designer.md` as a clone of the project's **current on-disk** `roles/engineer.md` (not the shipped template) with retitled H1.
- `contextspec create-role data`: writes the structured skeleton with `<placeholder>` markers in every section.
- Re-running `create-role qa` without `--force`: useful error, `registry.yaml` untouched. With `--force`: the second run is byte-stable against the first.
- After `create-role qa`, `contextspec generate-claude` emits `qa-review.md` — the previously latent `DEFAULT_ROLE_TASK` qa mapping becomes live with a real role file behind it.
- `contextspec --cwd <dir> create role x` works (position-independent `preprocessArgv`), covered by a spawned-bin test.
- `npm test` green: ≥6 `createRole.test.ts` cases plus the new `cli.test.ts` case; no existing test changes behavior.
- Shipped role templates' checklist items use "verify still true" framing; the dogfood mirror to `.contextspec/roles/*.md` happened only via explicit user confirmation.

## Cross-cutting

- All four cross-cutting invariants from `docs/v0-1-implementation-notes.md` still hold: byte-stable output, no LLM in compiler, CLI does not write to user-authored files, path-based routing.
- `docs/v0-1-implementation-notes.md` is updated in the same PR as the code (per its "Update protocol" section), including striking open risk #2.
- One written retro at initiative close. `docs/open-questions.md` status moves (H-03, H-05) happen at retro only, each citing an observation.
- The hypothesis-2 readout (QA-only comments vs engineer-review on the same change) is recorded — pass or fail — before the initiative closes.
