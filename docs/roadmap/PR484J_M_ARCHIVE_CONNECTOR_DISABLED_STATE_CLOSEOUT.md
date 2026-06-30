# PR484J-M - Archive Connector Disabled State Closeout

Owner: MIMIR / A1

Date: 2026-06-30

Status: Closed

## Decision

MIMIR closes PR484J-M and the PR484J-L visible owner connector defect after
ARIADNE passed the hosted rerun:

`docs/roadmap/PR484J_M_ARCHIVE_CONNECTOR_DISABLED_STATE_RERUN_RESULT.md`

Final verdict:

```text
PASS_READY_TO_CLOSE
```

## Closed Boundary

Accepted behavior:

- the owner persona Archive Reddit saved-items panel is discoverable;
- desktop, 375px mobile, and 390px mobile fit checks passed;
- readiness setup/config blockers now win over credential-readback failures;
- hosted setup-blocked state renders honest disabled credential-storage /
  provider-config copy;
- disabled setup/config state exposes only safe refresh;
- no connect/reconnect, account lookup, source inventory, import intent,
  activation, preview, staging, import-preview, or final-import action is
  available while setup is blocked;
- saved-items-only generic copy is preserved;
- no secret/provider/source readback leaks into the panel.

ARGUS also accepted the technical PR484J-M repair:

`docs/roadmap/PR484J_M_ARCHIVE_CONNECTOR_CREDENTIAL_READBACK_DISABLED_STATE_REVIEW_RESULT.md`

## Remaining Truth

The hosted environment is still intentionally blocked for live connector use:

- credential storage is not configured;
- Reddit provider app config is missing;
- credential readback remains bounded at
  `500 archive_connector_credential_read_failed`;
- Reddit OAuth start remains bounded at
  `409 archive_connector_provider_app_setup_required`.

That is no longer a PR484J-L/M UI defect. It is the next live-connector setup
boundary.

## Next Move

Open a separate preflight for live connector hosted setup:

```text
PR484J-N - Archive Connector Hosted Setup Preflight
Owner: ARGUS / A3
```

