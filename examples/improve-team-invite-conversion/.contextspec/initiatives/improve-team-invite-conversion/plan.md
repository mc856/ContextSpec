# Plan

Three hypotheses, sequenced to limit blast radius. Each phase is a separate experiment with its own decision rule.

## Phase 1 — Inviter-aware email copy (hypothesis 1)

Two changes:

1. Subject line: "{inviter_first_name} invited you to {workspace_name} on Tessera".
2. Body includes an optional, editable one-line personal note. Default suggestion is generated from the inviter's role and the workspace name. Inviter sees and can edit before sending.

Surface: invite send (`/w/:workspace_id/settings/members`) + Postmark template.

Experiment: 50/50 split per workspace at invite send. Primary metric: `opened → clicked`. Guardrails: spam complaint rate, accept rate.

Estimated duration: 2 weeks experiment + 1 week analysis.

## Phase 2 — Bootstrap with teammate signal (hypothesis 2)

Workspace bootstrap shows the invitee:

1. Workspace name and inviter avatar (already shipped).
2. Three most recent non-private issues in the workspace, with assignee avatars.
3. Contextual first-action prompt (already shipped).

Surface: `/w/:workspace_id/welcome`.

Experiment: 50/50 split per accepted member. Primary metric: `accepted → activated within 7 days`. Guardrails: workspace abandonment rate, inviter-to-invitee message rate.

Estimated duration: 3 weeks experiment + 1 week analysis. Longer than phase 1 because activation has a 7-day window.

## Phase 3 — Expired-invite recovery (hypothesis 3)

When a token at `/invites/:token` is expired, show a page with the inviter's name, the workspace name, and a "request a new invite" button that emails the inviter.

Surface: `/invites/:token` expired path.

Not an experiment in v1 — it is a strict improvement over the current generic expired page. Ship behind a flag, measure recovered cohort lift in the next two cohorts, and only A/B if the lift is unclear.

Estimated duration: 1 week implementation + 2 cohorts of observation.

## Sequencing rationale

Phase 1 is first because it is the cheapest to implement and the easiest to roll back. Phase 2 carries the most downside risk (it changes the post-accept page that is currently shipping flat). Phase 3 is last because it depends on copy decisions that may interact with phase 1.

## Out of plan

- Combining phases into a single multivariate test. Traffic is too low.
- Rebuilding the invite-send admin UI. The phase-1 note field is a single textarea addition.
