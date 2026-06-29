# Context Map

Pointers into the rest of `.contextspec/` and the repo for this initiative. Roles read this first when picking up the work.

## Internal docs

- [`docs/decisions/2026-06-11-v0-2-distribution-first.md`](../../../docs/decisions/2026-06-11-v0-2-distribution-first.md) — the route decision that re-scoped this initiative to one phase and frames v0.2 as a distribution-first dual track; the OpenSpec schema bundle (weeks 3–4) consumes this initiative's `create-role`. Read it before questioning the cut.
- `docs/v0-2-backlog.md` — the original "Candidate 1" entry, plus the re-parked phases (archetype detection, agent drafting) with their preconditions.
- `docs/open-questions.md` — H-03 (minimal role set) and H-05 (founders edit YAML/MD without friction) are the hypotheses this initiative moves; status changes are retro-gated.
- `docs/v0-1-implementation-notes.md` — module map and the four cross-cutting invariants; `createRole.ts` mirrors `createInitiative.ts`; open risk #2 (`preprocessArgv` fixed positions) is closed by this initiative. Update in the same PR per its "Update protocol."
- `docs/notes/trials/2026-05-13-pr9-review-trial.md` — the "Symmetric observation" section anchors the "verify still true" checklist rewording.
- `docs/decisions/2026-05-13-drop-monetization-role.md` — the evidence bar that demoted the Reviewer preset.
- `.contextspec/initiatives/finish-line/decisions.md` — "Growth role left at template default," which this initiative's registry attachment responds to.

## Source modules touched

- `src/templates.ts` — new `ROLE_QA_MD`, `ROLE_SKELETON_MD`, `LENS_LIBRARY`; "verify still true" checklist rewording in existing role templates.
- `src/createRole.ts` — new module.
- `src/cli.ts` — wire `create-role` + spec form; position-independent `preprocessArgv`.

Not touched: `src/generateClaude.ts` (qa command emission is automatic once the registry declares `qa` — `DEFAULT_ROLE_TASK` already maps it), `compile.ts`, `route.ts`, `resolve.ts`, `generateCodex.ts`.

## Memory

- `memory/anti-patterns.md` — read before designing the YAML-AST edit. The empty-flow-mapping trap that bit `createInitiative` is recorded here; `createRole` faces the same shape.

## External sources

- (none claimed for this initiative)
