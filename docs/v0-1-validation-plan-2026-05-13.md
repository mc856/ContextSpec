# v0.1 Validation Plan — 2026-05-13

Follow-up to `docs/methodology-review-2026-05-12.md` and the owner's update
note in §5 of that file.

Scope: execute all four owner-prioritized recommendations as one bounded piece
of work, without shipping any new v0.2 compiler features.

This plan should also sharpen whether ContextSpec really fits the emerging
"solo founder / one-person company with AI" workflow. That fit is currently a
strong thesis, not yet a demonstrated result.

This plan is methodology and evidence work, not protocol or code work.

## Container

All four phases ship under one new initiative:

    .contextspec/initiatives/v0-1-validation/

Reusing the initiative template for non-feature work is itself a dogfood
signal — if the template strains under this kind of work, that surfaces an
open question for v0.2.

## Phase 1 — End-to-end review trial

**Owner priority #1.** This is the load-bearing phase; phases 2–4 depend on
its evidence.

**Trial subject.** PR #9 (the dogfood PR that introduced
`.contextspec/finish-line`). Chosen over PRs #10 (docs-only) and a synthetic
mini-PR because PR #9 simultaneously tests two claims: that role packs help
review quality, and that the dogfood `.contextspec/` itself carries useful
content for a solo founder who is switching between PM, engineering, and
review concerns in one workflow.

**Method.**

1. Generate two packs for the `finish-line` initiative from current `main`:
   `engineer-review` and `pm-review`.
2. Run three review passes on the diff of PR #9:
   - **A. baseline** — Claude Code given only the PR diff.
   - **B. pack-assisted** — Claude Code given the diff plus the generated pack.
   - **C. human** — a manual pass by the author, as a sanity reference.
3. Tag every comment in pass B with one of:
   `from-pack:<section>` / `from-diff` / `model-prior` / `human-only`.
4. Compute A vs B set difference: comments unique to B, comments unique to A,
   shared comments.

**Output.** `docs/trials/2026-05-13-pr9-review-trial.md` containing:
the raw outputs of A and B, the tagged version of B, the diff summary, and
a short discussion.

**Falsifiable success criteria.** Stated *before* running the trial so they
cannot be softened after the fact:

- ≥30% of pass-B comments are tagged `from-pack:<section>` (not `from-diff`
  or `model-prior`).
- ≥1 comment in B is both absent from A and clearly attributable to pack
  context — i.e. the trial produces at least one specific insight that the
  baseline could not have reached.
- The author can point to at least one moment where the pack reduced repeated
  explanation or role-switching overhead in a way that would matter in a real
  solo-founder workflow.

**Failure mode handling.** If the criteria are not met, the conclusion is
"v0.1 pack thesis is not yet validated for review use". That is a legitimate
outcome of this plan and the trial doc must record it as such; phases 2–4
proceed but Phase 2 will be smaller because there will be fewer positive
examples to harvest.

## Phase 2 — Spec semantic contracts

**Owner priority #2.** Strong dependency on Phase 1 output — without trial
data, positive/negative examples are guesswork.

**Targets.** Three currently under-specified narrative shapes in the v0.1
spec:

- `initiatives/<id>/context-map.md` (§8.1)
- `## Review Checklist` (§5.2)
- `## Output Contract` (§5.2)

**For each target, add:**

- one positive example — a span quoted from the trial that demonstrably helped
  pass B make a comment that pass A missed
- one negative example — a span that was inert or misleading in the trial
- one one-line heuristic — a rule of thumb, not a hard constraint

**Self-check.** Every positive/negative example must cite a line in the trial
doc. Examples that cannot be cited are dropped, not invented.

