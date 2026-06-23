# PR177 - Protected Alpha Human Rehearsal After 2D

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: ARIADNE runs hosted human-eye rehearsal.
Reviewer: MIMIR sequences from ARIADNE's verdict. ARGUS reviews only if the
rehearsal raises security, privacy, public-boundary, or receipt concerns.
Builder: DAEDALUS repairs only concrete blocking defects with repro steps.
Status: closed by MIMIR after ARIADNE acceptance

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

## ARIADNE Rehearsal Verdict - 2026-06-23

Verdict: pass for protected-alpha rehearsal closeout. No DAEDALUS repair is
needed from PR177.

Hosted deployment identity:

- Web `/health/deployment`: ready, Railway service `@station/web`, main commit
  `b10eb8b9b8e0`.
- API `/health/deployment`: ready, Railway service `@station/api`, main commit
  `b10eb8b9b8e0`.

Routes exercised:

- Owner desktop: `/studio`, `/studio/personas/<persona>`,
  `/studio/personas/<persona>/memory`,
  `/studio/personas/<persona>/continuity`,
  `/studio/personas/<persona>/files`,
  `/studio/personas/<persona>/calibration`, and
  `/developer-spaces/station-replay-dev-alpha/manage`.
- Owner mobile: `/developer-spaces/station-replay-dev-alpha/manage`.
- Anonymous desktop: `/`, `/discover`, `/developer-spaces`,
  `/developer-spaces/station-replay-dev-alpha`, `/space/station-replay-alpha`,
  `/space/<public-document>`, `/forums`, `/forums/documents-and-codexes`, and
  `/forums/<public-discussion>`.
- Anonymous mobile: `/developer-spaces/station-replay-dev-alpha` and
  `/space/<public-document>`.

Developer Agent boundedness:

- Safe readbacks all previewed without future-lane escalation:
  `read_developer_space_brief`, `read_observed_runtime_status`,
  `read_provider_policy_posture`, `read_evidence_path`, `read_logs`, and
  `draft_project_update`.
- Gated flows stayed bounded: `request_capability`, `publish_to_page`, and
  `update_observatory` required a future lane without selected owner input;
  `save_project_update_draft` previewed as an owner-confirmed private draft
  path.
- Risky actions stayed blocked as `requires_future_lane`: `update_layout`,
  `push_to_repo`, `run_job`, `rotate_ingestion_key`, and
  `create_webhook_signing_secret`.
- No repo push, job execution, key rotation, signing-secret creation, layout
  mutation, provider call, worker, billing action, Railway, Redis, Cloudflare,
  or Supabase config mutation was performed.

Privacy and public-boundary observations:

- Visible-text scans for UUID-shaped and secret-shaped strings passed on owner
  and public browser routes.
- Public routes also passed a scan for owner-only Developer Agent vocabulary
  such as dedupe, confirmation, receipt, preview hash, webhook secret, and
  private payload.
- Owner-only Developer Agent receipts were readable to the owner and rejected
  anonymously with HTTP `401`.
- Public Developer Space detail exposed public evidence and event-stream items
  without owner receipts or confirmation artifacts.

UX observations:

- Studio reads as the private continuity workspace: personas, integrity
  sessions, archive activity, and export affordances were legible on desktop.
- Developer Space manage is dense but coherent on desktop and mobile. The
  Developer Agent panel reads as bounded owner review rather than autonomous
  action.
- Public Developer Space detail reads as a live observatory, not a generic
  dashboard or profile. Mobile is long but navigable and did not overflow.
- Public Space, public document, Discover, forums, and linked discussion routes
  loaded without visible application error.

Safe evidence reference:

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr177-protected-alpha-rehearsal.spec.js --reporter=line --workers=1`
  passed locally against hosted with sanitized output only.
- Temporary local screenshots were inspected for owner Studio, owner Developer
  Space manage desktop/mobile, and public Developer Space desktop/mobile. They
  were not committed.

Recommendation:

- Deliberately pause risky Developer Agent expansion. PR177 did not produce a
  concrete defect or product need that justifies opening repo push, job
  execution, key rotation, signing-secret creation, or layout mutation.

## MIMIR Closeout - 2026-06-23

MIMIR accepts ARIADNE's PR177 rehearsal verdict.

Closeout decision:

- PR177 is closed as protected-alpha rehearsal pass evidence.
- No DAEDALUS repair is needed from PR177.
- No ARGUS hostile review is needed from PR177 because no code, schema, auth,
  visibility, receipt, billing, provider, Redis, Cloudflare, worker, or queue
  behavior changed.
- Risky Developer Agent expansion remains deliberately paused until a later
  lane proves a concrete need.
