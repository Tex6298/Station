# PR24 - Launch-Core Sufficiency Closeout

Date: 2026-06-18
Status: opened for A3 / ARGUS
Owner: ARGUS audit first. ARGUS may wake ARIADNE only if a final human route
rehearsal is genuinely needed, or DAEDALUS only if a concrete implementation
blocker remains.

## Why This Lane Is Next

PR10 through PR23 have now filled the concrete launch-core gaps that were
blocking the protected-alpha Station promise:

- publishing API/UI wiring and approval state;
- private archive search;
- external import parsing and durable import jobs;
- import review candidates and visible Import Review Inbox;
- Reddit and Discord manual archive intake;
- operational quota guards;
- Station Assistant operations;
- Creator-positive public publish -> public Space -> forum discussion proof.

Before opening another feature lane, ARGUS should audit whether Station is now
launch-core sufficient for protected-alpha replay, and exactly what caveats must
travel with that claim.

## Audit Question

Can MIMIR truthfully mark the current Railway/Supabase staging line as
launch-core sufficient for protected-alpha replay?

The answer may be:

- yes, with caveats;
- no, one exact blocker remains;
- yes for backend/product flow, but ARIADNE should run one final human route
  rehearsal before public-facing closeout language.

## Evidence Map To Check

Map `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md` Definition of sufficient:

1. choose an onboarding path;
2. create or import a persona;
3. chat with context assembled from Canon, Memory, recent turns, and Integrity
   output;
4. archive a chat;
5. review and accept/edit/reject Memory and Canon candidates;
6. search private archive;
7. export data;
8. publish a private draft as a labelled public document;
9. display that document on a public Space;
10. discuss it in the forum under correct visibility rules;
11. use Station Assistant to understand and operate the above.

Use existing docs/evidence before asking for more work. Relevant recent lanes:

- PR10 Studio Publish API Wiring;
- PR11 Publishing Approval Queue;
- PR12 Private Archive Search;
- PR14 External Conversation Import Parsers;
- PR15 Background Job Boundary;
- PR16 Durable File Import Jobs;
- PR17 Import Review Candidates;
- PR18 Operational Quota Guards;
- PR19 Reddit Archive Intake;
- PR20 Discord Archive Intake;
- PR21 Import Review Inbox;
- PR22 Station Assistant Operations;
- PR23 Creator Publish Public Discussion Proof;
- accepted export bundle/readback and staging replay docs already in
  `ACTIVE_STATUS.md`.

## Caveats To Police

Do not overclaim:

- production readiness;
- live-money billing;
- Stripe-paid Creator activation from the PR23 staging tier seed;
- autonomous Assistant execution;
- worker/queue deployment beyond the protected-alpha job boundary;
- Cloudflare retrieval or Redis memory truth;
- live Reddit/Discord OAuth/API pulls;
- background social dispatch or scheduled publishing execution;
- broad UI reskin completion;
- full workspace/PDF/binary export.

Do preserve true claims:

- owner scoping and private/public boundaries where accepted;
- staging proof versus production proof;
- existing Stripe test-mode activation proof as separate from PR23;
- public-safe synthetic replay evidence;
- known caveats as future lanes, not hidden blockers, unless they prevent the
  protected-alpha launch-core loop.

## ARGUS Task

Produce a closeout verdict:

- evidence table mapping each definition item to the accepted lane/docs;
- exact caveats that must appear in MIMIR's closeout;
- any stale or contradictory active-status lines that would mislead the team;
- whether another ARIADNE final human route pass is needed;
- whether a DAEDALUS implementation blocker remains;
- recommended next lane after closeout, if any.

## ARGUS Audit Result - 2026-06-18

Verdict: yes, with caveats.

The current Railway/Supabase staging line can be marked launch-core sufficient
for protected-alpha replay. That means a prepared test owner can traverse the
core Station loop without developer intervention. It does not mean production
readiness, full Station MVP, or completion of the wider roadmap.

No exact DAEDALUS implementation blocker remains for the launch-core closeout.
No required ARIADNE pass remains before MIMIR marks this closeout, because the
visible surfaces that changed materially already received focused ARIADNE
rehearsals, and PR23 was proof/setup only with no product UI patch. A final
ARIADNE end-to-end narrated rehearsal would be useful before an external demo
or public-facing announcement, but ARGUS does not treat it as a launch-core
blocker.

### Evidence Map

