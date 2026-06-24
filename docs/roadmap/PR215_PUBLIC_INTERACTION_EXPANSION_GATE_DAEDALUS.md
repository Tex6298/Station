# PR215 Public Interaction Expansion Gate - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: open

## Frame

PR208 through PR214 completed the first public persona interaction bridge:

- signed-in public persona chat alpha;
- public-source-only context;
- public persona report route;
- owner/admin interaction readback;
- aggregate-only owner activity counters;
- hosted migration/deploy proof;
- ARIADNE human rehearsal.

The next step should not be chosen by vibe. Station can now consider several
larger public interaction families, but they have very different risk and
implementation shapes.

This lane compares options and recommends the smallest next implementation
slice. Do not implement the next product family in this PR.

## Candidate Families

Compare at least these:

1. Roulette
   - Random or guided public persona discovery/encounter.
   - Likely discovery/readback first, no provider call until a later lane.

2. Salons
   - Public or semi-public conversation spaces around personas/topics.
   - Likely needs moderation, membership, visibility, and rate-limit choices.

3. Public persona events
   - Public-safe activity, announcements, or milestone events for public
     personas.
   - Must not expose private aggregate counters, owner-only moderation state,
     visitor identity, or transcripts.

4. Voice/avatar
   - Media/provider integration for public or owner persona experience.
   - Likely config/provider-heavy and should not be first unless repo evidence
     says otherwise.

5. Institutional/research features
   - Researcher-facing collection, citation, export, and observatory workflows.
   - Likely useful but may be a separate audience lane.

6. Persona-to-persona encounters
   - Persona interactions with other personas.
   - High risk for runaway claims, moderation, storage, and provenance; likely
     not first unless bounded to dry-run/readback.

## Required Repo Map

Inspect current route/component/schema support for:

- public persona routes and serializers;
- Discover/public feed/public Space surfaces;
- forums/moderation/report routes;
- Developer Space observatory/event-like surfaces;
- aggregate owner counters from PR213;
- tier limits and entitlement checks;
- any existing docs mentioning Roulette, Salons, events, voice/avatar,
  institutional/research, or persona-to-persona.

Use `rg` first. Record the concrete files/routes you inspected.

## Output

Produce a short decision packet in this doc and `ACTIVE_STATUS` with:

- current repo affordances for each candidate;
- missing schema/API/UI pieces;
- privacy/moderation/billing/provider/config risks;
- which candidates require new external config;
- which candidates can be built without new config;
- recommended first implementation slice;
- why the other candidates wait;
- exact PR216 handoff proposal.

## Preferred Bias

MIMIR's current bias:

- Prefer a no-new-config, low-risk, public-readback/discovery slice first.
- Avoid media/provider-heavy work, persona-to-persona behavior, or public
  event feeds that expose private/owner-only activity before ARGUS has gated
  the public boundary.
- If Roulette can be introduced as a discovery/readback surface using already
  public eligible personas and no provider call, it is probably the first
  candidate to beat.

DAEDALUS should confirm or overturn that bias from the repo, not from vibes.

## Hard Boundaries

Do not implement:

- new provider calls;
- anonymous chat expansion;
- public event feeds;
- voice/avatar media;
- persona-to-persona model calls;
- new billing flows;
- Redis/Cloudflare/workers/queues;
- raw event logs;
- private memory/archive/canon/continuity/integrity exposure;
- broad UI reskin.

This is a comparison and recommendation lane only.

## Validation

Run:

```text
git diff --check
git diff --cached --check
```

If you add any helper script or test fixture for mapping, run the matching
syntax/test check. Otherwise this should remain docs-only.

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed PR215 public interaction expansion gate.
Recommendation:
- Name the recommended PR216 first implementation slice.
Task:
- Decide whether to open the recommended implementation lane or ask ARGUS for a
  hostile preflight first.
```
