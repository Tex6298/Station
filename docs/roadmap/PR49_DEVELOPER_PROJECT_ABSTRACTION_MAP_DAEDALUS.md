# PR49 - Developer Project Abstraction Map

Date: 2026-06-18
Agent: MIMIR, completing after DAEDALUS did not consume the PR49 wakeups
Status: accepted by ARGUS

## Direct Answer

The evolved Developer Pages picture does not conflict with the current
Developer Space implementation yet.

The current implementation is a valid Phase 2A / Tier 1 Showcase Window:
a single signed-in owner creates a Developer Space, sends public-safe node,
event, and snapshot data through an ingestion key, links public evidence, and
manages the owner console. That matches the current "developer hosts their own
system, Station provides public observatory plus archive/community surface"
relationship.

The conflict begins in Phase 2B if Station needs any of these to be true:

- more than one Station account can administer the same project;
- a Developer Page belongs to an institution, lab, or company rather than a
  single user;
- quotas, billing, usage, exports, and API integrations are attached to a
  project instead of only a profile;
- one project owns several public Spaces, documents, Developer Spaces, and
  future hosted runtimes;
- Tier 2 hosted runtime needs database/container/queue ownership separate from
  the human account that clicked "create."

So the current code is not wrong. It is just user-owned. Phase 2B should add a
Project layer beside it before hosted runtime work makes that assumption
expensive to unwind.

## Sources Inspected

- `docs/product/DEVELOPER_PAGES_CTO_BRIEF.md`
- `docs/product/Station_Document_2_Technical_Specification.md`
- `docs/roadmap/PR40_DEVELOPER_PAGES_PHASE2A_ALIGNMENT.md`
- `docs/roadmap/PR47_DEVELOPER_PAGES_OWNER_EVIDENCE_CONSOLE.md`
- `docs/roadmap/PR48_DEVELOPER_PAGES_OWNER_EVIDENCE_RECHECK_ARIADNE.md`
- `packages/db/src/types.ts`
- `packages/config/src/tiers.ts`
- `packages/auth/src/permissions.ts`
- `apps/api/src/routes/developer-spaces.ts`
- `apps/api/src/services/developer-space-usage.service.ts`
- `apps/api/src/routes/spaces.ts`
- `apps/api/src/routes/documents.ts`
- `apps/api/src/routes/exports.ts`
- `apps/api/src/routes/forums.ts`
- `apps/api/src/services/billing.service.ts`

## Current-State Inventory

### Profiles, Tiers, Billing

`profiles` is the current account and billing authority. It stores tier,
Stripe customer/subscription IDs, and subscription status. Stripe metadata maps
subscription state back to a single Station profile.

`packages/config/src/tiers.ts` defines subscription tiers and limits:

- `private` can use private Studio but has no Spaces or Developer Spaces;
- `creator` can create one Space but no Developer Spaces;
- `canon` can create one Developer Space;
- `institutional` exists as a type-level tier with larger limits, but it is not
  a real project/account model yet.

`packages/auth/src/permissions.ts` enforces user-tier counts directly through
`canCreateSpace` and `canCreateDeveloperSpace`.

Phase 2B implication: subscription tier is still useful as a user entitlement,
but project connection depth should become separate from profile tier. A Canon
user may own a Tier 1 Showcase Window; a company could later own a Tier 2
hosted project; a contributor might have editor access without personally
paying for the project.

### Developer Spaces

`developer_spaces` is currently the project-like object, but it is owned by
`owner_user_id`.

The route layer assumes direct ownership:

- create route requires the signed user to have Canon-tier Developer Space
  capacity, then inserts `owner_user_id: req.user.id`;
- owner management loads the space by ID and checks `space.owner_user_id` or
  admin;
- public reads are visibility-based and remain valid;
- live SSE and WebSocket-style updates authorize through the parent
  Developer Space;
- ingestion keys identify the Developer Space, then the parent space provides
  owner context.

Child runtime rows are scoped by `developer_space_id`:

- `developer_space_nodes`
- `developer_space_events`
- `developer_space_snapshots`

That shape is good. Runtime rows do not need direct user ownership if the
parent Developer Space is project-aware later.

### Developer Space Keys, Evidence, Usage, Exports

`developer_space_ingestion_keys` stores both `developer_space_id` and
`owner_user_id`. This works for a single-owner account but needs project-aware
audit ownership later: key creator, key owner/project, and key revoker are not
the same concept.

`developer_space_documents` stores `developer_space_id`, `document_id`,
`owner_user_id`, role, link visibility, and sort order. The linked Station
document itself is still `author_user_id` owned.

`developer_space_usage` stores `developer_space_id` and `owner_user_id`.
`developer-space-usage.service.ts` loads the owner's profile tier to determine
Developer Space quotas. This is the clearest future conflict: project usage
will need project connection depth and billing policy, not merely the human
owner's subscription tier.

