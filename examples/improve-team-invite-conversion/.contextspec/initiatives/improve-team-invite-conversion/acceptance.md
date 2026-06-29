# Acceptance Criteria

The initiative is accepted when all of the following are true. "Accepted" means we either ship the change to 100% or formally kill it.

## Phase 1

1. Personal-note field renders, persists, and is included in the email when set.
2. Subject line shows inviter first name and workspace name when both are available; falls back gracefully when either is missing.
3. `invite_copy_v2` flag can be turned off at any time; turning it off reverts copy within 5 minutes for new sends.
4. Experiment ran for at least 2 weeks or 6,000 invites, whichever first.
5. Decision rule applied as written in `plan.md`. Result recorded in `decisions.md` and `memory/experiment-results.md`.

## Phase 2

1. Bootstrap page renders the teammate-signal section when ≥1 eligible issue exists for the invitee, and a defined empty-state otherwise.
2. Permission filtering is verified by an integration test: a private issue must not appear for a freshly-accepted invitee.
3. `bootstrap_signal_v1` flag can be turned off at any time; turning it off reverts the page within one deploy cycle.
4. Experiment ran for at least 3 weeks or 4,000 accepted invitees.
5. Guardrail metrics did not regress beyond thresholds in `domains/onboarding/metrics.md`. If a guardrail breached, decision rule explicitly addresses it.
6. Result recorded in `decisions.md` and `memory/experiment-results.md`.

## Phase 3

1. Expired invite page shows inviter name and workspace name, and a request-new-invite button.
2. Rate limit honored.
3. Inviter receives the reissue email with a working one-click link.
4. Two cohorts of observation completed; recovery rate recorded in `memory/experiment-results.md`.

## Cross-cutting

1. No constraint in `constraints.md` violated by the merged code.
2. No principle in `principles.md` violated by the shipped UX.
3. Headline metric (invite conversion) measured before, during, and after each phase. Final value reported on retro.
4. All feature flags removed from code within 30 days of the per-phase acceptance, or a follow-up issue filed.
