# PR527F - Settings Persistence Truth Closeout

Owner: MIMIR / A1

Date closed: 2026-07-16

Status: Closed - accepted locally and hosted

```text
CLOSE_PR527F_SETTINGS_PERSISTENCE_TRUTH_ACCEPTED
```

## Accepted Product Truth

Station now exposes one real owner-only Forum reply notification preference.
Missing rows default enabled. An authoritative PATCH persists the owner's
choice, refresh reads it back, and only future eligible thread-comment fanout
consults it. Explicit false suppresses future reply notifications without
deleting history; malformed or failed preference lookup fails closed while the
valid comment remains successful.

Report/review notifications, Watches, existing notification/read state,
external delivery, and unrelated Settings categories remain unchanged. The
four unsupported Settings categories render as unavailable facts rather than
false controls.

## Acceptance Composition

| Evidence | Accepted authority |
| --- | --- |
| Boundary | `PR527F_SETTINGS_PERSISTENCE_TRUTH_PREFLIGHT_ARGUS_RESULT.md` |
| Implementation and safety patch | `PR527F_SETTINGS_PERSISTENCE_TRUTH_ARGUS_RESULT.md` |
| Hosted migration/catalog/RLS | `PR527F1_SETTINGS_PERSISTENCE_HOSTED_SCHEMA_DEPLOYMENT_DAEDALUS_RESULT.md` |
| Complete hosted product/browser lifecycle | `PR527F2D_SETTINGS_PERSISTENCE_EVIDENCE_HARDENED_RERUN_ARIADNE_RESULT.md`, limited to the gates it passed |
| Sole provenance-bound direct-RLS authority | `PR527F2G_SERIALIZED_PROVENANCE_BOUND_DIRECT_RLS_RERUN_DAEDALUS_RESULT.md` |

PR527F2D passed the signed-out, malformed-request, default, first-comment,
single-notification, disable, future-fanout suppression, re-enable,
no-backfill, refresh, keyboard, theme, viewport, diagnostics, cleanup, recovery,
and restoration lifecycle. Its direct-RLS evidence defect remains truthful
history rather than being relabeled a pass.

PR527F2G supplies only that missing direct-RLS authority. Public-safe receipt
`PR527F2G-D466966F7730038D` and local-gate digest
`06F892526AD48DE60158AA1745B8A43954B68A9108D167B0F7F773C1FA9B4349`
bind one sole-owner run to the local gate, five ordered hosted RLS requests,
exact cleanup, independent recovery, and two fresh restoration proofs. It
supersedes both ambiguous PR527F2E result artifacts.

## Final Hosted State

- Railway web/API source, migration `084`, ledger, catalog, policies, grants,
  trigger, and owner boundary are exact.
- Owner read returns one own row; cross-owner read/write return zero rows;
  anonymous read/write are denied `401` without disclosure or mutation.
- Preferences, Watches, notifications, tagged residue, disposable residue, and
  checked orphans are all zero after cleanup.
- Retained owner state and out-of-scope session/refresh metadata are exact.
- No temporary runner, credential, journal, screenshot, lock, or recovery state
  remains.

## Validation

Accepted validation includes AI Settings `14/14`, Community `54/54`, Reports
`9/9`, Auth `24/24`, preference helper `5/5`, executable migration/RLS proof,
DB build, API/web typecheck, web lint, intercepted browser matrices, the full
hosted lifecycle, and the serialized hosted direct-RLS proof.

## Programme Transition

This closes PR527F, not overall UI integration. Sequencing commit `7c14c1b9`
ends the PR527 correction baton here and moves the product into PR528, the
Important Routes Partner Pass. Remaining inventory findings are candidates for
that pass or the named paused PR529 post-partner detail lane. They are not
silently closed and no claim is made that every route is complete.

