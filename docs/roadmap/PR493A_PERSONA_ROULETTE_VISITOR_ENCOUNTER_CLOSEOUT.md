# PR493A - Persona Roulette Visitor Encounter Closeout

Owner: MIMIR / A1

Date closed: 2026-07-05

Status: Closed - hosted rehearsal passed

## Result

PR493A is closed as:

```text
PASS_READY_FOR_PR493A_CLOSEOUT
```

DAEDALUS implemented the protected-alpha visitor encounter:

`docs/roadmap/PR493A_PERSONA_ROULETTE_VISITOR_ENCOUNTER_RESULT.md`

ARGUS accepted the implementation without a review patch:

`docs/roadmap/PR493A_PERSONA_ROULETTE_VISITOR_ENCOUNTER_REVIEW_RESULT.md`

ARIADNE passed the hosted desktop, `375px`, and `390px` rehearsal:

`docs/roadmap/PR493A_PERSONA_ROULETTE_VISITOR_ENCOUNTER_REHEARSAL_RESULT.md`

## Accepted Product Truth

Station now has a bounded protected-alpha anonymous visitor encounter at:

`/discover/roulette`

Accepted behavior:

- the encounter draws anonymous-eligible personas through
  `GET /personas/public/roulette?limit=1&chatMode=anonymous_alpha`;
- visitor sends reuse the existing public persona chat route,
  `POST /personas/public/:publicSlug/chat`;
- visible visitor/assistant messages stay in component memory only;
- local session storage is limited to public slug, submitted count, and
  exhausted state;
- the five-message exhaustion UX stops further UI sends and shows the
  Studio/sign-in CTA;
- the signed-in-alpha fixture is excluded from anonymous roulette;
- replay alpha remains `anonymous_alpha`;
- the owner-gated fixture and signed-in-alpha fixture remain
  `signed_in_alpha`;
- Discover right-rail roulette cards and public persona pages remain
  compatible.

## Hosted Proof

ARIADNE verified hosted web/API freshness at app/API commit `d554f493`.

Passed:

- `/discover/roulette` signed out on desktop, `375px`, and `390px`;
- anonymous candidate selection of `station-replay-alpha-persona`;
- default public roulette compatibility across replay, owner-gated, and
  signed-in-alpha public cards;
- signed-out denial for signed-in-alpha and owner-gated fixtures;
- safe-count desktop exhaustion proof with one hosted signed-out UI message;
- no desktop or mobile horizontal overflow;
- no transcript text, visitor identity, raw ids, private prompts, source
  bodies, provider payloads, cookies, headers, user agents, IP addresses,
  owner ids, persona ids, or secret-shaped values in public or storage
  readback.

## Not In PR493A

No launch, voice, avatar, Salon/live chat, matching, billing, queue, worker,
Redis, Cloudflare, provider architecture, transcript storage, visitor identity
storage, raw event storage, broad Discover redesign, or runtime expansion beyond
the protected-alpha text encounter entered this lane.

## Next Lane

MIMIR is opening PR494 as a numbered Discern companion-home translation preflight
after inspecting the recent Discern commits and the already-closed PR485
translation chain:

`docs/roadmap/PR494_DISCERN_COMPANION_HOME_CONTEXT_PREFLIGHT_ARGUS.md`
