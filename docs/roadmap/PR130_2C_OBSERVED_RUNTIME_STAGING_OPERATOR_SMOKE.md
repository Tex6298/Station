# PR130 - 2C Observed Runtime Staging Operator Smoke

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS runs/proves. ARGUS reviews evidence, no-secret handling, and
overclaim risk. ARIADNE only rehearses if a visible route changes.
Status: blocked by missing required smoke config; ready for MIMIR decision

## Why This Lane

ARGUS accepted PR129 and recommended the next lane: a narrow staging/operator
smoke proof using the PR128 operator packet with configured dev/staging values,
recording only non-secret request categories, response classes, and pass/fail
evidence.

This is a proof lane, not a new product feature. It should show whether the
observed-runtime webhook foundation can be operated from the committed packet.

## Scope

- Use the PR128 operator packet and existing committed docs/examples.
- Prefer configured local `.env` or staging environment variables if present.
  Do not print values.
- Prove the smoke flow with non-secret evidence only:
  - target API class, not secret URL details if sensitive;
  - whether required env names are present/missing;
  - request category sent;
  - response class such as accepted, replayed, retryable/in-progress, conflict,
    auth/signature/config failure;
  - whether no secret values were printed or committed.
- If values are missing, record the exact missing env names and wake MIMIR with
  the blocker. Do not ask Marty for values in the middle of the lane unless the
  blocker is concrete and unavoidable.
- If the packet or client fails despite config being present, fix the narrow
  code/docs defect and wake ARGUS.
- Update the PR128/observed-runtime docs only if the run exposes a gap in the
  operator instructions.

## Non-Scope

- No hosted runtime, Cloudflare Worker/Vectorize/D1, worker, queue, scheduler,
  partner adapter, public onboarding wizard, visible secret-management UI,
  user-pasted secret flow, vault UI, billing/Stripe, Redis memory truth,
  provider routing, chat-native developer agent, broad UI, production partner
  claim, or committed secret values.
- No printing `.env` values, Railway variables, Supabase secrets, Developer
  Space keys, webhook signing secrets, raw private payloads, cookies, bearer
  tokens, or credentials.
- No live Cloudflare/deployment dependency work unless MIMIR opens that lane
  after this proof.

## Acceptance

- The operator packet is either proven runnable against configured dev/staging
  values, or the exact missing config/blocker is recorded without secrets.
- Evidence includes response classes and pass/fail categories, not raw secrets
  or private payloads.
- Any committed doc updates improve operator accuracy without broadening scope.
- If code changes are needed, focused tests remain green.

## DAEDALUS Proof Result

DAEDALUS ran the non-secret config inventory on 2026-06-21 before sending any
webhook request.

Command/proof path:

- Checked process environment and root local `.env` for the PR128 smoke env
  names.
- Excluded `.env.example` because it is a placeholder file, not configured
  local or staging values.
- Printed env-name presence/missing status only; no values were printed.

Required env inventory:

| Env name | Result |
| --- | --- |
| `STATION_API_URL` | Missing |
| `STATION_DEVELOPER_KEY` | Missing |
| `STATION_OBSERVED_RUNTIME_WEBHOOK_ID` | Missing |

Optional env inventory:

| Env name | Result |
| --- | --- |
| `STATION_OBSERVED_RUNTIME_SIGNING_SECRET` | Missing |
| `STATION_OBSERVED_RUNTIME_SOURCE_ID` | Missing |
| `STATION_OBSERVED_RUNTIME_PAYLOAD_PATH` | Missing |

Smoke result:

- Target API class: blocked before target selection because `STATION_API_URL`
  is missing.
- Request category: no request sent.
- Response class: blocked by missing required config.
- Runnable result: blocked until the required env names above are configured in
  process env or local/staging `.env`.
- No-secret proof: the inventory printed only env names and presence/missing
  categories; no `.env` values, URLs, keys, signing secrets, private payloads,
  cookies, bearer tokens, or credentials were printed or committed.
- Files touched: this PR130 status document, `ACTIVE_STATUS.md`, and
  `VALIDATION_BASELINE.md`.

## Validation

Run the narrow gates appropriate to the outcome:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- --filter @station/developer-space-client build
git diff --check
```

If API behavior changes, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- --filter @station/api build
npm exec --yes pnpm@10.32.1 -- run typecheck
```

DAEDALUS validation for the blocked config outcome:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 7 tests passed; PR128 packet helpers remain green. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/developer-space-client build` | Pass | Client package build completed. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## Handoff

Wake ARGUS with:

- exact command/proof path used, without secret values;
- env-name presence/missing inventory, without values;
- response class evidence;
- whether the smoke was runnable or blocked;
- files touched, if any;
- validation results;
- no-secret proof and non-claims.

If blocked by missing config, wake MIMIR with the exact missing env names and no
secret values.

## MIMIR Decision - 2026-06-21

MIMIR defers PR130 until deliberate smoke config exists.

Reason:

- `STATION_API_URL`, `STATION_DEVELOPER_KEY`, and
  `STATION_OBSERVED_RUNTIME_WEBHOOK_ID` are not configured under the names the
  PR128 operator packet expects.
- Local `.env` contains API URL aliases and replay owner credentials, but not a
  raw Developer Space ingestion key or smoke webhook id.
- Existing API routes can generate a new ingestion key, but generating one for
  an existing Developer Space rotates/revokes prior active keys. MIMIR will not
  mutate or rotate a real integration key just to make a smoke proof pass.

PR130 remains the correct next operator proof once an intentionally scoped smoke
key/webhook id exists. Until then, continue with config-free adapter discovery
so the team can determine what external runtime/Cloudflare dependency actually
needs to connect to this foundation.

## PR135 Smoke-Key Update - 2026-06-21

PR135 adds a safer setup path for this lane:

- create or select a dedicated smoke Developer Space;
- create a named ingestion key labelled for smoke/operator use through
  `POST /developer-spaces/:id/ingestion-keys`;
- copy the one-time raw key from that create response into the external sender
  environment as `STATION_DEVELOPER_KEY`;
- keep `STATION_DEVELOPER_KEY` out of general Station app/backend env;
- use `STATION_API_URL` as the target app URL;
- use `STATION_OBSERVED_RUNTIME_WEBHOOK_ID` as the delivery/idempotency value;
- use `STATION_OBSERVED_RUNTIME_SIGNING_SECRET` only when the target Developer
  Space has an active dedicated observed-runtime signing secret;
- do not rotate real integration keys for smoke.
