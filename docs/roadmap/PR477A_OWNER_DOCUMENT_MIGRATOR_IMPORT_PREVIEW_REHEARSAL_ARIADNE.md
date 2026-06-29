# PR477A - Owner Document Migrator Import Preview Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted owner-only proof

## Why This Rehearsal

ARGUS accepted PR477A:

`docs/roadmap/PR477A_OWNER_DOCUMENT_MIGRATOR_IMPORT_PREVIEW_REVIEW_RESULT.md`

The remaining risk is hosted product truth: the live staging site must prove
Document Migrator preview is visible, owner-only, no-write, redacted, and
positioned before the existing import/upload confirmation paths.

This is a human-eye hosted proof. It is not an external connector, live API
pull, provider account, storage upload, or real archive import test.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at app commit `c635fea9` or later, or at
     the deploy-equivalent app commit if later commits are docs/state only;
   - the persona files page visibly includes the PR477A import preview step.
2. Signed-in `/studio/onboarding`:
   - Document Migrator still routes honestly from existing owner state;
   - copy frames source handling as pasted/uploaded exports with preview first;
   - no live OAuth/API pull, recurring sync, provider account, or automatic
     import claim appears.
3. Signed-in persona Archive/files page on desktop:
   - pasted-source preview is visible before import confirmation;
   - a safe dummy pasted source can be previewed and returns format/count/
     no-write readback;
   - the confirm/import action is disabled until the exact current pasted source
     has been previewed;
   - editing the pasted source after preview marks the previous preview stale or
     disables confirmation again.
4. Signed-in persona Archive/files page at 390px mobile:
   - preview controls and result readback are readable;
   - no horizontal overflow, clipped primary controls, overlapping text, or
     hidden confirmation state.
5. Local file preview, only with safe local dummy text/Markdown/JSON content:
   - selected text/Markdown/JSON file can be previewed before upload/register;
   - preview returns format/count/no-write readback;
   - changing the selected file clears stale preview state before upload
     confirmation can be enabled again;
   - no signed upload URL, storage path, file registration, or import job is
     created during preview.
6. Malformed or unsupported JSON:
   - returns bounded copy;
   - does not echo the private source body, raw JSON, parser dump, stack trace,
     SQL/table detail, URL/permalink, storage path, signed URL, token, account
     id, or provider payload.
7. Optional direct API sample, only if already available without exposing
   secrets:
   - authenticated `POST /imports/preview` with a safe dummy source returns
     no-write safety booleans and redacted preview fields.
8. Safety:
   - do not perform the final import/upload confirmation unless MIMIR explicitly
     opens a separate mutation proof;
   - do not capture private real user source text, hosted logs, SQL output,
     tokens, provider payloads, storage paths, signed URLs, stack traces, or
     internal row ids.

## Out Of Scope

Do not import the previewed source, upload a real file, create an import job,
register a persona file, create archive chunks, write Memory/Canon/Continuity,
publish documents, or use external services.

Do not try live Reddit, Discord, ChatGPT, Claude, social, website, cloud drive,
or external API pulls. Do not enter OAuth/API tokens, bot tokens, credentials,
webhooks, provider accounts, or secrets.

Do not broaden into recurring sync, workers, queues, Redis, Cloudflare,
provider/model calls, billing, Stripe, schema changes, migrations, API Bridge
credential setup, full workspace export, PDF/binary parsing, or archive
redundancy.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_IMPORT_BOUNDARY_FAIL
SEED_OR_ROUTE_BLOCKER
```

Use `PASS_READY_TO_CLOSE` if hosted desktop/mobile owner flows show preview
before confirmation, redacted no-write readback, stale-preview invalidation, and
no forbidden import/storage/provider/private-source leakage.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for concrete visible defects such as missing
preview after fresh deploy, confirmation enabled before preview, stale preview
not invalidating after source/file change, broken mobile layout, or misleading
live-connector/import claims.

Use `PRIVACY_OR_IMPORT_BOUNDARY_FAIL` if any private source body, raw parser
dump, source snippet, permalink/URL, storage path, signed URL, token, account
id, SQL/table output, stack trace, provider payload, hosted log, or write path
appears during preview.

Use `SEED_OR_ROUTE_BLOCKER` only if the hosted owner account has no routeable
persona/files surface to inspect and the defect cannot be distinguished from
missing staging seed data.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR477A hosted owner-only Document Migrator import preview rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_IMPORT_BOUNDARY_FAIL | SEED_OR_ROUTE_BLOCKER
Task:
- Close PR477A, wait for deploy, route the smallest repair, or choose the seed/route unblock.
```
