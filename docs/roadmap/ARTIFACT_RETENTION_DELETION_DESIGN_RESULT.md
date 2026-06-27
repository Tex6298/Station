# Artifact Retention And Deletion Design Result

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Review target: ARGUS / A3

Date: 2026-06-27

Status: ARGUS accepted - wake MIMIR

## Verdict

```text
TOMBSTONE CLEANUP REMAINS PROTECTED-ALPHA TRUTH - NO FULL HARD DELETE IMPLEMENTATION YET
```

Full hard-delete artifact removal should not be treated as a near-term Station
product feature. Current main proves one bounded path only: owner document
delete removes the owner document row, tombstones linked document-discussion
threads, preserves comments/community records, hides public/member routes, and
returns owner-scoped cleanup readback.

The smallest safe future DAEDALUS slice, if MIMIR opens one, is not broad
artifact removal. It is a narrow owner-facing deletion receipt/readback
hardening slice around the existing document delete contract, with tests that
prove preserved community, moderation, export, archive, Memory, Continuity,
AI Activity, search, and cache semantics are unchanged. Anything that deletes
additional artifact classes needs another ARGUS preflight.

Account and user data deletion stays out of this lane. It is a separate
privacy/compliance project because it crosses auth profiles, billing,
community history, public identity, exports, hosted evidence, and legal
retention.

## Evidence Sampled

Current code and docs inspected:

