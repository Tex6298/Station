# PR483 - Workspace Export Product Depth Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - decide smallest safe workspace export depth slice

## MIMIR Decision

After closing PR482A, MIMIR chooses a different named Phase 3/customer-facing
feature:

```text
Full workspace / PDF / binary export
```

Do not deepen API Bridge again by inertia.

Station already has owner-only persona and Developer Space JSON/Markdown
manifest and portable bundle readback. The reopened product gap is larger:
portable workspace export that can honestly preserve more of a creator's
Station material without overstating backup, print, binary packaging, or
redundancy.

## Current Repo Evidence

Useful existing pieces:

- `builds.md` names Archive Trust as protected alpha and keeps original file
  packaging, PDF/binary/full workspace exports, background jobs, redundancy,
  and Station Press open.
- `prep-lane-audit.md` keeps export trust protected alpha but full workspace/
  PDF/binary export and archive redundancy reopened.
- PR428 through PR431 accepted API-backed persona, Developer Space, and Project
  export classes plus hosted export/readback evidence.
- Current export package UI can create/read manifests and portable bundle
  readbacks for owner-visible Station state.

Risk to review:

- Full workspace export can accidentally become raw private archive leakage,
  signed URL exposure, original-file packaging without expiry policy, PDF/print
  generation claims, background jobs, backup/redundancy promises, or broad
  storage architecture.
- The smallest useful slice should deepen export trust without claiming a full
  production backup system.

## ARGUS Task

Hostile-preflight the current repo and decide whether DAEDALUS may implement a
small PR483A slice that advances workspace export product depth without new
external config or production infrastructure.

Return one of:

```text
ACCEPT_PR483A_WORKSPACE_EXPORT_SCOPE_READBACK
ACCEPT_PR483A_EXPORT_BUNDLE_FILE_INVENTORY
ACCEPT_PR483A_PDF_EXPORT_PREVIEW_CONTRACT
BLOCKED_NEEDS_UNBLOCK_LANE
BLOCKED_NEEDS_MIMIR_DECISION
REJECT_DEFER
```

If accepted, specify exact touched files or acceptable local equivalents,
tests, public/private boundary rules, and whether ARIADNE must run hosted
desktop/mobile rehearsal.

If blocked, name the concrete blocker and the smallest numbered unblock lane
that directly enables workspace export product depth.

## Candidate PR483A Shapes

ARGUS may accept, patch, or reject these candidates.

Preferred no-new-config candidate:

1. Workspace export scope/readback:
   - add owner-only readback that explains what a full workspace export can and
     cannot include today;
   - enumerate included classes using existing export-package truth;
   - explicitly mark original files, PDF/binary packaging, background jobs,
     redundancy, expiry, and Station Press as unavailable or future unless the
     repo already supports a safe subset;
   - avoid creating new package formats or background execution.

Optional if existing code supports it safely:

2. Export bundle file inventory:
   - extend the owner-only bundle readback with a safe file inventory for
     already-generated export package contents;
   - include file names, MIME/type labels, counts, hashes, and byte sizes only;
   - do not expose raw private source bodies, signed URLs, storage paths,
     private archive snippets, credentials, or logs.

Only if repo support is already close:

3. PDF export preview contract:
   - define a no-write owner-only preview contract for future PDF/print export;
   - show selected public/owner document metadata and privacy warnings only;
   - do not generate PDFs, call print providers, create storage objects, or
     claim Station Press readiness.

If none are safe, name the direct unblock. Examples: export class inventory
contract, file-manifest redaction contract, private-source packaging policy,
expiry/download policy, original-file inclusion policy, or PDF preview
privacy contract.

## Questions ARGUS Should Answer

1. Which existing export package classes are real product truth: persona,
   Developer Space, Project, workspace, or only the first three?
2. Can PR483A safely add workspace-level readback without new package creation?
3. Is file inventory safe if limited to names, MIME labels, counts, hashes, and
   byte sizes?
4. What must remain out of any owner UI/API readback: raw private archive text,
   source bodies, storage paths, signed URLs, package download URLs, credentials,
   prompts, provider payloads, SQL/table details, stack traces, or hosted logs?
5. Does current storage/export code support original-file inclusion at all, or
   should PR483A explicitly say original files remain future?
6. Is PDF/print preview too early, or can ARGUS define a no-write preview
   contract that helps future Station Press work?
7. Which tests must DAEDALUS run if accepted?
8. What would ARIADNE need to prove on hosted desktop and 390px mobile?

## Guardrails

Do not add or claim:

- production backup/redundancy, disaster recovery, legal archive, or Station
  Press readiness;
- generated PDFs, print-on-demand calls, print orders, background package jobs,
  scheduled jobs, workers, queues, Redis, Cloudflare, or runtime provisioning;
- original-file packaging unless ARGUS confirms the exact safe subset and
  redaction/download policy;
- broad storage architecture, schema changes, migrations, provider/model calls,
  billing, Stripe, export billing, or new external config;
- public export access, cross-owner export access, anonymous download links, or
  shareable private package URLs.

Do not expose raw private source bodies, archive snippets, prompts, provider
payloads, credentials, tokens, cookies, SQL/table output, table names, storage
paths, signed URLs, stack traces, hosted logs, or secret-shaped values in docs,
tests, UI, API responses, or package readbacks.

## Inputs

- `docs/roadmap/PR482A_API_BRIDGE_SETUP_PACKET_READBACK_CLOSEOUT.md`
- `docs/roadmap/builds.md`
- `docs/roadmap/prep-lane-audit.md`
- `docs/roadmap/STATION_FUTURE_LANES.md`
- `docs/roadmap/PR428_API_BACKED_BACKUP_EXPORT_PROOF_REVIEW_RESULT.md`
- `docs/roadmap/PR429_HOSTED_API_EXPORT_REHEARSAL_RESULT.md`
- `docs/roadmap/PR430_DEVELOPER_SPACE_EXPORT_READBACK_CONTROLS_REVIEW_RESULT.md`
- `docs/roadmap/PR431_DEVSPACE_EXPORT_READBACK_REHEARSAL_RESULT.md`
- Current export API routes, export service, export UI, and export tests.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR483 Workspace Export Product Depth preflight.
Verdict:
- ACCEPT_PR483A_WORKSPACE_EXPORT_SCOPE_READBACK | ACCEPT_PR483A_EXPORT_BUNDLE_FILE_INVENTORY | ACCEPT_PR483A_PDF_EXPORT_PREVIEW_CONTRACT | BLOCKED_NEEDS_UNBLOCK_LANE | BLOCKED_NEEDS_MIMIR_DECISION | REJECT_DEFER
Task:
- Wake DAEDALUS with accepted scope, revise scope, route the smallest unblock lane, make the product decision, or choose another named Phase 3/customer-facing feature.
```
