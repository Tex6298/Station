# Staging Public Persona Fixture Proof

Purpose: create one safe non-production ordinary public persona fixture for
hosted proof that non-replay public personas remain signed-in alpha and
anonymous-denied.

## Fixture

The fixture script plans exactly one ordinary public persona:

```text
station-replay-signed-in-alpha-persona
```

The fixture uses only public-safe profile fields:

- `name`: Station Replay Signed-In Alpha Persona
- `shortDescription`: Public-safe staging persona for signed-in alpha chat
  boundary proof.
- `visibility`: public
- `provider`: platform
- `public_chat_enabled`: true

It must resolve to `signed_in_alpha`. The replay slug
`station-replay-alpha-persona` remains the only `anonymous_alpha` slug.

## Commands

Dry-run proof:

```powershell
node scripts/staging-public-persona-fixture.mjs --dry-run
```

Focused script tests:

```powershell
node --test scripts/staging-public-persona-fixture.test.mjs
```

Hosted write, only after authorized staging seed access is available:

```powershell
$env:STATION_PUBLIC_PERSONA_FIXTURE_WRITE="1"
node scripts/staging-public-persona-fixture.mjs
```

Required for hosted writes:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STATION_PUBLIC_PERSONA_FIXTURE_WRITE=1`

Optional owner selector:

- `STATION_PUBLIC_PERSONA_FIXTURE_OWNER_USERNAME`
- `STATION_PUBLIC_PERSONA_FIXTURE_OWNER_ID`
- `STATION_REPLAY_OWNER_USERNAME`
- `STATION_REPLAY_OWNER_ID`

Do not print, paste, or commit secret values.

## Safety Contract

The script:

- supports dry-run proof without hosted writes;
- requires the explicit write flag for hosted mutation;
- refuses the replay anonymous alpha slug;
- refuses raw-id-shaped public slugs;
- writes or updates only the same-owner fixture row;
- fails if the fixture slug already belongs to a different owner;
- keeps private profile, prompt, style, private source, Memory, Canon,
  Continuity, Integrity, Archive, transcript, provider payload, storage, and raw
  row fields out of fixture output.

Output is limited to safe public labels, public slugs, booleans, counts, and
pass/fail states.

## Hosted Proof Expectations

After ARGUS accepts the implementation, the hosted proof should verify:

- the second ordinary public persona route exists;
- owner/admin readback for the fixture says `signed_in_alpha`;
- signed-out anonymous chat POST for the fixture returns
  `public_persona_auth_required`;
- `station-replay-alpha-persona` still says `anonymous_alpha`;
- no owner id, persona id, source id, prompt, provider payload, credential,
  storage path, token, cookie, auth header, IP address, user agent, or raw row is
  exposed.
