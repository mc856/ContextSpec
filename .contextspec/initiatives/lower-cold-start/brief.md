# lower-cold-start

Cut the role-related cold-start cost of a new `.contextspec/` with the smallest evidence-anchored change: a `create-role` command plus a curated QA preset. Today the role set is hardcoded at `init` (`src/init.ts` always writes `pm`/`growth`/`engineer`) and there is no command to add a role afterward — adding one means hand-editing `registry.yaml` (H-05's scariest edit) plus writing `roles/<id>.md` from scratch. QA is half-wired: spec §10 promises `qa-review` and `src/generateClaude.ts:30` already maps `qa → review`, but `src/templates.ts` has no `ROLE_QA_MD`, so the mapping is latent until a user hand-builds the role.

> **Re-scoped 2026-06-11.** The original three-phase proposal (lens library + archetype detection + agent-assisted drafting) was cut to this single phase per `docs/decisions/2026-06-11-v0-2-distribution-first.md`. The deferred phases are re-parked in `docs/v0-2-backlog.md` with the audit lessons attached.

## Why now

- v0.1 shipped (`0.1.0` on npm, CI green). The v0.2 cycle is distribution-first (see [`docs/decisions/2026-06-11-v0-2-distribution-first.md`](../../../docs/decisions/2026-06-11-v0-2-distribution-first.md)), and the OpenSpec schema-bundle story needs "add a role lens with one command" to be true.
- The spec §10 / `generateClaude` / `templates.ts` inconsistency around QA is real and latent — the moment a careful user looks, it's incoherent.
- `AGENTS.md` calls registry edits a scope change to surface, but ContextSpec gives the user no command to make one safely. H-05's scariest edit is unaddressed.
- The one H-02 trial surfaced a concrete template flaw — checklist items framed as "decided/historical" suppress re-examination (`docs/notes/trials/2026-05-13-pr9-review-trial.md`, "Symmetric observation") — which can be fixed in the same template pass.

## Hypotheses

1. **`create-role` with three honest template sources (curated preset / `--from` clone / structured skeleton) makes a wrong role-set default cheap rather than protocol-breaking.** This is H-03's relief valve. — falsified if a real role need cannot be served by any of the three sources without protocol changes.
2. **QA is the missing fourth lens worth curating.** — falsified if a QA-review pack on a real change produces no comment that an engineer-review pack on the same change did not (same trial shape as `docs/notes/trials/2026-05-13-pr9-review-trial.md`).

## Out of scope

- `init --profile` / `--role` + archetype/org-shape detection. Returned to backlog: the proposed solo signal misclassifies this very repo (three author identities in the last 50 commits), the static `REGISTRY_YAML` template must be parameterized first, and auto-apply vs recommend-only was never decided. See `docs/v0-2-backlog.md`.
- Agent-assisted role-content drafting. Returned to backlog: the grounding contract is prose a host agent may ignore; it cannot be enforced in code, and its acceptance was unobservable as written. Revisit after the OpenSpec bundle ships and at least one external user exists.
- A curated Reviewer preset. Demoted to the skeleton / `--from` path until a real invocation shows distinct value — per the evidence bar in `docs/decisions/2026-05-13-drop-monetization-role.md` (rationale 2) and the backlog's "skeleton for the rest until demand shows."
- Interactive multi-select for `init`. Unchanged: adds a prompt dependency to a dep-light codebase for pure UX sugar.
- Curating designer / security / monetization / coordinator / data presets. Monetization is explicitly dropped (`docs/decisions/2026-05-13-drop-monetization-role.md`).
- Rewriting `compilePack`, `route.ts`, `resolve.ts`, or `generateCodex.ts`. The four cross-cutting invariants in `docs/v0-1-implementation-notes.md` remain inviolate.
