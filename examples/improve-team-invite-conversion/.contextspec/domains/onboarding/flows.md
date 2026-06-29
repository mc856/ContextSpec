# Onboarding Flows

## Invite send

1. Workspace admin opens `/w/:workspace_id/settings/members`.
2. Admin enters one or more emails or pastes a list.
3. Backend creates an `invite` row per email with status `pending`, signs a token, and queues a Postmark send.
4. Postmark delivers the email; the `invited` event fires when the API call returns 2xx.

## Invite accept

1. Invitee clicks the email link, lands at `/invites/:token`.
2. Token is validated server-side. If valid and unexpired, the page shows the inviter's name, the workspace name, and the inviter's avatar.
3. If the invitee is logged in with a matching email, they accept directly.
4. Otherwise they go through `/signup` with the invite token preserved in the URL and in a short-lived cookie.
5. After signup completes, the invite is marked `accepted` and the user becomes a `member`.

## Workspace bootstrap

1. Immediately post-accept, the user lands at `/w/:workspace_id/welcome`.
2. The page shows: workspace name, a short list of teammates already in the workspace, and a "first action" prompt that suggests creating an issue, commenting on an existing one, or assigning someone.
3. The first-action prompt is contextual — if the workspace has no issues, it suggests creating one; otherwise it suggests commenting.
4. The user is considered an `activated member` once they perform any of: create an issue, comment, assign.

## Known fall-out points

- Invite link expired (default 14 days). Currently shows a generic "this invite has expired" page with no path to request a new one.
- Email mismatch: invitee's signup email differs from the invited email. Currently allowed but the invite is not auto-claimed; user lands in their own empty workspace.
- Invite to an email that already has a Tessera account in another workspace. Current behavior: lands at `/invites/:token` while logged in, accepts directly, joins the new workspace. This works but is undertested.
