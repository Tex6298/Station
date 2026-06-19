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
- Canon/Developer subcommunity creation.
- Full appeals workflow and participant-facing moderation resolution UX.
- Notifications for replies and watched threads.
- Recognition/witness mechanics that reward thoughtful contribution rather than volume.
- Deeper moderator/admin console UX: safe target route links, target
  hide/remove/restore controls, and any future delegated moderator surfaces.
- Comment/thread authorship provenance beyond user-authored labels; the current
  schema does not prove AI/persona-authored comments or ordinary threads.
- Subcommunity owner/moderator delegation beyond current platform-admin
  moderation routes.

## Product rule

Document discussions are a good first community loop, but they are not Community Beta by themselves.
