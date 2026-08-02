# PR541 - Institution Community Presence

Owner: DAEDALUS / A2 -> ARGUS / A3 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-08-02

Status:

```text
OPEN_PR541_INSTITUTION_COMMUNITY_PRESENCE
```

## Customer Result

The retained `Station Institutional Alpha` public Space has one real community
destination. A signed-out visitor can follow it into an active public Salon,
an eligible active Institution member can participate through the existing
forum controls, and the Institution owner can use the existing local report
and moderation workflow. The member receives no automatic moderator power.

This is a customer-facing continuation of the accepted Institution identity,
Project, publication, and Space journey. It is not a community placeholder,
an Institution-branded personal subcommunity, or a new discussion engine.

## Architecture Decision

Migration `097` extends the mature `community_subcommunities` relation with a
first-class Institution principal. Existing rows are personal-principal rows;
new Institution Salon rows have no hidden human owner:

- make `owner_user_id` nullable and add nullable `institution_id` referencing
  `institutions(id)` with `ON DELETE RESTRICT`;
- require exactly one of `owner_user_id` or `institution_id` for every row;
- keep both principal fields immutable;
- allow at most one Institution-principal subcommunity per Institution in
  Alpha;
- require an Institution-principal row to use the existing `salon` type and
  forbid personal Space or Developer Space links on that row; and
- preserve every existing personal row, owner, category, link, policy outcome,
  count, and fingerprint.

Do not represent this as a personal row owned by the Institution owner and do
not add a second shadow community model. The subcommunity remains the existing
forum category-backed product; only its principal and safe Institution
attribution are new.

## Atomic Creation And Audit

Add one service-only, database-atomic create transition. It must lock and
validate the Institution, reject null or non-owner actors, validate bounded
slug/title/description input, create the category and Institution Salon, and
append one typed Institution audit event in the same transaction. Any failure
must leave no category, subcommunity, or audit residue.

Extend the Institution audit constraints with an exact community creation
action and `institution_subcommunity` resource kind without weakening the
accepted publication and Space pairs. PR542 owns owner-facing audit readback;
PR541 only produces durable typed truth.

The RPC is executable by `service_role` only. It must fail closed for null,
unknown, member, invited, stale, removed, unrelated, anonymous, and repeated
creation attempts. Do not grant browser write authority to Institution,
subcommunity, category, moderator, report, thread, or audit tables.

Update the existing subcommunity owner/read/moderation policies and service
checks so the Institution owner is the local owner for this row. Effective
public visibility also requires the Institution to remain verified and public.
An active Institution member may read the private Institution workspace, but
membership alone does not bypass ordinary forum visibility or posting-tier
rules and never implies owner, admin, or moderator authority.

## Existing Community Contract

Reuse the current community stack:

- `forum_categories`, threads, comments, votes, reports, moderation actions,
  delegated moderator assignments, and public/community visibility rules;
- the current `/forums/[categorySlug]` and thread routes;
- the existing Basic/private-tier posting gate and ordinary authorship;
- the existing local owner/admin/delegated-moderator decision path; and
- current hidden/removed/report-review behavior and safe serializers.

Refactor synchronous personal-owner assumptions where necessary, but do not
change ordinary category behavior or make all Institution members local
moderators. Existing delegated moderator assignment remains explicit. A
personal subcommunity owner continues to have exactly the authority they have
today.

## API And DTO Boundary

Add a private Institution community read/create route for the Institution
owner and active member. The owner sees truthful create and moderation links;
the member sees a read-only role. Invited, stale, removed, unrelated, and
anonymous callers receive the same bounded not-found behavior used by the
other Institution workspaces.

Extend public and community serializers with bounded Institution attribution
only where the relation is effective. Safe attribution is name, slug, verified
state, and routeable href. Never emit raw Institution, owner, member,
moderator, audit, report, or profile ids through the public Institution
aggregate.

The strict signed-out Institution response may include one `community` summary
only when all of these are true:

1. the Institution is verified and public;
2. its authored Institutional Space is published;
3. its Institution-principal Salon is active and public; and
4. the forum category still resolves to that exact Salon.