`export_packages` stores `owner_user_id`, `persona_id`, and nullable
`developer_space_id`. Developer Space exports are owner-only and currently
load the Developer Space only if it belongs to the user. For projects, exports
need both project authority and actor audit: who requested it, what project it
belongs to, and whether the export includes private project material.

### Spaces And Documents

`spaces` uses `owner_user_id`; `space_pages` hangs off `space_id`.

`documents` uses `author_user_id` and optional `space_id` / `persona_id`.
Document creation validates that the linked Space or Persona belongs to the
same signed user. Developer Space evidence templates create ordinary documents
with `author_user_id` set to the signed user and `source_id` pointing to the
Developer Space.

This is fine for Phase 2A. For Phase 2B, project-authored material needs more
precision:

- a document may be authored by a human but owned by a project;
- a project may publish documents not tied to a personal Space;
- public evidence attached to a Developer Page should preserve both project
  provenance and human/editor attribution.

### Forums And Discussion

Threads and comments are user-authored through `author_user_id`.
Threads can link a Space, Persona, or Document, but not a Project. Public /
community visibility is derived from linked document visibility and forum
rules.

This is acceptable for now. A project-level forum can initially be represented
by linked Developer Page documents and ordinary forum categories, but true
project-scoped discussion will eventually need either `project_id` on threads
or a `project_forum_channels` relation.

### Storage, Tokens, Archive, Continuity

Current storage and token usage are profile-owned:

- `storage_usage.user_id`;
- `token_usage.user_id`;
- persona files, imports, memory, canon, continuity, integrity, and archived
  chats all use owner-user scoping.

That should stay user-owned until Station decides which private archive
material can become project material. Phase 2B should not casually move
personal continuity/archive data into project ownership.

## Conceptual Future Model

### Core Tables

Add a Project layer without replacing users:

```text
projects
- id
- owner_user_id
- name
- slug
- description
- visibility
- connection_tier: showcase | hosted | lab
- billing_mode: owner_profile | project_customer | invoiced
- created_at / updated_at

project_members
- id
- project_id
- user_id
- role: owner | admin | editor | viewer | billing
- status: invited | active | removed
- created_at / updated_at
```

Optional later tables:

```text
project_integrations
project_usage_records
project_subscriptions
project_forum_channels
project_runtime_environments
```

### Nullable Links

Add nullable `project_id` gradually, not as a hard rewrite:

- PR50 first anchor: `developer_spaces`, `developer_space_usage`;
- project-aware export lane: `export_packages`, after actor audit and
  membership permissions are explicit;
- later public/content lane: `spaces`, `documents`, `threads`;
- later only if product policy needs it: personas, archive/import/memory/canon
  records.

Keep `owner_user_id` / `author_user_id` during the transition. In Phase 2B,
project membership should add access, not erase the single-owner safety model.

### Access Model

Keep these distinct:

- `owner_user_id`: the original human owner or fallback account owner;
- `project_id`: the project/institution/lab that owns or frames the asset;
- `actor_user_id`: the human who performed an action;
- `author_user_id`: the human author of a document/thread/comment;
- `billing_owner`: who pays and receives quota;
- `connection_tier`: how deeply Station integrates with the project.

This distinction matters because the same user may be:

- a Basic subscriber personally;
- an editor on a Canon-level project;
- a billing admin for a Tier 2 hosted project;
- the author of a public evidence note but not the project owner.

## How The Seeded Examples Map Later

`station-replay-dev-alpha`:

- future project: `Station Replay Dev Alpha`;
- owner: replay owner account;
- connection tier: `showcase`;
- resources: one Developer Space, one node, one event, one snapshot, public
  methodology/finding/field-log evidence, one owner-only ARIADNE smoke note;
- billing: owner profile in current staging, project billing later.

`animus-field-lab`:

- future project: `Animus Field Lab`;
- owner: replay owner account;
- connection tier: `showcase`;
- resources: one Developer Space, one node, one event, one snapshot, public
  methodology/finding/field-log evidence;
- later proof value: shows that Project abstraction cannot be overfit to a
  single replay example.

No seed data needs to change for the first schema scaffold. Existing rows can
remain `project_id = null` until a backfill or explicit project creation lane.

## Risk Register

- Privacy: project membership must not grant access to personal archive,
  continuity, memory, canon, provider traces, private prompts, or owner BYOK
  material unless a separate policy explicitly allows it.
- Evidence: public Developer Page evidence currently requires public link
  visibility plus published/public document state. Preserve that predicate.
- Keys: ingestion keys need project/actor audit before multi-member projects
  can rotate or revoke keys safely.
