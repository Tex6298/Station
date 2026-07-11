# PR515A - Cross-Owner Consent Counterparty Selection Contract ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Reviewed implementation:

- `docs/roadmap/PR515A_CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT_DAEDALUS.md`
- `docs/roadmap/PR515A_CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT_RESULT.md`
- `docs/roadmap/PR515_CROSS_OWNER_CONSENT_INVITATION_UI_PREFLIGHT_RESULT.md`
- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`
- `docs/testing/VALIDATION_BASELINE.md`

Result:

```text
ACCEPT_PR515A_CROSS_OWNER_CONSENT_COUNTERPARTY_SELECTION_CONTRACT
```

## Verdict

ARGUS accepts PR515A without a review patch.

DAEDALUS added the missing safe counterparty selection/create contract. A later
visible PR515 invitation UI can now resolve a public counterparty by safe public
slug or `/personas/:slug` href and create the consent invitation through the
new public-slug route, without submitting a raw counterparty persona UUID or
owner id from browser code.

The old raw-id create route remains for the existing API surface. Visible PR515
UI must use the new public-slug contract:

```text
GET /persona-encounters/cross-owner-consent-targets/:publicSlug
POST /persona-encounters/cross-owner-consents/from-public-persona
```

## Boundary Findings

Accepted:

- target lookup requires auth and rejects unsafe or UUID-shaped public slugs
  before target lookup;
- target lookup resolves only public personas with safe public slugs and
  owner-tier eligibility;
- target lookup returns only public display name, short public description,
  sanitized avatar URL, safe public slug, route href, eligibility, and
  provenance labels;
- target lookup does not serialize raw persona ids, raw owner ids, private
  profile fields, provider payloads, token facts, SQL details, prompts, or
  generated words;
- public-slug create validates a strict body containing requester persona id,
  counterparty public slug, and bounded requested scopes only;
- strict body validation rejects `counterpartyPersonaId`, forged owner fields,
  provider payload fields, and other unexpected fields before writes;
- create verifies the requester persona belongs to the current owner;
- create resolves the counterparty server-side from the safe public slug;
- private, unavailable, ineligible-owner, stale, and same-owner targets fail
  closed before consent writes;
- successful create reuses the existing consent ledger RPC, audit rows, scope
  bounds, participant readback, and non-executable ledger semantics;
- success readback includes consent participant display snapshots and public
  target readback, not raw owner/persona ids;
- web helpers normalize safe bare slugs and `/personas/:slug` hrefs, reject
  nested paths and UUID-shaped slugs, and build target/create payloads without
  counterparty persona ids or owner ids;
- invitation error copy ignores untrusted server messages and stays bounded;
- no visible invitation UI was added in PR515A.

Still blocked until a later MIMIR-routed UI lane:

- saved cross-owner private sessions;
- public cross-owner exhibits;
- generated-word sharing, excerpts, transcripts, summaries, share links,
  publication, and counterparty generated-word readback;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, migrations, provider config, public
  surfacing, partner adapters, webhooks, hosted-runtime scope, and broad Studio
  redesign.

## UI Unblock Guidance

PR515A safely unblocks a visible invitation/inbox lane if that lane stays inside
these constraints:

- use the new public-slug target/create contract for invitation creation;
- do not use the legacy raw-id `POST /persona-encounters/cross-owner-consents`
  route from browser-facing invitation UI;
- use existing participant-scoped list/detail/approve/reject/cancel/revoke
  routes for already-visible consent rows;
- keep invitation and approval copy ledger-only and non-executable by default;
- do not imply saved sessions, public exhibits, generated-word sharing,
  transcripts, summaries, excerpts, retrieval, publication, or public
  surfacing;
- keep same-owner saved private artifact and public exhibit controls visually
  separate from cross-owner consent controls.

Recommended next lane for MIMIR to consider:

```text
PR515B - Cross-Owner Consent Invitation and Inbox UI
Owner: DAEDALUS / A2
```

Suggested PR515B scope:

- owner-only Studio or dedicated consent screen;
- target lookup by safe public persona slug/href;
- invitation create through
  `/persona-encounters/cross-owner-consents/from-public-persona`;
- participant consent inbox/list using existing consent readback;
- approve/reject/cancel/revoke actions using existing participant routes;
- focused web tests proving no raw counterparty persona ids or owner ids enter
  visible UI payload/readback.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hostile implementation review | Pass | Reviewed PR515A handoff/result, preflight blocker, API routes, serializers, helper contract, focused tests, and validation docs. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 64 tests passed, including public-slug target/create coverage, unsafe/private/ineligible/stale/same-owner rejection, strict raw-id body rejection, no forbidden readback scans, and existing consent/runtime/session/exhibit boundaries. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 209 tests passed, including public-slug helper coverage and existing Studio cross-owner panel source guards. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| `git diff --check` | Pass | No whitespace errors. |
| Implementation path scan | Pass | PR515A touched route/helper/tests/status docs and agent state only; no infra, migration, package/lockfile, billing, queue, worker, storage, Cloudflare, Railway, Stripe, or deployment paths changed. |
| Secret-shaped diff scan | Pass | No API-key, private-key, GitHub token, bearer-token-shaped, JWT-shaped, provider-key env, Railway token, or private-key block values found in the implementation diff. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
