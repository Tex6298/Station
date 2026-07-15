# PR527E2 - Persona Profile Hosted Blocker Rerun Result

Date: 2026-07-15

Owner: ARIADNE / A4

Accepted hosted runtime: `c8bceb1df006da3a29d248d0fe7a742e7227c627`

State:

```text
PASS_PR527E2_PERSONA_PROFILE_HOSTED_BLOCKER_RERUN
```

## Verdict

PR527E2 passes. ARIADNE reran only PR527E's two formerly failed hosted
gates: the two empty Persona Profile placeholders across the locked nine-case
matrix and the correct persona Archive route's credential metadata read.

All `18` placeholder samples render at computed opacity `1` and exceed the
`4.5:1` normal-text floor. The Archive route sends exactly one credentials
GET at `200`, receives the bounded Reddit and Discord missing-state shape,
and renders the truthful setup-disabled owner state. The rehearsal sent zero
hosted product writes.

## Deployment Gate

Web and API were checked before and after the rehearsal. Both remained ready
on `main` at the exact accepted implementation SHA.

| Service | HTTP | Ready | Railway service | Branch | Exact SHA |
| --- | ---: | --- | --- | --- | --- |
| Web | `200` | `true` | `@station/web` | `main` | `c8bceb1df006da3a29d248d0fe7a742e7227c627` |
| API | `200` | `true` | `@station/api` | `main` | `c8bceb1df006da3a29d248d0fe7a742e7227c627` |

No rolling deployment or runtime identity drift occurred.

## Hosted Schema Retention

Read-only PostgreSQL transactions checked the hosted state before and after
the browser rehearsal, then rolled back.

| Read-only check | Before | After | Result |
| --- | ---: | ---: | --- |
| `062_archive_connector_credentials` ledger rows | `1` | `1` | Pass |
| `063_archive_connector_scope_metadata` ledger rows | `1` | `1` | Pass |
| `public.archive_connector_credentials` rows | `0` | `0` | Pass |
| `public.archive_connector_oauth_states` rows | `0` | `0` | Pass |

No migration, database write, RPC mutation, seed, or cleanup operation ran.

## Placeholder Matrix

The existing replay owner opened the existing replay persona through visible
Studio navigation and then used its visible Profile command. Avatar URL and
Context handoff remained empty throughout. Every appearance was selected with
Station's shipped Appearance control.

| Appearance | Resolved | Viewport | Avatar contrast | Handoff contrast | Opacity | Heights | Focus | Overflow |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |
| System | Dark | `1440x900` | `7.53:1` | `7.53:1` | `1` / `1` | `43px` / `96px` | `2px` visible | `0` |
| System | Dark | `390x844` | `7.53:1` | `7.53:1` | `1` / `1` | `43px` / `96px` | `2px` visible | `0` |
| System | Dark | `375x812` | `7.53:1` | `7.53:1` | `1` / `1` | `43px` / `96px` | `2px` visible | `0` |
| Light | Light | `1440x900` | `5.35:1` | `5.35:1` | `1` / `1` | `43px` / `96px` | `2px` visible | `0` |
| Light | Light | `390x844` | `5.35:1` | `5.35:1` | `1` / `1` | `43px` / `96px` | `2px` visible | `0` |
| Light | Light | `375x812` | `5.35:1` | `5.35:1` | `1` / `1` | `43px` / `96px` | `2px` visible | `0` |
| Dark | Dark | `1440x900` | `7.53:1` | `7.53:1` | `1` / `1` | `43px` / `96px` | `2px` visible | `0` |
| Dark | Dark | `390x844` | `7.53:1` | `7.53:1` | `1` / `1` | `43px` / `96px` | `2px` visible | `0` |
| Dark | Dark | `375x812` | `7.53:1` | `7.53:1` | `1` / `1` | `43px` / `96px` | `2px` visible | `0` |

Across all nine cases:

- both placeholders fit without clipping;
- both controls retained stable dimensions;
- keyboard focus produced a solid `2px` outline on each field;
- field, document, body, and Profile-shell horizontal overflow remained zero;
- neither field value changed; and
- human-eye review of all nine temporary capture pairs found clear placeholder
  text, visible focus, coherent wrapping, and no overlap or clipping.

No field was typed into, toggled, submitted, or allowed to enter a pending,
saved, or error state.

## Archive Read Rerun

From Profile, the visible `Open Archive` command reached the correct owner
route:

```text
/studio/personas/:id/files
```

| Check | Result |
| --- | --- |
| Credentials request count | Pass, exactly one `GET /archive-connectors/credentials` |
| Credentials response | Pass, `200` |
| Safe metadata shape | Pass, Reddit and Discord both `missing` with `credential: null` |
| Owner presentation | Pass, missing credential plus `Credential storage unavailable` setup-disabled state |
| Unsafe detail | Pass, no secret, owner id, raw storage error, or implementation detail rendered |
| Return navigation | Pass, visible Archive `Home` tab followed by the visible companion `Profile` command |

The owner panel exposed no connector setup command while configuration was
disabled. ARIADNE did not refresh the connector, configure Reddit, start
OAuth, revoke a credential, inspect source inventory, prepare an intent,
preview, stage, or import material.

## Diagnostics And No-Write Boundary

| Check | Result |
| --- | --- |
| Standard replay-owner sign-in setup | `1` auth sign-in request before measured product work |
| Unexpected auth mutations | `0` |
| Hosted product writes | `0` |
| Unknown API calls | `0` |
| Failed product responses | `0` |
| Page errors | `0` |
| Unclassified console errors | `0` |
| Unclassified request failures | `0` |
| Classified cancelled Next navigation/prefetch GETs | `55` |

No avatar or anonymous-chat `PATCH`, handoff `POST`, Integrity start,
architecture `PATCH`, persona `DELETE`, connector or OAuth mutation, direct
database write, RPC mutation, migration, seed, cleanup, tier, billing, or
configuration change occurred.

## Scope And Cleanup

The rerun changed no source, test, script, package metadata, lockfile,
configuration, migration, deployment setting, or hosted data. The disposable
browser harness, aggregate JSON, debug probe, session material, and every
private capture were removed before commit. Only this result document is
committed.

`git diff --check` is the applicable repository validation. Typecheck is not
required because this docs-only result changes no import or script.
