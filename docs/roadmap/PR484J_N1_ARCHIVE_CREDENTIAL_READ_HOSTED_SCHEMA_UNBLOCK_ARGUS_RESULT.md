# PR484J-N1 - Archive Credential Read Hosted Schema Unblock ARGUS Result

Owner: ARGUS / A3

Reviewed commit: `c8bceb1df006da3a29d248d0fe7a742e7227c627`

Date completed: 2026-07-15

Status:

```text
ACCEPT_PR484J_N1_ARCHIVE_CREDENTIAL_READ_HOSTED_SCHEMA_UNBLOCK_WITH_EVIDENCE_CORRECTION
```

## Verdict

ARGUS accepts the exact hosted migrations `062` and `063`, their durable ledger
and catalog state, owner/RLS boundary, safe empty credential readback, and zero
credential/OAuth/product-row result. Independent read-only proof confirms web
and API were both healthy on `main` at the exact reviewed SHA
`c8bceb1df006da3a29d248d0fe7a742e7227c627`.

One submitted evidence claim required correction. DAEDALUS loaded
`/studio/archive`, but the Archive connector panel is mounted only on the
persona route `/studio/personas/:id/files`. The global route therefore could
not prove the requested UI credential read. ARGUS corrected the submitted
result instead of preserving that overclaim, then independently exercised the
correct persona Archive route. It issued one credentials GET at `200`, rendered
the safe missing-credential and setup-disabled state, and produced zero failed
API responses, product writes, page errors, or console errors.

This is an evidence correction, not a product blocker. The direct and correct
UI read paths both pass after the schema apply.

## Independent Hosted Review

ARGUS used GET-only HTTP checks, an existing replay-owner authentication session,
and PostgreSQL transactions opened read-only and rolled back. Output contained
only statuses, booleans, aggregate counts, accepted object counts, and the public
deployment SHA. No URL, connection string, key, password, token, cookie, private
id, raw response body, SQL row, hash field, provider payload, or hosted log was
printed or committed.

| Check | Independent ARGUS result |
| --- | --- |
| Deployment identity | Web/API HTTP `200`, `ok:true`, `ready:true`, branch `main`, expected service names, shared exact SHA `c8bceb1d...` |
| Migration `062` hash | `B5547424906F78FD6B24499900020851B100F9E304A202A9F6FEB9711427DAF5` |
| Migration `063` hash | `92727C29AC21B3F6847131F7EE3A895428DFA7087008B7FB9A9F5F3D73330A60` |
| Ledger | Exactly one row and one distinct version for each exact `062`/`063` name |
| Later migration ledger | `064` through `067` names remain absent |
| Columns | Credentials `15/15`; OAuth states `13/13` |
| Constraints | Credentials `6`; OAuth states `7`, including owner cascade FKs and accepted checks |
| Indexes | Credentials `3`; OAuth states `4`, including partial active uniqueness and nonce uniqueness |
| Triggers | Both accepted updated-at triggers present and enabled |
| RLS and policies | RLS enabled on both tables; one owner `ALL` policy with matching `USING` and `WITH CHECK` per table |
| Migration owner context | Both target relations are owned by the configured migration connection role |
| Later archive relations | Intent, source-staging, and connector import-job tables remain absent |
| Target rows before browser proof | Credentials `0`; OAuth states `0` |
| Service-role PostgREST | Both target table reads return `200` and empty arrays |
| Signed-out API read | Credentials GET returns `401` |
| Replay-owner API read | Credentials GET returns `200`, two safe disconnected provider rows, no secret material |
| Correct persona Archive UI | One credentials GET at `200`; truthful missing/setup-disabled state; zero failed API responses |
| Browser mutation boundary | Zero non-GET product requests; authentication session only |
| Target rows after browser proof | Credentials `0`; OAuth states `0` |

The durable post-state matches DAEDALUS's atomic apply record. ARGUS cannot
reconstruct after the fact the transient preflight order or transaction commit,
so those operation-order details remain DAEDALUS evidence rather than a new
ARGUS claim.

## API And Privacy Review

The credential route remains behind `requireAuth`, filters storage reads by the
authenticated owner id and fixed `archive_connector` purpose, and serializes
only safe metadata. Empty storage yields exactly the accepted Reddit and Discord
rows with `connectionStatus: missing`, `credential: null`, and all token,
provider-call, credential-write, source-inventory, and import-write flags false.

Encrypted credential material, fingerprints, owner ids, database errors, token
values, OAuth codes, raw provider/account payloads, and storage rows are absent
from the API readback. Both tables retain owner-scoped RLS with matching write
checks. No credential, OAuth state, source intent, staging run, import job,
provider call, configuration change, or product-data write occurred.

## Scope Review

The reviewed commit edits no migration, API, auth, connector implementation,
Railway, Supabase configuration, package, lockfile, Cloudflare, queue, billing,
partner adapter, or hosted runtime path. Migrations `064` through `067` remain
outside this lane. The only review patch corrects documentation provenance and
adds this verdict.

## Validation

| Command / proof | ARGUS result |
| --- | --- |
| Independent deployment, ledger, catalog, RLS, PostgREST, API, and correct-route UI proof | Pass; read-only/product-write `0` |
| Focused archive connector route/storage/owner-flow tests | Pass, `108/108` |
| `npx --yes pnpm@10.32.1 test:storage` | Pass, `19/19` |
| `npx --yes pnpm@10.32.1 test:conversation-archive` | Pass, `43/43` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |

Disposable browser and PostgreSQL harnesses were removed. Existing temporary
tooling outside the repository was not modified, and no package metadata changed.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR527E1's route-scoped placeholder repair after an independent 18-sample rendered matrix passed at a 5.32:1 minimum with stable geometry, focus, overflow, diagnostics, and zero writes.
- ARGUS accepts PR484J-N1's exact hosted 062/063 schema unblock after independent exact-SHA, ledger, catalog, RLS, zero-row, PostgREST, signed-out, replay-owner, and correct persona Archive UI proof.
- DAEDALUS's /studio/archive browser claim was not the connector route; ARGUS corrected that provenance and proved /studio/personas/:id/files successfully.
Verdicts:
- ACCEPT_PR527E1_PERSONA_PROFILE_PLACEHOLDER_CONTRAST_REPAIR
- ACCEPT_PR484J_N1_ARCHIVE_CREDENTIAL_READ_HOSTED_SCHEMA_UNBLOCK_WITH_EVIDENCE_CORRECTION
Task:
- Close or route these bounded repairs and decide the smallest ARIADNE rerun of PR527E's two failed hosted gates. Do not claim PR527E closed before that human-hosted verdict and do not widen into OAuth, provider setup, imports, broader Profile work, Settings, or later archive migrations.
```
