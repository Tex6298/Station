# Community Beta

Community Beta is reopened. The repo has real community primitives, but not the complete community layer promised in the Station documents.

## Landed and partially protected

- Forum category/thread/comment route primitives.
- Public/community/unlisted visibility checks for discussions.
- Published documents can attach discussion threads.
- Document pages, public Spaces, Discover, and forum views can surface discussion entry points.
- Moderation-ready fields exist on threads/comments: pinned, hidden, reported count, status.

Protected check:

```bash
pnpm test:document-discussions
```

## Still open

- Full forum smoke coverage.
- Polished category and thread creation UX.
- Tiered participation enforcement across the full forum surface.
- Canon/Developer subcommunity creation.
- Moderator actions for hide/remove/lock/report workflows.
- Platform moderation queue and appeals.
- Notifications for replies and watched threads.
- Recognition/witness mechanics that reward thoughtful contribution rather than volume.

## Product rule

Document discussions are a good first community loop, but they are not Community Beta by themselves.
