# Tasks

Phase-tagged work breakdown. Each task is small enough to estimate independently.

## Phase 1 — Inviter-aware email copy

- [ ] P1-T1: Add optional `personal_note` field to the `invite` table. Backfill nulls. Migration must be reversible.
- [ ] P1-T2: Add personal-note textarea to the invite-send admin UI; auto-suggest from inviter role + workspace name.
- [ ] P1-T3: Update Postmark `onboarding-invite` template to include the personal note when present, and the new subject line.
- [ ] P1-T4: Add `invite.personal_note_used` event for instrumentation.
- [ ] P1-T5: Add experiment split at invite send (`flag: invite_copy_v2`).
- [ ] P1-T6: Verify funnel events fire for both variants in the staging dashboard.

## Phase 2 — Bootstrap with teammate signal

- [ ] P2-T1: Add server-side query for "three most recent non-private issues" with assignee. Must be permission-aware; an invitee just-added must not see private items even if the workspace generally allows them.
- [ ] P2-T2: Render the new section in `/w/:workspace_id/welcome` behind `flag: bootstrap_signal_v1`.
- [ ] P2-T3: Add `bootstrap.signal_shown` and `bootstrap.signal_clicked` events.
- [ ] P2-T4: Define empty-state when the workspace has no eligible issues.
- [ ] P2-T5: Ensure the page degrades gracefully when the query is slow (>500ms): render without the section, log a `bootstrap.signal_skipped_slow`.
- [ ] P2-T6: Verify guardrail metrics are queryable from the experiment dashboard before launch.

## Phase 3 — Expired-invite recovery

- [ ] P3-T1: Update `/invites/:token` expired path to show inviter name and workspace name.
- [ ] P3-T2: Add "request a new invite" button that fires a `notifications` job emailing the inviter.
- [ ] P3-T3: Add `invite.expired_recovery_requested` event.
- [ ] P3-T4: Rate-limit recovery requests per token to 1 per hour.
- [ ] P3-T5: Update the inviter's email template to include a one-click reissue link.

## Cross-cutting

- [ ] X-T1: Update `domains/onboarding/metrics.md` if any new event becomes part of the headline or guardrail definitions.
- [ ] X-T2: Document feature flags in `projects/web-app.md` flag inventory.
- [ ] X-T3: Add rollback rehearsal to the launch checklist for each phase.
