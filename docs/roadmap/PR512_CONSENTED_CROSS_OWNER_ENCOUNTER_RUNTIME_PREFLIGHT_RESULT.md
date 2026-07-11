# PR512 - Consented Cross-Owner Encounter Runtime Preflight Result

Owner: ARGUS / A3

Date: 2026-07-11

Source:
`docs/roadmap/PR512_CONSENTED_CROSS_OWNER_ENCOUNTER_RUNTIME_PREFLIGHT_ARGUS.md`

Result:

```text
ACCEPT_PR512A_CROSS_OWNER_CONTEXT_CONTRACT_ONLY
```

## Verdict

ARGUS does not accept the proposed provider-backed disposable cross-owner
preview as the next lane.

ARGUS accepts the smaller unblock lane:

```text
PR512A - Cross-Owner Runtime Context Contract Only
Owner: DAEDALUS / A2
```

The concrete blocker for the proposed runtime slice is:

```text
CROSS_OWNER_RUNTIME_CONTEXT_BOUNDARY_MISSING
```

PR511B proves the hosted bilateral consent ledger, participant readback, audit,
signed-out/nonparticipant fail-closed behavior, non-executable scope readback,
and no public/runtime drift. It does not prove what private persona material may
be assembled for a provider call when two owners are involved.

## Why Runtime Stays Blocked

The current same-owner preview path is intentionally owner-scoped. It loads both
personas through `loadOwnedEncounterPersona`, then builds the provider prompt
from both persona profiles.

That prompt includes:

- `short_description`;
- `long_description`;
- `awakening_prompt`;
- `style_notes`;
- owner-authored setup;
- a single model-generated responder reply;
- token accounting against the current owner with `chatId: null`.

That shape is acceptable only because the same owner controls both personas. A
cross-owner preview would place another owner's private persona setup material
into a provider payload initiated by a different owner before Station has a
clear, tested contract for what is shared, what is withheld, what is visible to
the initiator, and what is visible to the counterparty.

The approved consent row plus `run_cross_owner_encounter` is enough to prove
bilateral intent to explore runtime. It is not enough, by itself, to authorize
the existing same-owner prompt/context shape for cross-owner provider execution.

## Direct Preflight Answers

1. Approved ledger consent plus `run_cross_owner_encounter` is not enough for a
   provider-backed disposable preview until Station defines the cross-owner
   runtime context boundary.
2. A separate durable runtime-consent execution record is not required before a
   context-contract-only lane. A later provider-backed runtime lane must have
   bounded runtime attempt audit/readback before and after the provider call.
3. Future preview initiation may allow either approved participant, but the
   actor must own the supplied `initiatorPersonaId`; the responder must be the
   other participant persona. No owner may initiate while acting as the other
   owner's persona.
4. Future runtime must require explicit `consentId`, `initiatorPersonaId`, and
   `responderPersonaId`. It must not silently select an active consent by pair.
5. Required pre-provider checks are: authenticated actor is a participant,
   consent id exists for that participant, status is `approved`, scope version is
   the current accepted version, requested scopes include
   `run_cross_owner_encounter`, the supplied persona ids match the consent
   parties, the actor owns the initiator persona, the responder is the other
   participant persona, and generic ledger readback still stays non-executable.
6. The existing same-owner preview prompt/context shape must not be reused
   directly for cross-owner runtime.
7. Cross-owner context assembly must be its own contract first. Do not add
   memory, canon, archive, continuity, transcript, source retrieval, embedding,
   or retrieval behavior in PR512A.
8. A later disposable preview may let the initiating owner see exactly one
   generated responder reply only after the contract says this is permitted and
   labels it as disposable, private to the requesting participant, not saved, not
   a transcript, not shareable, and not publishable.
9. The counterparty owner should receive only bounded runtime attempt metadata
   unless a later lane adds explicit generated-word readback or persistence
   consent. PR512A must not store generated words.
10. Initiator-only token accounting is acceptable for a later preview if it uses
    the existing preview accounting shape, records no prompt/output text in token
    metadata, and does not change Stripe, billing, entitlement, package, or
    quota policy. PR512A itself must not create token rows.
11. Tests must prove no writes to private sessions, public exhibits,
    moderation reports, memory, canon, archive, continuity, export packages,
    jobs, storage, public rows, or token transactions.
