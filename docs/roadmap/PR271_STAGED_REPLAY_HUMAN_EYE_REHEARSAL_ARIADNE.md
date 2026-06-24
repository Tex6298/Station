# PR271 - Staged Replay Human-Eye Rehearsal

Owner: A4 / ARIADNE
Status: open
Opened by: A1 / MIMIR
Date: 2026-06-24

## Why

PR270 proved the hosted replay owner path is technically routeable and
data-backed. ARGUS accepted the measurement packet and recommended ARIADNE
human-eye rehearsal as the next move.

This is not a raw route probe and not a backend implementation lane. The next
question is whether the staged replay feels coherent to a real user: memory,
continuity, archive, observability, public surfaces, Developer Space, and
billing should read as Station rather than as a pile of technically green
pages.

## Read First

- `docs/roadmap/PR270_STAGED_REPLAY_OWNER_MEASUREMENT_RESULT.md`
- `docs/roadmap/STAGED_REPLAY_MEASUREMENT_BASELINE.md`
- `docs/roadmap/STATION_REPLAY_STAGING_READINESS.md`
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/ops/triad/ARIADNE_UX_NAVIGATOR.md`

## Hosted Targets

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

Use the local replay-owner env if sign-in is needed. Do not print, commit, or
record credentials, bearer tokens, cookies, private text, prompts, completions,
provider payload bodies, trace bodies, hosted logs, raw ids, customer ids,
subscription ids, import ids, export ids, persona ids, or Developer Space ids.

## Scope

Run this as a human-eye rehearsal, not a synthetic API audit.

Check the staged app as a user would:

- sign in as the replay owner if needed and verify the session feels stable;
- move through Studio to the replay persona;
- inspect Memory, Continuity/runtime context, Archive/import trust, Export
  status/readback, and Billing readback;
- inspect public Discover, Forums, public Space/document/discussion route where
  routeable from the UI, and public Developer Space;
- inspect Developer Space owner/public contrast without exposing private setup
  data;
- check desktop and mobile-sized behavior where practical;
- note whether the product explains provenance, privacy, continuity, authorship,
  and public/private boundaries in language a user can trust.

Explicitly look for:

- pages that are technically routeable but feel empty, misleading, generic, or
  disconnected from Station's promise;
- action buttons that look live but do not respond or do not explain why they
  are unavailable;
- auth/session persistence friction;
- public/private boundary confusion;
- Memory/Archive/Continuity claims that feel magical, overconfident, or
  disconnected from visible source/trust evidence;
- Developer Space methodology/field-log/storytelling gaps;
- mobile overflow, unreadable controls, or text clipped inside buttons/cards.

## Non-Scope

Do not:

- start a Stripe Checkout or use the test card unless MIMIR opens a Stripe
  browser lane;
- mutate staged data unless the action is clearly part of a safe replay path and
  you record only sanitized results;
- broaden backend/provider/Cloudflare/Redis/queue/billing scope;
- redesign whole surfaces during the rehearsal;
- assign broad manual checking back to Marty.

## Output

Create a concise result doc, suggested path:

```text
docs/roadmap/PR271_STAGED_REPLAY_HUMAN_EYE_REHEARSAL_RESULT.md
```

Use a verdict:

- `PASS`: staged replay is coherent enough for the next MIMIR product/backend
  decision.
- `PASS WITH CAVEATS`: routeable and usable, but name bounded follow-ups.
- `FAIL`: name exact visible defects and who should fix them.
- `BLOCKED`: name the smallest unblocker without exposing secrets.

For each defect, classify the next owner:

- DAEDALUS: code/UI wiring/layout/copy defect.
- ARGUS: privacy/visibility/authorization/overclaim risk.
- MIMIR: product sequencing or scope decision.

## Validation

If this is review-only, record:

- hosted routes/screens visited;
- desktop/mobile dimensions or browser conditions used;
- no product code changed;
- `git diff --check`;
- `git diff --cached --check`.

If ARIADNE makes a small UI/copy patch, run the focused local checks that match
the touched files before waking ARGUS.

## Wake MIMIR

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR271 Staged Replay Human-Eye Rehearsal.
- Verdict: PASS / PASS WITH CAVEATS / FAIL / BLOCKED.
- Result doc: docs/roadmap/PR271_STAGED_REPLAY_HUMAN_EYE_REHEARSAL_RESULT.md.
Findings:
- ...
Recommendation:
- ...
```

If ARIADNE makes UI/copy changes, wake ARGUS first for review, then ARGUS wakes
MIMIR.
