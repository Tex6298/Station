# PR326 - Named Signed-In External Pilot Preflight Result

Owner: ARGUS

Date: 2026-06-26

Status: Complete

## Verdict

Classification:

```text
READY WITH GATES
```

Next owner:

```text
ARIADNE
```

ARIADNE should run a hosted human rehearsal before any real external tester
entry. No DAEDALUS repair is required before that rehearsal.

## Safety Finding

The named signed-in pilot is safe to rehearse with gates because current
accepted surfaces already prove the needed bounded shape:

- PR315 proved signed-in public persona chat for the replay public persona with
  `transcriptStored:false` and owner aggregate-only readback.
- PR316 proved signed-in public persona report creation with status-only public
  confirmation and owner aggregate/status-only readback.
- PR319 proved the admin persona-report moderation queue at
  `/forums/moderation?targetType=persona`, safe persona report rows, and
  non-admin boundary.
- PR324 proved the hosted public Space -> public document -> linked forum
  discussion chain on desktop and mobile.
- Focused tests rerun for this preflight passed for public personas, reports,
  community/forums, and document discussions.

Important caveat: Station has signed-in chat/report gates and owner/admin
readback gates, but this preflight does not find a product-enforced allowlist
for "only these 3-5 named testers." For PR326, invite-only is therefore an
operational pilot gate: MIMIR/Marty control the named account list, links, and
entry timing. If MIMIR wants software-enforced tester allowlisting before the
pilot, that is a new DAEDALUS access-control lane.

## In Scope

Only these surfaces are in scope:

- one existing public persona path, preferably the accepted replay path
  `/personas/station-replay-alpha-persona`;
- signed-in public persona chat on that path;
- signed-in public persona report creation on that path;
- owner public-interaction aggregate/status readback for that persona;
- admin persona-report moderation readback at
  `/forums/moderation?targetType=persona`;
- one existing public Space/document/discussion chain, using the hosted-proven
  replay chain from PR324;
- desktop and `375px` mobile fit for the checked pilot routes.

## Out Of Scope

Do not open or claim:

- anonymous public chat;
- public launch readiness;
- commercial, customer, or partner packaging;
- generalized all-personas, all-Spaces, all-testers, or production-traffic
  readiness;
- durable visitor transcript storage beyond the existing
  `transcriptStored:false` public persona posture;
- visitor identity analytics expansion;
- report target actions or moderation status mutation during rehearsal;
- private Memory, Archive, Continuity, Canon, Integrity, raw event, report
  body, reporter identity, provider payload, token, credential, SQL, or raw id
  exposure;
- Cloudflare, Redis/queue/worker execution, provider/model swaps, billing,
  repo/deploy actions, key rotation, signing-secret creation, or broad UI
  redesign.

## Gates Before ARIADNE Rehearsal

ARIADNE should not begin rehearsal until:

- hosted web/API are healthy and deployment-ready;
- hosted web/API include the accepted runtime commits for the public persona
  moderation pointer and public document discussion entrypoint;
- MIMIR names the exact rehearsal routes:
  - public persona slug;
  - public Space slug;
  - public document route;
  - linked forum discussion route;
- MIMIR confirms the rehearsal uses internal/replay aliases only, not real
  external testers;
- owner and admin replay aliases are available without printing or committing
  secrets;
- the rehearsal plan caps mutations:
  - at most one setup public persona chat if needed;
  - at most one persona report;
  - no moderation status change;
  - no target action;
  - no billing, provider, deploy, key, or infrastructure mutation.

## Gates Before Real Tester Entry

Real external tester entry is blocked until:

- Marty/MIMIR names 3-5 trusted testers and their signed-in account emails or
  aliases;
- MIMIR confirms the pilot is invitation-only and gives testers only the named
  in-scope routes;
- MIMIR confirms whether each tester may perform public persona chat, report,
  both, or read-only navigation;
- owner/admin monitoring is assigned for the pilot window;
- the owner confirms the public persona chat surface can be disabled quickly if
  the pilot must stop;
- admin confirms `/forums/moderation?targetType=persona` is reachable before
  tester entry;
- ARIADNE's hosted rehearsal passes after the latest relevant deploy;
- all pilot copy remains clear that this is a controlled signed-in pilot, not a
  public launch, commercial/customer offer, partner readiness claim, or
  anonymous visitor feature.

## Owner And Admin Monitoring

During the pilot, the owner/admin should monitor only safe readbacks:

- public persona chat attempts/successes/failures as aggregate counts;
- persona report total/active/status counts;
- admin persona moderation queue rows for safe target context;
- rate-limit, quota, provider-unavailable, and public persona disabled states;
- public Space/document/discussion routeability.

The owner/admin should not collect or expose visitor identity, raw event rows,
report bodies, public chat transcripts, provider payloads, private source
bodies, credentials, tokens, SQL, or raw ids outside the already accepted admin
moderation boundary.

## Smallest Success Bar

The rehearsal/pilot can pass only if:

- every named tester can sign in;
- every named tester can reach the named public persona and public
  Space/document/discussion routes;
- at least one signed-in public persona chat succeeds with
  `transcriptStored:false`;
- at least one signed-in persona report can be submitted with public-safe
  status-only confirmation;
- owner readback remains aggregate/status-only;
- admin moderation readback shows persona reports with safe target context;
- signed-out users cannot perform public persona chat or report actions;
- no checked public, owner, or admin-visible surface leaks private/source,
  reporter, visitor, raw event, provider, credential, token, SQL, or raw id
  material;
- desktop and `375px` mobile fit pass for the checked routes.

## Stop Conditions

Stop the pilot and wake the right owner if any of these occur:

- anonymous users can chat or report;
- uninvited accounts are treated as part of the pilot through any product
  claim or operational flow;
- owner readback exposes reporter identity, report bodies, visitor identity,
  transcript text, raw event rows, or raw ids;
- admin persona queue is unavailable or leaks private persona/source material;
- public persona chat stores transcripts or durable visitor identity;
- the public document/discussion chain is not routeable on hosted desktop and
  mobile;
- hosted web/API freshness is stale for a relevant runtime repair.

Wake DAEDALUS only for a concrete code/docs/test defect. Wake ARGUS for privacy
or boundary leakage. Wake MIMIR for missing product choices, tester details, or
pilot stop/continue decisions.

## Validation

ARGUS validation for PR326:

- read PR326, PR325, PR315, PR316, PR319, PR324, current `ACTIVE_STATUS`, and
  the relevant public persona/report route and test slices;
- `npm exec --yes pnpm@10.32.1 -- run test:personas` passed with 12 tests;
- `npm exec --yes pnpm@10.32.1 -- run test:reports` passed with 6 tests;
- `npm exec --yes pnpm@10.32.1 -- run test:community` passed with 31 tests;
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` passed with
  2 tests;
- `git diff --check` passed before staging docs, with CRLF normalization
  notices only;
- staged whitespace and added-line hygiene checks passed before commit.

## Wakeup

Wake MIMIR with `READY WITH GATES` and recommend opening ARIADNE hosted
rehearsal before real tester entry.