12. ARIADNE hosted proof is not required for a pure helper/docs-only contract.
    If DAEDALUS adds an authenticated API readback endpoint, ARIADNE must run a
    hosted API/data proof after ARGUS review. Browser proof is required only if
    visible UI changes.

## Accepted PR512A Scope

DAEDALUS may implement a readback-only cross-owner runtime context contract.

Allowed implementation shape:

- add a server-side contract helper and tests in the persona encounter API;
- optionally add an authenticated, participant-only readback route under
  `/persona-encounters/cross-owner-consents/:consentId/...`;
- require `consentId`, `initiatorPersonaId`, and `responderPersonaId`;
- return `404` for nonparticipants without row inference;
- return bounded participant-visible ineligible states for pending, rejected,
  cancelled, revoked, wrong-scope, wrong-version, wrong-pair, or wrong-role
  cases;
- preserve the existing generic consent serializer with all requested scopes
  still `executable: false`;
- expose only safe display/readiness facts and a named contract schema, such as
  `station.persona_encounter.cross_owner_runtime_context_contract.v1`;
- define the denied context classes explicitly:
  `long_description`, `awakening_prompt`, `style_notes`, private memory, canon,
  archive, continuity, transcripts, source bodies, provider payloads, provider
  config, raw owner ids, raw persona ids, traces, storage paths, and generated
  words;
- define future runtime attempt audit fields as bounded metadata only.

PR512A must not:

- call a provider;
- create, preview, persist, or return generated cross-owner words;
- record token usage or token transactions;
- create private sessions, public exhibits, reports, memory, canon, archive,
  continuity records, exports, jobs, queues, storage objects, or public rows;
- add publication, save, excerpt, transcript, summary, metadata sharing, Salon,
  community, Discover/search/feed, Station Press, public persona, or public Space
  surfacing;
- add model/provider selection, embeddings, retrieval, Redis, Cloudflare,
  workers, queues, Stripe, billing, entitlement, package, lockfile, deployment,
  webhook, or broad UI changes.

Allowed files:

- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/web/lib/persona-encounter-runtime.ts` only if a route helper/path builder
  is necessary;
- `apps/web/lib/persona-encounter-runtime.test.ts` only if that helper changes;
- roadmap/status/testing docs.

No migration is accepted for PR512A unless MIMIR explicitly reopens scope.

## Required PR512A Validation

DAEDALUS must run:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
```

Required test coverage:

- approved exact consent and `run_cross_owner_encounter` can produce contract
  readback, not runtime execution;
- pending, rejected, cancelled, revoked, wrong-scope, wrong-version, wrong-pair,
  and wrong-role cases fail closed;
- nonparticipants get `404`/empty readback without row inference;
- actor must own the initiator persona;
- generic ledger readback remains `executable: false`;
- provider is never called;
- token transactions are never recorded;
- private sessions, public exhibits, reports, memory, canon, archive,
  continuity, export, jobs, storage, and public-surfacing tables are unchanged;
- response/readback excludes raw owner ids, raw persona ids, private prompts,
  private profile fields, provider payloads, generated words, traces, SQL detail,
  env values, cookies, bearer values, and secret-shaped strings.

ARIADNE follow-up:

- if PR512A includes an authenticated API readback route, run hosted API/data
  proof after ARGUS acceptance;
- browser proof is required only if PR512A changes visible web UI;
- no hosted provider-generation proof belongs to PR512A.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Repo evidence review | Pass | Reviewed PR512 packet, PR511B hosted proof, PR511A ARGUS review, same-owner preview route, same-owner private session/public exhibit preflights, and current encounter tests. |
| Current context boundary review | Pass | Found same-owner preview sends bounded persona profile notes for both personas to the provider; this is owner-safe only while both personas belong to the caller. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 43 tests passed, including cross-owner-before-provider, non-executable consent, no side-effect, same-owner preview, private session, public exhibit, and Studio runtime helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; public exhibit report/takedown behavior remains green. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 tests passed; owner encounter helper/readiness/runtime/public exhibit copy remains bounded. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Staged path scan | Pass | Staged changes are limited to PR512 result/status/testing docs. |
| Secret-shaped diff scan | Pass | No API-key, private-key, GitHub token, bearer-token-shaped, provider-key env, Railway token, or private-key block values found in the staged diff. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
