# Brief: improve-team-invite-conversion

## Problem

Invite conversion (invitees → activated members within 7 days) is stuck at 18.3% for the last six cohorts. We believe two of the funnel steps are leaking disproportionately:

- `invite.opened` → `invite.clicked`: ~46%, below industry comparison for product-led tools.
- `invite.accepted` → `member.activated`: ~62%, but with a long tail of accepts that never act.

## User

The invitee. Specifically, an invitee who is being added to a 5–25 person workspace by a teammate they know but who has not used Tessera before. This is the largest segment by volume and the one most responsive to inviter context.

Secondary user: the inviter (workspace admin), who picks how many people to invite at once and how invite emails are addressed.

## Goal

Lift headline invite conversion from **18.3%** to **25%** by end of 2026 H1, without regressing guardrail metrics in `domains/onboarding/metrics.md`.

## Hypotheses (to be evaluated by growth)

1. Invite emails with the inviter's name and a one-line personal note (auto-suggested, editable) lift `opened → clicked`.
2. Workspace bootstrap that shows the invitee what their teammates are working on (3 most recent issues) lifts `accepted → activated`.
3. Expired invite links with a one-click "request a new invite" path recover a measurable share of currently-lost cohorts.

## Non-goals

- Mobile invite-accept improvements.
- Changes to authentication providers.
- Changes to Postmark or any vendor swap.
- Free-tier or pricing changes.
- Marketing email cadence changes.
- Anything in the `auth` or `billing` domains.

## Success criteria

See `acceptance.md`. The brief is approved when PM, growth, and engineer have each completed a review and the open questions in `decisions.md` are resolved or assigned.

## Why now

Free-to-paid conversion of workspaces with ≥5 activated members is roughly 3.4x that of workspaces with <5. Lifting invite conversion is the highest-leverage way to grow paid workspace count without increasing top-of-funnel spend.
