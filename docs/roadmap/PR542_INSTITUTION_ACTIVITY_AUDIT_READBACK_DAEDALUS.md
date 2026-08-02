# PR542 - Institution Activity And Audit Readback

Owner: DAEDALUS / A2 -> ARGUS / A3 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-08-02

Status:

```text
OPEN_PR542_INSTITUTION_ACTIVITY_AND_AUDIT_READBACK
```

## Customer Result

The owner of `Station Institutional Alpha` can open one private Institution
activity surface and understand what has happened across the team, Project,
publication, Space, and Salon without reading database rows or exposing raw
user/resource ids. The surface combines a bounded domain summary with a typed,
newest-first audit timeline. It is operational truth, not analytics theatre.

This is the final product slice before PR543 rehearses the complete
Institutional Alpha journey. It must make the retained work from PR537-PR541
legible to the owner without changing member authority or public output.

## Existing Truth And Missing Link

`institution_audit_events` is already append-only and service-owned. It records
identity/team lifecycle, Institution publication state, collaborative
publication events, Space events, and Institution Salon creation. Those rows
remain the audit authority.

Migration `093` is the one gap: `create_institution_project_v1` creates the
Institution Project atomically but does not append an Institution audit event.
PR542 closes that gap without replacing the ledger or manufacturing a parallel
activity store.

## Database Contract

Add migration `098` as a serialized, fail-closed extension of the existing
Institution ledger:

- extend the exact action constraint with `project_created` and the exact
  resource pair with `institution_project`;
- replace `create_institution_project_v1` so Project creation and its audit
  event commit or roll back together under the same owner-only authority and
  validation contract;
- add exactly one idempotent historical `project_created` event for each
  already-existing Institution Project that lacks one, using that Project's
  Institution owner as actor/subject and its original creation timestamp;
- reject a backfill if the principal relation is ambiguous rather than guessing;
- preserve append-only guards, service-role-only execution, existing personal
  Projects, all prior audit rows, migration fingerprints, and existing RPC
  behavior; and
- add an index suited to bounded newest-first owner reads, while keeping raw
  table access revoked from browser roles.

The migration must prove exact preflight/postflight row counts and event
fingerprints. Reapplying source or retrying the backfill must not duplicate the
Project event. Do not add audit writes for ordinary forum participation in this
slice: PR541's `community_created` is the Institution authority event, while
thread/reply/report truth remains owned by the existing community system.

## Read Model And DTO

Add an authenticated owner-only route such as:

```text
GET /institutions/:slug/activity?limit=25&cursor=...
```

The response has two explicit parts:

1. `summary`: bounded counts and latest-event time for team, Project,
   publication, Space, and community, plus a total event count; and
2. `timeline`: an allow-listed union of typed entries, ordered by
   `created_at desc, id desc`, with an opaque cursor and a hard maximum page
   size.

Each timeline entry may expose only:

- stable public event type and domain;
- human copy derived from an exhaustive server-side action map;
- event time;
- an owner-safe actor/subject label using only the existing bounded Station
  identity (`displayName` or `@username`) where that identity still resolves,
  plus a relationship label such as `Institution owner`, `Institution member`,
  `Former member`, or `System`;
- bounded resource label and an owner-safe route when the resource still
  resolves; and
- non-sensitive state needed to explain the event.

Never serialize audit ids, actor/subject user ids, resource ids, emails,
avatars, profile metadata beyond that bounded identity label, raw rows,
arbitrary action text, or arbitrary resource metadata. Deleted or
no-longer-visible subjects/resources must degrade to honest generic labels
without making the whole timeline fail. Unknown action or resource pairs fail
closed from the DTO and raise a visible operational error in tests; they must
not be echoed through generic serialization.

Only the immutable Institution owner may read this route. Active, invited,
removed, stale, unrelated, anonymous, and admin-without-owner-context callers
receive the existing bounded not-found/forbidden behavior. Membership does not
grant audit access. Query or projection failures return no partial timeline.

## Product Surface

