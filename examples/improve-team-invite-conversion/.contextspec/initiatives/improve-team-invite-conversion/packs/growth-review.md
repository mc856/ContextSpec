---
contextspec_version: 0.1
role: growth
task: review
initiative: improve-team-invite-conversion
project: web-app
generated_at: 2026-04-26T10:00:00Z
sources:
  - context.md
  - principles.md
  - glossary.md
  - constraints.md
  - roles/growth.md
  - memory/experiment-results.md
  - domains/onboarding/context.md
  - domains/onboarding/flows.md
  - domains/onboarding/metrics.md
  - domains/onboarding/decisions.md
  - initiatives/improve-team-invite-conversion/brief.md
  - initiatives/improve-team-invite-conversion/context-map.md
  - initiatives/improve-team-invite-conversion/plan.md
  - initiatives/improve-team-invite-conversion/acceptance.md
  - initiatives/improve-team-invite-conversion/decisions.md
  - projects/web-app.md
  - source://personal_knowledge_base/Customers/2025-Q3-onboarding-review.md
  - source://personal_knowledge_base/Decisions/2026-01-invite-copy-rollback.md
---

# Context Pack

## Task

Perform a Growth review of the `improve-team-invite-conversion` initiative against the role output contract in `roles/growth.md`. Produce hypothesis assessment, funnel impact, instrumentation requirements, experiment design, risks, and a recommendation. Do not propose implementation details (engineer's call) or scope changes (PM's call).

## Global Context

Tessera is a team workspace tool for product and engineering teams of 5–50 people. Post-PMF, early growth, ~1,200 paying workspaces. 2026 H1 priorities: invite conversion, time-to-first-collaborative-action, free-to-paid conversion of workspaces with ≥5 activated members. The first two are upstream of the third.

### Principles to honor

1. Workspace value before user value.
2. No new onboarding friction without instrumentation.
3. Email is opt-in by default for marketing; transactional is allowed.
4. Inviter context beats generic copy.
5. One workspace per signup intent.
6. Reversible before clever.

### Glossary highlights

- **Invitee**: invited but not yet accepted.
- **Activated member**: member who created / commented / assigned within 7 days of accepting.
- **Invite conversion**: invitees → activated members within 7 days, cohorted by send week.

### Constraints relevant here

- Free tier limit (10 members) unchanged in H1; do not gate behind paid tiers.
- Postmark is the sole email vendor for H1; no vendor swap.
- Feature flags default off; ship through the existing `flags` service.
- We do not auto-add invitees pre-signup.

## Role Context

You are the Growth Manager. You own funnel definitions, experiment design, activation/conversion definitions, and the experiment-results memory. You review whether hypotheses are falsifiable, whether metrics are instrumented, whether designs are powered, and whether rollouts are reversible. You do not decide product principles (PM), implementation (engineer), or QA gating.

## Domain Context

### Onboarding scope

Surfaces in scope: `/signup`, `/invites/:token`, `/w/:workspace_id/welcome`, the invite-send admin UI, transactional email templates. Auth and billing are separate domains and out of scope here.

### Funnel

| Step | Event |
|---|---|
| Sent | `invite.sent` |
| Delivered | `invite.delivered` |
| Opened | `invite.opened` |
| Clicked | `invite.clicked` |
| Accepted | `invite.accepted` |
| Activated | `member.activated` |

Headline metric: invite conversion = `member.activated within 7 days of invite.sent` / `invite.sent`. Current: **18.3%** (cohort 2026-W17). Target: **25%** by end H1.

### Guardrails

- Workspace abandonment within 24h post-accept (≤ +2pp).
- Inviter-to-invitee message rate within 7 days (≥ -10%).
- Auth provider error rate during signup (≤ +0.5pp).
- Postmark spam complaint rate (≤ 0.1%).

### Known instrumentation gaps

- `invite.opened` undercounted by ~15–20% due to image-blocking; affects both arms equally.
- `member.activated` does not count "viewed" actions; intentional.

### Past decisions to respect

