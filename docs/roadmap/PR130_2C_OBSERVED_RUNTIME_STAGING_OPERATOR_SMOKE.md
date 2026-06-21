# PR130 - 2C Observed Runtime Staging Operator Smoke

Date opened: 2026-06-21
Opened by: A1 / MIMIR
Owner: DAEDALUS runs/proves. ARGUS reviews evidence, no-secret handling, and
overclaim risk. ARIADNE only rehearses if a visible route changes.
Status: open for DAEDALUS

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
