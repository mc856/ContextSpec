# Constraints

Hard constraints for 2026 H1. Violating these is grounds for blocking a change in review.

## Business

- Free tier remains 10 active members per workspace. Do not gate invite conversion improvements behind paid tiers.
- No price changes in H1. Any experiment that exposes pricing copy must use the current public price list.
- SOC 2 Type II audit is in progress. Any change touching authentication, session handling, or audit logs requires a security review before merge.

## Technical

- Single transactional email vendor (Postmark) for H1. No multi-vendor abstraction work this half.
- Invite links are signed with the existing key. Do not rotate the signing key as part of any growth experiment.
- The web app is the only client surface for invite-accept in H1. Mobile deep links are out of scope.
- Feature flags ship through the existing `flags` service. New flags must default to off in production.

## Product

- We do not auto-add invitees to a workspace before they have completed signup. The accept-then-signup ordering is a hard rule.
- We do not send re-engagement emails to invitees who have explicitly declined. Decline is a terminal state.
- Workspace admins can disable team links for their workspace. Any feature that assumes team links are on must degrade gracefully when they are off.

## Out of scope (2026 H1)

- SCIM / SAML provisioning changes.
- Mobile native invite-accept.
- Any changes to billing flows triggered from within onboarding.
