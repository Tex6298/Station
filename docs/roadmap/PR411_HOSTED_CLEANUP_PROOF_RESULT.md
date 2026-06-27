# PR411 - Hosted Cleanup Proof Result

Owner: DAEDALUS
Preflight owner: ARGUS
Status: READY FOR ARGUS REVIEW

## Result

DAEDALUS ran the single approved disposable hosted cleanup proof on
2026-06-27, after rechecking the PR411 freshness and isolation gates.

Sanitized verdict:

```text
PASS
```

## Freshness Gates

| Service | Result | Sanitized evidence |
| --- | --- | --- |
| Web | Pass | Ready service `@station/web`, commit prefix `ab272215738b`. |
| API | Pass | Ready service `@station/api`, commit prefix `ab272215738b`. |

The hosted commit prefix is after the required PR409 route-story baseline
`d2674abd` and PR407 cleanup baseline `c4b077d6`.

## Hosted Proof Evidence

| Check | Result | Sanitized evidence |
| --- | --- | --- |
| Owner auth | Pass | Replay owner sign-in and `/auth/me` returned HTTP `200`; tier readback was `canon`. |
| Existing owner Space | Pass | One existing owner-owned route-safe Space was selected. |
| Artifact isolation | Pass | Created exactly one synthetic unlisted document with title prefix `[cleanup-proof:pr411-20260627-0754]`, comments enabled, and public-safe synthetic body text only. |
| Publish | Pass | Published that exact artifact as `unlisted`; linked discussion was present. |
| Pre-delete public document read | Pass | `/documents/public/[redacted-document-id]` returned HTTP `200`. |
| Pre-delete linked discussion read | Pass | `/documents/[redacted-document-id]/discussion` returned HTTP `200` with linked discussion present. |
| Pre-delete thread read | Pass | `/threads/[redacted-thread-id]` returned HTTP `200`. |
| Synthetic comment | Pass | Created exactly one synthetic owner-authored preservation comment. |
| Delete | Pass | `DELETE /documents/[redacted-document-id]` returned HTTP `200` with `deleted: true`. |
| Cleanup strategy | Pass | `linked_discussion_tombstone`. |
| Cleanup counts | Pass | `linkedDiscussionThreadsHidden: 1`, `commentsPreserved: 1`, `commentsDeleted: 0`, `unrelatedThreadsTouched: 0`. |
| Post-delete public document read | Pass | `/documents/public/[redacted-document-id]` returned HTTP `404`. |
| Post-delete discussion read | Pass | `/documents/[redacted-document-id]/discussion` returned HTTP `404`. |
| Post-delete thread read | Pass | `/threads/[redacted-thread-id]` returned HTTP `404`. |
| Unrelated public route before/after | Pass | Public discover search returned HTTP `200` before and after cleanup. |
| Public web route | Pass | Web public health route returned HTTP `200`. |

## Redaction

No cookies, bearer tokens, auth headers, secrets, raw response bodies, stack
traces, SQL errors, private source bodies, prompts, memory/archive content,
owner/user IDs, document IDs, thread IDs, comment IDs, package IDs, or
deployment IDs are recorded in this result.

## Scope Control

- Exactly one disposable owner document was created, published as unlisted, and
  deleted.
- Exactly one linked discussion was used.
- Exactly one synthetic owner-authored comment was created to prove comment
  preservation.
- No broad forum/community mutation, full hard-delete removal, UI cleanup
  action, API/schema/migration/auth/billing/deploy/provider/cache/vector work,
  or unrelated artifact deletion was performed.

## Review Request

ARGUS should verify the sanitized evidence, confirm the proof stayed within the
PR411 guardrails, and decide whether to wake MIMIR with acceptance or DAEDALUS
with exact fix/recheck requirements.
