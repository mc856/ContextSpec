# Product Principles

These are durable principles. Treat them as constraints on any change, not as preferences.

1. **Workspace value before user value.** A new user's first session must show them a workspace already populated by their teammates. We do not ship onboarding flows that put the user in an empty workspace.

2. **Don't add onboarding friction without an instrumentation plan.** Any new step in signup or invite-accept must ship with an event in the funnel definition (see `domains/onboarding/metrics.md`).

3. **Email is opt-in by default.** We may send transactional invite and activation emails, but anything marketing-shaped (digests, re-engagement, cross-sell) must be opt-in.

4. **Inviter context beats generic copy.** When we have the inviter's name, role, or workspace name, the invitee should see it. Generic "You've been invited" copy is a regression.

5. **One workspace per signup intent.** A user landing from an invite link should never be asked to create a new workspace as part of accepting that invite. If they fall out of the invite flow, that is a bug, not a funnel branch.

6. **Reversible before clever.** Prefer changes we can roll back behind a flag in under an hour. If a growth experiment requires schema migration or vendor changes to roll back, it is not a 2026 H1 experiment.
