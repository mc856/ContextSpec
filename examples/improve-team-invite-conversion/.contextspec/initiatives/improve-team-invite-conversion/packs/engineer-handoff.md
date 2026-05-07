---
contextspec_version: 0.1
role: engineer
task: handoff
initiative: improve-team-invite-conversion
project: web-app
generated_at: 2026-04-26T12:00:00Z
sources:
  - context.md
  - principles.md
  - glossary.md
  - constraints.md
  - roles/engineer.md
  - memory/anti-patterns.md
  - domains/onboarding/context.md
  - domains/onboarding/flows.md
  - domains/onboarding/metrics.md
  - domains/onboarding/decisions.md
  - initiatives/improve-team-invite-conversion/brief.md
  - initiatives/improve-team-invite-conversion/context-map.md
  - initiatives/improve-team-invite-conversion/plan.md
  - initiatives/improve-team-invite-conversion/tasks.md
  - initiatives/improve-team-invite-conversion/acceptance.md
  - initiatives/improve-team-invite-conversion/decisions.md
  - initiatives/improve-team-invite-conversion/reviews/growth.md
  - projects/web-app.md
---

# Context Pack

## Task

Receive a PM → Engineer handoff for `improve-team-invite-conversion`. Produce an engineering handoff document per the role output contract: implementation approach, affected modules, data shape changes, flag and rollback plan, risks with mitigations, test plan, open questions, and an estimate with assumptions. Do not relitigate scope; do not redesign experiments.

## Global Context

Tessera is a team workspace tool for product and engineering teams of 5–50 people. The initiative targets headline invite conversion (18.3% → 25%) without regressing guardrails. Three sequenced phases: copy change, bootstrap signal, expired-invite recovery.

### Principles

1. Workspace value before user value.
2. Don't add onboarding friction without instrumentation.
3. Email opt-in by default for marketing; transactional allowed.
4. Inviter context beats generic copy.
5. One workspace per signup intent.
6. Reversible before clever.

### Constraints

- Free tier 10 members; do not gate behind paid tiers.
- Postmark only; no vendor work.
- Invite signing key stable; do not rotate.
- Web is the only client surface for invite-accept in H1.
- Flags default off; `flags` service.
- No auto-add pre-signup. No re-engagement to declined invitees. Workspace admins can disable team links.

## Role Context

You are the Engineer. You own implementation approach, interface and data shape decisions, code-level test coverage, and engineering risks (rollback, perf, migration). You review whether the brief is concrete enough to estimate, whether acceptance criteria are testable from code or logs, whether constraints are respected, and whether the change is reversible behind a flag. You do not decide whether the initiative is worth doing (PM) or experiment design (growth).

## Domain Context

### Surfaces affected

| Surface | Path | Phase |
|---|---|---|
| Invite send (admin) | `/w/:workspace_id/settings/members` | 1 |
| Postmark template | `onboarding-invite` | 1 |
| Invite accept | `/invites/:token` (expired path) | 3 |
| Workspace bootstrap | `/w/:workspace_id/welcome` | 2 |

### Funnel

`invite.sent` → `invite.delivered` → `invite.opened` → `invite.clicked` → `invite.accepted` → `member.activated`. Headline = `activated within 7 days of sent` / `sent`. Current 18.3%, target 25%.

### Guardrails to protect

- Workspace abandonment within 24h post-accept (≤ +2pp).
- Inviter-to-invitee message rate within 7 days (≥ -10%).
- Auth provider error rate during signup (≤ +0.5pp).
- Postmark spam complaint rate (≤ 0.1%).

### Past decisions you must not break

- Bootstrap page is mandatory (2025-11). Phase 2 must not introduce a skip path.
- 14-day expiry stays (2025-09). Phase 3 reuses this.
- Email mismatch is allowed but not auto-claimed (2026-02). Out of scope for this initiative.

## Initiative Context

### Brief excerpt

Three hypotheses, sequenced:

1. Inviter-aware email copy lifts `opened → clicked`.
2. Bootstrap teammate signal lifts `accepted → activated`.
3. Expired-invite recovery flow recovers lost cohorts.

### Plan

