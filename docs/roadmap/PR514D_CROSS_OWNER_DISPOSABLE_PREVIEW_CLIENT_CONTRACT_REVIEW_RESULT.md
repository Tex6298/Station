# PR514D - Cross-Owner Disposable Preview Client Contract ARGUS Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Reviewed implementation:

- `docs/roadmap/PR514D_CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_CONTRACT_DAEDALUS.md`
- `docs/roadmap/PR514D_CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_CONTRACT_RESULT.md`
- `docs/roadmap/PR514C_CONSENTED_CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_UX_PREFLIGHT_RESULT.md`
- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`
- `apps/web/lib/persona-encounter-contract.ts`
- `apps/web/lib/persona-encounter-contract.test.ts`

Result:

```text
ACCEPT_PR514D_CROSS_OWNER_DISPOSABLE_PREVIEW_CLIENT_CONTRACT
```

## Verdict

ARGUS accepts PR514D with one narrow review patch.

DAEDALUS implemented the participant-safe contract unblock requested after
PR514C: browser payloads no longer need participant persona ids, and the server
infers the actor-owned initiator and consented responder from the authenticated
participant and consent row.

## ARGUS Patch

ARGUS found one helper-copy honesty issue in the no-response web readback
fallback. Before a preview has run, the helper said:

```text
Runtime attempt audit recorded
```

That is true only after a successful response. ARGUS patched the fallback to
say:

```text
Runtime attempt audit required
```

Successful response readback still returns:

```text
Runtime attempt audit recorded
```

The patch also changes the fallback counterparty label from a generated-reply
claim to a future-tense boundary:

```text
Counterparty will not see a generated reply here
```

Focused tests now prove both the pre-run fallback labels and the successful
response labels.

## Boundary Findings

Accepted:

- the disposable preview route remains consent-scoped at
  `POST /persona-encounters/cross-owner-consents/:consentId/disposable-preview`;
- the POST body accepts only `setup` and optional bounded `maxOutputTokens`;
- strict schema validation rejects explicit or stale `initiatorPersonaId` and
  `responderPersonaId` fields before consent inference, audit, provider call, or
  token write;
- requester and counterparty actors each get server-inferred direction from the
  consent row;
- signed-out callers remain `401`;
- nonparticipants remain `404`;
- inactive, wrong-scope, and wrong-version consents fail closed before token
  writes;
- audit insertion failure still fails closed before provider call or token
  write;
- provider unavailable, quota, rate limit, provider failure, and empty reply
  paths remain bounded and audited;
- successful previews remain actor-only token-accounted and do not create
  counterparty token transactions;
- response/provider payload tests still exclude raw owner ids, raw persona ids,
  private persona material, provider secrets, bearer values, SQL details, and
  env details;
- web helper payloads contain only setup/options;
- web error copy is bounded and does not echo provider payloads, SQL details,
  token facts, bearer values, env values, or secret-shaped strings;
- owner-visible contract copy names only the approved private consent-scoped
  disposable preview exception and does not imply saved/shared output.

Still blocked:

- visible customer-facing UI;
- saved cross-owner private sessions;
- public cross-owner exhibits;
- generated-word excerpts, transcripts, summaries, share links, publication,
  and counterparty generated-word readback;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, migrations, provider config, broad Studio
  redesign, public routes, deployment, partner adapters, and webhook scope.

## Next Routing

ARGUS recommends MIMIR close PR514D locally and decide the next customer-facing
wiring/rehearsal lane using the accepted consent-scoped contract.

If MIMIR routes visible UI wiring next, the implementation must continue to:

- call only the consent-scoped preview helper;
- avoid raw participant persona ids in browser payloads;
- keep cross-owner preview controls visually separate from saved private
  sessions and public exhibit controls;
- show pending/ineligible/provider/quota/rate/provider-failure states with
  bounded copy;
- show successful output as exactly one private disposable response;
- keep "Runtime attempt audit recorded" only on successful response readback;
- avoid public surfacing, persistence, retrieval, generated-word sharing, and
  counterparty generated-word readback.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Implementation review | Pass | Reviewed PR514C blocker, PR514D handoff/result, API strict schema/inference, API tests, web helper contract, contract copy, and no-scope docs. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 58 tests passed, including consent-scoped request shape, requester/counterparty inference, strict body-id rejection, audit fail-closed behavior, provider/quota/rate/failure/empty outcomes, actor-only token accounting, privacy scans, and ARGUS fallback-label regression. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 205 tests passed, including cross-owner preview helper readback/error copy and updated encounter contract copy. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Staged path scan | Pass | Staged review changes are limited to cross-owner preview web helper/test updates plus PR514D review/status/testing docs. |
| Forbidden-path scan | Pass | No visible UI app/component route, package/lockfile, provider service, token service, operational cache, Supabase migration, Railway, Cloudflare, worker, queue, billing, Stripe, storage, or deploy-script paths changed. |
| Secret-shaped diff scan | Pass | No API-key, private-key, GitHub token, bearer-token-shaped, provider-key env, Railway token, or private-key block values found in the staged diff. |
| `git diff --check` | Pass | No unstaged whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
```
