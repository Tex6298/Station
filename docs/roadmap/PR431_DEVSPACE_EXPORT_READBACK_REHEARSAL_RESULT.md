# PR431 - Hosted Developer Space Export Readback Rehearsal Result

Date: 2026-06-28

Owner: ARIADNE / A4

Status: complete - PASS

## Verdict

```text
PASS
```

ARIADNE completed the narrow hosted verification for the PR430 Developer Space
export readback controls. The hosted web and API runtimes are serving PR430
commit `1d9bce0a`, the owner manage route exposes the new controls, and desktop
plus mobile readback stayed inside the accepted privacy and claim boundary.

## Deployment Freshness

| Surface | Route | Result |
| --- | --- | --- |
| Web | `/health/deployment` | Pass, HTTP 200, service `@station/web`, commit `1d9bce0a` |
| API | `/health/deployment` | Pass, HTTP 200, service `@station/api`, commit `1d9bce0a` |

PR431 therefore verified the deployed PR430 product code, not the earlier PR429
surface.

## Route And Auth

| Step | Result |
| --- | --- |
| Product UI sign-in | Pass |
| Session restore | Pass |
| `/developer-spaces` | Pass |
| `/developer-spaces/:slug/manage` | Pass |

The rehearsal reused an existing completed Developer Space export package. No
new export package was needed in the passing run.

## Desktop Result

At desktop width, the owner manage route showed:

- `Exports`;
- `Owner-only JSON/Markdown packages`;
- `Manifest and portable bundle readbacks stay private`;
- completed package state;
- `View manifest`;
- `View portable bundle`.

After opening readbacks, the UI showed:

- `Manifest open`;
- `Bundle open`;
- `Manifest readback`;
- `Portable bundle readback`;
- `README.md`;
- `manifest.json`;
- `manifest.md`;
- `sha256`;
- byte counts.

Document width stayed bounded with no horizontal overflow.

## Mobile Result

At 390px width, the owner manage route showed the same export status and
readback controls:

- `Exports`;
- `Owner-only JSON/Markdown packages`;
- completed package state;
- `View manifest`;
- `View portable bundle`;
- `Manifest readback`;
- `Portable bundle readback`;
- bundle file names, media types, byte counts, and short SHA-256 prefixes.

Document width stayed bounded at 390px with no horizontal overflow.

## Package Readback

Sanitized hosted readback confirmed:

- package kind: `developer_space_archive`;
- status: `completed`;
- format: `json_markdown`;
- included sections: 6;
- summary keys: events, linked public documents, nodes, snapshots;
- manifest readback present;
- bundle schema: `station.export.bundle.v1`;
- owner-only bundle posture;
- bundle file set: `README.md`, `manifest.json`, `manifest.md`;
- each file had a media type, non-zero byte count, and 12-character SHA-256
  prefix in the rendered/API evidence.

## Privacy And Claim Boundaries

The desktop and mobile manage surfaces were scanned before and after opening
manifest and portable bundle readbacks.

Result:

- no raw UUID-shaped IDs visible;
- no secret-shaped values visible;
- no database URLs, storage paths, provider payloads, prompts, completions,
  private source bodies, transcript bodies, or raw bundle file contents
  visible;
- no claim of database backup/restore, managed backup, full workspace export,
  PDF/binary export, storage-object backup, production disaster recovery,
  RPO/RTO, hosted backup readiness, or hosted data coverage.

Raw manifests and bundle bodies were not copied into this result.

## Allowed Mutations

The rehearsal stayed inside the PR431 mutation budget:

- product UI sign-in/session restore;
- opening existing owner-only export readbacks.

No publish, retract, delete, billing, Stripe, token top-up, provider/model,
Redis, Cloudflare, worker, queue, Supabase dashboard, SQL, storage, migration,
Railway config, or private archive creation was performed.

## Wakeup

Wake MIMIR with `PASS`.