Add a private Institution `Activity` workspace, linked from the owner team,
publication, Space, and community workspaces. It should use the current Tex
Station Institution visual language and show:

- one compact summary band for Team, Project, Publications, Space, and
  Community;
- a readable chronological timeline with domain, action, actor-role, resource,
  and time hierarchy;
- honest empty, loading, pagination, unavailable-resource, and error states;
- owner-safe links only when a retained resource can still be opened; and
- explicit copy that this is bounded operational history, not billing,
  provider telemetry, or a complete analytics product.

Do not show this shortcut to active members as though they can use it. Do not
put the timeline on the public Institution route. Keep desktop, `390px`, and
`375px` layouts stable in light and dark themes with visible focus and no
horizontal overflow. Do not broad-reskin Institution pages, add charts,
gradients, nested cards, decorative blobs, export, search, filters, or a second
Settings-style AI Activity implementation.

## Retained Hosted Proof

Deploy migration `098` and exact accepted API/web source, then retain the
current Institutional Alpha resources while proving:

1. migration `098` applies and ledgers exactly once with every pre-existing
   Institution/personal row and prior audit fingerprint preserved;
2. the retained Institution Project has exactly one trustworthy
   `project_created` event after the bounded backfill;
3. one transaction-scoped actual-engine Institution Project fixture writes
   Project plus audit atomically, and rollback/forced failure leaves neither
   row in hosted retained state;
4. owner readback contains typed team, Project, publication, Space, and
   community truth for the retained Institution in deterministic order;
5. owner summary counts agree with the typed timeline/source rows and bounded
   pagination produces no gaps or duplicates;
6. active, invited, removed, stale, unrelated, anonymous, and cross-Institution
   callers cannot read the route or infer counts;
7. raw ids, emails, profile fields, private publication bodies, report details,
   prompts, credentials, and provider payloads are absent from API and DOM;
8. missing/deleted resource projection is honest and safe, while a source query
   failure returns no partial data;
9. personal Project, community, Institution, publication, Space, Settings AI
   Activity, export, billing, and public routes remain unchanged; and
10. transaction-scoped fixtures and browser state leave zero residue while the
    retained Institution, member, Project, publication, Space `8/8`, Salon,
    thread, reply, and accepted audit truth remain exact.

Keep raw ids and private receipts under ignored `.station-private/pr542`.
Commit only public-safe counts, hashes, route outcomes, and screenshots.

## Required Validation

- migration source and actual-engine invariants, idempotent Project backfill,
  atomic rollback, append-only behavior, exact ACL/RLS, and no-drift hashes;
- focused Institution activity API/DTO and owner/member/hostile tests;
- complete Institution identity, Project, publication, Space, and community
  suites;
- representative personal Project/community and Settings AI Activity neighbor
  suites;
- web source tests for owner-only reachability, typed rendering, pagination,
  empty/error states, privacy, responsive layout, and theme behavior;
- API/web typecheck, lint, and root build with any known local packaging caveat;
  and
- exact-source Railway deploy, fresh retained verifier, responsive browser
  proof, and zero-residue evidence.

Add a focused `test:institution-activity` command if that keeps the new contract
independently runnable; do not weaken existing commands to make the lane pass.

## Exclusions

PR542 does not add analytics dashboards, charts, arbitrary filtering, exports,
notifications, member audit access, community-post mirroring, new moderator
authority, public activity, billing/provider traces, custom retention, or final
programme acceptance. PR543 owns the independent owner/member/unrelated/
signed-out hosted journey and MIMIR closeout.

## Baton

DAEDALUS implements and proves PR542 end to end, then wakes ARGUS with exact
migration/application source and retained hosted state. ARGUS owns independent
source, database, hostile-boundary, and hosted review. If accepted, ARGUS wakes
ARIADNE for the owner/member/unrelated/signed-out human rehearsal. ARIADNE wakes
MIMIR with the verdict. No subordinate agent opens PR543; MIMIR opens it after
accepting PR542.
