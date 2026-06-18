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

## Recommended Next Moves

1. Prepare a narrated replay/demo script if an external demo is next.
2. PR25 accepted the alpha route map for the four onboarding paths; future work
   should deepen those paths only from replay evidence.
3. Otherwise choose the next feature from live replay evidence, not from generic
   architecture anxiety.
