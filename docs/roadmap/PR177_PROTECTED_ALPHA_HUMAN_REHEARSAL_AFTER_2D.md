# PR177 - Protected Alpha Human Rehearsal After 2D

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: ARIADNE runs hosted human-eye rehearsal.
Reviewer: MIMIR sequences from ARIADNE's verdict. ARGUS reviews only if the
rehearsal raises security, privacy, public-boundary, or receipt concerns.
Builder: DAEDALUS repairs only concrete blocking defects with repro steps.
Status: open for ARIADNE rehearsal

## Why This Lane

PR162 through PR176 closed the bounded Phase 2D Developer Agent surface:

- safe owner readbacks;
- explicit confirmation envelopes;
- durable receipts;
- private draft save and owner review;
- selected public publish;
- capability request triage;
- sanitized activity readback;
- selected public observatory status note;
- source-of-truth closeout proving remaining risky actions stay blocked.

Before opening repo push, job execution, key rotation, signing-secret creation,
layout mutation, or another automation lane, Station needs a protected-alpha
human rehearsal on hosted. The goal is to find the next real gap from a human
view of the product, not from implementation momentum.

## Goal

Answer these questions from the hosted product:

- Does the current Station flow feel coherent for the owner and a public
  visitor?
- Do Phase 2D Developer Agent controls read as bounded and non-autonomous?
- Are private owner surfaces, public surfaces, receipts, and evidence paths
  still separated clearly?
- What single concrete gap should become the next lane, if any?

## Owner Route Scope

ARIADNE should exercise the owner-visible hosted product without printing
credentials, cookies, tokens, service keys, connection strings, raw ids, or
private payloads.

Cover:

- sign-in or session resume;
- Studio and private persona overview;
- memory, continuity, archive, integrity, and export/readback stops;
- Developer Space owner manage surface;
- Developer Agent safe readbacks:
  - Developer Space brief;
  - observed runtime status;
  - provider/privacy posture;
  - evidence path;
  - sanitized activity log;
  - draft preview;
- gated Phase 2D flows:
  - capability request triage;
  - save private project-update draft;
  - Review draft handoff;
  - selected publish gate;
  - selected observatory status-note gate;
- risky actions staying blocked:
  - `update_layout`;
  - `push_to_repo`;
  - `run_job`;
  - `rotate_ingestion_key`;
  - `create_webhook_signing_secret`.

## Public Route Scope

Cover public visitor routes where seeded data exists:

- landing/front door;
- Discover and public search/feed;
- public Developer Space detail;
- public document or evidence path;
- linked forum/discussion path if public content exposes one;
- anonymous or signed-out mobile public detail.

## Boundaries

Do not:

- edit product code;
- commit or print secrets, credentials, raw ids, cookies, tokens,
  credentialed URLs, service-role material, connection strings, or private
  payloads;
- run live billing or real purchases;
- mutate repo push, jobs, keys, signing secrets, layout config, workers,
  providers, Cloudflare, Railway, Redis, or Supabase config;
- issue broad redesign instructions;
- turn a blocked risky action into an implementation lane unless the rehearsal
  proves a concrete reviewed need.

## Expected Output

ARIADNE should wake MIMIR with:

- routes exercised;
- desktop and mobile coverage;
- pass/fail by area;
- concrete defects with repro steps;
- privacy and public-boundary observations;
- Developer Agent boundedness observations;
- safe screenshot or evidence references;
- exactly one recommendation:
  - repair a specific defect;
  - open a narrow implementation lane;
  - run a targeted follow-up rehearsal;
  - or deliberately pause risky expansion.

## Validation

Minimum rehearsal validation:

- hosted browser rehearsal on desktop and mobile;
- visible-text scan for UUID-shaped and secret-shaped strings on owner and
  public routes;
- public/private differential for at least one owner-only Developer Agent
  artifact and one public item;
- no code validation unless ARIADNE or DAEDALUS patches docs or product code.

## Next Baton

ARIADNE should wake MIMIR if the rehearsal produces a verdict without an
immediate code repair.

If there is a blocking defect, ARIADNE may wake DAEDALUS first, but the wakeup
must include:

- exact route;
- user state;
- repro steps;
- expected behavior;
- actual behavior;
- safe evidence reference;
- whether the defect blocks protected-alpha rehearsal closeout.
