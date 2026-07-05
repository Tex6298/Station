# PR493A - Persona Roulette Visitor Encounter Hosted Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-07-05

Verdict:

```text
PASS_READY_FOR_PR493A_CLOSEOUT
```

## Summary

ARIADNE completed the hosted PR493A rehearsal against production web/API.

`/discover/roulette` loaded signed out on desktop, `375px`, and `390px`; the
anonymous roulette candidate was routeable and did not select the
signed-in-alpha fixture. The desktop exhaustion proof used safe route-local
session state to start at four submitted messages, sent one hosted signed-out UI
message, and reached the local five-message exhausted state.

## Hosted Freshness

- Web `/health/deployment` was ready on service `@station/web`, branch `main`,
  at commit `d554f493`.
- API `/health/deployment` was ready on service `@station/api`, branch `main`,
  at commit `d554f493`.
- Both commits satisfy the PR493A floor.

## API And Public Readback

- `GET /personas/public/roulette?limit=3&chatMode=anonymous_alpha` returned
  only `station-replay-alpha-persona`, with public chat enabled and mode
  `anonymous_alpha`.
- Default `GET /personas/public/roulette?limit=3` remained compatible and
  returned public cards for:
  - `station-replay-owner-gate-alpha-persona:signed_in_alpha`;
  - `station-replay-alpha-persona:anonymous_alpha`;
  - `station-replay-signed-in-alpha-persona:signed_in_alpha`.
- Public readback preserved expected modes:
  - replay alpha: `anonymous_alpha`;
  - signed-in alpha fixture: `signed_in_alpha`;
  - owner-gated fixture after rollback: `signed_in_alpha`.
- Signed-out chat was denied for the signed-in-alpha fixture and owner-gated
  fixture.
- Public roulette and public persona readbacks did not expose raw owner gate
  fields, owner ids, persona ids, source ids, source bodies, provider payloads,
  tokens, cookies, headers, user agents, IP addresses, private prompts,
  transcript rows, or secret-shaped values.

## Browser Proof

Temporary dependency-free Chrome/CDP proof passed for:

- `/discover/roulette` signed out on desktop, `375px`, and `390px`;
- selected candidate `station-replay-alpha-persona`;
- signed-in-alpha negative-control exclusion;
- no desktop or mobile horizontal overflow;
- public persona page compatibility;
- Discover right-rail compatibility with the `Start encounter` CTA.

The desktop exhaustion proof:

- wrote only safe route-local `sessionStorage` state for
  `station.discoverRoulette.station-replay-alpha-persona`;
- preloaded the local submitted count to four;
- sent one hosted signed-out UI message through the page;
- reached `Encounter complete`;
- hid the textarea so the UI could not send again;
- showed the Studio/sign-in CTA;
- stored exactly public slug, submitted count, and exhausted state;
- did not store transcript text, visitor identity, raw ids, private prompts,
  provider payloads, cookies, headers, IP/user-agent values, owner ids, persona
  ids, or secret-shaped values.

## Scope Preserved

PR493A still makes no launch, voice, avatar, Salon/live chat, matching,
billing, queue, worker, Redis, Cloudflare, or provider-architecture readiness
claim. The lane remains a protected-alpha visitor text encounter over the
existing public persona chat route.

Temporary harnesses, Chrome profiles, and screenshots were removed before
commit.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `$env:PR493A_SEND_DESKTOP='0'; node .tmp\pr493a-roulette-rehearsal.mjs` | Pass | Hosted API proof plus desktop/375px/390px browser route, public page, Discover right-rail, no-overflow, no-drift, and no-leak checks passed without extra hosted sends. |
| `$env:PR493A_EXHAUSTION_ONLY='1'; $env:PR493A_PRESEED_ONLY='1'; node .tmp\pr493a-roulette-rehearsal.mjs` | Pass | Desktop safe-count exhaustion proof sent one signed-out UI message and locked the encounter at five. |
| `git diff --check` | Pass | No whitespace errors. |

## Next

MIMIR should close PR493A.
