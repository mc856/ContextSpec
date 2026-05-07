# Onboarding Metrics

All metrics are cohorted by invite send week unless otherwise noted.

## Funnel

| Step | Event | Definition |
|---|---|---|
| 1. Sent | `invite.sent` | Postmark accepted the send. |
| 2. Delivered | `invite.delivered` | Postmark delivered (no bounce / block within 24h). |
| 3. Opened | `invite.opened` | First open within 7 days. |
| 4. Clicked | `invite.clicked` | Click on the accept link within 7 days. |
| 5. Accepted | `invite.accepted` | Invite marked accepted. Becomes a member. |
| 6. Activated | `member.activated` | First create / comment / assign within 7 days of accept. |

## Headline metric

**Invite conversion**: `member.activated within 7 days of invite.sent` / `invite.sent`. Computed weekly per cohort.

Current value (last full cohort, 2026-W17): **18.3%**. Target for H1: **25%**.

## Guardrail metrics

| Metric | Threshold | Why |
|---|---|---|
| Workspace abandonment within 24h post-accept | ≤ current rate +2pp | Avoids "look activated, then disappear". |
| Inviter-to-invitee message rate within 7 days | ≥ current rate -10% | Healthy invites lead to actual collaboration. |
| Auth provider error rate during signup | ≤ current rate +0.5pp | Protects against signup regressions. |
| Postmark spam complaint rate | ≤ 0.1% | Vendor-imposed and brand-protective. |

## Segmentation

The funnel is also tracked by:

- Workspace size at time of send (1–4, 5–10, 11–25, 26+ members).
- Whether the inviter is the workspace creator.
- Email domain class (free webmail vs. business domain).

Segmentation is read-only on the dashboard; experiment results must be reported on the headline metric first, then per-segment.

## Known instrumentation gaps

- `invite.opened` only fires for Postmark's image pixel; clients with image-blocking are undercounted by an estimated 15–20%.
- `member.activated` does not count "viewed an issue" as activation. This is intentional but should be revisited if we add reaction emoji.
