# ADR — Drop Monetization from v0.1 built-in roles

- **Date:** 2026-05-13
- **Status:** Accepted (recording an existing decision)
- **Context recorded into:** `CONTEXTSPEC_V0_1_SPEC.md` §6

## Context

`PRODUCT_BLUEPRINT.md` §5.2 lists seven roles: PM, Growth, Monetization,
Engineer, QA, Reviewer, Coordinator (lines 240, 1390–1397).

`CONTEXTSPEC_V0_1_SPEC.md` §6 lists four built-in roles: PM, Growth,
Engineer, QA.

The reduction from seven to four was made during spec consolidation but
never accompanied by a written rationale. The methodology review on
2026-05-12 flagged this as a "silent drop" — a decision made in fact, not
in record. This ADR records the decision.

The example fixture already treats this drop as established:

> Monetization: skipped. None of the hypotheses touch pricing, packaging,
> or the free-tier limit.
> — `examples/improve-team-invite-conversion/.contextspec/initiatives/improve-team-invite-conversion/context-map.md:14`

> It does not exercise `monetization` or `coordinator` roles — those are
> out of v0.1 scope.
> — `examples/improve-team-invite-conversion/README.md:26`

So the operational decision exists. This document gives it a written
home.

## Decision

v0.1 ships four built-in role templates: PM, Growth, Engineer, QA.
Monetization, Reviewer, and Coordinator from the blueprint are not built
in for v0.1.

This ADR focuses on Monetization specifically because it is the role
most easily confused with Growth and most likely to be re-introduced
later.

## Rationale

1. **Target-audience overlap with Growth.** For solo founders and small
   teams — the v0.1 target audience — monetization decisions are not
   cleanly separable from growth decisions. Pricing, packaging, free-tier
   limits, paywall placement, and activation surfaces are typically owned
   by the same person who owns acquisition and activation. A separate
   role template would split a workflow that lives in one head.
2. **Per-role maintenance cost.** Each built-in role costs a role file,
   a slash command, a checklist, and ongoing template upkeep. The
   four-role set already covers the Create / Pack / Review loop that v0.1
   ships. Adding a fifth role without observed demand spends maintenance
   ahead of evidence.
3. **No protocol limitation.** Users who do want a Monetization role can
   add it via `.contextspec/roles/monetization.md` and a `roles.monetization`
   entry in `registry.yaml`. The compiler treats user-defined roles the
   same as built-ins. The missing piece is a template, not a capability.
4. **Trial evidence supports the smaller set.** The PR #9 review trial
   (`docs/notes/trials/2026-05-13-pr9-review-trial.md`) produced useful PM and
   engineer signal without invoking a Monetization role; there is no
   current evidence of a Monetization-specific review point that the
   existing roles miss.

## Alternatives considered

- **Restore Monetization in v0.2 by default.** Rejected for now: no
  observed user pull. May revisit when at least one user reports that
  Growth review is leaving real monetization questions unanswered.
- **Merge Monetization into Growth permanently.** Rejected: keeping the
  blueprint's seven-role taxonomy as the long-form vocabulary preserves
  optionality. The decision is "not built-in for v0.1", not "the concept
  is wrong".
- **Replace Growth with a combined Growth+Monetization role.** Rejected:
  Growth's acceptance criteria (funnel metrics, activation experiments)
  and Monetization's (pricing tests, packaging changes, revenue impact)
  are sharp enough to make a merged checklist longer and less actionable
  than two short ones would be.

## Consequences

- `VISION.md` continues to mention "monetization decisions" (line 20) and
  "monetization owner" (line 146). This is intentional: ContextSpec
  helps with these concerns; it just does not ship a default template
  for them.
- `PRODUCT_BLUEPRINT.md` still lists Monetization in §5.2 and §13. The
  blueprint is the long-form vocabulary; the spec is the shipping
  surface. The asymmetry is now intentional and documented.
- Users adding Monetization themselves should expect to write the role
  file from scratch; copying `roles/growth.md` as a starting point is the
  most common path and works without changes elsewhere.
- This ADR is referenced from `CONTEXTSPEC_V0_1_SPEC.md` §6 so a
  reader scanning the role list finds the trail.

## Open question carried to `docs/open-questions.md`

Whether the four-role set is the right minimal set is itself an open
assumption. The Phase 3 deliverable will register it explicitly as a
falsifiable hypothesis (falsifier: a user reports a review need that no
existing role's checklist covers).
