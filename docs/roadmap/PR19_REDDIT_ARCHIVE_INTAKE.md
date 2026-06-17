# PR19 - Reddit Archive Intake

Date: 2026-06-17
Status: implemented by A2 / DAEDALUS; ready for A3 / ARGUS review
Owner: DAEDALUS implementation, ARGUS review, ARIADNE only if a visible import
journey changes materially.

## Why This Lane Is Next

PR14 through PR18 put the safe intake foundation in place:

- explicit ChatGPT and Claude parser boundaries;
- truthful job execution and readiness reporting;
- durable file pointers for queued import jobs;
- import-backed owner-reviewable Memory/Canon candidates;
- active work quota guards before expensive or unbounded writes.

The next launch-core import source is Reddit, but only as bounded archive intake.
This lane must not become live Reddit crawling, social posting, recurring pulls,
or Cloudflare retrieval.

## Goal

Add safe Reddit-sourced archive intake so a user can upload or paste a Reddit
thread/export-like source and Station can preserve it as private archive source
material, create owner-reviewable candidates when the parser recognizes the
shape, and fail safely when the shape is unknown.

The replay proof should be:

> Station can ingest a recognized Reddit thread/comment export as private
> archive source material, preserve source metadata, keep it out of runtime
> context before review, create pending owner-scoped candidates, and reject
> unknown Reddit-shaped JSON without archiving raw private payloads.

## Current Baseline

- `apps/api/src/services/imports/parsers/` supports ChatGPT, Claude, explicit
  legacy role/content arrays, text, and Markdown.
- Unknown JSON fails before archive memory creation.
- `processUploadedFile` preserves parsed import text as private archive chunks.
- Parsed ChatGPT and Claude imports create pending import-backed Memory/Canon
  candidates through `continuity_candidates`.
- Imported archive chunks default to quarantined lifecycle behavior and fail
  closed out of runtime context unless explicitly active.
- Active import jobs are quota-guarded.
- `apps/api/src/routes/social.ts` contains Reddit OAuth/social publishing
  concepts, but those are for publishing/identity and must not be reused as a
  hidden archive crawler in this lane.

## Scope

Parser boundary:

- Add a `reddit` parser under `apps/api/src/services/imports/parsers/`.
- Extend `ParsedImportFormat` and parser routing so recognized Reddit JSON is
  parsed explicitly.
- Keep `.json` extension authority over misleading text MIME types.
- Recognize only narrow, test-backed Reddit shapes. Suggested first shapes:
  - Reddit listing-style JSON with `data.children` comment/post objects;
  - thread-like JSON arrays/objects where comments have stable fields such as
    author, body/selftext, title, permalink/url, subreddit, created/created_utc,
    and parent/link IDs.
- Preserve chronological or thread order deterministically.
- Include source metadata such as parser, source name, message/comment count,
  subreddit, thread title, and permalink when present.
- Keep text/Markdown fallback for non-JSON paste/source files, but do not call
  unrecognized JSON "reddit" or archive it as raw text.

Import and candidate behavior:

- Update import candidate generation so parsed Reddit imports can create pending
  owner-scoped candidates with `persona_files` provenance.
- Keep raw Reddit source bodies private. Candidate summaries should be excerpts
  or review prompts, not full dumps.
- Imported Reddit chunks must remain quarantined/private before owner review,
  preserving PR17 fail-closed behavior.
- Accept/reject behavior should reuse the existing import-backed candidate
  machinery without changing archived-chat behavior.
- Duplicate file registration and active-job quota behavior must remain intact.

Live Reddit/API posture:

