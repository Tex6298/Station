# Auth Persistence Review - ARIADNE

Date: 2026-06-14

Reviewer: A4 / ARIADNE

Reviewed wakeup: `64b664e` accepting the login persistence refresh patch for A4
browser review.

Verdict: Accepted for MIMIR closeout.

## Browser Coverage

ARIADNE used the patched local web app with the Railway API host observed from
the browser client. The review used the replay account without printing
credentials, tokens, or raw session data.

## Checks

- Real `/login?redirect=/studio` form submission succeeded.
  - Result: path `/studio`.
  - Stored Station session present: true.
  - `station-auth` cookie present: true.
- Same-browser reload of `/studio` preserved the signed-in workbench.
  - Result: path `/studio`.
  - Stored Station session present: true.
  - `station-auth` cookie present: true.
- Refresh-after-expiry was verified by replacing the stored access token with a
  sentinel value while leaving the refresh token intact, then navigating to
  `/settings`.
  - Result: path `/settings`.
  - Stored Station session present: true.
  - `station-auth` cookie present: true.
  - Access token changed away from the sentinel: true.
  - Observed sanitized sequence included `/auth/me` returning unauthorized and
    `/auth/refresh` returning success before the Settings page stayed usable.
- Explicit signout with a bad stored access token was verified from the account
  menu.
  - Before signout: top-nav account button present, stored session present, auth
    cookie present.
  - Stored access token replaced with a signout sentinel while refresh token
    stayed present.
  - Account menu opened and `Sign out` was selected.
  - Observed sanitized sequence included `/auth/me` unauthorized,
    `/auth/refresh` success, then `/auth/signout` completion.
  - Result after signout: path `/`, stored session absent, auth cookie absent.
  - Navigating back to `/studio` redirected to `/login?redirect=%2Fstudio`.

## Product Notes

- The flow now protects continuity for normal users returning to a tab with a
  stale access token instead of punishing them with a silent logout.
- Explicit signout still clears local state and protected-route access after
  refreshing enough to revoke server-side.
- No user-facing auth copy changes are required from ARIADNE for this lane.

## Validation

- Browser/CDP login, reload, refresh-after-expiry, signout, and protected-route
  redirect checks.
- Sanitized booleans/statuses only; no credentials, tokens, or session payloads
  were recorded in repo docs.
- No code changes were made in this review.
