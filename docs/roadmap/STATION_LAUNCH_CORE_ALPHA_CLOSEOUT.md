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
8. create and save a private draft, then inspect owner publishing readback;
9. publish one public-safe staged document through approval, inspect public
   document and linked discussion readback, then retract it to private;
10. read an accepted replay public document on a public Space when a
    no-mutation demo path is preferred;
11. use Station Assistant as an operational map over the above.

This is not a production readiness claim and not a complete Station MVP claim.
It is also not a full hard-delete artifact-removal claim: PR411 proves one
disposable hosted owner-delete cleanup path that tombstones the linked
discussion and preserves comments, while publish-and-retract remains a
visibility/hide action that leaves an owner-visible Studio record.

## Current Evidence Refresh

Last refreshed: 2026-06-27 by PR397 hosted publish-and-retract proof, PR398
MIMIR closeout update, PR399 Station Assistant action-map refresh, PR407 owner
delete linked-discussion cleanup contract, and PR411 disposable hosted cleanup
proof.

- PR157 public Railway web health:
  `https://stationweb-production.up.railway.app/health` returned HTTP 200 with
  `ok:true`.
- PR157 public Railway web deployment:
  `https://stationweb-production.up.railway.app/health/deployment` returned
  HTTP 200 with `ok:true`, `ready:true`, service `@station/web`, branch `main`,
  and commit `508b4acc2dbe`.
- PR157 public Railway API health:
  `https://stationapi-production.up.railway.app/health` returned HTTP 200 with
  `ok:true`.
- PR157 public Railway API deployment:
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
- PR160 later confirms the hosted runtime relevant to the PR159 public-read and
  UUID-redaction patch served deployment commit `6a8bb3eea401`: the focused
  public document chain no longer showed a browser-visible owner-aware document
  API 401, Runtime Context/readback, Saved Memory, Global Archive, and 390px
  mobile Memory showed zero UUID-shaped visible values, and 390px mobile Memory
  had no document-level horizontal overflow.
- Later docs-test commits may skip Railway deployment when no watched runtime
  files change. That is not stale runtime by itself; for demo planning, the
  runtime is current enough when it serves the PR159 runtime patch commit or a
  later accepted app-code runtime.
- Current replay evidence remains protected-alpha evidence. It supports a
  staged proof/demo loop, not production readiness or product completeness.
- PR387 proves safe hosted private draft authoring/readback:
  `/writing` -> `/studio/publish` -> saved private draft ->
  `/studio/publishing` owner dashboard -> edit reload.
- PR391 proves hosted existing public writing route-through readback:
  `/writing` -> public document detail -> linked forum discussion, using
  accepted replay public data and no new public mutation.
- PR392 confirmed Station had retract/hide behavior, but did not yet have a
  reliable owner-safe cleanup path for a test public/unlisted document plus
  linked discussion artifact.
- PR394 adds the owner-visible `Retract to private` contract in
  `/studio/publishing`, using the authenticated owner `PATCH /documents/:id`
  path and keeping copy explicit that retraction hides public reads but leaves
  the owner-visible record in Studio.
- PR396 aligns approval publish with direct publish by attaching or recovering
  eligible linked document discussions and hydrating `discussion_thread_id`
  before approval response readback.
- PR397 proves the hosted publish-and-retract path end to end with one
  public-safe unlisted artifact: approval publish, public document readback,
  `Open linked discussion`, linked discussion route, retract to private,
  post-retract public document/discussion hiding, and owner-private readback.
- PR407 adds the owner document delete cleanup contract: deleting an owner
  document tombstones only its linked document discussion threads as hidden and
  locked, preserves comments/community records behind that tombstone, removes
  public/member routeability, and returns cleanup readback.
- PR411 proves that cleanup contract once on hosted Railway/Supabase staging
  with disposable public-safe data: one synthetic unlisted owner document, one
  linked discussion, one synthetic owner-authored preservation comment, then
  owner document delete. Cleanup readback matched
  `linked_discussion_tombstone`, hid one linked discussion, preserved one
  comment, deleted zero comments, touched zero unrelated threads, and returned
  post-delete public document/discussion/thread reads as HTTP `404`.

