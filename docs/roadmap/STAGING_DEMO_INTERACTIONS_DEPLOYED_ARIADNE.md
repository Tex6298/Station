# Staging demo interaction deployed verification - ARIADNE

Date: 2026-06-13

Owner: ARIADNE, A4 UX Navigator

## Verdict

ARIADNE accepts the deployed interaction cleanup for the audited staging demo
surfaces.

The Railway API is serving the DAEDALUS patch commit `276daa993321`, deployment
health is `ready:true`, and the live browser/API pass did not reproduce the
previous live-looking no-op controls, own-post vote dead ends, red report
success styling, or `catch is not a function` vote failure.

MIMIR can treat `STAGING-DEMO-INTERACTIONS-PATCH-01` as browser-verified for the
human rehearsal path. No DAEDALUS or ARGUS rework lane is needed from this pass.

## Method

Surfaces checked:

- `https://stationweb-production.up.railway.app/studio/archive`
- `https://stationweb-production.up.railway.app/forums/general`
- `https://stationweb-production.up.railway.app/forums/general/<threadId>`
- staging API category/thread/comment/vote/report routes

Browser:

- Local Chrome headless through Chrome DevTools Protocol.
- Mobile viewport: 390px wide.
- Separate browser profiles for replay-owner and throwaway non-owner probes so
  session restore could not race across users.

Sanitization:

- Replay credentials, probe credentials, tokens, cookies, raw thread IDs, raw
  owner IDs, raw comment IDs, and raw response bodies were kept out of committed
  docs.
- No screenshots were saved.
- Throwaway non-owner vote probes and sanitized report probes were created in
  staging to exercise the live paths.

## Results

### Deployment

- API `/health/deployment` returned `ready:true`.
- Served Railway commit prefix was `276daa993321`, matching the DAEDALUS
  interaction cleanup patch.
- Replay owner sign-in succeeded as a `canon` account.

### Global Archive

Route: `/studio/archive`

- Preview copy is visible and points users to persona Archive and Export Trust
  for live import/export.
- `Upload preview` was present once and disabled.
- `Attach preview`, `Pin preview`, `Draft preview`, and `Export preview` were
  present on the four sample cards and all were disabled.
- Preview controls use the `Preview only` title.
- Mobile width was clean at 390px.
- No `catch is not a function` text appeared.

Verdict: pass. The static Global Archive controls no longer look live.

### Forum Category

Route: `/forums/general`

- The seeded replay-owned thread was found.
- `Own post` was visible for the replay owner.
- Thread-list `Up`/`Down` controls were not visible for the replay-owned thread.
- Mobile width was clean at 390px.
- No `catch is not a function` text appeared.

Verdict: pass. The category list no longer invites an own-post vote dead end.

### Forum Thread Detail

Route: `/forums/general/<threadId>`

Replay-owner view:

- `Own post` was visible on the thread action row.
- Thread-level `Up`/`Down` controls were not visible for the replay owner.
- `Report` was present.
- Clicking `Report` showed `Report sent for moderation review.` with success
  styling.
- No `You cannot vote on your own post.` text appeared.
- No `catch is not a function` text appeared.

Throwaway non-owner view:

- The probe user was confirmed not to be the thread owner.
- The thread readback was confirmed not to be authored by the probe user.
- Browser view showed thread `Up`/`Down` controls.
- Browser view did not show `Own post`.
- Mobile width was clean at 390px.
- No self-vote or RPC catch error text appeared.

Verdict: pass. Owner and non-owner views now show the right affordances.

### Non-Owner Vote RPC Path

API checks:

- Non-owner thread vote returned 201.
- Non-owner comment vote returned 201.
- Thread readback showed the probe viewer vote state.
- Neither vote response contained `catch is not a function`.

Verdict: pass. The deployed RPC thenable hardening is proven on staging for
valid non-owner thread and comment votes.

## Human Rehearsal Guidance

- `/studio/archive` can be shown as a preview surface because the action buttons
  are disabled and labelled as preview actions.
- Persona Archive and Export Trust remain the live archive/export proof path.
- `/forums/general` and the seeded thread can be shown without avoiding
  owner-vote controls; the owner sees own-post labels instead.
- Report success and non-owner voting are live enough for the interaction
  rehearsal.
- No security, visibility, moderation, quota, archive, billing, or seeded-data
  blocker was found in this pass.

## Validation

- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 20 https://stationweb-production.up.railway.app/health`
- Live owner sign-in through staging API.
- Live owner mobile browser pass at 390px.
- Live throwaway non-owner mobile browser pass at 390px.
- Live non-owner thread vote API probe.
- Live non-owner comment vote API probe.
- Live thread report browser probe.
