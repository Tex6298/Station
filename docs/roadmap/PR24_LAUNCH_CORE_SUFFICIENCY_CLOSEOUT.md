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

## Validation

Docs-only audit minimum:

```bash
git diff --check
```

Run targeted tests only if ARGUS edits code or finds a fresh behavior claim that
requires proof. Do not re-run the whole world just to avoid making a judgement.
