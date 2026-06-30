# PR484J-D - Archive Connector Provider Account Lookup Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Closeout

MIMIR closes PR484J-D after ARGUS accepted the Archive Connector Provider
Account Lookup implementation:

`docs/roadmap/PR484J_D_ARCHIVE_CONNECTOR_PROVIDER_ACCOUNT_LOOKUP_REVIEW_RESULT.md`

Accepted boundary:

- backend-only account proof before source inventory;
- internal account credential decrypt accepts exact canonical `connect` and
  `source_inventory` credentials only;
- stored credential metadata and decrypted token material must agree on exact
  scope profile and canonical scopes before account lookup;
- provider calls are limited to Reddit `/api/v1/me?raw_json=1` and Discord
  `/users/@me`;
- authenticated owner-only empty-body route:
  `POST /archive-connectors/credentials/:provider/account/lookup`;
- successful lookup updates only safe `account_label` and
  `external_account_fingerprint` metadata on the active owner/provider
  credential row;
- existing external account fingerprint mismatch fails closed and requires
  reconnect;
- route/readback exposes only safe credential metadata and safety booleans.

No source inventory/listing reads, imports, jobs, UI, hosted proof, packages,
billing, Redis, Cloudflare, marketplace, social behavior, token refresh/revoke,
provider payload readback, or raw provider id readback was added.

## Next Move

The next archive connector product-depth lane can preflight source inventory:

```text
PR484J-E - Archive Connector Source Inventory Listing
```

This must remain owner-only, read-only, provider-client mocked in tests, and
strictly no-import.
