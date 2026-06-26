# PR350 - UX-08 Onboarding Public Step Hosted Rehearsal

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR349 first Space/public publishing onboarding entrypoint.
- /studio/onboarding now has a signed-in Public step panel after the four accepted onboarding cards.
- MIMIR needs hosted desktop/mobile proof after Railway deploy.
Task:
- Sign in with local .env replay-owner credentials without printing them.
- Rehearse hosted /studio/onboarding on desktop and mobile.
- Prove the Public step panel is visible, readable, linked to existing routes only, and does not imply automatic publishing or Assistant execution.
- Wake MIMIR with PASS, PASS WITH CAVEAT, FAIL, or BLOCKED.
```

## Target

Hosted web:

```text
https://stationweb-production.up.railway.app
```

Use local ignored `.env` keys only:

```text
STATION_REPLAY_OWNER_EMAIL
STATION_REPLAY_OWNER_PASSWORD
```

Do not print, log, screenshot, commit, or summarize the credential values.

Routes:

```text
/login?redirect=/studio/onboarding
/studio/onboarding
/space
/space/new
/studio/publish
/studio/assistant?prompt=...
```

## Required Checks

Authentication:

- Sign in as the replay owner using the local ignored `.env` credential keys.
- Do not record cookies, auth tokens, bearer values, raw owner IDs, or
  credential values.

Onboarding desktop:

- Confirm `/studio/onboarding` loads authenticated content.
- Confirm the four accepted onboarding path cards still appear.
- Confirm the new signed-in `Public step` panel appears after the four cards.
- Confirm it points only to existing route targets: `/space`, `/space/new`, and
  `/studio/publish`.
- Confirm the Assistant handoff remains prompt-prefill-only and does not
  auto-send.
- Confirm copy does not claim automatic publishing, Space creation, visibility
  mutation, approval submission, backend route execution, or tool autonomy.

Onboarding mobile:

- Repeat `/studio/onboarding` at a narrow mobile viewport around `375px`.
- Confirm the public-step panel is readable with no horizontal overflow,
  clipped cards, overlapping text, or trapped controls.

Route safety:

- It is safe to navigate to `/space`, `/space/new`, and `/studio/publish` to
  confirm they are routeable, but do not submit forms or create/publish content.
- It is safe to open the Assistant handoff and verify prefilled text, but do not
  send the message.

Signed-out boundary:

- In a fresh signed-out context or after clearing session for a separate check,
  confirm `/studio/onboarding` does not expose the signed-in public-step panel
  before auth. Do not lose the signed-in proof if the browser context makes this
  awkward; use a separate context if needed.

## Non-Scope

Do not change or test mutations for:

- Space creation;
- publishing;
- visibility;
- Assistant message sending;
- archive/import;
- API Bridge credentials;
- billing or Stripe;
- provider/model calls;
- schema, migrations, Redis, Cloudflare, queues, or workers.

## Result Doc

Create:

```text
docs/roadmap/PR350_UX08_ONBOARDING_PUBLIC_STEP_HOSTED_REHEARSAL_RESULT.md
```

Use one verdict:

```text
PASS
PASS WITH CAVEAT
FAIL
BLOCKED
```

Include:

- hosted freshness evidence;
- authenticated desktop result;
- authenticated mobile result;
- route safety result;
- signed-out boundary result;
- caveats or defects;
- whether MIMIR can close this deployed UX-08 first Space/publishing clarity
  proof or should wake DAEDALUS with a repair packet.