- Quotas: Developer Space usage currently derives limits from profile tier.
  Project connection depth must not accidentally give every project member the
  owner's personal quota.
- Billing: Stripe customer IDs are profile-bound. Project billing should not be
  bolted onto `profiles.stripe_customer_id` without a separate project billing
  decision.
- Exports: project exports need actor audit and membership permissions; do not
  expose private project material to every member by default.
- Forums: linked document discussions can remain user-authored, but project
  forum moderation needs ownership clarity before institutions or labs use it.
- Backfill: adding `project_id` is low-risk if nullable, but dangerous if a
  migration tries to infer project ownership for personal Spaces, documents, or
  archives too aggressively.

## Recommended PR Sequence

### PR50 - Project Alpha Schema Skeleton

Smallest useful implementation:

- Add `projects` and `project_members`.
- Add nullable `project_id` to `developer_spaces` and
  `developer_space_usage`.
- Add DB/types coverage.
- Do not change route authorization.
- Do not backfill existing rows.
- Do not add `export_packages.project_id` yet.
- Add focused tests proving existing Developer Space routes still work with
  `project_id = null`.

This gives Phase 2B a real anchor without changing product behavior.

### PR51 - Project Membership Helpers

- Add pure helper/service functions for project roles and access decisions.
- Keep current owner checks as the only active route behavior.
- Add hostile tests: non-member, viewer, editor, admin, owner.
- Do not expose UI yet.

### PR52 - Developer Space Project Attachment

- Allow an owner to create or attach a Developer Space to a Project.
- Serialize non-secret project summary on owner reads.
- Keep public Developer Page reads unchanged unless the project is public.
- Add tests proving project members cannot see owner-only evidence unless their
  role allows it.

### PR53 - Project-Aware Usage And Exports

- Let Developer Space usage resolve limits from either owner profile or project
  connection tier.
- Add actor audit to project exports.
- Keep existing owner-only export semantics until membership policy is explicit.

### PR54 - Project Authorship For Evidence/Public Docs

- Add optional project provenance to documents created as Developer Page
  evidence.
- Keep `author_user_id`.
- Add visible public byline/provenance rules only after ARIADNE reviews the
  human wording.

## First Implementation Recommendation

Open PR50 next: Project Alpha Schema Skeleton.

Keep it deliberately boring:

- schema/types only;
- nullable links only on Developer Spaces and Developer Space usage;
- no ownership behavior change;
- no UI;
- no billing mutation;
- no Cloudflare, Tier 2 hosting, developer agent, or DexOS widgets.

That is the best next step because it lowers future migration pain while
preserving everything PR40 through PR48 just proved on staging.

## Decisions For MIMIR

1. Whether PR50 should include `export_packages.project_id` immediately or wait
   for the project-aware export lane. ARGUS decision: wait. Developer Space
   exports can still resolve project context through `developer_space_id` after
   PR50, and direct `export_packages.project_id` should arrive with actor audit
   and membership permissions.
2. Whether the first Project UI should appear in owner settings or stay API/doc
   only. Recommendation: no UI in PR50.
3. Whether project connection tier values should be `showcase`, `hosted`,
   `lab` or explicitly `tier_1_showcase`, `tier_2_hosted`,
   `tier_3_lab`. Recommendation: use explicit enum values in DB to avoid
   confusing them with subscription tiers.

## Validation

- Repo/code inspection only.
- No source files changed.
- `git diff --check` should be run before handoff.

## ARGUS Review Result

ARGUS accepted PR49 on 2026-06-18.

Current-repo grounding checked:

- `profiles` carries tier, Stripe customer/subscription IDs, and subscription
  status.
- `canCreateSpace` and `canCreateDeveloperSpace` enforce profile-tier counts.
- `developer_spaces`, ingestion keys, linked documents, usage, and export
  packages are currently direct `owner_user_id` shapes.
- Developer Space usage resolves limits from the owner's profile tier.
- `export_packages` currently has `owner_user_id`, nullable `persona_id`, and
  nullable `developer_space_id`, but no `project_id`.

ARGUS agrees with the direct answer: current Developer Spaces are compatible
with Phase 2A / Tier 1 Showcase Window. The conflict starts when Station needs
multi-account project ownership, institutional ownership, project-level
billing/quotas, or Tier 2 hosted runtime.

PR50 recommendation:

- Add `projects` and `project_members`.
- Add nullable `project_id` to `developer_spaces` and
  `developer_space_usage`.
- Keep route behavior, public reads, owner checks, billing, exports, seed data,
  and UI unchanged.
- Add tests proving existing Developer Space routes still work with
  `project_id = null`.
- Defer `export_packages.project_id` until the project-aware exports lane,
  because exports need actor audit and membership permissions rather than just
  an early nullable column.

Validation:

- `git diff --check`: pass with CRLF normalization warnings only.
