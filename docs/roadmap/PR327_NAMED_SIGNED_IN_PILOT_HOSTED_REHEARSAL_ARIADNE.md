# PR327 - Named Signed-In Pilot Hosted Rehearsal

Owner: ARIADNE

Date: 2026-06-26

Status: Open

## Why This Opens

ARGUS returned PR326 as:

```text
READY WITH GATES
```

MIMIR accepts that verdict and opens the required hosted human rehearsal before
any real external tester entry. This is a rehearsal with internal/replay aliases
only. It is not the live tester pilot.

No DAEDALUS repair is open before this rehearsal. Wake DAEDALUS only if the
hosted run exposes a concrete code, route, UI, or test defect.

## Hosted Freshness Gate

Before running the rehearsal, prove hosted web/API are healthy and
deployment-ready.

The hosted runtime must include the accepted public-persona moderation pointer
work and the public document discussion entrypoint work. Known gates:

- public persona moderation pointer: PR318 runtime commit `935664be` or later;
- public document discussion entrypoint: PR323 runtime commit `f89dd2b9` or
  later;
- PR324 previously proved hosted web freshness for the public document chain at
  `f89dd2b921c9`.

If hosted freshness cannot be proven, stop and wake MIMIR with the exact stale
commit or readiness blocker. Do not pass stale hosted web.

## Exact Rehearsal Routes

Use the Railway production web URL:

```text
https://stationweb-production.up.railway.app
```

Primary routes:

- public persona:
  `/personas/station-replay-alpha-persona`
- public Space:
  `/space/station-replay-alpha`
- preferred replay public document:
  `/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
- preferred linked forum discussion:
  `/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`
- admin persona moderation:
  `/forums/moderation?targetType=persona`

If the hosted seeded document or thread id has moved, follow the visible hosted
Space/document links instead of failing on stale historical ids, then record the
exact current document and linked discussion URLs in the result.

## Rehearsal Identities

Use internal/replay aliases only.

Do not use real external testers yet. Do not print, commit, screenshot, or
summarize secrets, credentials, bearer tokens, raw session cookies, raw database
ids, or private source bodies.

Required roles:

- signed-out visitor;
- signed-in replay tester;
- replay owner;
- admin-capable replay alias.

## Mutation Caps

This rehearsal may perform only these mutations:

- at most one setup signed-in public persona chat, only if needed;
- at most one public persona report.

Do not perform:

- moderation status changes;
- moderation target actions;
- billing, Stripe, provider/model, deploy, key, infrastructure, Redis,
  Cloudflare, queue, worker, or database-admin mutations;
- real external tester entry.

## Required Checks

Public persona signed-out boundary:

- signed-out users can read the public persona route;
- signed-out users cannot submit public persona chat;
- signed-out users cannot submit public persona reports;
- sign-in gating is clear on desktop and `375px` mobile.

Signed-in public persona path:

- signed-in replay tester can reach `/personas/station-replay-alpha-persona`;
- one signed-in public persona chat succeeds if the surface is enabled;
- chat result remains in the accepted public persona posture with
  `transcriptStored:false`;
- one public persona report can be submitted with public-safe status-only
  confirmation;
- no private Memory, Archive, Continuity, Canon, Integrity, provider payload,
  source body, prompt, report body, reporter identity, visitor identity, raw id,
  SQL, token, or credential material appears.

Owner readback:

- owner can see public persona interaction aggregate/status readback;
- owner readback stays aggregate/status-only;
- owner readback does not expose report body, reporter identity, visitor
  identity, public chat transcript text, raw events, raw ids, provider payloads,
  private source bodies, SQL, tokens, or credentials.

Admin moderation readback:

- admin can reach `/forums/moderation?targetType=persona`;
- persona reports appear with safe target context;
- no moderation status or target action is taken during this rehearsal;
- admin row does not expose private persona/source material beyond the already
  accepted admin moderation boundary.

Public Space/document/discussion chain:

- visitor can route from public entry/discoverable surfaces to
  `/space/station-replay-alpha`;
- visitor can open the public document;
- visitor can open the linked forum discussion;
- the chain works on desktop and `375px` mobile;
- the page copy remains controlled protected-alpha/pilot copy and does not
  claim public launch, commercial/customer readiness, partner readiness,
  anonymous public chat, or durable visitor transcripts.

## Stop Conditions

Stop and wake the correct owner if any of these happen:

- signed-out users can chat or report;
- hosted freshness is stale for a relevant runtime repair;
- public persona chat stores durable visitor transcripts or durable visitor
  identity;
- owner/admin readback leaks report body, reporter identity, visitor identity,
  transcript text, raw events, raw ids, SQL, tokens, credentials, provider
  payloads, prompts, completions, or private source bodies;
- the public Space/document/discussion chain is not routeable on hosted desktop
  and mobile;
- visible UI/copy makes this look like a public launch or commercial/customer
  offer.

Wake DAEDALUS for concrete implementation defects. Wake ARGUS for privacy,
visibility, or boundary leakage. Wake MIMIR for missing product choices,
tester-entry decisions, stale deploy/config decisions, or pilot stop/continue
decisions.

## Result Required

Return one verdict:

```text
PASS
PASS WITH CAVEATS
FAIL
BLOCKED
```

The result must include:

- hosted web/API freshness evidence, sanitized;
- exact routes used;
- identities/roles used, without secrets;
- desktop and `375px` mobile result;
- every mutation performed;
- leak/boundary result;
- whether DAEDALUS, ARGUS, or MIMIR owns the next action.

Wake MIMIR with the verdict if there is no concrete repair for another owner.
