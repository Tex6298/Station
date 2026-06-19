# PR67 Memory Observability Staging Replay - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: Pass

## Runtime Checked

- Web staging: `https://stationweb-production.up.railway.app`
- API staging: `https://stationapi-production.up.railway.app`
- Web/API product runtime:
  `b1e9ce3ae5d2f8a6c4f0e5c270dd2cbc216c567f`
- Web service: `@station/web`
- API service: `@station/api`
- Account mode: signed replay owner via local env for owner routes; anonymous
  browser session for public Developer Space comparison
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`

No credentials, tokens, cookies, owner IDs, persona IDs, trace IDs, API keys,
raw prompts, completions, raw payload bodies, private source bodies, or replay
corpus text are included in this result.

## Preflight

Public health/deployment checks passed:

- Web `/health`: `ok:true`
- API `/health`: `ok:true`
- Web `/health/deployment`: `ready:true`
- API `/health/deployment`: `ready:true`
- Web/API deployment identity matched accepted product runtime `b1e9ce3`

Signed session checks passed:

- `POST /auth/signin`: success
- `GET /auth/me`: `200`
- Web `/studio`: restored the signed owner session without exposing tokens,
  cookies, auth headers, or IDs in this document.

## Sanitized Data Snapshot

The replay owner had enough current staging data for a read-only proof pass:

- Persona: `Station Replay Persona`, private
- Memory items: `14`
- Shared memory blocks: `0`
- Lifecycle events: `13`
- Handoffs: `3`
- Integrity sessions: `5`
- Continuity records: `5`
- Import Review candidates: `6`
- AI Activity summary: `5` seven-day traces, `0` failed traces, `10,562`
  total tokens
- Recent AI traces readback: `6`, all completed, source group `conversation`
- Developer Spaces: `2`
- `Station Replay Dev Alpha`: public, owner access on manage route, anonymous
  public access on public route
- Developer Space live state: `1` node, `1` event, current snapshot present,
  `4` linked evidence rows, `3` visitor-visible evidence rows, `1` owner-only
  evidence row
- Developer Space usage: `ok`, `1` metered node, `1` event, `1` snapshot,
  `1` export

## Desktop Route Replay

Desktop passed in the PR67 route order:

- Studio dashboard rendered `Studio Dashboard`, `Continue Where You Left Off`,
  `Integrity Sessions Due`, and `Personas`.
- Persona Memory rendered `Memory Briefing`, lifecycle counters, Saved Memory,
  runtime eligibility/holdout copy, and owner lifecycle actions.
- Persona lifecycle/handoff rendered Persona Management, Memory Graph, Context
  Handoffs, Lifecycle, Persona Archive counts, and Integrity History.
- Continuity rendered Continuity Trust, Runtime Continuity, Continuity Timeline,
  separated Memory/Integrity/Archive buckets, and did not expose compiled system
  prompt text.
- Integrity rendered Integrity Overview, Integrity Session, Session Timeline,
  destination copy, and accept/dismiss review actions.
- Archive rendered Archive Trust, Storage and Quota, Import Review, Memory/Canon
  destination copy, preservation copy, Archive Import, and Archive Import
  Library.
- Settings rendered AI Activity, 7-day traces, Recent traces, token/cost
  metrics, and no raw prompt/completion/provider-payload/trace-id markers in the
  AI Activity panel.
- Developer Space manage rendered Current observatory state separately from
  Metered usage and quota, with live signals present and quota copy framed as
  metering/accounting.

All desktop routes had:

- no document-level horizontal overflow;
- no offscreen controls;
- no visible application/auth error state.

## Mobile Spot Checks

Mobile passed at `390px`:

- Studio dashboard
- Persona Memory
- Continuity
- Archive import review
- Developer Space manage

All mobile spot checks had:

- no document-level horizontal overflow;
- no offscreen controls;
- no visible application/auth error state.

## Public Comparison

Anonymous public Developer Space comparison passed at `390px`:

- `Station Replay Dev Alpha` rendered publicly;
- public signal/evidence copy was present;
- owner manage copy was absent;
- ingestion-key headers/placeholders were absent;
- raw event/snapshot payload markers were absent;
- bearer values, token assignments, and secret-shaped values were absent;
- no document-level horizontal overflow;
- no offscreen controls.

## Privacy

The staging replay kept the memory/observability privacy boundary:

- No secrets, bearer values, token assignments, or secret-shaped values were
  visible in audited public or owner-readback surfaces.
- Settings AI Activity showed source/status/duration/token/cost style readback
  without raw prompts, completions, provider payloads, or trace IDs.
- Developer Space public did not expose owner manage, ingestion-key, or raw
  payload material.
- Developer Space manage used the `$STATION_DEVELOPER_KEY` placeholder in setup
  examples and did not show an actual ingestion key.
- Archive, Continuity, Integrity, and Developer Space readback stayed
  label/count/state based.

Caveat: the owner-private Memory page contains existing owner-visible replay
memory content with UUID-shaped text. ARIADNE did not capture, quote, or commit
that private content. It was not visible in public routes or in the new
observability/readback panels, so this is a replay data hygiene caveat rather
than a PR67 blocker.

## Verdict

Pass. The current Railway staging app supports the focused
memory/observability replay path:

- the owner can understand what Station remembers;
- held-out and active Memory state are legible;
- persona lifecycle/handoff, Continuity, Integrity, and Archive import review
  explain how runtime trust is built;
- AI Activity and Developer Space observability avoid raw private leaks;
- mobile core owner surfaces remain usable at `390px`.

No DAEDALUS fix is needed from this rehearsal.

## Next-Lane Recommendation

MIMIR should close PR67 from ARIADNE rehearsal and use this as current staging
proof for the PR60-PR65 memory/observability lane.

Do not open Redis, Cloudflare, provider migration, parser/OAuth, workers,
hosted runtime, Project, billing, DexOS, or broad UI work from this pass.
Those lanes should remain gated on concrete route-level evidence. If MIMIR
wants one more proof step, make it a narrow public Space/document/forum story
continuity check, not an infrastructure lane.

## Validation

- Public Railway health/deployment checks for web/API
- `POST https://stationapi-production.up.railway.app/auth/signin`
- `GET https://stationapi-production.up.railway.app/auth/me`
- Signed owner API reads:
  - `/personas`
  - `/memory/persona/:personaId`
  - `/memory/persona/:personaId/briefing`
  - `/personas/:personaId/architecture`
  - `/integrity/history/:personaId`
  - `/continuity/persona/:personaId/records`
  - `/conversations/persona/:personaId/candidates?source=import&status=all`
  - `/observability/summary`
  - `/observability/traces?limit=6`
  - `/developer-spaces`
  - `/developer-spaces/:slug`
  - `/developer-spaces/:id/usage`
  - `/exports/developer-spaces/:id`
- Anonymous public Developer Space API/detail comparison
- Signed Chrome/CDP desktop route replay
- Signed Chrome/CDP `390px` mobile spot checks
- Anonymous Chrome/CDP `390px` public Developer Space comparison
- `node --check scripts/tmp-pr67-memory-observability-staging-replay.mjs`
- `node scripts/tmp-pr67-memory-observability-staging-replay.mjs`
- `git diff --check`
- Temporary local replay script was removed before commit.