| Definition item | Accepted evidence | Caveat to preserve |
| --- | --- | --- |
| Choose an onboarding path | Existing `/studio/new` Awakening route plus the accepted public entry/onboarding copy work gives a protected-alpha path into persona creation. | Do not claim the four documented onboarding paths are complete. API Bridge, Document Migrator, Awakening, and Fresh Start remain a product lane. |
| Create or import a persona | `POST /personas` and `/studio/new` create personas; PR14 through PR21 added uploaded/pasted source intake, durable import jobs, import-backed Memory/Canon candidates, and the visible Import Review Inbox for an existing persona. | Whole-persona import wizarding is not complete. Current import truth is source-material intake into an owned persona archive and review queue. |
| Chat with context from Canon, Memory, recent turns, and Integrity output | The launch-core patch fixed latest-turn loading, production-gated debug, and uses `buildPersonaContext`; accepted context tests cover Canon, Memory, Integrity, archive refs, and owner scoping. | Runtime context is connected, not final. Topology weighting, context budgets, streaming polish, production retrieval hardening, and provider/quota polish remain future work. |
| Archive a chat | The conversation archive route creates archived transcripts, stores archive chunks, marks chats archived/read-only, and generates continuity candidates; `test:conversation-archive` is the protected gate. | Candidate extraction is heuristic alpha behavior, not production-grade summarization. |
| Review and accept/edit/reject Memory and Canon candidates | PR17 added import-backed candidate creation; PR21 closed the owner-facing Import Review Inbox after ARGUS review and ARIADNE deployed rerun. | Full review workspace, live Reddit/Discord pulls, workers, vectors, Redis memory truth, and broad UI reskin remain deferred. |
| Search private archive | PR12 closed owner-scoped `/imports/archive/search` and deployed `/studio/archive` search after ARIADNE contrast rerun. | Future vector search, Cloudflare retrieval, Redis memory truth, extra archive source types, and worker indexing remain separate lanes. |
| Export data | The accepted export bundle lane gives owner-only JSON/Markdown persona and Developer Space bundle readback with hashes, manifest, provenance, and privacy notes; `test:exports` protects it. | This is not a full workspace/PDF/binary export, background export worker, redundancy layer, or Station Press package. |
| Publish a private draft as a labelled public document | PR10 made Studio publish save/edit real; PR11 added approval state and owner readback; PR23 proved Creator-capable staging draft -> review -> published public document. | PR23 used a staging profile tier seed for Creator capability, not Stripe-paid Creator activation proof. Scheduling/social dispatch/workers remain deferred. |
| Display that document on a public Space | PR23 public route proof loaded `GET /spaces/station-replay-alpha`, web `/space/station-replay-alpha`, and the public document route with the synthetic published document visible. | This is public-safe synthetic staging evidence, not a production content claim. |
| Discuss it in the forum under correct visibility rules | Document discussion tests cover public/community/unlisted/private boundaries; PR23 proved linked discussion creation and forum category route readback for the public published document. | This is document discussion/community loop, not full Community Beta with subcommunities, moderation queue, notifications, appeals, or recognition mechanics. |
| Use Station Assistant to understand and operate the above | PR22 closed Station Assistant as an owner-safe operational map with sanitized typed action cards after ARGUS leak review and ARIADNE desktop/mobile contrast rerun. | Assistant is not a persona, not autonomous, and does not mutate Memory/Canon, publish, export, start Integrity Sessions, or execute multi-step workflows. |

### Caveats MIMIR Must Preserve

- Protected-alpha replay, not production readiness.
- Railway/Supabase staging truth, not broad deployment truth for every future
  environment.
- The PR23 Creator proof used a staging profile tier seed; it is not
  Stripe-paid activation proof. Existing Stripe test-mode activation evidence
  stays separate.
- Four onboarding paths remain incomplete. The protected-alpha path is enough
  for replay, not for the documented onboarding promise.
- Chat/archive candidate extraction is heuristic alpha behavior.
- Background jobs are a protected-alpha boundary with inline compatibility, not
  a deployed durable BullMQ/worker system.
- Reddit and Discord intake are uploaded/pasted/manual archive sources, not live
  OAuth/API pulls or recurring import jobs.
- Cloudflare retrieval, Redis memory truth, topology weighting, vector
  production retrieval, and context-budget hardening remain future lanes.
- Export is owner-only JSON/Markdown manifest/bundle readback, not full
  workspace/PDF/binary export, archive redundancy, or Station Press.
- Community proof is document discussion visibility, not full Community Beta.
- Station Assistant is an operational map, not an autonomous executor or
  persistent persona.
- Broad UI reskin/mobile polish is not complete, even though the changed
  launch-core routes received focused human passes.

### Stale Or Contradictory Claims

`ACTIVE_STATUS.md` is not misleading on the active launch-core sequence: PR21,
PR22, and PR23 are marked fully closed, and PR24 is correctly opened for this
ARGUS audit.

Older summary docs remain intentionally conservative but now under-describe the
latest closed loops. In particular, `docs/roadmap/builds.md` and
`docs/product/station-v1.md` still frame several items as reopened that now have
protected-alpha launch-core evidence: private archive search, Station Assistant
operations, manual Reddit/Discord archive intake, and portable JSON/Markdown
bundle readback. That is not a blocker for PR24, but MIMIR should reconcile the
summary docs after closeout so the repo says "launch-core sufficient for
protected-alpha replay" without implying finished MVP.

### Recommended Next Lane

Do not open another feature immediately. MIMIR should first close PR24 with a
truthful launch-core sufficiency statement and update the high-level roadmap
summary. The next bounded lane should be either:

1. `docs: publish launch-core replay script`, if the goal is a repeatable human
   demo/runbook; or
2. `feat: implement four onboarding paths`, if the goal is to move from
   protected-alpha replay toward the documented Station onboarding promise.

## Validation

Docs-only audit minimum:

```bash
git diff --check
```

Run targeted tests only if ARGUS edits code or finds a fresh behavior claim that
requires proof. Do not re-run the whole world just to avoid making a judgement.
