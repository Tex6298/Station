# PR539 - Collaborative Institution Publishing

Owner: DAEDALUS / A2 -> ARGUS / A3 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-31

Status:

```text
OPEN_PR539_COLLABORATIVE_INSTITUTION_PUBLISHING
```

## Customer Result

The retained Institution owner and active member collaborate on one piece of
Institution-owned work attached to the retained Institution Project. The
member can create and edit a draft, the owner can also edit and is the only
person who can publish or retract it, and a signed-out visitor can read only
the deliberately published version with clear Institution and human
attribution.

This is a new customer capability. It is not satisfied by assigning a personal
Station document to an Institution in presentation copy or by giving a member
the owner's personal writing authority.

## Publication Model

Migration `094` adds a first-class `institution_publications` relation rather
than weakening the mature personal `documents.author_user_id` contract.
Required fields and invariants are:

- immutable `institution_id` principal with `ON DELETE RESTRICT`;
- immutable `project_id` referencing a Project owned by that same Institution;
- immutable original human creator reference plus a durable public-safe creator label;
- current last-editor id plus a durable public-safe editor label;
- Institution-scoped unique slug, bounded title/summary/body/document type;
- optimistic integer `version` beginning at `1`;
- exact `draft` or `published` state with private/public visibility derived
  from that state;
- publication/retraction timestamps and actor attribution; and
- created/updated timestamps using the database clock.

Human attribution is provenance, not ownership. Removing a member from the
Institution ends future authority but must not transfer or delete Institution
work. Use nullable actor references with `ON DELETE SET NULL` plus immutable
bounded attribution labels so the publication survives later account removal.

Do not add a hidden personal owner, reuse `documents.author_user_id` as an
organisation steward, duplicate Institution members into another membership
table, or relax personal document RLS/routes. Personal documents, versions,
discussions, Spaces, personas, and publishing flows remain unchanged.

## Atomic Transitions

All raw table authority remains service-only. Add bounded service-owned
transitions for:

1. **Create draft** - Institution owner or exact active member; retained
   Institution Project must belong to the same Institution.
2. **Edit draft** - owner or exact active member; full validated draft snapshot
   plus `expectedVersion`; stale versions return a stable conflict and do not
   overwrite another collaborator.
3. **Publish** - Institution owner only; requires verified/public Institution,
   a valid non-empty draft, and matching expected version.
4. **Retract** - Institution owner only; returns the current work to private
   draft state, records retraction, and keeps the same Institution asset ready
   for further member editing and later republication.

Invited, stale, removed, unrelated, anonymous, and active-member publish/
retract attempts must fail without revealing whether a private publication
exists. Principal, Project, creator, and original creation attribution are
immutable. Editing updates last-editor attribution and version only through
the transition.

## Audit Contract

Extend the append-only Institution audit action allowlist with exact
publication actions:

- `publication_created`;
- `publication_edited`;
- `publication_published`; and
- `publication_retracted`.

Add a nullable paired resource reference to Institution audit events so these
actions identify the publication for later PR542 owner readback. Existing
events retain null resource references. Enforce both-null-or-both-present,
allow only the bounded resource kind, and write publication events inside the
same transaction as each successful transition. Do not expose raw audit rows
in PR539 UI or public DTOs.

## API And DTOs

Use Institution-scoped authenticated routes for team work and a separate
strict public route. The exact path shape may follow local router conventions,
but it must make the authority boundary obvious.

Private owner/member responses may include:

- publication title, slug, summary, body, document type, status, version, and
  timestamps;
- retained Institution and Project names/slugs with route hrefs;
- creator and last-editor public labels; and
- exact access `{ role: institution_owner|institution_member, readOnly }` plus
  explicit `canPublish`/`canRetract` booleans.

They must not include raw Institution/Project/profile/audit ids, emails,
membership timestamps, billing/provider data, tokens, or personal Studio
resources.

The signed-out public response exists only when both publication and principal
are public/verified. It includes the published body and bounded attribution,
not private versions, editor ids, audit data, team roster, or draft metadata.
Retraction or Institution verification/publication loss returns `404` and also
removes any public index entry added in this lane.

## Product Surface

Translate the capability into the current Tex Station system without a global
reskin:

- Institution team page: a publication workspace showing drafts and published
  work attached to the retained Project;
- owner and member: create/open/edit draft affordances with visible original
  creator, last editor, version, save state, and conflict feedback;
- active member: no publish or retract control;
- owner: explicit publish/retract controls with success/error feedback;
- signed-out visitor: a readable Institution publication page naming the
  Institution, linked Project, and human creator; and
- desktop/mobile plus light/dark behavior with no overflow, false controls, or
  silent actions.

Use the existing Station typography, panels, notices, buttons, and form
patterns. Do not import Discern CSS, broaden unrelated Writing/Discover pages,
or turn PR539 into the PR540 branded Institutional Space.

## Retained Hosted Proof

Serialize exact migration, deployment, lifecycle, and cleanup. Use the retained
Institution, owner, active member, and Institution Project. Retain one clearly
tagged publication after proving:

1. member creates version `1` draft with Institution and Project principal;
2. owner and member each complete an edit with exact attribution/version
   movement;
3. a stale expected version loses cleanly without overwriting current text;
4. member publish/retract is denied;
5. owner publishes and signed-out public read returns exact bounded content;
6. owner retracts and public read/index return `404`/absent while team draft
   access remains;
7. member edits the retracted draft and owner republishes it;
8. invited, stale, removed, unrelated, and anonymous private reads/writes are
   denied;
9. Institution verification/publication revocation hides public work without
   deleting private team state, then exact restoration returns it;
10. original creator attribution stays stable while last-editor attribution
    and version move truthfully;
11. audit events and resource references match only successful transitions;
12. personal document/publication row counts and representative personal
    create/edit/publish/read behavior remain unchanged; and
13. disposable accounts, memberships, drafts, and proof rows are removed with
    Auth/profile authority, migration/catalog, and non-target row fingerprints
    restored or explicitly explained.

Keep credentials, tokens, raw ids, private labels, and full database receipts
under ignored `.station-private/pr539`. Commit only redacted proof.

## Required Validation

- migration source/shape, exact constraints, ACL/RLS, transition privilege,
  audit resource, and personal-schema compatibility tests;
- focused Institution publication route tests for owner/member/hostile/public
  states, optimistic conflict, exact serializers, and stable failures;
- Institution, Project, auth/profile-boundary, writing/document, Discover,
  community, Space, Developer Space, and export neighbour suites;
- lint, API/web typecheck, root build, and precise reporting of any known
  local-only packaging failure;
- hosted exact-source, ledger/catalog, retained-state, no-drift, and cleanup
  verification; and
- ARIADNE human-eye rehearsal of owner, member, and signed-out visitor paths
  after ARGUS source/hosted review.

## Exclusions

PR539 does not add branded Institutional Space aggregation, Institution
subcommunities, delegated editorial roles, comments/discussions on Institution
work, advanced revision comparison, approvals, analytics, billing, custom
domains, or global Writing/Discover redesign. PR540-PR543 retain those programme
responsibilities.

## Baton

DAEDALUS implements and proves PR539 end to end, then commits a public-safe
result and wakes ARGUS. ARGUS reviews source and fresh hosted truth, then wakes
ARIADNE for the bounded human rehearsal. If either reviewer watcher remains
unavailable, the current owner must wake MIMIR with exact completed/blocking
state instead of sleeping and leaving PR536 idle.
