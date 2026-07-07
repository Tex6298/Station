# PR502A - Owner Encounter Explicit Provider Route Gate Result

Owner: DAEDALUS / A2

Reviewer: ARGUS / A3

Date: 2026-07-07

Status: Ready for ARGUS review

Result:

```text
READY_FOR_ARGUS_REVIEW
```

## Summary

DAEDALUS implemented the default-false, route-specific NVIDIA private-context
gate for the existing owner-only disposable persona encounter preview:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true
```

The gate is used only by:

- `GET /persona-encounters/preview/readiness`;
- `POST /persona-encounters/preview`.

Both routes still load the selected personas as same-owner rows before provider
resolution. The shared provider router was not changed.

## Implementation

- `apps/api/src/routes/persona-encounters.ts` now passes
  `allowPlatformNvidia: true` to the provider router only when
  `PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT` is exactly `true`.
- Absent, empty, `false`, uppercase, whitespace-padded, and other non-`true`
  values remain blocked when only NVIDIA is configured.
- Readiness with the exact opt-in can report ready without provider calls,
  token accounting, rate-limit increments, or durable writes.
- Generation with the exact opt-in can produce one disposable responder reply
  for same-owner personas and records only the already accepted token usage
  shape with `chat_id: null`.
- Owner BYOK OpenAI and existing non-NVIDIA platform DeepSeek routes continue
  to behave as accepted.

## Boundaries Held

- No `packages/ai/src/providers/router.ts` or broad provider policy change.
- No public encounter, anonymous encounter, shareable page, public route
  control, or availability claim.
- No prompt/output transcript persistence.
- No conversations, messages, archive, memory, canon, continuity, integrity,
  document, thread, comment, moderation, vector, embedding, source retrieval,
  queue, worker, Redis, Cloudflare, billing, schema, migration, package, or
  lockfile change.
- No social publishing, social credential, PR500D, Stripe, UI, Railway, or
  Supabase change.
- No provider key, raw base URL, model label, owner id, raw persona id, env
  value, or secret-shaped material is returned in readiness or generation
  responses.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/persona-encounters.test.ts` | Pass | 13 API encounter tests passed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-runtime.test.ts` | Pass | 6 web runtime tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 19 combined encounter tests passed after package builds. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 190 Studio UI tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo typecheck passed. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors before docs/result staging. |
| Changed-path scan | Pass | Only `apps/api/src/routes/persona-encounters.ts` and `apps/api/src/routes/persona-encounters.test.ts` changed before docs. |
| Provider-policy scan | Reviewed | Matches were the route-local env gate and expected NVIDIA test fixtures only; no shared router change. |
| Public encounter scan | Reviewed | No public encounter implementation drift; matches were file headers/test names only. |
| Durable/source retrieval scan | Reviewed | Matches were no-durable-write assertions and test copy only; no implementation writes. |
| Secret-shaped diff scan | Reviewed | Matches were env/test fixture names and negative non-leak assertions only; no real secret values. |

## Handoff

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR502A as a default-false owner encounter route gate.
- Only PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true opts the existing owner-only disposable preview into platform NVIDIA.
- Same-owner persona loading still happens before provider resolution; the shared provider router was not changed.
Risk:
- Review that this did not broaden private NVIDIA provider policy, public encounters, persistence, source retrieval, or UI.
Validation:
- API encounter test passed: 13 tests.
- Web runtime test passed: 6 tests.
- test:persona-encounters passed: 19 tests.
- test:studio-ui passed: 190 tests.
- typecheck and diff checks passed.
- Drift and secret-shaped scans were reviewed with only expected test markers.
Task:
- Review PR502A implementation and either accept by waking MIMIR or send fixes back to DAEDALUS.
Status: READY_FOR_ARGUS_REVIEW
```
