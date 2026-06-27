# PR386 - Writing Publishing Workflow Gate Result

Date: 2026-06-27
Owner: A2 / DAEDALUS
Status: map-only result; ready for MIMIR decision.

## Summary

DAEDALUS mapped the current writing-to-public-document workflow and found no
code repair needed before a bounded hosted authoring rehearsal.

Current Station behavior already supports:

- public writing discovery through `/writing`;
- owner draft creation/editing through `/studio/publish`;
- owner publishing dashboard readback through `/studio/publishing`;
- Space-backed approval queue transitions through `/publishing/approvals`;
- publish transition from approved queue state into a published public,
  community, or unlisted document;
- public document readback through `/space/:slug/documents/:documentId`;
- owner-only version history readback;
- linked document discussion creation/readback when comments are enabled.

No code changed in PR386.

## Route Map

### Public Reading

- `/writing`
  - Public document index backed by `/discover/feed?tab=new|featured`.
  - `Latest` and `Featured` are live.
  - `Staff picks` is intentionally disabled/preview-only until curated writing
    exists.
  - The `Write` action routes to `/studio/publish`.

- `/space/:slug/documents/:documentId`
  - Public/owner document readback route.
  - Loads owner-readable `/documents/:id` when signed in, otherwise public
    `/documents/public/:id`.
  - Shows document trust rows: document state, provenance/private-source
    boundary, version, and discussion state.
  - Owner sees `Continue editing` back to `/studio/publish?documentId=:id`.
  - Owner can start a linked discussion when the document is published,
    comments are enabled, and visibility is public/community/unlisted.

### Owner Authoring

- `/studio/publish`
  - Live owner authoring surface.
  - Loads Spaces, personas, and optionally an existing document by
    `documentId`.
  - `Save draft` creates or patches `/documents`.
  - `Send for review` saves the draft and enqueues `/publishing/approvals`.
  - Rich formatting toolbar is explicitly disabled/deferred.
  - External connectors are explicitly disabled/deferred.
  - Scheduling is explicitly disabled/deferred.
  - Private-to-public boundary is visible: drafts can be private; Space plus
    non-private visibility are required before review.

- `/studio/publishing`
  - Live owner dashboard for documents and approval queue state.
  - Lists owner documents from `/documents`.
  - Lists owner approval items from `/publishing/approvals`.
  - `Edit` routes back to `/studio/publish?documentId=:id`.
  - `Review` queues a Space-backed draft.
  - `Human review`, `Approve`, and `Publish` transition approval state.
  - `View` is available only for Space-backed published documents.
  - `Space required`, `Creator required`, and `Schedule deferred` states are
    intentionally disabled/readback states, not fake live controls.

### Space-Local Authoring

- `/space/:slug/documents/new`
  - Live Space-local document creation route.
  - Can save a draft through `/documents`.
  - Can directly publish through `/documents/:id/publish`.
  - This path is more mutation-heavy than the Studio approval flow and should
    not be the default PR386 hosted rehearsal path unless MIMIR explicitly wants
    a public/unlisted test artifact.

## API Map

- `POST /documents`
  - Creator-tier owner route.
  - Verifies owned Space and owned persona when provided.
  - Creates a draft with owner, document type, visibility, comments flag,
    user-authored provenance, and manual source label.

- `PATCH /documents/:id`
  - Owner route.
  - Updates draft/document fields.
  - Snapshots prior version when versioned fields change.
  - Syncs linked discussion eligibility after visibility/status/comment changes.

- `POST /publishing/approvals`
  - Creator-tier owner route.
  - Requires a Space-backed draft.
  - Creates/requeues a grounding-check approval item.
  - Does not expose private document body in approval readback.

- `POST /publishing/approvals/:id/transition`
  - Creator-tier owner route.
  - Enforces state transitions:
    `grounding_check -> human_review -> approved -> published`.
  - The `published` transition updates the owned document status, visibility,
    and published timestamp.

- `POST /documents/:id/publish`
  - Owner route.
  - Direct publish path, used by Space-local authoring and owner document page.
  - Snapshots prior version and ensures linked discussion when eligible.

- `GET /documents/:id/versions`
  - Owner-only version history.

- `GET /documents/:id/discussion` and `POST /documents/:id/discussion`
  - Public/readable and owner-start discussion affordances.
  - Enforce document visibility and comment eligibility.

## Live Versus Preview-Only Controls

Live:

- `/writing` `Write` -> `/studio/publish`.
- `/studio/publish` `Save draft`.
- `/studio/publish` `Send for review` when Space and non-private visibility are
  selected.
- `/studio/publishing` `Review`, `Human review`, `Approve`, `Publish`, and
  `View` when guard conditions are satisfied.
- Public document `Continue editing` for the owner.
- Public document linked discussion open/start controls when eligible.
- Space-local `/space/:slug/documents/new` `Save draft` and `Publish`.

Preview-only or explicitly deferred:

- `/writing` `Staff picks`.
- `/studio/publish` rich formatting toolbar.
- `/studio/publish` external connector rows.
- `/studio/publish` scheduling.
- `/studio/publishing` `Schedule deferred`.

Out of PR386 hosted rehearsal scope:

- Public document `Signal Share to socials` and the social composer.
- Social settings/connections, teaser generation, and `/social/compose`.
- Station Press, scheduled publishing workers, checkout/billing, provider work,
  Redis, Cloudflare, worker/queue infrastructure, schema, and migrations.

## Recommended Hosted Rehearsal

Default safe rehearsal:

1. Confirm hosted web/API are fresh at or after this PR386 result commit.
2. Sign in as the replay owner.
3. Open `/writing`.
4. Verify public writing loads or has honest empty states, and `Staff picks` is
   disabled/preview-only.
5. Use `Write` to open `/studio/publish`.
6. Create a short private draft with a PR386-specific title.
7. Keep visibility `private` and do not select social/scheduling controls.
8. Click `Save draft`.
9. Confirm the save notice appears and the page now has a document id.
10. Open `/studio/publishing`.
11. Verify the draft appears under `Drafts`, with sanitized trust/readback line
    and `View unavailable` until published.
12. Use `Edit` to return to `/studio/publish?documentId=:id`.
13. Verify title/body/visibility/Space/persona fields load from the saved draft.
14. Open an existing replay public document route from `/writing`, `/discover`,
    or `/studio/publishing` if one exists.
15. Verify document trust, provenance/private-source boundary, version readback,
    and linked discussion affordance remain safe.

Mutation guard for the default rehearsal:

- Do not click `Send for review`.
- Do not transition approval queue state.
- Do not click `Publish`.
- Do not open or use `Signal Share to socials`.
- Do not use `/space/:slug/documents/new` direct publish.
- Do not create exports, imports, chat prompts, billing changes, provider
  settings, social connections, scheduled publishing, or external dispatch.

Optional full public mutation, only if MIMIR explicitly wants it:

1. Create a clearly named unlisted PR386 test document in an existing owned
   public Space.
2. Send it for review from `/studio/publish`.
3. In `/studio/publishing`, move it through `Human review`, `Approve`, and
   `Publish`.
4. Open the public `View` route and verify document trust/version/discussion
   readback.
5. Record that the artifact remains as a long-lived unlisted hosted test
   document unless a separate cleanup instruction uses the API delete route.

## Validation

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass, 21 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 126 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass, 2 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass, 13 tests. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass. |
| `git diff --check` | Pass. |

## Recommendation

Proceed with ARIADNE using the default safe rehearsal above.

Do not run the optional full public mutation unless MIMIR explicitly accepts the
long-lived unlisted document artifact or supplies cleanup instructions.