The summary is limited to title, slug, bounded description, type, and public
href. Any lookup inconsistency or related-query failure fails closed rather
than returning a stale or partial link. Space unpublish, Institution
verification/publication loss, Salon pause/archive/non-public visibility, or
category mismatch removes the link on the next read. Institution
verification/publication loss must also make the Institution-principal forum
route unavailable publicly while preserving private owner/member truth.

## Product Surface

Add one Institution community workspace reachable from the Institution team
and Space workspaces:

- owner: create the one public Salon with title, slug, and description; then
  open the public category or its existing moderation queue;
- active member: read the linked community state and open it, with explicit
  existing-policy participation truth and no owner controls; and
- all states: show the Institution as principal, current public availability,
  and truthful failure/success feedback.

Add a full-width community band to the published public Institutional Space.
It should use the accepted Space visual language, show real title/description,
and link directly to the existing forum category. On the category/thread
surface, show bounded verified Institution provenance without importing a new
skin or duplicating the Institutional Space hero.

Keep desktop, `390px`, and `375px` layouts stable in light and dark themes.
Controls must wrap cleanly, expose visible focus, and produce no horizontal
overflow. Do not broad-reskin forums, nest cards, add gradients or decorative
blobs, or invent a parallel moderation dashboard.

## Retained Hosted Proof

Serialize migration, deployment, lifecycle, human-route, and cleanup proof.
Retain one active public Institution Salon for `Station Institutional Alpha`
with one clearly synthetic, useful discussion thread after proving:

1. migration `097` applies and ledgers exactly once with personal rows and
   policy fingerprints preserved;
2. the owner creates the category, Salon, and exact audit event atomically;
3. repeated, null, member, invited, stale, removed, unrelated, and anonymous
   creates fail with zero row/audit drift;
4. owner/member private readback is role-truthful and unrelated access is
   hidden;
5. the eligible active member creates one tagged thread and reply through the
   normal forum routes, with no tier or Institution-role bypass;
6. that member has no moderation controls before any explicit delegated
   assignment;
7. the owner handles one tagged report through the existing local moderation
   path and restores the retained thread to its intended visible state;
8. signed-out visitors can travel from the published Institutional Space to
   the Salon and retained thread without encountering private data;
9. Institution verification/publication loss removes public Institution
   attribution and reachability, then exact restoration returns it;
10. Space unpublish removes only the Space community band and exact republish
    restores it without recreating the Salon;
11. representative personal subcommunity creation, owner moderation,
    delegated moderation, visibility, category, thread, and comment behavior
    remains unchanged; and
12. disposable users, memberships, reports, threads, comments, categories,
    and communities are removed while retained Institution, Space `8/8`,
    Project, publication, Salon, and intended retained discussion state remain
    exact.

Keep credentials, raw ids, and private receipts under ignored
`.station-private/pr541`. Commit only public-safe evidence.

## Required Validation

- migration source and actual-engine invariants, atomic rollback, null-safe
  authority, ACL/RLS, audit-pair compatibility, and personal-row no-drift;
- focused Institution owner/member/hostile/public API and DTO tests;
- complete community subcommunity, category, thread, comment, report,
  moderation, delegated-moderator, and visibility suites;
- Institution identity, Project, publication, Space, Discover, writing,
  profile/auth, export, and billing/provider neighbor suites;
- API/web typecheck, lint, root build with a precise local packaging caveat;
  and
- exact-source Railway deploy, fresh retained verifier, public route receipts,
  responsive/theme browser proof, and zero-residue evidence.

## Exclusions

PR541 does not add a new forum engine, multiple Institution communities,
private departments, Institution-wide moderator roles, automatic member
moderation, custom community themes, approval workflows, custom domains,
community analytics, billing, provider changes, owner audit UI, or final
Institutional Alpha closeout. PR542 retains owner activity/audit readback and
PR543 retains the complete independent programme rehearsal.

## Baton

DAEDALUS implements and proves PR541 end to end, then wakes ARGUS with the exact
source and hosted retained state. ARGUS owns independent source/hosted review;
if accepted, ARGUS wakes ARIADNE for the owner/member/signed-out human
rehearsal. ARIADNE wakes MIMIR with a public-safe verdict. No owner may open
PR542 or take another agent's assigned work from silence.
