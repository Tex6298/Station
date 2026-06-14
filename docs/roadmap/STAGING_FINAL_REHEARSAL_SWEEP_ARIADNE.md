# Staging Final Rehearsal Sweep - ARIADNE

Date: 2026-06-14
Reviewer: ARIADNE / A4 UX Navigator
Status: pass for human rehearsal.

## Scope

This sweep used `docs/roadmap/STAGING_FINAL_REHEARSAL_SWEEP_MIMIR.md` and
`docs/roadmap/STAGING_DEMO_NARRATIVE_ARIADNE.md` as the run-of-show.

Hosted staging targets:

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

Replay owner credentials were read from the ignored local `.env`. Tokens,
cookies, owner/persona/document/thread/export IDs, raw response bodies, private
excerpts, prompts, completions, corpus text, Stripe paths, webhook bodies,
customer/subscription IDs, Developer Space keys, and screenshots were not
captured or committed.

## Sanitized Coverage

Public entry passed:

- API `/health`: 200, `ok:true`.
- API `/health/deployment`: 200, `ready:true`.
- Web `/`, `/discover`, `/space/station-replay-alpha`,
  `/developer-spaces/station-replay-dev-alpha`, and `/forums`: 200 shells.

Public Space, document, and community passed:

- API `/spaces/station-replay-alpha`: 200, public access, 1 public document.
- Public document read: 200, published, public, comments enabled.
- Document discussion: 200, eligible, discussion present.
- Forum thread: 200, active, public, comments present.
- Web public document and linked forum discussion routes: 200 shells.

Developer Space public observatory passed:

- API `/developer-spaces/station-replay-dev-alpha`: 200, public access,
  1 node, 1 event, latest snapshot present.
- SSE `once=1` returned a readable Developer Space update.
- Owner usage returned no warning and counted 1 node, 1 event, 1 snapshot.

Authenticated Studio and continuity surfaces passed:

- Replay owner sign-in: 200, token captured in memory only.
- `/auth/me`: 200, replay owner authenticated.
- `/personas`: 200, 1 persona.
- Web `/studio`, persona workspace, Memory, Continuity, Archive,
  `/studio/export`, Developer Space manage, Billing, and Settings: 200 shells.
- Memory list: 4 memories, lifecycle states `active` and `rejected`.
- Memory briefing: 3 active memories, lifecycle keys `active` and `rejected`.
- Memory graph: 4 nodes, 0 edges.
- Continuity records: 1 memory record.
- Runtime context preview: counts `canon:0`, `memory:1`, `integrity:1`,
  `archive:2`.
- Archive retrieval: vector mode, 2 returned, 2 searched, 0 skipped.
- Persona export readback: completed owner-only `persona_archive` package and
  3-file bundle.

Billing and observability passed within staging-demo bounds:

- Billing: tier `private`, subscription `active`, customer present.
- Replay readiness: 8 top-level metadata keys.
- Observability summary: 4 traces, 0 failed, token/cost totals present.
- Trace list: 4 completed traces, 3 token-bearing traces.

Browser and mobile fit passed:

- Chrome/CDP desktop pass covered the public route chain, Studio, persona
  workspace, Memory, Continuity, Archive, Export, Developer Space manage,
  Billing, and Settings.
- Chrome/CDP mobile pass covered Studio, Memory, Archive, and Continuity at
  390 x 844.
- Checked routes stayed on expected paths, had no document-level horizontal
  overflow, and showed no visible application-error/auth-error pattern.

## Findings

Pass for human rehearsal:

- The accepted staging route is ready for a human rehearsal using
  `docs/roadmap/STAGING_DEMO_NARRATIVE_ARIADNE.md`.
- The public/private/community/owner boundaries are demonstrable without
  exposing private content.
- Archive can be narrated as trust infrastructure through runtime context,
  retrieval, continuity, and owner-only export readback.
- Billing can be shown only as bounded Stripe test-mode proof for the replay
  owner, not as live-money production readiness.

Future polish:

- The seeded Archive import/library surface still has 0 pasted/file import
  sources. This is not a blocker, but the narrator should explicitly explain
  that archived chats and runtime archive context are counted separately.
- Developer Space public methodology/field-log storytelling remains thin because
  the public observatory has live state but no linked public documents in this
  seed.

DAEDALUS blockers:

- None found.

ARGUS security/visibility concerns:

- None found. The sweep found no visible private-data leak, auth boundary
  break, entitlement leak, or visibility regression.

## Verdict

Open `STAGING-DEMO-HUMAN-01`.

Run the narrative once with Marty as a real human rehearsal. Capture only
user-facing friction, narrative gaps, missed transitions, and concrete blockers.
Keep Redis, Cloudflare, background jobs, full workspace/PDF/binary export,
broad billing expansion, and generic Discern parity out of scope unless the
human rehearsal produces new evidence.
