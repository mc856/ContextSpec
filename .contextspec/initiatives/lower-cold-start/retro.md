# Retro — lower-cold-start Phase 1 (2026-06-12)

Phase 1 (`create-role` + QA preset) shipped in `e524469` + `c21e83a`, with review-driven fixes following. The initiative was re-scoped from three phases to one on 2026-06-11 (`docs/decisions/2026-06-11-v0-2-distribution-first.md`); this retro covers the single shipped phase.

## Hypothesis readouts

**Hypothesis 1 — `create-role` with three template sources makes a wrong role-set default cheap.** *Supported (n=1, the founder's own repo).* The dogfood registration of `qa` (`c21e83a`) used the command end-to-end: no `registry.yaml` hand-edit, comments preserved, `/qa-review` emitted byte-stable. The skeleton (`data`, `constructor`) and `--from` (`designer`) paths are test-covered. Not "validated": one user, one repo — external usage is the real test.

**Hypothesis 2 — QA is the missing fourth lens worth curating.** *Smoke-level support; formal readout deferred.* The QA-lens review (`reviews/qa.md`) produced findings the engineer lens did not reach: the acceptance-criterion caveat on `dogfood.test.ts` changing behavior, and three documentation-truth contradictions (`constraints.md` write-surface wording, the stale "validate deferred to v0.2" line, `projects/cli.md` staleness). All are pack-enabled, acceptance/constraint-anchored — the class of finding §H-02's trial said packs uniquely produce. **Caveat:** the reviewer was the same agent/session that authored the change, so this is not trial-grade evidence. The honest readout for hypothesis 2 needs an independent cold reviewer re-running `/qa-review` vs `/engineer-review` on a future change (same protocol as `docs/notes/trials/2026-05-13-pr9-review-trial.md`).

## What worked

- **Proposal audit before code.** The 2026-06-11 audit killed two blocker-grade defects (solo-detection signal, impossible acceptance criterion) before any code existed, and the cut-down single phase landed in one day.
- **Dogfood as first user.** First real `create-role` run immediately surfaced the empty-collection flow-style rendering wart; the dogfood test correctly went red when the live registry gained `qa`.
- **Byte-stability discipline paid out.** Re-running `generate-claude` for the acceptance check exposed that the four committed role commands had *never* matched generator output (drift since `5fed5fd`, flagged as A13/B12 in the PR #9 trial and unaddressed for a month).
- **The review loop fixed real bugs**: prototype-chain id lookup (`create-role constructor` crashed) and `--from` path traversal — both found by review, both now test-covered (70 cases green).

## What didn't

- **A red test got committed once.** The dogfood-commit pipeline piped `npm test` through `grep`, which swallowed the non-zero exit; the failing dogfood assertion was caught and amended immediately, but the slip is exactly the class of error CI exists for. Lesson below.
- **Acceptance wording vs reality.** "No existing test changes behavior" was technically broken by the (intended, user-confirmed) dogfood registry change. Acceptance criteria should distinguish "the feature's code changes no existing test" from "the initiative's dogfood adoption may move dogfood assertions."
- **Documentation-truth debt resurfaces.** B-pm 1 from the 2026-05-13 trial (stale `validate` line in `constraints.md`) sat unfixed for a month until this phase's pack review re-found it. Findings recorded in reviews need an owner and a deadline, or they rot.

## Registry/process notes

- `qa` is now attached to this initiative (`registry.yaml`) so `reviews/qa.md` routes into future packs. `growth` remains excluded per decisions #6.
- `constraints.md` / `principles.md` write-surface wording updated (review defect 3) — a hard-constraint change, recorded here per `constraints.md`'s own header.

## Proposed memory updates (confirmed and applied 2026-07-02)

For `memory/anti-patterns.md`:

1. **Piping a test command erases its exit code.** `npm test 2>&1 | grep …` returns grep's status; a red suite can look green to the invoking script. Rule: capture to a file and check `$?` explicitly (or rely on CI as the backstop).
2. **Plain-object `Record` lookups resolve prototype keys.** `LENS_LIBRARY[id]` with user-supplied `id = 'constructor'` returned `Object.prototype.constructor` and crashed downstream. Rule: gate user-supplied keys with `Object.hasOwn` (or use a `Map`).

For `docs/open-questions.md` (applied at this retro):

- H-05 → `partial-evidence`: `create-role` removes the scariest hand-edit; first real use on 2026-06-12.
- H-03 stays `untested`; evidence note updated with the de-risk (relief valve shipped) and the smoke-level QA-lens signal, pending an independent review trial.

## Follow-ups carried out of this initiative

- Independent `/qa-review` vs `/engineer-review` trial on a future change (hypothesis-2 formal readout; also feeds H-10).
- `0.2.0` release after the review fixes (distribution plan, weeks 1–4).
- Re-parked backlog items unchanged (`docs/v0-2-backlog.md`); nothing learned this phase changes their preconditions.
