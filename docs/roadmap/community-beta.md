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
- Thread/comment moderation actions are logged through
  `community_moderation_actions`: platform admins keep all powers, while
  subcommunity owners and active moderators can use bounded safety actions only
  on their own subcommunity-backed thread targets and thread-parent comment
  targets.
- Admin-only moderation report queue/readback and report status updates exist
  over `moderation_reports`.
- Scoped delegated moderation report queue readback exists at
  `/forums/subcommunities/:slug/moderation/reports` for platform admins,
  subcommunity owners, and active moderators. It includes only thread and
  thread-parent comment reports in the requested subcommunity, keeps status
  mutation admin-only, and omits reporter identities, admin notes, moderation
  reasons, hidden bodies, private target metadata, role assignments, and raw
  route ids.
- The first visible scoped delegated moderation queue exists at
  `/forums/subcommunities/[slug]/moderation`. It is discoverable only for
  platform admins, subcommunity owners, and active moderators, fetches only the
  scoped delegated queue after access preflight, renders safe rows only, and
  remains read-only.
- Scoped delegated report status transitions exist at
  `/forums/subcommunities/:slug/moderation/reports/:id` for platform admins,
  subcommunity owners, and active moderators. They can mark only eligible
  scoped thread/comment reports as reviewing, resolved, or dismissed; target
  visibility is not mutated, global admin report behavior is unchanged, and
  reporter notifications keep moderator identity private.
- Visible delegated report status controls exist on
  `/forums/subcommunities/[slug]/moderation`. They call only the scoped
  delegated report status route, keep failed rows visible, and stay visually
  separate from target moderation actions.
- Visible delegated queue target safety controls exist on
  `/forums/subcommunities/[slug]/moderation` for rows whose sanitized delegated
  target context proves supported thread/comment actions. They call only the
  existing thread/comment moderation routes, stay separate from report status
  triage, and remain bounded to hide, unhide, remove, and restore.
- The first admin moderator console exists at `/forums/moderation`, exposing
  report queue readback and status transitions to admins without fetching queue
  material for anonymous or non-admin users.
- Moderator console rows now include admin-only safe target context and route
  hints for supported thread/comment reports, plus separated thread/comment
  target actions where existing admin moderation routes support them.
- Moderator console report context now also covers document, Space, persona,
  and user targets where safe fields can be proven, with explicit unavailable
  reasons for missing or unroutable targets and no mutation actions for those
  target types. Persona targets remain label-only until a real public persona
  route exists; the protected Studio route is not advertised as a public
  moderator route hint.
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
- Subcommunity moderator role foundation exists through durable owner/admin
  managed moderator assignments, safe owner/admin moderator readback, active/
  revoked moderator permission helpers, and unchanged public/community
  serializers that do not expose moderator identities.
- Bounded subcommunity moderation actions exist through the existing API
  moderation routes. Non-admin delegated users are limited to `hide`, `unhide`,
  `remove`, and `restore`; ordinary categories, document comments, Space-page
  comments, thread lock/pin actions, and comment pin actions remain
  platform-admin-only.
- Visible delegated moderation controls exist on forum thread detail for
  current viewers whose `viewer_moderation_actions` prove they can already use
  the PR99 thread/comment safety actions. The visible controls do not expose
  moderator identities, role assignments, moderation reasons, private action
  history, private action metadata, or admin-only actions.
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
- Recognition/witness storage and API foundations exist for readable
  thread/comment targets, with self-witness prevention, idempotency, fail-closed
  target visibility, actor-only raw-row access, aggregate-only public readback,
  and viewer-scoped witness state.
- Visible witness controls exist on forum thread detail and comments, showing
  aggregate counts and current-viewer state only, with signed-out, below-tier,
  own-contribution, and eligible states kept explicit.
- Private author recognition readback exists at `/forums/witnesses/mine`,
  returning aggregate witness counts received on the viewer's own readable
  thread/comment contributions without witnesser identities, raw witness rows,
  rankings, badges, public scores, or clout surfaces.
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

- Private recognition readback UI beyond the accepted API route; no public
  leaderboards, badges, rankings, or public user scores are open.
- Deeper moderator/admin console UX beyond safe target context and any future
  visible delegated moderator surfaces beyond the accepted thread-detail and
  scoped-queue slices.
- Future trusted AI/persona/imported authorship routes, if ever opened; current
  public creation routes remain user-authored only.

## Product rule

Document discussions are a good first community loop, but they are not Community Beta by themselves.
