# PR484J-M - Archive Connector Credential Readback Disabled State

Owner: DAEDALUS / A2

Date: 2026-06-30

Status: Open

## Source Defect

ARIADNE rehearsed the accepted PR484J-L owner connector flow and found one
product defect:

`docs/roadmap/PR484J_L_ARCHIVE_CONNECTOR_OWNER_UI_FLOW_REHEARSAL_RESULT.md`

Hosted truth:

- persona Archive connector panel is discoverable;
- desktop, 375px mobile, and 390px mobile fit passed;
- no visible secret/provider/source leakage was found;
- readiness says connector setup is blocked:
  `credential_encryption_required` and Reddit provider app missing;
- `GET /archive-connectors/credentials` returns bounded
  `500 archive_connector_credential_read_failed`;
- the owner panel shows generic retryable connector-error copy instead of the
  honest setup-disabled state that readiness already knows.

## Goal

Make the owner connector panel fail closed into the accepted readiness-disabled
state when credential readback fails during known connector setup/config
blockers.

The owner should see credential storage/provider setup as unavailable, not a
generic broken-flow error.

## Required Behavior

When connector readiness reports credential encryption or provider app setup is
missing or unavailable:

- a credential readback failure must not make the panel look like a live flow
  that randomly broke;
- the visible state should be disabled/config-blocked and honest;
- no connect, account lookup, source inventory, import intent, preview, staging,
  import preview, or final import action should be enabled;
- `Refresh connector state` or equivalent safe readback retry may remain
  available;
- no credential/provider/source/secret details should be rendered.

When readiness does not report a setup/config blocker:

- preserve a bounded credential-readback error state if credentials genuinely
  cannot be loaded;
- do not silently treat unknown credential state as missing, source-ready, or
  safe to connect/import.

## Preferred Scope

Prefer a small web-layer repair in the PR484J-L owner-flow helper/panel:

- combine readiness and credential-load errors so known setup/config blockers
  win the visible copy;
- keep credentials API errors bounded and non-leaky;
- preserve all accepted PR484J-L scope boundaries.

Touch the API only if the web layer cannot correctly distinguish the state from
existing readiness responses.

## Tests

Add focused coverage for:

- readiness blocked plus credential readback failure renders the disabled
  config state, not generic retryable error copy;
- blocked config state exposes no connect/import actions;
- no token/provider/source/secret-shaped copy leaks in the blocked state;
- credential readback failure without readiness setup blockers still renders a
  bounded retryable error;
- existing PR484J-L owner flow states still pass.

Run the PR484J-L focused tests, relevant archive connector route tests if API is
touched, typecheck, lint, and `git diff --check`.

## Non-Scope

Do not add:

- credential encryption setup;
- provider app config;
- live Reddit OAuth completion;
- new credential endpoints;
- new source inventory, staging, import, queue, worker, scheduled, or retry
  behavior;
- Discord content reads;
- broader Reddit categories;
- pagination or recurring pulls;
- billing, Redis, Cloudflare, marketplace, partner adapters, social behavior,
  public writes, Canon, Continuity, or review candidates.

## Handoff

After implementation, wake ARGUS with the exact changed files, validation, and
remaining hosted caveat. ARGUS should decide whether ARIADNE rerun is required;
given this came from an ARIADNE visible defect, expect a narrow desktop/mobile
rerun after review.

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE rehearsed PR484J-L on hosted Railway at app commit 35828f8 and found one product defect.
- Persona Archive connector panel discoverability, desktop/375px/390px fit, saved-items-only generic copy, and no-leak checks passed.
- Hosted readiness reports connector setup blockers, but GET /archive-connectors/credentials returns 500 archive_connector_credential_read_failed, so the UI shows generic retryable-error copy instead of honest disabled credential/provider setup copy.
Task:
- Implement PR484J-M: archive connector credential readback fail-closed disabled state.
- When readiness reports credential encryption/provider setup blockers, credential readback failure should render the accepted disabled config state and enable no connect/import actions.
- Preserve bounded retryable credential-readback error behavior when readiness does not identify a setup/config blocker.
- Keep scope to the owner connector flow unless API shaping is truly required; do not add credential setup, provider config, OAuth completion, source expansion, queues/workers, billing, Redis, Cloudflare, marketplace, social behavior, public writes, Canon, Continuity, or review candidates.
- Add focused tests, run validation, then wake ARGUS for review.
```

