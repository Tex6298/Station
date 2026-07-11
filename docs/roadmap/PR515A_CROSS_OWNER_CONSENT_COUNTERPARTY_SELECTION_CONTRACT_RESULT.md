# PR515A - Cross-Owner Consent Counterparty Selection Contract Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-11

State:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the smallest safe selector/create contract for
cross-owner consent invitations.

The browser no longer needs to submit a raw counterparty persona UUID to create
a cross-owner consent invitation. It can resolve an eligible public persona by
safe public slug or href, then create the invitation through a public-slug
contract.

## Implementation

Added authenticated API routes in `apps/api/src/routes/persona-encounters.ts`:

- `GET /persona-encounters/cross-owner-consent-targets/:publicSlug`
- `POST /persona-encounters/cross-owner-consents/from-public-persona`

The target route returns only public-safe selection readback:

- persona display name;
- short public description;
- sanitized avatar URL;
- safe public slug;
- public route href;
- explicit eligibility and provenance labels.

The create route:

- accepts `requesterPersonaId`, safe `counterpartyPublicSlug`, and bounded
  requested scopes;
- rejects unsafe or UUID-shaped slugs before target lookup;
- rejects private, unavailable, ineligible-owner, stale, and same-owner
  targets before consent writes;
- verifies requester persona ownership before writes;
- uses the existing consent ledger RPC, audit rows, scope bounds, participant
  readback, and state transition behavior;
- does not add generated output, sessions, exhibits, retrieval, storage, or
  public surfacing.

The existing raw-id create route remains unchanged for the current API surface,
but the new browser-facing contract gives PR515 UI a safe invitation path.

Added web helper contract in `apps/web/lib/persona-encounter-runtime.ts`:

- public target path builder;
- public slug/href normalizer;
- public-slug create payload builder;
- typed target/create responses;
- bounded error copy for invalid, unavailable, same-owner, requester-not-owned,
  load, save, and generic failures.

## Tests

Focused API coverage now proves:

- authenticated public targets resolve by safe slug;
- create by public slug writes the existing consent/audit rows;
- response readback does not expose raw owner ids, raw persona ids, raw DB
  field names, private persona fields, provider payloads, token facts, bearer
  values, SQL details, or generated words;
- anonymous target lookup is blocked;
- UUID-shaped and unsafe slugs are rejected;
- strict create body rejects raw counterparty ids and forged owner/provider
  fields;
- private, ineligible-owner, missing-requester, stale, and same-owner targets
  fail closed before writes;
- failed target cases do not create consent rows, audit rows, provider calls,
  private sessions, public exhibits, reports, token rows, runtime attempts, or
  generated messages.

Focused web coverage now proves:

- safe public slugs are derived from bare slugs and `/personas/:slug` hrefs;
- nested paths, UUID-shaped slugs, and unsafe slugs return `null`;
- target/create helpers do not include `counterpartyPersonaId`, owner ids, raw
  DB owner fields, or provider payloads;
- error copy ignores untrusted server messages and stays bounded.

The persona-encounter test harness was also tightened to honor Supabase
`select(..., { count, head })` behavior so public-persona tier eligibility is
tested against real filtered counts.

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## Non-Scope Preserved

No visible invitation UI was added.

No saved cross-owner sessions, public cross-owner exhibits, generated-word
excerpts, transcripts, summaries, share links, publication, counterparty
generated-word readback, Memory, Canon, Archive, Continuity, Integrity,
retrieval, export, storage, billing, Redis, Cloudflare, workers, provider
config, broad Studio redesign, public routes, migrations, or deployment work
was added.

## Handoff

ARGUS should hostile-review whether this contract safely unblocks PR515 visible
invitation UI.

Review focus:

- browser-facing create no longer requires raw counterparty persona UUIDs;
- target readback stays public-only and participant-safe;
- unsafe, private, ineligible, stale, missing-requester, and same-owner cases
  fail closed before writes;
- existing consent ledger, audit, scopes, participant readback, and state
  transitions are preserved;
- no generated-word, saved-session, public-exhibit, retrieval, storage,
  billing, provider, or public-surfacing drift entered PR515A.

Wakeup:

```text
WAKEUP A3:
Codename: ARGUS
```