- Invite expiry stays at 14 days (2025-09).
- Workspace bootstrap is mandatory; the skip variant lost (2025-11). See `memory/experiment-results.md`.
- Email mismatch is allowed but not auto-claimed (2026-02).

## Initiative Context

### Problem

Invite conversion stuck at 18.3% for six cohorts. Two leaks dominate:

- `opened → clicked`: ~46%.
- `accepted → activated`: ~62%, with a long inactive tail.

### User

The invitee in a 5–25 person workspace, added by a known teammate, no prior Tessera usage. Largest segment by volume; most responsive to inviter context.

### Goal

18.3% → 25% by end H1 without regressing guardrails.

### Hypotheses (under your review)

1. Inviter-aware copy lifts `opened → clicked`.
2. Bootstrap teammate signal lifts `accepted → activated`.
3. Expired-invite recovery flow recovers a measurable share of currently-lost cohorts.

### Plan summary

- Phase 1: subject line with inviter first name + workspace; opt-in personal note auto-suggested. 50/50 per workspace at send.
- Phase 2: bootstrap shows three most recent non-private issues. 50/50 per accepted member.
- Phase 3: expired-invite recovery; not an A/B, ship-and-observe two cohorts.

### Open questions blocking design

- OQ-3: include or exclude inviter's own activity in phase 2 signal? Pending growth decision before P2-T1.
- OQ-1: should phase 3 ship before phase 1 concludes? Pending PM.

### Non-goals

Mobile, auth, vendor swaps, free-tier or pricing changes, marketing email cadence.

## Project Context

`web-app` (`../web-app`). Next.js + React 19, TS, Prisma + Postgres. Feature flags via `flags` service, default off. Telemetry events use `domain.subject_action`; events that join the funnel must also be added to `domains/onboarding/metrics.md`. Permission filtering is a query concern, not render concern. Migrations must be reversible.

## Relevant Memory

### Experiment history (excerpts)

- 2025-11 — Skip-bootstrap variant lost: -3.1pp activation (p=0.04). Bootstrap is mandatory.
- 2026-01 — Generic invite subject line caused 9% open-rate drop in 48h; rolled back. Codified as principle 4.
- 2026-02 — Email-mismatch auto-claim killed pre-experiment due to support-ticket evidence.

## Review Checklist

- [ ] Each hypothesis is falsifiable, measurable, scoped.
- [ ] Primary metric matches a funnel step in `metrics.md`.
- [ ] Sample sizes based on current traffic, not aspirational.
- [ ] Guardrails named, with thresholds.
- [ ] Decision rule written before launch.
- [ ] Instrumentation diff fits in one engineering task per phase.
- [ ] No principle in `principles.md` violated by either variant.
- [ ] No anti-pattern from `memory/anti-patterns.md` reintroduced (especially A4: migration-coupled experiments).

## Output Contract

Produce, in this order:

1. Hypothesis assessment.
2. Funnel impact: target step, expected lift, confidence.
3. Instrumentation requirements: events, owner, ETA.
4. Experiment design: variants, allocation, primary metric, guardrails, sample size, decision rule.
5. Risks to the funnel, including segments that may regress.
6. Recommendation: run as designed / revise design / not worth running.

Include risks, open questions, and source references inline. Do not propose implementation approach; do not change scope.

## Sources

- `context.md`
- `principles.md`
- `glossary.md`
- `constraints.md`
- `roles/growth.md`
- `memory/experiment-results.md`
- `domains/onboarding/context.md`
- `domains/onboarding/flows.md`
- `domains/onboarding/metrics.md`
- `domains/onboarding/decisions.md`
- `initiatives/improve-team-invite-conversion/brief.md`
- `initiatives/improve-team-invite-conversion/context-map.md`
- `initiatives/improve-team-invite-conversion/plan.md`
- `initiatives/improve-team-invite-conversion/acceptance.md`
- `initiatives/improve-team-invite-conversion/decisions.md`
- `projects/web-app.md`
- `source://personal_knowledge_base/Customers/2025-Q3-onboarding-review.md`
- `source://personal_knowledge_base/Decisions/2026-01-invite-copy-rollback.md`
