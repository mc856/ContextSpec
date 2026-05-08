# Domain: Onboarding

## Scope

Onboarding covers the surfaces between "person learns Tessera exists" and "person performs their first collaborative action in a workspace". Concretely:

- The `/signup` page (organic and invite-driven entry points).
- The invite-accept route at `/invites/:token`.
- Workspace bootstrap: workspace selection, preferences, and the first-action prompt shown post-signup.
- Transactional emails sent during the first 7 days of a member's lifecycle.

Out of scope for this domain:

- Logged-out marketing pages.
- Authentication providers and the `/login` page (covered by the `auth` domain).
- Billing and trial conversion (covered by the `billing` domain).

## Why this domain matters

Tessera's value is collaborative, so the workspace is essentially worthless until at least three people are activated. Onboarding is the only surface that controls how many invitees become activated members. Most of the 2026 H1 funnel work lives here.

## Key surfaces

| Surface | Path | Owner |
|---|---|---|
| Public signup | `/signup` | web-app |
| Invite-accept | `/invites/:token` | web-app |
| Workspace bootstrap | `/w/:workspace_id/welcome` | web-app |
| Invite send (admin) | `/w/:workspace_id/settings/members` | web-app |
| Transactional email templates | `postmark://onboarding-*` | web-app + Postmark |

## Cross-references

- Flows: `flows.md`
- Funnel definitions: `metrics.md`
- Past decisions: `decisions.md`
