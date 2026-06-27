# PR404 - Onboarding Migrator and API Bridge Human Rehearsal

Date: 2026-06-27
Owner: ARIADNE
Status: Open

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR403 as PASS WITH ARGUS PATCH.
- PR403 changed visible /studio/onboarding behavior for Document Migrator and API Bridge.
- MIMIR wants desktop/mobile human-eye acceptance before choosing the next product lane.
Task:
- Rehearse /studio/onboarding as a signed-in owner and as a signed-out visitor.
- Check Document Migrator and API Bridge state-aware first actions, route-only behavior, Assistant prompt prefill, and mobile layout.
- Report PASS/BLOCKED with exact visible defects or wake DAEDALUS if a narrow UI fix is needed. Do not go idle without a wakeup commit.
Scope:
- No hosted data mutation, no Space or Developer Space creation, no import upload/paste, no API key generation, no Assistant send, no live connector OAuth/API, no provider/model routing, no Redis, Cloudflare, queues, workers, schema, migrations, billing, Stripe, auth/session, deployment behavior, broad UI reskin, or autonomous Assistant execution.
```

## Context

PR403 deepened the existing onboarding route without changing backend product
semantics:

- Document Migrator now distinguishes no persona, no archive sources, pending
  import-review candidates, and existing archive source states.
- API Bridge now distinguishes no Developer Space from an existing Developer
  Space and may route to an owner manage surface when a route-safe non-UUID
  slug exists.
- ARGUS patched unsafe slug/key-tail handling: owner manage deep-links require
  route-safe non-UUID-shaped slugs, and key-tail readback renders only a bounded
  four-character tail.

## Freshness

If using hosted Railway, verify the web deployment is at or after code commit:

```text
12bb24b2
```

If the hosted build is stale, report `BLOCKED: hosted not fresh enough` instead
of accepting old behavior.

## Human Routes

Use the human UI route:

```text
/studio/onboarding
```

Also check linked route targets without mutating data:

- `/studio/new?path=document-migrator` when shown.
- `/studio/personas/<persona>/files` or equivalent route when shown, without
  recording raw persona identifiers.
- `/developer-spaces` when shown.
- `/developer-spaces/<slug>/manage` when shown, only if the slug is route-safe.
- `/studio/assistant?prompt=...` when shown, verifying prefill only.

## Checks

- Signed-out users see the authentication boundary and no owner path cards or
  private route targets.
- Signed-in owners see Fresh Start, Awakening, Document Migrator, API Bridge,
  and the Public step without regressions.
- Document Migrator copy names a concrete first action that matches the current
  owner state.
- API Bridge copy names a concrete first action that matches the current owner
  Developer Space state.
- All actions are route-only links; no create/import/upload/key generation/send
  action fires during rehearsal.
- Assistant prompt handoff pre-fills text but does not auto-send.
- API Bridge visible key-tail readback, if present, is only a bounded
  four-character tail; no raw ingestion key, secret, token, private id, UUID,
  SQL, stack trace, provider payload, or private source body is visible.
- Copy does not claim live OAuth/API connectors, recurring imports, API
  credential creation, provider/model work, workers/queues, Redis, Cloudflare,
  or autonomous Assistant execution.
- Desktop and 375-390px mobile have no document-level horizontal overflow,
  clipped primary controls, trapped controls, or overlapping copy.

## Result Contract

Write:

```text
docs/roadmap/PR404_ONBOARDING_MIGRATOR_API_BRIDGE_REHEARSAL_RESULT.md
```

If the rehearsal passes, wake MIMIR with:

```text
WAKEUP A1:
Codename: MIMIR
Verdict:
- PASS
Task:
- Close PR404 and choose the next roadmap move.
```

If a narrow UI fix is needed, wake DAEDALUS with exact route, viewport, expected
behavior, observed behavior, and whether the defect is desktop, mobile,
signed-out, signed-in, Document Migrator, API Bridge, or Assistant handoff.
