# Onboarding Decisions

Durable decisions about onboarding. Each entry should name the decision, the date, and the rationale. Reversal requires a new entry.

## 2025-09 — Invite expiry stays at 14 days

We considered shortening invite expiry to 7 days to push urgency. We kept it at 14. Customer interviews showed that team admins frequently send invites on Friday for an onboarding session "next week"; a 7-day expiry caused expired invites for ~6% of cohorts. See [the 2025-Q3 customer review notes](source://personal_knowledge_base/Customers/2025-Q3-onboarding-review.md) for the underlying interviews.

## 2025-11 — Workspace bootstrap is mandatory

Earlier we A/B tested skipping `/w/:workspace_id/welcome` for users who arrived from invites where the workspace already had ≥5 members. The skip variant lost on activation (-3.1pp, p=0.04). The bootstrap page now ships unconditionally. The hypothesis that experienced workspaces "self-onboard" did not hold.

## 2026-01 — Generic "You've been invited" copy is a regression

A copy refresh briefly shipped without the inviter's name in the email subject line. Open rate dropped 9% within 48 hours; we rolled back. This is now codified in `principles.md` rule 4. See [the rollback decision log](source://personal_knowledge_base/Decisions/2026-01-invite-copy-rollback.md).

## 2026-02 — Email mismatch is allowed but not auto-claimed

When the invitee signs up with a different email than the invited email, we still allow signup but do not auto-attach them to the inviting workspace. Auto-attaching surfaced multiple support tickets where the wrong person joined a workspace. The current behavior is intentional, even though it costs us some invite conversion. Revisit only with a verification step (e.g. sending a confirmation to the original invited address).

## Open questions for the current initiative

- Should expired invite links offer a one-click "request a new invite" path? Not decided. Tracking under `initiatives/improve-team-invite-conversion/decisions.md`.
- Should team links (reusable invite links) be on by default for new workspaces? Not decided. See [team-link adoption notes](source://personal_knowledge_base/Product/team-links-adoption.md).