- `apps/api/src/routes/documents.ts`
- `apps/api/src/routes/document-discussions.test.ts`
- `apps/api/src/routes/spaces.ts`
- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/memory.ts`
- `apps/api/src/routes/canon.ts`
- `apps/api/src/routes/conversations.ts`
- `apps/api/src/routes/persona-files.ts`
- `apps/api/src/routes/threads.ts`
- `apps/api/src/routes/comments.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/discover.ts`
- `apps/api/src/routes/exports.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/services/operational-cache.service.ts`
- `docs/architecture/persistence-schema-baseline.md`
- `docs/architecture/operational-cache-foundation.md`
- `docs/architecture/cloudflare-retrieval-adapter.md`
- `docs/roadmap/HARD_DELETE_ARTIFACT_REMOVAL_PREFLIGHT_ARGUS.md`
- `docs/roadmap/STATION_LAUNCH_CORE_ALPHA_CLOSEOUT.md`

## Lifecycle Vocabulary

- Preserve: keep the durable row and existing owner/admin readback.
- Hide: make public/community readback unavailable while preserving owner or
  moderator context.
- Tombstone: preserve an artifact as hidden/locked with enough receipt state to
  explain why it disappeared publicly.
- Detach: remove a public relationship while preserving both sides as private
  or historical records.
- Redact: remove or suppress displayable body/detail while preserving audit
  structure.
- Hard-delete: physically remove the canonical row or storage object.
- Defer: do not change behavior until a narrower lane designs it.

## Lifecycle Matrix

| Artifact class | Current behavior / evidence | Recommended lifecycle |
| --- | --- | --- |
| Private drafts | Owner-scoped document routes can update and delete rows. Drafts are not public artifacts. | Preserve current owner-only behavior. For future product UX, allow hard-delete only for owner-private drafts that have no public discussion, approval, export, or Developer Space linkage. |
| Published, unlisted, community, or public documents | `DELETE /documents/:id` loads by owner, tombstones linked discussion threads, then deletes the document row. PR407/PR411 prove this once for a disposable artifact. | Keep the bounded tombstone contract. Do not add full artifact removal until every linked class below has an accepted policy. |
| Document versions | Version snapshots are tied to owner documents and cascade with the document row. Failed update snapshots are cleaned up best-effort. | Preserve current behavior for now. If version history becomes owner-auditable public history, revisit before deleting published versions silently. |
| Linked document-discussion threads | Linked threads are updated to `status: "locked"` and `is_hidden: true`; comments stay. Public/member reads return not found. | Tombstone, never silently hard-delete. Receipt must include linked thread count and preserved comment count. |
| Forum threads | Own-thread delete is a soft removal: status and moderation state become removed. Moderation actions hide, lock, remove, restore, pin, and unpin without row deletion. | Preserve/soft-remove. Public reads and Discover must exclude removed/hidden linked artifacts. |
| Comments and replies | Own-comment delete is a soft removal. Moderator actions hide/remove/restore without row deletion. | Preserve or redact. Never silently hard-delete comments as a side effect of document or thread deletion. |
| Reports, review requests, and moderation actions | Reports persist in `moderation_reports`; review requests and moderation actions provide status/readback history. | Preserve. These are audit records and must not be hard-deleted by artifact cleanup. |
| Votes, watches, witnesses, notifications | Thread/comment watch and witness helpers remove participation rows or update counters; community tables are owner/user scoped. | Actor-level removal is acceptable for explicit watch/witness actions. Broad artifact deletion should detach or hide public surfaces while preserving moderation/accountability facts where needed. |
| Public Spaces and pages | Space delete currently hard-deletes the owner space and cascades pages; documents detach via nullable `space_id`. | Do not combine with document artifact cleanup. Public Space deletion needs its own lane covering route removal, document detachment, page history, and owner receipt. |
| Developer Space references | No broad delete route is exposed. Visibility update, key revocation, document links, exports, events, snapshots, confirmations, and receipts are owner-scoped. | Preserve. Document cleanup may detach links through existing relationship constraints, but Developer Space events, snapshots, receipts, usage, and exports must not vanish silently. |
| Developer Space ingestion keys and signing material | Current routes revoke active rows or rotate values; rows and audit readbacks remain. | Revoke, do not hard-delete, except in a dedicated credential-retention lane. |
| Archive files and storage objects | Persona-file delete removes the storage object and DB row, releases storage bytes, and archive retrieval treats missing source rows as not authoritative. Registration failure performs best-effort cleanup. | Keep explicit owner file deletion separate from public artifact cleanup. Future archive cleanup should tombstone source metadata or quarantine derived chunks before any physical chunk removal. |
| Import jobs and archive chunks | Imports, archived transcripts, continuity candidates, and archive-backed memory chunks preserve provenance. Retrieval validates completed or processed source rows before returning excerpts. | Preserve source metadata and lifecycle state. If a source is removed, derived chunks must be hidden from runtime/search first; hard-delete only after an ARGUS-reviewed source/chunk policy. |
| Memory items and lifecycle | Memory rows can be deleted, but lifecycle state also supports active, superseded, rejected, expired, and quarantined. Runtime filters honor lifecycle. | Prefer lifecycle changes over hard-delete for accepted or source-linked memory. Owner-only hard-delete may remain for isolated manual memory, but not as a public artifact cleanup side effect. |
| Canon items | Canon rows are owner-scoped and deletable. Accepted canon can derive from chat, import, document, calibration, integrity, or manual sources. | Prefer preserve/redact/lifecycle for source-linked canon until provenance/export expectations are accepted. |
| Continuity candidates and records | Candidates are accepted or rejected. `continuity_records` is the cross-source ledger with owner and source pointers. | Preserve accepted/rejected history. Do not hard-delete candidates, records, or source refs during document cleanup. |
| Integrity sessions and outputs | Sessions and outputs are owner-scoped; outputs can be accepted, rejected, or edited. AI trace events may be attached. | Preserve. Use status transitions and redaction, not cleanup side effects. |
| Conversations and archived transcripts | Conversation delete hard-deletes owner conversation rows; archive creates transcripts, candidates, and archive chunks. | Conversation delete remains a private owner action. Archived transcripts and derived candidates are separate archive artifacts and should be preserved or explicitly lifecycle-managed. |
| Export packages and bundles | Export packages are owner-scoped snapshots for personas, Developer Spaces, and projects. Bundles read stored manifests. | Preserve existing export packages. Future exports should show deletion/tombstone state rather than rewriting old packages silently. Add export deletion only as its own owner-explicit lane. |
| AI Activity and trace events | `ai_trace_events` stores owner-scoped sanitized events. Tests assert provider bodies and private source details are not stored in trace readback. | Preserve sanitized trace rows as owner audit history. Redact display if needed; do not hard-delete as artifact cleanup. |
| Discover, public search, and private search | Public feed/search filter published, active, unhidden, public-safe items and exclude linked document-discussion threads. Owner private buckets stay separate for signed-in users. | Public search must drop deleted/tombstoned artifacts immediately. Private Studio can retain owner receipts and tombstone readback. |
| Cache and external index mirrors | Operational cache is short-lived helper state with explicit TTLs and invalidation hooks. Cloudflare/Vectorize remains future-only ID/minimal-metadata mirror scope. | Invalidate cache after lifecycle changes. Any future external mirror must receive delete/tombstone propagation and reauthorize through Station before returning private records. |
| Hosted proof artifacts and docs | Existing proof docs intentionally preserve redacted evidence and caveats. | Preserve. Hosted proof evidence should not be edited to pretend cleanup was broader than it was. |

## Owner And Public Readback Rules

Owner actions must be explicit and receipt-backed:

- show which canonical artifact is affected;
- show which linked public surfaces will disappear;
- show which classes are preserved behind a tombstone;
- report counts for hidden linked discussions, preserved comments, affected
  links, and cache/index invalidation when those are implemented;
- provide a post-action owner readback route or response body;
- avoid implying that comments, reports, exports, archive sources, Memory,
  Canon, Continuity, Integrity, AI Activity, or account data were removed.

Public and community readback after a deletion/tombstone:

- public document routes return not found;
- linked document-discussion routes return not found;
- direct linked thread routes return not found for signed-out and member users;
- category, Discover, and search lists exclude hidden/removed linked artifacts;
- unrelated public routes remain routeable;
- owner-private Studio may show a receipt or historical tombstone, but public
  search must not.

Export/readback behavior:

- existing exports remain historical owner snapshots;
- new exports should include explicit tombstone/deletion state where relevant;
- export generation must not resurrect public routes or expose hidden linked
  discussions;
- export package deletion is not part of public artifact cleanup.

## Stop Conditions

Block implementation if a proposed patch:

- deletes comments, reports, review requests, moderation actions, trace events,
  export packages, archive source metadata, Continuity records, or Integrity
  sessions as a side effect of document cleanup;
- changes Space, Developer Space, archive import, Memory, Canon, Continuity,
  Integrity, export, provider, cache, Cloudflare, billing, or auth behavior
  without a named lane;
- mutates hosted data without ARGUS preflight and MIMIR authorization;
- leaves deleted/tombstoned public artifacts routeable through Discover,
  public document reads, linked discussion reads, thread reads, or search;
- rewrites historical roadmap/proof evidence to overclaim full cleanup;
- treats account/user deletion as solved by artifact cleanup.

## Tests And Proof Shape

Existing accepted proof:

- `test:document-discussions` proves owner-only document delete, linked
  discussion tombstone, preserved comments, hidden public/member routes, and
  unrelated route stability.
- PR411 proves that exact path once on hosted Railway/Supabase staging with one
  disposable artifact.

Future narrow implementation tests, if opened:

- owner versus non-owner delete attempts;
- public/unlisted/community visibility before and after tombstone;
- category, Discover feed, Discover search, and direct thread exclusion;
- comments and moderation history preserved;
- report/review queues unchanged;
- Developer Space links detached or hidden without deleting events/snapshots;
- export packages remain owner-readable and new exports disclose tombstones;
- archive retrieval excludes removed source material through source/lifecycle
  validation;
- Memory/Canon/Continuity/Integrity rows remain untouched unless a dedicated
  owner action targets them;
- cache invalidation keys are generated for affected owner/resource scopes;
- hosted proof, if allowed later, uses one disposable artifact and redacted
  evidence only.

## Recommendation To ARGUS

Review this design for two decisions:

1. Accept or reject the policy that full hard-delete artifact removal remains
   deferred and that tombstone cleanup is the protected-alpha truth.
2. If accepted, tell MIMIR that the only safe DAEDALUS follow-up is a narrow
   receipt/readback hardening packet around the existing document delete
   contract, not broad removal of additional artifact classes.

If ARGUS finds a gap, wake DAEDALUS with the exact missing artifact class or
route evidence to add.

## ARGUS Review

Verdict: `ACCEPTED DESIGN - WAKE MIMIR`.

ARGUS accepts the design as a conservative retention/deletion policy map. It
keeps the current protected-alpha truth honest: owner document delete may
delete the owner document row, tombstone linked document-discussion threads,
preserve comments/community records, hide public/member routeability, and
return owner-scoped cleanup readback. It does not approve full hard-delete
artifact removal or deletion of additional artifact classes.

Accepted decisions:

- Full hard-delete artifact removal remains deferred.
- Tombstone cleanup remains the protected-alpha truth for public/unlisted
  document cleanup.
- Account/user data deletion remains a separate privacy/compliance lane.
- Comments, reports, review requests, moderation actions, export packages,
  archive source metadata, Continuity records, Integrity sessions, AI trace
  events, and hosted proof docs must not disappear as side effects of document
  cleanup.
- Existing owner-private delete/revoke actions remain current behavior only;
  they are not authorization for broad artifact cleanup.
- The only safe future implementation shape named here is narrow
  receipt/readback hardening around the existing document delete tombstone
  contract, and only if MIMIR explicitly opens that lane.

Boundary review:

- The packet changes docs only; no product code, schema, migration, storage
  bucket, hosted data, package, config, auth/session, provider/model, Redis,
  Cloudflare, worker, queue, billing, Stripe, or UI behavior changed.
- The lifecycle matrix preserves moderation, provenance, export, archive,
  Memory, Canon, Continuity, Integrity, AI Activity, and hosted-proof records
  instead of silently broadening deletion semantics.
- Stop conditions correctly block code that deletes audit/provenance records,
  mutates hosted data without fresh authorization, leaves tombstoned public
  artifacts routeable, or treats account deletion as solved.

ARGUS validation:

| Command / check | Result | Notes |
| --- | --- | --- |
| Design review | Pass | Reviewed lifecycle matrix, owner/public readback rules, stop conditions, and future proof shape. |
| Source spot-check | Pass | Spot-checked current delete/revoke/remove behavior across document, thread/comment, file, Memory/Canon, Space, export, Developer Space, cache, and trace surfaces. |
| `git diff 183cc5f^ 183cc5f --check` | Pass | DAEDALUS docs-only design commit whitespace check passed. |
| Added-line sensitive-pattern scan | Reviewed | Matches were policy words for credential/session/redaction scope, not secret values. |
| Added-line raw-id scan | Pass | No UUID-shaped raw identifiers found. |

## ARGUS Recommendation

Wake MIMIR to accept the design or choose the next lane. Do not hand DAEDALUS a
hard-delete implementation packet from this design alone. If MIMIR wants code,
the next packet should be limited to owner-facing deletion receipt/readback
hardening around the existing tombstone contract, with ARGUS review before any
hosted mutation.
