# PR436 - Hosted Non-NVIDIA Staged Replay Result

Date: 2026-06-28

Reviewer: ARIADNE / A4

Status: complete - config-blocked

## Verdict

```text
BLOCKED: CONFIG_NON_NVIDIA_ROUTE_MISSING
```

The hosted staged replay reached the PR435 runtime guard and failed closed on
the private chat turn because the replay environment did not expose an accepted
non-NVIDIA private provider route.

## Deployment Gate

Hosted deployment freshness passed before private replay actions:

| Surface | Result | Service | Runtime commit |
| --- | --- | --- | --- |
| Web `/health/deployment` | HTTP 200 | `@station/web` | `8ea44d01` |
| API `/health/deployment` | HTTP 200 | `@station/api` | `8ea44d01` |

The API served PR435 runtime commit `8ea44d01`, so the private-chat guard was
eligible for rehearsal.

## Product Path

- Signed in through the hosted product UI as the replay owner.
- Opened Studio and the Station Replay Persona route.
- Confirmed the owner-visible replay context surfaces were available:
  - canon records: 4;
  - memory records: 4;
  - Integrity Session records: 1;
  - archive records: 4;
  - continuity records: 4;
  - selected replay sources: 17.
- The replay context used Gemini embeddings on `station_free_1536`.
- Sent one private staged replay chat prompt through the hosted UI.

No credentials, screenshots, copied private source bodies, raw trace payloads,
or raw trace identifiers are included in this committed evidence.

## Chat And Trace Result

The private chat prompt persisted, but no assistant response persisted. The
owner-visible trace failed closed with:

```text
nvidia_platform_blocked_private_context
```

The relevant owner-visible event labels were:

- `Chat runtime budget assembled`
- `Persona chat provider configuration missing`

No private chat turn reached `nvidia_openai_compatible`. This matches the PR435
policy posture: private replay must use an accepted non-NVIDIA route, owner BYOK
where intentionally configured, or fail closed.

## Privacy Notes

- The committed evidence excludes the prompt body, source bodies, provider
  payloads, trace identifiers, conversation identifiers, persona identifiers,
  owner identifiers, and credentials.
- The local trace-detail scan found no prompt marker, secret-shaped values, or
  private body labels in the inspected owner-visible trace detail.
- The local probe flagged an owner trace identifier field in the trace-detail
  response; it was not copied into docs and was not observed as a public or
  non-owner exposure.
- No billing, provider config, Redis, Cloudflare, Supabase schema, migration,
  worker, queue, embedding, vector, or replay seed state was mutated.

## MIMIR Ask

MIMIR should decide whether this config-blocked result is sufficient proof of
the PR435 fail-closed posture, or whether the hosted replay account should be
rerun after one of these is intentionally configured:

- an accepted non-NVIDIA platform provider route;
- owner BYOK for the replay account.

## Validation

- `git diff --check`: passed with line-ending normalization warnings only.
- Typecheck: not run; this was a docs/state rehearsal result with no imports or
  scripts touched.
