# Settings Placeholder Recheck - ARIADNE

Date: 2026-06-14

Reviewer: A4 / ARIADNE

Reviewed wakeup: `3c3c42b` closing the `/settings` placeholder defect and
asking for one narrow live recheck.

Verdict: the placeholder-control behavior is fixed, but the mobile settings
layout has a concrete overlap defect. Wake DAEDALUS for a narrow responsive
layout repair.

## Target

- Live web: `https://stationweb-production.up.railway.app/settings`
- Deployment identity: `/health/deployment` reported `railwayGitCommitSha`
  `d34f92e938b07b86a711668b1f09a7365868b60b`.
- Browser pass: disposable Chrome/CDP profile with sanitized signed-in replay
  session state. No credentials, tokens, Stripe URLs, or private payloads were
  recorded in repo docs.

## Desktop Result

Accepted at `1366 x 900`:

- `Profile`, `Privacy`, and `Notifications` cards are no longer anchors.
- Those cards render `Coming soon`, have disabled wrapper state, and clicking
  them leaves the URL unchanged.
- The old `Edit profile` label is gone; the replacement button reads
  `Profile editor coming soon` and is disabled.
- Notification preferences show copy that settings are not persisted yet.
- All notification checkboxes are disabled; clicking them did not toggle state.
- `Delete account unavailable` is disabled.
- No document-level overflow was detected.

## Mobile Result

Failed at `390 x 844`:

- The same disabled/unavailable control behavior is present.
- The page has no measured document-level horizontal overflow.
- The visual layout still breaks: the right-side settings panels overlap the
  settings-card grid instead of stacking below it. `Usage and Credits`,
  `Storage`, `AI Activity`, `Profile Snapshot`, and `Notification Preferences`
  visually cover the left-column cards, including the disabled Profile and
  Privacy cards.

This is user-visible overlap, not a cosmetic preference. It makes the fixed
coming-soon states difficult to read and makes `/settings` feel broken on a
normal phone width.

Implementation clue: `apps/web/app/settings/page.tsx` still uses a hard-coded
main content grid of `minmax(0, 1fr) 330px`. The page needs a small responsive
stack/wrap rule for narrow screens while preserving the newly disabled
placeholder controls.

## Expected Patch

- Keep the desktop behavior and copy from `d34f92e`.
- At mobile widths, stack the settings-card section and sidebar panels in one
  readable column, or otherwise prevent visual overlap.
- Preserve the unavailable/coming-soon states for Profile, Privacy,
  Notifications, profile editor, notification preferences, and account
  deletion.
- Do not change auth, billing, Stripe, privacy/visibility, storage/quota,
  archive/export, providers, migrations, package config, or persistence
  semantics.

## Validation

- Live `/health/deployment` check against Railway web.
- Hosted Chrome/CDP desktop pass at `1366 x 900`.
- Hosted Chrome/CDP mobile pass at `390 x 844`.
- Local temp screenshots captured for visual inspection:
  `C:\Users\marty\AppData\Local\Temp\station-a4-settings-3CbD6r`.
