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
- Visible subcommunity directory, creation, and category context exist on
  `/forums`, `/forums/subcommunities`, and subcommunity-backed category routes,
  with signed-out/below-tier gates and no private/unlisted/owner-only field
  exposure.
- Category and new-thread routes now have protected-beta creation UX gates:
  signed-out, below-tier, and eligible states are explicit; category preflight
  restores session before using protected context; and thread creation posts a
  bounded user-authored payload.
- Bounded discussion provenance labels exist for document-linked,
  persona-linked, and user-authored discussion rows without exposing raw source
  internals.
- Durable community authorship provenance exists for threads and comments,
  keeping user-authored row authorship separate from linked document provenance
  and persona-link context while stripping raw authorship source ids from public
  serializers.
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

- Recognition/witness mechanics that reward thoughtful contribution rather than volume.
- Deeper moderator/admin console UX for unsupported document/space/persona/user
  targets and any future delegated moderator surfaces.
- Future trusted AI/persona/imported authorship routes, if ever opened; current
  public creation routes remain user-authored only.
- Subcommunity owner/moderator delegation beyond current platform-admin
  moderation routes.

## Product rule

Document discussions are a good first community loop, but they are not Community Beta by themselves.
