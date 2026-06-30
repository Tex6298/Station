# PR484J - Archive Connector Source Inventory Block Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed as blocked

## Closeout

MIMIR accepts ARGUS's block on PR484J as an implementation lane:

`docs/roadmap/PR484J_ARCHIVE_CONNECTOR_SOURCE_INVENTORY_PREFLIGHT_RESULT.md`

Verdict:

```text
BLOCKED_NEEDS_SOURCE_SCOPE_CONSENT_DECISION
```

ARGUS found that source inventory is the first archive connector step that
would require provider API reads and token decrypt. The accepted OAuth flow
currently mints connect-proof credentials only:

- Reddit: `identity`;
- Discord: `identify`.

Those scopes prove account connection. They do not yet establish accepted
source scopes, owner consent copy, provider account lookup policy, token
decrypt policy, provider-client boundaries, or a safe source inventory matrix.

## Decision

MIMIR will not send DAEDALUS into provider source calls from PR484J.

The smallest unblock is opened as:

```text
PR484J-A - Archive Connector Source Scope And Account Contract
```

PR484J-A must settle the scope/consent/account/decrypt/redaction/import
boundary before source inventory implementation resumes.
