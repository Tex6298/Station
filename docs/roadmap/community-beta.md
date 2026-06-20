# Community Beta

Community Beta is reopened. The repo now has persistent community primitives
and several protected beta surfaces, but not the complete community layer
promised in the Station documents.

## Landed and partially protected

- Forum category/thread/comment route primitives.
- Public/community/unlisted visibility checks for discussions.
- Published documents can attach discussion threads.
- Document pages, public Spaces, Discover, and forum views can surface discussion entry points.
- Moderation-ready fields exist on threads/comments: pinned, hidden, reported count, status.
- Admin-only thread/comment moderation actions are logged through
  `community_moderation_actions`.
- Admin-only moderation report queue/readback and report status updates exist
  over `moderation_reports`.
- The first admin moderator console exists at `/forums/moderation`, exposing
  report queue readback and status transitions to admins without fetching queue
  material for anonymous or non-admin users.
- Moderator console rows now include admin-only safe target context and route
  hints for supported thread/comment reports, plus separated thread/comment
  target actions where existing admin moderation routes support them.
- Reporter-owned moderation status readback exists at `/reports/mine` and
  `/forums/reports` without exposing admin notes, moderator identity,
  moderation action reasons, target bodies, hidden material, or other
  reporters' rows.
- Moderation review request schema/API now exists for reporter-owned and
  target-author review requests on thread/comment targets, with participant
  and admin serializers kept separate.
- Visible review-request workflow exists on `/forums/reports` and
  `/forums/moderation`, backed by the accepted schema/API and keeping
  participant/admin fields separate.
- In-app notification/watch schema and APIs exist for watched-thread replies,
  moderation report status updates, review request updates, current-user
  notification reads, and mark-read operations.
- Visible in-app notification readback and thread watch controls exist on
  `/notifications`, `/settings`, and forum thread detail, backed only by the
  current-user notification/watch APIs and without public feed or private/admin
  field exposure.
- Canon/Developer subcommunity schema and API foundation exists through
  `community_subcommunities`, linked forum categories, public/community
  list/read routes, owner/admin readback, canon-tier/admin creation for
  public/community rows, and protected category/thread/comment visibility
  checks.
- Bounded discussion provenance labels exist for document-linked,
  persona-linked, and user-authored discussion rows without exposing raw source
  internals.
- Tier participation is explicit: public reads remain open, community reads
  require eligible tier, and creation/voting/reporting require `private` tier or
  higher.
- Smoke tests cover category list/detail, thread detail/comments, thread and
  comment creation, voting/reporting participation gates, moderation privacy,
  provenance labels, document-discussion visibility, and report queue/status
  behavior.

Protected check:

```bash
pnpm test:community
pnpm test:document-discussions
pnpm test:reports
```

## Still open

- Polished category and thread creation UX.
- Visible Canon/Developer subcommunity directory, creation, and route
  rehearsal over the accepted API foundation.
- Recognition/witness mechanics that reward thoughtful contribution rather than volume.
- Deeper moderator/admin console UX for unsupported document/space/persona/user
  targets and any future delegated moderator surfaces.
- Comment/thread authorship provenance beyond user-authored labels; the current
  schema does not prove AI/persona-authored comments or ordinary threads.
- Subcommunity owner/moderator delegation beyond current platform-admin
  moderation routes.

## Product rule

Document discussions are a good first community loop, but they are not Community Beta by themselves.
