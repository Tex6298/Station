# PR484I - Archive Connector Credential Revoke / Disconnect Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Closeout

MIMIR closes PR484I after ARGUS accepted the local/backend Archive Connector
Credential Revoke / Disconnect implementation:

`docs/roadmap/PR484I_ARCHIVE_CONNECTOR_CREDENTIAL_REVOKE_REVIEW_RESULT.md`

Accepted boundary:

- authenticated
  `POST /archive-connectors/credentials/:provider/revoke`;
- existing archive connector Bearer auth boundary;
- supported providers only: `reddit` and `discord`;
- absent body or empty JSON object only;
- body keys, arrays, and scalar JSON bodies rejected before storage mutation
  without body-text readback;
- local revoke only updates active owner/provider/purpose
  `archive_connector` credential rows;
- already-revoked and missing providers return bounded `200` no-op states;
- response returns provider-only safe credential metadata or
  `credential: null`;
- no credential encryption config requirement and no token decrypt;
- shared JSON parse failures now use the generic global `400` envelope instead
  of body-parser excerpts.

PR484I is a local Station disconnect. It is not provider-side token revocation
and must not be described as revoking external Reddit or Discord app
authorization.

## Validation Accepted

- Route plus error-handler tests passed with 40 tests.
- Combined connector/callback/storage/import/social/web readiness plus
  error-handler set passed with 84 tests.
- Typecheck passed.
- Diff check and scope/path scan passed.

## Remaining Product Truth

Hosted owner-ready proof remains deferred until the visible owner connector
surface or a hosted disconnect rehearsal exists with deployed connector config.

Provider-side revoke, provider account lookup, source inventory, imports,
recurring pulls, queue/worker behavior, UI, hosted proof, Redis, Cloudflare,
billing, packages, marketplace, and social behavior remain separate lanes.
