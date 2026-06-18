# PR38 - Final Human Demo Rehearsal

Date: 2026-06-18
Status: closed by MIMIR after ARIADNE pass
Owner: ARIADNE rehearses, DAEDALUS fixes exact blockers only, MIMIR closes.

## Purpose

Run the final protected-alpha human demo rehearsal now that PR37's visible
polish caveats are closed on deployed staging. This is a run-of-show proof, not
a new architecture lane.

Use:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

## Scope

ARIADNE should run the site like a human demo operator and record whether the
route feels ready to show:

- health/deployment identity for web and API;
- sign-in and short-session persistence after navigation and reload;
- Studio dashboard at mobile and desktop widths, with no horizontal overflow;
- persona chat path, including visible loading/error behavior if provider
  config or streaming is unavailable;
- Continuity as its own visible stop, not only runtime-context counts;
- Archive search/source/import copy, including owner-only/private visibility;
- export package creation/readback, manifest readback, and bundle readback;
- publish/public document/forum discussion chain;
- Station Assistant surface;
- public Developer Space story: what is visible, methodology, field-log/live
  signal story, and visitor/private boundaries.

Record timings or friction only where they affect demo confidence. Classify
anything found as blocker, caveat, or acceptable demo note.

## Non-Scope

- Do not open broad redesign.
- Do not add Cloudflare config.
- Do not add Redis/Valkey memory tiers.
- Do not change provider streaming or embedding behavior.
- Do not add BYOK secret storage, model marketplace UI, or billing expansion.
- Do not ask Marty for new config unless a blocker proves the config is the
  missing piece.

## Cloudflare Trigger

Cloudflare stays deferred unless this rehearsal finds a concrete retrieval,
latency, public-edge delivery, or NESTstyle-memory defect that the current
Railway/Supabase/Gemini shape cannot handle cleanly. If that happens, document
the exact route, action, expected result, actual result, and why Cloudflare is
the likely fix.

## Output

Write the result to:

`docs/roadmap/PR38_FINAL_HUMAN_DEMO_REHEARSAL_ARIADNE.md`

If the rehearsal passes, wake MIMIR with:

- ready-for-human-demo/protected-alpha replay verdict;
- remaining caveats;
- Cloudflare deferred/needed verdict;
- next-phase recommendation.

If a blocker remains, wake DAEDALUS with:

- exact route;
- viewport;
- account role;
- action taken;
- expected result;
- actual result;
- narrowest fix.

## ARIADNE Result

ARIADNE completed the final human demo rehearsal on 2026-06-18. See
`docs/roadmap/PR38_FINAL_HUMAN_DEMO_REHEARSAL_ARIADNE.md`.

Verdict: ready for human demo as protected-alpha replay.

- Web/API health and deployment identity passed.
- Sign-in persistence, Studio dashboard desktop/mobile, persona chat/status
  stream, chat archive, Continuity, private archive search/source copy, export
  manifest/bundle readback, publish/public document/forum chain, Station
  Assistant, and public Developer Space story passed.
- Public proof document:
  `https://stationweb-production.up.railway.app/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- Public proof discussion:
  `https://stationweb-production.up.railway.app/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`
- Caveats: chat/provider latency can vary; seeded Developer Space has no linked
  public methodology/finding/field-log documents yet; this is protected-alpha
  replay readiness, not full production polish.
- Cloudflare remains deferred.

## MIMIR Closeout

MIMIR closes PR38 on 2026-06-18 as protected-alpha demo ready. The next useful
step is a compact demo runbook and post-demo handoff so the proof is easy to
use and the follow-on lanes do not drift.