**Edits land in** `CONTEXTSPEC_V0_1_SPEC.md` §5.2 and §8.1. `§12 Acceptance
Criteria` gains one snapshot-style item ("a pack generated from
`examples/improve-team-invite-conversion/` matches the committed fixture
byte-for-byte under a fixed `generated_at`").

## Phase 3 — Assumptions registration

**Owner priority #3.** Can run in parallel with Phase 1.

**Decision first, document second.** The deliverable is a two-layer
governance rule:

- **Project-level** `docs/open-questions.md` — long-lived assumptions that
  span initiatives. Examples to seed it with: target-user framing, YAML
  tolerance, four-vs-seven role set, the `source://` boundary, and the claim
  that solo founders will sustain this workflow instead of falling back to raw
  prompts.
- **Initiative-level** — assumptions local to a single cycle can live in the
  initiative's own `decisions.md` or a new optional `hypotheses.md`. No
  protocol change in this plan; v0.2 may consider adding `hypotheses.md` to
  the initiative template if that pattern repeats.

**Allocation rule** (one line, will appear in both documents):
*if the assumption still holds when the current initiative closes, it lives
at the project level; otherwise it lives in the initiative.*

**Cap.** `docs/open-questions.md` is capped at 10 entries to prevent it from
becoming a wishlist. Each entry has: the assumption, the falsifier, current
status (`untested` / `partial-evidence` / `validated` / `falsified`).

**Governance note** is appended to `PRODUCT_BLUEPRINT.md` describing the
two-layer rule so future readers know where to look.

## Phase 4 — Monetization role: explicit record

**Owner priority #4.** Can run in parallel with Phase 1.

**Investigation.** `git log -S "Monetization" --all` plus a grep across
`BLUEPRINT`, `SPEC`, and merged PRs, to reconstruct when the role appeared
and when it disappeared.

**Decision** (the decision was effectively made already; this phase only
records it):

- **(a) — recommended.** Drop is intentional. v0.1 ships PM / Growth /
  Engineer / QA only because Monetization and Growth overlap heavily for
  solo founders and small teams, who typically wear both hats. Record this
  as an ADR.
- (b) Drop was an oversight; restore in v0.2. Not recommended absent any
  pull for it from real use.
- (c) Re-evaluate the entire role set. Out of scope here; would be a separate
  brainstorm.

**Output.** `docs/decisions/2026-05-13-drop-monetization-role.md` (ADR-style:
context, decision, consequences, alternatives considered). A one-line link
added to `CONTEXTSPEC_V0_1_SPEC.md` §6.

## Sequencing and dependencies

```text
Phase 1 (trial)        ─┬─> Phase 2 (spec contracts)
                        │
Phase 3 (assumptions)  ─┤   parallel
Phase 4 (monetization) ─┘   parallel
                        │
                        └─> close v0-1-validation initiative
```

Phase 1 first because it determines the substance of Phase 2 and the
evidence status of items in Phase 3. Phases 3 and 4 are independent of the
trial result and can be drafted in parallel.

## What this plan is not

- Not a v0.2 feature plan. No new compiler functionality.
- Not a role-set redesign. Phase 4 only records the existing drop.
- Not a `sources/` protocol change. The KB-vs-sources question is one of the
  items registered in `docs/open-questions.md`, not resolved here.
- Not a code-review process change. Per-slice planning artifacts are
  discussed in the methodology review but not part of this plan's deliverables.

## Risk register

- **R1 — Phase 1 falsifies the thesis.** Acceptable. Surface it; do not
  soften the success criteria after the fact.
- **R2 — Phase 2 examples become taste-driven.** Mitigated by the
  "every example must cite a trial line" self-check.
- **R3 — `open-questions.md` bloats.** Mitigated by the hard cap of 10.
- **R4 — Phase 4 scope creep into role-set redesign.** Mitigated by
  explicitly scoping option (c) out.

## Definition of done

- `docs/trials/2026-05-13-pr9-review-trial.md` exists, with tagged comments
  and an explicit pass/fail call against the criteria above.
- `CONTEXTSPEC_V0_1_SPEC.md` §5.2 and §8.1 each contain one positive
  example, one negative example, and a one-line heuristic, each citing
  the trial doc.
- `docs/open-questions.md` exists with ≤10 entries, each with a falsifier
  and a status.
- `PRODUCT_BLUEPRINT.md` has a short governance section describing the
  two-layer assumption rule.
- `docs/decisions/2026-05-13-drop-monetization-role.md` exists.
- The `v0-1-validation` initiative under `.contextspec/initiatives/` has at
  minimum `brief.md` and `retro.md` summarizing what was learned.
  *Status (2026-05-13): intentionally skipped. The four deliverables above
  carry the brief + retro content in distributed form; a separate initiative
  container would only restate them and risk drift. Captured as H-07
  evidence in `docs/open-questions.md`.*

## Reading order for an external reviewer

A reader picking this trail up cold should read in this order:

1. `VISION.md` — what the project is for.
2. `docs/methodology-review-2026-05-12.md` — the diagnosis this plan
   responds to. Pay attention to §5 (the 2026-05-13 update note); some
   diagnoses are already outdated.
3. *this file* — what we committed to do and the falsifiable criteria.
4. `docs/trials/2026-05-13-pr9-review-trial.md` — Phase 1 evidence. This
   is the load-bearing artifact; if it does not convince, nothing
   downstream does.
5. `docs/decisions/2026-05-13-drop-monetization-role.md` — Phase 4. A
   concrete worked example of recording a silent drop.
6. `docs/open-questions.md` and `PRODUCT_BLUEPRINT.md` §22 — Phase 3.
   What we have not yet validated.
7. `CONTEXTSPEC_V0_1_SPEC.md` §5.2.1 and §8.1 sub-section — Phase 2. The
   spec edits the trial produced.

`PRODUCT_BLUEPRINT.md` (full) and `docs/v0-1-implementation-notes.md` are
optional unless the reviewer wants to audit mechanical invariants or the
shipping surface beyond what the review touched.