- Do not require `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, refresh tokens, or
  a live Reddit API call for this lane.
- Do not use social publishing OAuth tokens for archive intake.
- If DAEDALUS identifies exact future Reddit OAuth scopes, rate limits, or data
  APIs needed for live pull/recurring intake, document them as a follow-up
  section only. Do not implement live OAuth or recurring pulls here.

## Out Of Scope

- Reddit OAuth archive pull.
- Recurring Reddit crawling or scheduled imports.
- Social posting changes.
- Discord production parser unless a disabled unsupported-format error changes
  naturally with the parser router.
- BullMQ/Redis worker deployment.
- Export worker redesign.
- Full import review workspace UI.
- Cloudflare retrieval, vector reindexing, Redis memory truth, public
  publishing, billing/pricing changes, or UI reskin.

## Validation

Minimum local gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add `test:community` only if forum/public discussion behavior is touched.
Add `test:auth` only if OAuth/session behavior is touched; this lane should not
need it.

## Required Tests

- Reddit parser extracts recognized post/comment/thread content with stable
  labels and deterministic order.
- Reddit parser preserves safe source metadata without leaking raw private
  payloads into errors.
- Unknown Reddit-like or arbitrary JSON still fails before archive memory
  creation.
- Malformed JSON remains sanitized and owner-visible through import-job failure.
- Parsed Reddit file import creates private archive chunks plus pending
  import-backed candidates.
- Parsed Reddit archive chunks stay out of runtime context before owner review.
- Existing ChatGPT, Claude, legacy array, text, Markdown, and unknown-JSON tests
  still pass.
- Active import-job quota and duplicate exact file registration still pass.
- Other owners cannot read, claim, accept, reject, or infer another owner's
  Reddit import/candidates.

## DAEDALUS Implementation Notes

- Added `apps/api/src/services/imports/parsers/reddit.ts`.
- Supported JSON shapes:
  - Reddit listing-style objects or arrays with `data.children`, where child
    entries may wrap post/comment data in `data`;
  - thread-like objects with post fields plus `comments` or `children` arrays.
- Recognized fields are intentionally narrow: `author`, `body`, `selftext`,
  `text`, `title`, `link_title`, `thread_title`, `subreddit`,
  `subreddit_name_prefixed`, `permalink`, `url`, `created`, and `created_utc`.
- Parsed Reddit text uses stable `[reddit/<subreddit>/<author>]` labels and
  deterministic created-time/thread-order sorting.
- Parsed Reddit imports now create private archive chunks plus pending
  import-backed Memory/Canon candidates through the existing `persona_files`
  provenance path.
- Unknown/malformed JSON still fails before archive memory creation, and `.json`
  extension remains authoritative over misleading text MIME.
- ARGUS blocker repair narrowed source detection so generic top-level JSON
  arrays are not treated as Reddit. Reddit parsing now requires listing
  wrappers, thread-like objects, or rows with unmistakable Reddit markers such
  as `subreddit`, Reddit-shaped `permalink`, or Reddit `kind` values;
  arbitrary `[{ "text": "..." }]` arrays fail before archive memory or
  candidates are created.
- ARGUS permalink blocker repair narrowed `permalink` recognition to `/r/...`
  paths and `reddit.com/r/...` URLs. Generic paths such as `/posts/1` no longer
  classify a row as Reddit and fail before archive memory or candidates are
  created.

## Future Live Reddit Notes

No live Reddit API or OAuth work was added. Future live pull/recurring intake
would need an explicit design for Reddit app credentials, owner OAuth consent,
refresh-token storage/rotation, API rate limits, listing pagination, deleted or
removed comment handling, and whether subreddit/moderator/private-subreddit
scopes are in scope. Social publishing OAuth paths must remain separate from
archive intake credentials.

## Handoff To ARGUS

Wake A3 / ARGUS with:

- parser files changed and exact Reddit shapes supported;
- routing behavior for `.json`, misleading MIME, text, and Markdown;
- import candidate behavior and source provenance;
- runtime quarantine/fail-closed evidence;
- owner-scope and non-owner rejection evidence;
- quota/idempotency preservation evidence;
- validation commands and results;
- documented future live Reddit OAuth/API needs, if any;
- caveats about deferred recurring pulls, social posting, workers, Discord,
  Cloudflare, vectors, Redis memory truth, publishing, billing, and UI.

ARGUS should review parser overclaiming, memory poisoning, owner/private
boundaries, sanitized failures, source metadata leakage, social-OAuth confusion,
quota bypasses, and accidental scope creep.
