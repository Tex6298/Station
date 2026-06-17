# PR21 Import Review Inbox - ARIADNE rerun result

Date: 2026-06-17
Reviewer: A4 / ARIADNE
Status: blocked on accept-with-edits runtime failure

## Verdict

The seeded rerun proves the Import Review Inbox is visible and mostly legible in
the existing persona Archive flow, but PR21 still cannot be accepted as a
complete user route.

Reject works through the browser. Accept-with-edits does not. After the
accept-with-edits attempt, the deployed API returned Railway `502` responses,
including `/health/deployment`.

## Environment

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Page checked: `/studio/personas/:personaId/files` for the replay persona
- Viewports checked:
  - desktop `1440x1100`
  - mobile `375x812`
- Seed state before actions:
  - import sources/jobs shown on page: 3 combined
  - import-backed candidates: 2
  - pending: 2
  - reviewed: 0
  - Memory: 1
  - Canon: 1
  - source label category: ChatGPT

## What Passed

- The route now loads past the earlier `import_jobs.file_id` blocker.
- The Import Review Inbox appears inside the existing persona Archive page,
  after Archive Trust and before Archive Import / Archive Import Library.
- Counts are understandable: Pending, Reviewed, Memory, Canon.
- Memory and Canon candidates are visually distinct.
- ChatGPT source labels are visible on both candidate cards.
- Candidate title and body fields are editable while pending.
- Rationale text appears for both candidates.
- Rejection language preserves source material:
  `Review before activating. Rejecting keeps the private archive source.`
- The owner-private archive framing is present:
  `Imported source material stays private in the archive.`
- Existing Archive Trust, Storage and Quota, Archive Import, Archive Import
  Library, and Export Trust sections remain in the page; no new workspace or
  broad reskin appeared.
- Mobile `375px` remained usable:
  - no horizontal overflow;
  - candidate cards fit within the viewport;
  - Reject and Accept with edits buttons fit side by side;
  - pending and reviewed states remain readable.
- No raw storage path, provider key, bearer token, or full source dump was
  visible in the checked page text.

## Action Results

### Reject

Reproduction:

1. Open `/studio/personas/:personaId/files` as the replay owner.
2. Click `Reject` on the Canon candidate.

Observed:

- The button action completed through the browser.
- The Canon candidate changed from `PENDING` to `REJECTED`.
- The rejected card removed action buttons.
- The reviewed state rendered on mobile.
- API candidate summary changed to pending `1`, reviewed `1`.

### Accept With Edits

Reproduction:

1. Open `/studio/personas/:personaId/files` as the replay owner.
2. Edit the pending Memory candidate title/body.
3. Click `Accept with edits`.

Observed:

- The UI enters the saving path.
- The browser sends `OPTIONS` successfully; preflight returns HTTP `204`.
- The browser sends `PATCH /conversations/candidates/:candidateId`.
- The PATCH response returned Railway fallback HTTP `502`.
- The response lacked `access-control-allow-origin`, so Chrome surfaced
  `MissingAllowOriginHeader` and the UI displayed `Failed to fetch`.
- After this accept-with-edits attempt, the deployed API also returned Railway
  `502` for `/health/deployment` and candidate listing.

Impact:

- The core paid-continuity route cannot promote an import-backed Memory
  candidate from the visible inbox.
- Because accept failed, ARIADNE cannot approve the full accept/edit/reviewed
  flow.
- The seed has now been partially consumed: Canon is rejected, Memory remains
  pending unless the failed accept attempt later completes after API recovery.

## Recommendation

MIMIR should route DAEDALUS for the accept-with-edits runtime failure before
closing PR21. The fix should prove browser PATCH accept for an import-backed
Memory candidate, verify the API remains healthy afterward, and then wake
ARIADNE for one more rerun. A small seed reset may be needed because this rerun
successfully rejected the Canon candidate.
