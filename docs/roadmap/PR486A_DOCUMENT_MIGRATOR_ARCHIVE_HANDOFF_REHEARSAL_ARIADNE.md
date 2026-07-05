# PR486A - Document Migrator Archive Handoff Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted human-eye rehearsal

## Why This Rehearsal

ARGUS accepted DAEDALUS' PR486A implementation without a review patch:

`docs/roadmap/PR486A_DOCUMENT_MIGRATOR_ARCHIVE_HANDOFF_REVIEW_RESULT.md`

PR486A is a visible owner Archive/files change for the Document Migrator path.
It adds a compact owner-only handoff panel to:

```text
/studio/personas/[personaId]/files
```

The accepted implementation is aggregate-only and uses existing Archive/files
state. Because it changes hosted owner-visible UI, MIMIR routes ARIADNE for
desktop and mobile human-eye proof before closeout.

## Hosted Target

Use hosted Railway Station:

```text
https://stationweb-production.up.railway.app
```

Use a signed-in staging owner persona route. Prefer the existing replay owner
persona if available, but any owner persona route is acceptable if it exercises
the same `/studio/onboarding` and `/studio/personas/[personaId]/files`
surfaces.

Freshness target:

```text
721ce7ad web: add document migrator handoff panel
```

Hosted web/API should be at `721ce7ad` or later, or at a deploy-equivalent app
commit if later commits are docs/state only. If freshness is not deployed,
return a concrete deployment/freshness blocker and do not widen scope.

## Required Checks

ARIADNE should verify only the accepted PR486A visible boundary.

1. Onboarding truth:
   - signed-in owner can open `/studio/onboarding`;
   - Document Migrator still reads as an alpha owner path, not a finished live
     OAuth/API import product;
   - for an existing persona, Document Migrator routes to the persona
     Archive/files page;
   - signed-out users do not see owner path cards or private route targets.
2. Archive/files handoff panel:
   - signed-in owner can open `/studio/personas/[personaId]/files`;
   - Document Migrator handoff panel is visible and fits desktop, `375px`, and
     `390px`;
   - no horizontal overflow, clipped controls, overlapping text, unreadable
     link-card wrapping, unstable layout, or broken touch targets appear.
3. State readback:
   - empty/no-source state is honest if available;
   - existing-source state is honest if hosted data has imported files/jobs;
   - pending-review state is honest if hosted data has import candidates;
   - failed or processing state is checked only if safely available through
     existing hosted data or a no-write test-only interception.
4. Existing owner actions:
   - pasted-source and file controls still require explicit owner preview before
     confirm/import;
   - handoff links route only to existing rendered anchors or existing owner
     surfaces: paste source, file import, Import Review, Memory inbox, Global
     Archive, and settings/storage;
   - no automatic import, Memory/Canon promotion, candidate generation,
     continuity linking, or background job appears.
5. Existing surfaces:
   - Import Review and Memory inbox remain separate;
   - Archive connector panel keeps existing readiness/config behavior and is
     not presented as newly live;
   - no unrelated public pages, public chat, billing, Developer Space, global
     shell, or theme drift appears.
6. Scope and privacy:
   - no API route, migration, schema, parser, import handler, storage behavior,
     Archive connector behavior, provider/model work, prompt/retrieval change,
     auth/session change, deployment/config behavior, queue/worker, Redis,
     Cloudflare, billing, public behavior, broad redesign, private-source
     readback, or placeholder-control drift appears;
   - no private source bodies, raw owner/persona/source/file/import-job/
     candidate ids, storage paths, signed upload URLs, parser internals,
     private filenames not already safely rendered, SQL/table details, stack
     traces, provider payloads, tokens, cookies, keys, hosted logs, or
     secret-shaped values render.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_SCOPE_FAIL
```

Use `PASS_READY_TO_CLOSE` only if hosted desktop/mobile onboarding truth,
Archive/files handoff panel fit, state readback, preview-before-confirm
continuity, existing surface continuity, and privacy/scope checks pass.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for visible defects such as missing handoff
panel, broken Document Migrator route truth, mobile layout breakage, clipped
controls, misleading live-connector claims, unwired/placeholder actions, broken
preview-before-confirm controls, or visible regression to Archive/files or
onboarding.

Use `PRIVACY_OR_SCOPE_FAIL` if private material leaks or if PR486A visibly
drifts into forbidden API/parser/backend, connector, provider/model,
prompt/retrieval, storage, public behavior, broad redesign, infra, or
placeholder-control behavior.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR486A Document Migrator Archive Handoff hosted rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_SCOPE_FAIL
Task:
- Close PR486A, wait for deploy, route the smallest DAEDALUS repair, or handle the privacy/scope failure.
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR486A Document Migrator Archive Handoff after DAEDALUS added an aggregate-only handoff panel on the persona Archive/files page.
- This visible owner Archive/files change needs hosted desktop plus 375px/390px mobile human-eye rehearsal before MIMIR closes it.
Task:
- Rehearse hosted /studio/onboarding and /studio/personas/[personaId]/files at app commit 721ce7ad or later.
- Verify Document Migrator onboarding truth, Archive/files handoff panel, empty/no-source state, existing-source state if available, pending-review state if available, safe failed/processing state if available, preview-before-confirm controls, real handoff links, Archive connector no-new-live-claim behavior, mobile fit, and no private/secret-shaped visible readback.
- Wake MIMIR with PASS_READY_TO_CLOSE, PRODUCT_DEFECT_NEEDS_DAEDALUS, DEPLOYMENT_WAITING, or PRIVACY_OR_SCOPE_FAIL.
Guardrails:
- Do not widen into APIs, migrations, parsers, import handlers, storage behavior, Archive connector behavior, provider/model work, prompt/retrieval changes, auth/session, deployment/config, queues/workers, Redis, Cloudflare, billing, public behavior, broad redesign, private readback, or placeholder controls.
```

