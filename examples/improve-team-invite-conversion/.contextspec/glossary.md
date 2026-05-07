# Glossary

Use these terms consistently in code, docs, and reviews.

| Term | Definition |
|---|---|
| **Workspace** | A team account. The unit of billing and the container for issues, docs, and members. |
| **Member** | A user who has accepted an invite into a workspace and completed signup. |
| **Invitee** | A user who has been sent an invite but has not yet accepted. State lives on the invite, not the user. |
| **Activated member** | A member who has performed at least one collaborative action (created an issue, commented, or assigned someone) within 7 days of accepting the invite. |
| **Inviter** | The existing member who sent the invite. Always a real user; never a system actor. |
| **Invite link** | A signed URL that encodes workspace_id, invite_id, and expiry. Single-use unless the workspace admin enables team links. |
| **Team link** | A reusable invite link scoped to a workspace, optionally restricted by email domain. Off by default. |
| **Invite conversion** | invitees → activated members within 7 days. Measured per cohort by send date. The numerator is activated members, not just members. |
| **Workspace bootstrap** | The first 60 seconds of an invitee's session post-accept: workspace selection (if any), preferences, and first-action prompt. |
| **Cohort** | A set of invites sent in the same calendar week. Used for funnel analysis. |

A "user" without qualification is always a workspace member. Anonymous visitors are "visitors", never "users".
