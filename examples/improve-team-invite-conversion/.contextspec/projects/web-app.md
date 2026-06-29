# Project: web-app

The customer-facing web application. All onboarding surfaces ship through this repo.

## Repo

`../web-app` (sibling of the project root containing `.contextspec/`, per spec §3.1).

## Stack

- TypeScript, React 19, Next.js (app router).
- Server runtime: Node 22 on Vercel.
- Database access via Prisma against Postgres.
- Background jobs via `notifications` service (separate repo, calls in via signed HTTP).
- Email through Postmark templates referenced by name.

## Conventions

- Feature flags via the `flags` service. New flags default to `off` in production. Flag names are `snake_case`.
- Telemetry events use `domain.subject_action` naming (e.g. `invite.personal_note_used`). Events that are part of the funnel must also be added to `domains/onboarding/metrics.md`.
- Server-only code lives under `app/(server)/`; do not import from there into client components.
- DB migrations are reversible. PRs that include a non-reversible migration require an explicit comment from a reviewer.

## Test approach

- Unit tests for utilities (`vitest`).
- Component tests for client components (`vitest` + Testing Library).
- Integration tests for routes that touch the DB (`playwright` against an ephemeral DB).
- Permission tests are mandatory for any query that returns workspace-scoped data.

## Active feature flags relevant to this initiative

- `invite_copy_v2` — phase 1.
- `bootstrap_signal_v1` — phase 2.
- `invite_expired_recovery` — phase 3.

All three should be removed within 30 days of their phase acceptance per the cross-cutting acceptance criteria.

## Out of scope for this project

- Mobile app (separate repo `mobile-app`, not in this `.contextspec/`).
- Admin tooling (separate repo `internal-tools`).
- Marketing site (`marketing`, statically generated).
