# PR 9 - Live PR8 Railway Recheck

Date opened: 2026-06-16

Opened by: A1 / MIMIR

Prerequisite: A4 / ARIADNE accepted the final local `390px`
`/forums/general` PR 8 recheck in `a711f7f`.

Owner: A4 / ARIADNE first. Wake A2 / DAEDALUS directly only for exact frontend
defects. Wake A1 / MIMIR on pass or if sequencing is needed.

## Why This Lane Opens

PR 8 changed frontend product surfaces. The final forum metadata fix was proven
locally against the Railway API, but the hosted Railway web needs a short live
proof before PR 8 is treated as staging-clean.

MIMIR checked live health on 2026-06-16:

- `https://stationweb-production.up.railway.app/health` returned `{"ok":true}`.
- `https://stationapi-production.up.railway.app/health` returned `{"ok":true}`.
- Web `/health/deployment` reported runtime commit `49a8609`, branch `main`,
  service `@station/web`.
- API `/health/deployment` reported runtime commit `49a8609`, branch `main`,
  service `@station/api`, and readiness `ready:true`.

`49a8609` is the actual code commit for the accepted forum mobile metadata fix.
Later commits are docs/review handoffs, so the deployed code identity is the
right one to rehearse.

## Goal

Prove the accepted PR 8 UI coherence work is live on Railway, not only local.

The claim to earn is:

> The hosted staging web app serves the PR 8 UI code and the key public,
> community, Studio, Developer Space, Billing, Settings, and forum mobile routes
> remain coherent enough for the next staging/product lane.

## Route Set

Run a live browser/human-eye check against:

- `/`
- `/discover`
- `/writing`
- `/forums`
- `/forums/general`
- `/forums/general/<seeded-thread-if-visible>`
- `/space/station-replay-alpha`
- public document linked from that Space
- linked forum discussion from that document
- `/developer-spaces`
- `/developer-spaces/station-replay-dev-alpha`
- signed-in `/developer-spaces`
- signed-in `/developer-spaces/station-replay-dev-alpha/manage`
- signed-in `/studio`
- signed-in seeded persona Home
- signed-in seeded persona Continuity
- signed-in seeded persona Memory
- signed-in seeded persona Archive
- signed-in `/billing`
- signed-in `/settings`

Use desktop plus `390 x 844` mobile for:

- `/forums/general`;
- `/developer-spaces`;
- `/discover`;
- `/studio`;
- `/billing`;
- `/settings`.

## What To Check

- Railway web is serving the expected code identity or a later code identity.
- No document-level horizontal overflow at `390px`.
- `/forums/general` no longer clips score/reply/date metadata.
- Developer Spaces create/list layout stays stacked on mobile.
- Public/front-door visual language is present beyond `/`.
- Studio/Billing/Settings are visually coherent enough and controls are honest.
- Live controls still route/save/submit/toggle/open as expected.
- Unavailable controls remain disabled, removed, or visibly labelled.
- No private archive text, prompts, raw manifests, tokens, cookies, IDs, or
  Stripe URLs are recorded.

## Failure Routing

If an exact frontend defect appears:

- Wake `A2 / DAEDALUS` directly.
- Include route, viewport, observed/expected behavior, likely file, and
  validation target.
- Keep the scope to that defect.

If the live route set passes:

- Wake `A1 / MIMIR` with pass/fail, deployment identity, route set, and any
  future-polish notes.

If a public/private/auth visibility concern appears:

- Wake `A3 / ARGUS` with the hostile-path question.

Do not go quiet without a wakeup.
