# Station Launch-Core Protected-Alpha Closeout

Date: 2026-06-18
Status: launch-core sufficient for protected-alpha replay, with caveats

## Verdict

The current Railway/Supabase staging line is launch-core sufficient for
protected-alpha replay.

That means a prepared test owner can traverse the core Station loop without
developer intervention:

1. enter Studio through an accepted onboarding/persona path;
2. create or use a persona;
3. chat with runtime context from Canon, Memory, recent turns, Integrity output,
   and archive material;
4. archive a chat;
5. review and accept/edit/reject Memory and Canon candidates;
6. search private archive;
7. inspect owner-only export bundles;
8. publish a private draft as a labelled public document;
9. read that document on a public Space;
10. open the linked forum discussion;
11. use Station Assistant as an operational map over the above.

This is not a production readiness claim and not a complete Station MVP claim.

## Current Evidence Refresh

Last refreshed: 2026-06-21 by PR161.

- Public Railway web health:
  `https://stationweb-production.up.railway.app/health` returned HTTP 200 with
  `ok:true`.
- Public Railway web deployment:
  `https://stationweb-production.up.railway.app/health/deployment` returned
  HTTP 200 with `ok:true`, `ready:true`, service `@station/web`, branch `main`,
  and commit `508b4acc2dbe`.
- Public Railway API health:
  `https://stationapi-production.up.railway.app/health` returned HTTP 200 with
  `ok:true`.
- Public Railway API deployment:
  `https://stationapi-production.up.railway.app/health/deployment` returned
  HTTP 200 with `ok:true`, `ready:true`, service `@station/api`, branch `main`,
  commit `508b4acc2dbe`, and Railway HTTPS app/API URLs.
- API readiness reports Supabase database, migration proof, private
  `persona-files` storage, Supabase Auth redirects, Gemini
  `station_free_1536` embeddings, NVIDIA platform chat configuration, Stripe
  test config, and Upstash REST operational cache configured at their accepted
  proof levels.
- PR156 closes the immediate Archive-retrieval latency loop for now:
  context-preview outer median improved from 4571ms to 1864ms, trace `total`
  median from 3549ms to 892ms, and `archive_retrieval` median from 3207ms to
  531ms; 0 of 7 counted requests exceeded 3000ms.
- PR160 confirms the hosted runtime serves the PR159 public-read and
  UUID-redaction patch at deployment commit `6a8bb3eea401`: the focused public
  document chain no longer showed a browser-visible owner-aware document API
  401, Runtime Context/readback, Saved Memory, Global Archive, and 390px mobile
  Memory showed zero UUID-shaped visible values, and 390px mobile Memory had no
  document-level horizontal overflow.
- Later docs-test commits may skip Railway deployment when no watched runtime
  files change. That is not stale runtime by itself; for demo planning, the
  runtime is current enough when it serves the PR159 runtime patch commit or a
  later accepted app-code runtime.
- Current replay evidence remains protected-alpha evidence. It supports a
  staged proof/demo loop, not production readiness or product completeness.

## Evidence Map

| Loop | Evidence |
| --- | --- |
| Persona entry/create | PR25 accepted four alpha onboarding paths with real route targets: Fresh Start, Awakening, Document Migrator, and API Bridge. |
| Chat/runtime context | Launch-core chat-history fix, production debug gating, persona-context tests, and accepted runtime context coverage. |
| Archive chat | Conversation archive route, archived transcripts, archive chunks, read-only archived chats, and continuity candidates. |
| Review candidates | PR17 import-backed candidates and PR21 Import Review Inbox closeout. |
| Private archive search | PR12 owner-scoped `/imports/archive/search` and deployed `/studio/archive` rehearsal. |
| Export data | Owner-only JSON/Markdown manifest and portable bundle readback for persona and Developer Space exports. |
| Publishing/public document | PR10 Studio publish API wiring, PR11 approval queue, and PR23 Creator-capable staging proof. |
| Public Space/document/discussion | PR23 public Space, document, linked discussion, and forum route proof. |
| Station Assistant | PR22 sanitized operational action cards and desktop/mobile browser closeout. |
| Manual social archive intake | PR19 Reddit and PR20 Discord uploaded/pasted intake with fail-closed parser behavior. |

## Replay Script

Use public-safe synthetic content only.

1. Open the Railway web URL and confirm `/health/deployment` is ready for web
   and API.
2. Sign in as the prepared replay owner.
3. Open Studio and select the replay persona.
4. Send a persona chat message that should use seeded memory/archive anchors.
5. Archive the chat and confirm candidates remain owner-reviewable.
6. Open the persona Archive page and review import-backed Memory/Canon
   candidates if fresh seed data exists.
7. Open Global Archive and search for a replay-safe archive term.
8. Open export status and inspect a completed JSON/Markdown bundle readback.
9. Open Station Assistant and ask what to finish next; check action cards point
   to real Studio routes.
10. Using a Creator-capable staging owner, create or use a public-safe draft,
    send it through approval, publish it, and open the public Space/document.
11. Open the linked forum discussion and confirm the route follows document
    visibility.

## Required Caveats

- Protected-alpha replay, not production readiness.
- Railway/Supabase staging truth, not every future deployment target.
- PR23 Creator proof used a staging profile tier seed, not Stripe-paid
  activation. Stripe test-mode activation is covered separately.
- The four documented onboarding paths are alpha-routeable after PR25, not full
  mature wizards/import/API Bridge products.
- Candidate extraction and memory scoring remain heuristic alpha behavior.
- Background jobs are a protected-alpha boundary, not a deployed durable worker
  system.
- Reddit and Discord are uploaded/pasted manual intake, not live OAuth/API pulls
  or recurring jobs.
- Export is JSON/Markdown bundle readback, not full workspace/PDF/binary export.
- Community proof covers document discussion visibility, not full Community
  Beta.
- Station Assistant is an operational map, not an autonomous executor or
  persistent persona.
- Redis memory truth, Cloudflare retrieval, production vector hardening,
  provider marketplace, social dispatch, scheduled publishing, and broad UI
  reskin remain future lanes.
- Stripe readiness is config/test-resource readiness only until a real hosted
  test-mode Checkout or signed Stripe webhook mutation proves paid subscription
  activation for the replay owner.
- Redis/Upstash is operational cache, idempotency, rate-limit, and cache-only
  queue-state support. It is not canonical Memory truth.
- Cloudflare remains future adapter/index-mirror scope unless a concrete
  Cloudflare replay objective is opened.

## Recommended Next Moves

1. Use the refreshed PR161 operator pack in
   `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md` if an external
   demo is next.
2. PR25 accepted the alpha route map for the four onboarding paths; future work
   should deepen those paths only from replay evidence.
3. Otherwise choose the next feature from live replay evidence, not from generic
   architecture anxiety.
