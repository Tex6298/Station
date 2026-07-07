# PR502 - Owner Encounter Private-Context Provider Route Preflight

Owner: ARGUS / A3

Date: 2026-07-07

## Why This Opens

PR500D remains blocked on hosted social connector credential encryption config.
Do not keep the product lane idle on that external Railway variable.

PR501 closed the Discern companion/UI delta revalidation with no remaining safe
implementation slice. The next useful customer-facing Phase 3 move is to return
to a named feature that is already partially built but intentionally paused:
owner-initiated persona-to-persona encounter previews.

PR473 closed safely at this exact blocker:

```text
hosted private-context encounter preview has no accepted provider route configured
```

The code currently keeps the encounter preview provider resolver on:

```text
allowPlatformNvidia: false
```

That was correct while provider policy was unsettled. Now ARGUS should decide
whether DAEDALUS may open the smallest explicit provider-route gate for owner
encounter previews, or whether the feature must remain paused.

## Preflight Question

Can Station open:

```text
PR502A - Owner Encounter Explicit Provider Route Gate
```

as a narrow implementation lane that lets the existing owner-only disposable
encounter preview use an accepted private-context platform route when explicitly
configured?

## Recommended Smallest Shape For PR502A

If accepted, prefer an explicit route-specific opt-in rather than silently
broadening all private provider policy:

- add a non-secret env flag such as
  `PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT`;
- keep the default fail-closed when the flag is absent or false;
- pass `allowPlatformNvidia: true` to `resolveChatProviderRuntimeRoute(...)`
  only for `/persona-encounters/preview` and
  `/persona-encounters/preview/readiness` when that flag is explicitly true;
- require the existing platform NVIDIA config to be present before readiness is
  true;
- keep existing BYOK and accepted non-NVIDIA platform routes working as before;
- return bounded readiness copy and provider-policy classification when the
  route is still blocked;
- optionally expose only boolean/non-secret readiness readback if needed for
  hosted proof.

This should not use Gemini embeddings. Embedding provider choice is irrelevant
to owner encounter generation because PR473 forbids source retrieval, vector
lookup, Memory, Archive, Canon, Continuity, Integrity, or transcript sources in
this slice.

## Boundaries To Preserve

PR502A must not add:

- cross-owner encounters;
- autonomous/background encounters;
- scheduled encounters;
- multi-turn loops;
- automatic retries;
- durable encounter transcripts;
- conversations or `conversation_messages` writes;
- archive, memory, canon, continuity, integrity, source retrieval, vector, or
  embedding calls;
- public/shareable encounter pages;
- anonymous encounter controls;
- public route controls or availability claims;
- provider/model picker UI;
- BYOK storage changes;
- social publishing, social credentials, or PR500D work;
- billing, Stripe, Redis, Cloudflare, workers, queues, schema, migrations,
  storage, or broad UI redesign.

## ARGUS Checks

ARGUS should inspect at minimum:

- `docs/roadmap/PR473_OWNER_INITIATED_ENCOUNTER_RUNTIME_CLOSEOUT.md`;
- `docs/roadmap/PR473B_OWNER_ENCOUNTER_PROVIDER_AVAILABILITY_REPAIR_REVIEW_RESULT.md`;
- `docs/roadmap/PR473B_OWNER_ENCOUNTER_PROVIDER_AVAILABILITY_REPAIR_HOSTED_RERUN_RESULT.md`;
- `apps/api/src/routes/persona-encounters.ts`;
- `packages/ai/src/providers/router.ts`;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/components/studio/persona-workspace.tsx`.

Answer one of:

```text
ACCEPT_PR502A_OWNER_ENCOUNTER_EXPLICIT_PROVIDER_ROUTE_GATE
```

Include the exact accepted implementation scope, test list, and any hosted
config/readiness proof needed before ARIADNE reruns the owner encounter
generation rehearsal.

```text
BLOCK_PR502_WITH_CONCRETE_REASON
```

Name the smallest blocker-removal lane. Do not block vaguely on "provider
policy"; identify the exact missing decision, config, route, or safety proof.

## Expected Validation If Accepted

DAEDALUS should at minimum prove:

- env flag absent/false plus NVIDIA configured returns paused readiness with
  provider-policy classification and no provider call;
- env flag true plus NVIDIA configured can return ready through the same
  readiness resolver without exposing keys, raw base URLs, or secrets;
- generation still verifies both personas are same-owner before provider
  resolution or provider calls;
- cross-owner ids fail before provider calls, token rows, rate-limit increments,
  or durable writes;
- BYOK accepted routes still behave as before;
- generation returns only one disposable responder reply;
- no prompt/output text is persisted;
- no conversations, messages, archive, memory, canon, continuity, integrity, or
  public/shareable rows are inserted;
- public persona/public Space samples remain free of encounter controls or
  availability claims.

Suggested commands:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/persona-encounters.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-runtime.test.ts
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

ARGUS should also require diff-only scans for provider-policy drift, public
encounter drift, durable persistence, and secret-shaped values.

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- MIMIR parked PR500D as an external Railway social credential config blocker.
- PR501 closed with no remaining safe Discern companion/UI delta.
- PR473 already built owner encounter preview but hosted generation is paused
  because private-context provider routing is not accepted.
Task:
- Run PR502 hostile preflight.
- Decide whether DAEDALUS may implement PR502A as an explicit owner-encounter
  private-context provider route gate.
- If accepted, specify exact scope and tests.
- If blocked, name the smallest concrete unblock lane.
```