- **Phase 1**: subject line "{inviter_first_name} invited you to {workspace_name} on Tessera"; optional editable personal note in the invite-send admin UI; default suggestion shown but not auto-sent. 50/50 split at send. Flag: `invite_copy_v2`.
- **Phase 2**: workspace bootstrap shows three most recent non-private issues with assignee avatars; permission-filtered at the query level; defined empty state; slow-query (>500ms) graceful skip with `bootstrap.signal_skipped_slow`. 50/50 per accepted member. Flag: `bootstrap_signal_v1`.
- **Phase 3**: expired `/invites/:token` shows inviter + workspace + "request a new invite" button (rate-limited 1/hour/token). Flag: `invite_expired_recovery`.

### Tasks (excerpt)

- P1-T1: `invite.personal_note` column, reversible migration.
- P2-T1: server-side query "three most recent non-private issues", permission-aware.
- P2-T5: page degrades gracefully on >500ms query.
- P3-T2: notifications-service job emails the inviter with reissue link.
- X-T2: document new flags in `projects/web-app.md` flag inventory.

### Decisions binding for engineering

- Personal note is opt-in for the inviter (not auto-sent).
- Phase 2 bootstrap query filters at the query level; integration test must enforce.
- OQ-2: per-invite vs per-workspace personal note storage. Engineer decision needed; growth review proposes per-invite. Resolve before P1-T1.

### Open questions to address in the handoff

- OQ-2 (yours): finalize per-invite vs per-workspace storage.
- OQ-1 (PM): phase 3 ship-before-phase-1 timing — note dependency, do not decide.

## Project Context

`web-app` at `../web-app`. TS / React 19 / Next.js app router. Server runtime Node 22 on Vercel. Prisma + Postgres. Background jobs in `notifications` service via signed HTTP. Postmark templates by name.

### Conventions

- Flags: `flags` service, snake_case, default off.
- Events: `domain.subject_action`. Funnel events also live in `domains/onboarding/metrics.md`.
- Server-only: `app/(server)/`.
- Migrations reversible.

### Test approach

- `vitest` for unit and component.
- `playwright` for integration on ephemeral DB.
- Mandatory permission tests for any workspace-scoped query.

### Active flags

- `invite_copy_v2`, `bootstrap_signal_v1`, `invite_expired_recovery`.

## Relevant Memory

### Anti-patterns to avoid

- **A1 — One-way feature flag**: both flag paths must have CI integration tests; flag removal within 30 days of phase acceptance.
- **A2 — Telemetry without a downstream consumer**: every new event must update `metrics.md` or name a consumer query in the PR.
- **A3 — Per-render permission filtering**: phase 2 must filter at the query, not the renderer. Test must enforce.
- **A4 — Migration-coupled experiments**: P1-T1 migration ships and goes live before the `invite_copy_v2` flag is enabled in production.

## Review Checklist

- [ ] Approach reversible behind a flag, or rollback plan documented.
- [ ] No constraint in `constraints.md` violated.
- [ ] Migration plan exists if data shape changes; migration ships before the flag.
- [ ] No anti-pattern reintroduced.
- [ ] Acceptance criteria verifiable from code, logs, or QA actions.
- [ ] Test plan covers failure modes named in the brief, including the flag-off path.
- [ ] Permission filtering enforced at the query for the phase-2 signal.
- [ ] Estimate lists assumptions.

## Output Contract

Produce, in this order:

1. Implementation approach summary.
2. Affected modules and interfaces (file paths, module names).
3. Data shape changes and migration plan, or "none".
4. Feature flag and rollback plan.
5. Engineering risks (perf, security, migration), with mitigations.
6. Test plan: unit, integration, manual, instrumentation verification.
7. Open questions or decisions needed before coding starts.
8. Estimate, in elapsed days, with assumptions.

Do not propose new hypotheses, change the experiment design, or expand scope.

## Sources

- `context.md`
- `principles.md`
- `glossary.md`
- `constraints.md`
- `roles/engineer.md`
- `memory/anti-patterns.md`
- `domains/onboarding/context.md`
- `domains/onboarding/flows.md`
- `domains/onboarding/metrics.md`
- `domains/onboarding/decisions.md`
- `initiatives/improve-team-invite-conversion/brief.md`
- `initiatives/improve-team-invite-conversion/context-map.md`
- `initiatives/improve-team-invite-conversion/plan.md`
- `initiatives/improve-team-invite-conversion/tasks.md`
- `initiatives/improve-team-invite-conversion/acceptance.md`
- `initiatives/improve-team-invite-conversion/decisions.md`
- `initiatives/improve-team-invite-conversion/reviews/growth.md`
- `projects/web-app.md`