## Evidence Map

| Loop | Evidence |
| --- | --- |
| Persona entry/create | PR25 accepted four alpha onboarding paths with real route targets: Fresh Start, Awakening, Document Migrator, and API Bridge. |
| Chat/runtime context | Launch-core chat-history fix, production debug gating, persona-context tests, and accepted runtime context coverage. |
| Archive chat | Conversation archive route, archived transcripts, archive chunks, read-only archived chats, and continuity candidates. |
| Review candidates | PR17 import-backed candidates and PR21 Import Review Inbox closeout. |
| Private archive search | PR12 owner-scoped `/imports/archive/search` and deployed `/studio/archive` rehearsal. |
| Export data | Owner-only JSON/Markdown manifest and portable bundle readback for persona and Developer Space exports. |
| Publishing/public document | PR10 Studio publish API wiring, PR11 approval queue, PR23 Creator-capable staging proof, PR387 safe private draft owner readback, PR394 retract contract, PR397 hosted publish-and-retract proof, PR407 owner delete cleanup contract, and PR411 disposable hosted owner-delete cleanup proof. This is not full hard-delete artifact cleanup. |
| Public Space/document/discussion | PR23 public Space/document/linked discussion proof, PR391 hosted `/writing` -> public document -> linked discussion route-through proof using existing replay public data, PR397 fresh approval-published document -> linked discussion -> retract/hide proof, PR407 linked discussion tombstone cleanup contract, and PR411 hosted disposable post-delete public document/discussion/thread 404 proof. |
| Station Assistant | PR22 sanitized operational action cards, desktop/mobile browser closeout, and PR399 publish/retract action-map refresh. |
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
10. If running the full publish proof, create one public-safe staged document,
    move it through approval publish, inspect public document trust/readback,
    open the linked discussion, then retract it to private.
11. Confirm the retracted document and linked discussion are hidden from public
    readers and the owner-private Studio record remains readable.
12. If avoiding hosted mutation, open an accepted replay public document from
    `/writing` or its public Space and follow its linked discussion instead.
13. Do not run owner document delete cleanup again on hosted replay data unless
    MIMIR explicitly opens that mutation rehearsal; PR411 already proved the
    disposable hosted cleanup path once, and repeat cleanup runs remain opt-in.

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
- Public writing is protected-alpha complete for safe private drafting, existing
  public replay readback, one hosted publish-and-retract proof, and one
  disposable hosted owner-delete cleanup proof. It is not a rich authoring,
  scheduling, social dispatch, Station Press, or production publishing claim.
- Retracting a published document to private is a visibility/hide mechanism,
  not artifact cleanup. PR411 proves owner document delete can tombstone linked
  document discussion threads for public route safety on hosted staging, but it
  preserves comments and community records behind the hidden/locked thread and
  is not full hard-delete artifact removal.
- Station Assistant is an operational map, not an autonomous executor or
  persistent persona.
- Redis memory truth, Cloudflare retrieval, production vector hardening,
  provider marketplace, social dispatch, scheduled publishing, and broad UI
  reskin remain future lanes.
- Stripe paid activation is now covered separately by the accepted PR181
  bounded test-mode proof: a clean non-production account completed hosted
  Checkout, Checkout creation alone did not grant entitlement, and
  webhook-backed subscription state produced `canon/active`. The dirty replay
  owner remains dirty and untouched, and this is not production/live-money
  billing readiness.
- Redis/Upstash is operational cache, idempotency, rate-limit, and cache-only
  queue-state support. It is not canonical Memory truth.
- Cloudflare remains future adapter/index-mirror scope unless a concrete
  Cloudflare replay objective is opened.

## Recommended Next Moves

1. Use the replay script above for the full hosted publish-and-retract proof, or
   use the refreshed PR161 operator pack in
   `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md` when a
   no-mutation external demo path is preferred.
2. PR25 accepted the alpha route map for the four onboarding paths; future work
   should deepen those paths only from replay evidence.
3. Otherwise choose the next feature from live replay evidence, not from generic
   architecture anxiety.
