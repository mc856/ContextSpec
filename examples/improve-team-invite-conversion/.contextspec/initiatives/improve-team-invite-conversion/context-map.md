# Context Map

Narrative complement to `registry.yaml > initiatives.improve-team-invite-conversion`. The registry is the machine-readable mapping; this file explains *why* those choices were made and what was deliberately excluded.

## Roles attached and why

- **PM**: scope, framing, and acceptance live here. The brief involves three independent hypotheses and we need someone gating against scope creep.
- **Growth**: every hypothesis is a funnel-step claim with a measurable metric. Growth review is a hard prerequisite before any A/B variant ships.
- **Engineer**: the changes touch the email send path, the invite-accept route, and the workspace bootstrap page — three different surfaces that need a coherent rollback story.

## Roles deliberately not attached

- **QA**: not mounted in this example registry. In a real project we would attach QA before the engineer-handoff pack is generated, because the bootstrap change has a non-trivial first-action prompt that has multiple states.
- **Monetization**: skipped. None of the hypotheses touch pricing, packaging, or the free-tier limit.

## Domains attached and why

- **onboarding**: every surface in scope (`/invites/:token`, `/w/:workspace_id/welcome`, transactional emails) lives in this domain.

## Domains considered and excluded

- **auth**: signup is part of the invite-accept flow, but auth-provider details are out of scope per `brief.md > Non-goals`.
- **billing**: free-tier limit interacts with invite count but is constrained out per `constraints.md`.

## Projects attached

- **web-app**: all three hypotheses ship through the web app. No backend-only project is needed for v1, though the email template change passes through the `notifications` service.

## Memory items most relevant

- `memory/experiment-results.md` — past invite-related experiments, especially the 2025-11 bootstrap-skip loss.
- `memory/anti-patterns.md` — flag-based experiments that could not be turned off cleanly.

## External sources referenced

- `source://personal_knowledge_base/Customers/2025-Q3-onboarding-review.md` — interviews behind the 2025-09 expiry decision.
- `source://personal_knowledge_base/Decisions/2026-01-invite-copy-rollback.md` — codifies "inviter context beats generic copy".
- `source://personal_knowledge_base/Product/team-links-adoption.md` — relevant if hypothesis 3 expands.

These are linked, not inlined. Per §5.5 of the spec, the pack compiler must verify each link against `registry.sources.personal_knowledge_base.{include,exclude}` before listing it in `## Sources`.
