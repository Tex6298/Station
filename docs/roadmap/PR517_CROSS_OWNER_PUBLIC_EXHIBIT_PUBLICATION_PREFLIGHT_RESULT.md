# PR517 - Cross-Owner Public Exhibit / Publication Preflight Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted with next contract lane

## Verdict

ARGUS accepts the smallest safe next Phase 3 lane as:

```text
ACCEPT_PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT
```

Next lane:

```text
PR517A - Cross-Owner Metadata-Only Public Exhibit Contract
Owner: DAEDALUS / A2
```

MIMIR should close PR517 if accepted and route DAEDALUS to PR517A with the
contract boundary below. PR517A is not approval for generated-word publication,
transcripts, excerpts, summaries, private saved cross-owner artifacts, Discover
search/index/feed surfacing, public persona or Space surfacing, provider calls,
retrieval, storage, billing, social posting, queues/workers, Cloudflare, Redis,
package/lockfile drift, or broad UI work.

## Why Metadata-Only First

PR510B proves same-owner public encounter exhibits can be metadata-only,
reportable, retractable, removable, and discover-searchable without exposing
private setup or generated words.

PR511 deliberately kept all cross-owner public scopes non-executable. PR511A
through PR516 then proved the missing foundation: bilateral consent ledger,
runtime context readiness, runtime attempt audit, consent-scoped private
disposable preview, owner-only invitation/inbox UI, and hosted invitation to
approval to one private disposable preview.

That foundation is enough to define a public metadata contract, but not enough
to publish generated words. PR516's generated output remains private,
disposable, not saved, not public, not canonical, no retrieval, and
counterparty-hidden. A generated-word lane would need a separate saved-output
and exact-text bilateral publication contract before any excerpt, transcript,
or summary can be public.

A private saved cross-owner artifact is also not a prerequisite for
metadata-only publication if PR517A treats the public object as newly
owner-authored public metadata approved by both owners, not as a saved preview
or transcript derivative.

## Current Implementation Findings

- Same-owner public exhibits are intentionally source-bound to
  `persona_encounter_private_sessions`: migration `076` requires
  `private_session_id`, `publication_candidate = true`, private visibility, no
  retrieval, and both source personas still owned by the exhibit owner.
- The same-owner publish route
  `POST /persona-encounters/private-sessions/:sessionId/public-exhibit`
  rechecks same-owner source personas before writing a public exhibit.
- Current public exhibit serializers and web routes label same-owner display
  snapshots and say the source is a private same-owner saved artifact.
- The cross-owner consent ledger contains the future scope label
  `publish_metadata_only_public_exhibit`, but all generic consent readback
  still marks requested scopes and the ledger as `executable: false`.
- The cross-owner disposable preview route returns one private generated reply
  and explicitly reports `saved: false`, `public: false`,
  `publicExhibitCreated: false`, no transcript, no summary, no excerpt, no
  share link, and no retrieval.
- Same-owner public exhibit reporting, admin remove, and restore behavior exist,
  but cross-owner restore must add an active bilateral-public-consent gate. The
  current same-owner restore path cannot be reused as-is for cross-owner
  content.
- Discover search currently filters same-owner public exhibit rows and uses
  same-owner labels/source copy. PR517A must not accidentally make cross-owner
  exhibits appear in `/discover/search`, `/discover/feed`, `/encounters` index,
  public persona pages, Space pages, forums, Salon, Station Press, or writing.

## Accepted PR517A Shape

PR517A may define a contract for one metadata-only cross-owner public exhibit
object whose public fields are explicitly approved by both participant owners.

The contract may expose only:

- owner-authored public title;
- owner-authored public summary or context note;
- optional public tags;
- safe requester and counterparty persona display snapshots;
- public slug or route href that is not a raw consent, persona, owner, runtime
  attempt, or database id;
- provenance labels that say the exhibit is cross-owner, metadata-only,
  bilaterally approved, and public;
- status and timestamps for draft/proposed/approved/published/retracted/
  removed or the closest implementation-native equivalent;
- report/takedown availability.

The public object must not expose generated text, transcripts, excerpts,
summaries of generated words, private setup, prompt material, source retrieval,
provider payloads, token facts, Memory, Archive, Canon, Continuity, Integrity,
private notes, raw internal ids, SQL details, stack traces, env values, tokens,
cookies, or secret-shaped strings.

## Required Contract Boundary

PR517A must not retroactively turn existing PR511A-PR516 consent rows into
public publication permission.

DAEDALUS should use one of these safe patterns:

- a dedicated cross-owner public metadata approval/proposal table tied to a
  participant consent row; or
- a hard-versioned consent/publication contract that requires a new explicit
  public metadata scope version and prevents older generic ledger rows from
  becoming executable.

The safer default is a dedicated table, for example:

```text
public.persona_encounter_cross_owner_public_exhibits
```

Required properties:

- references one active participant consent row;
- requires requester and counterparty owner/persona snapshots from that
  consent, not browser-supplied raw ids;
- stores only bounded public title, public summary, and public tags;
- stores both participant owners' explicit approval of the exact public
  metadata body and contract version;
- records revocation/retraction/removal/tombstone state without retaining
  generated words;
- exposes public reads only for published, non-retracted, non-removed rows with
  active bilateral public metadata approval;
- keeps owner/participant reads bounded to safe display snapshots, statuses,
  scope version, timestamps, and audit/provenance facts.

If DAEDALUS proposes extending `persona_encounter_public_exhibits` instead,
the implementation must preserve the same-owner trigger and RLS behavior
unchanged, add explicit source-kind constraints, and prove cross-owner rows
cannot satisfy or weaken the same-owner private-session path. ARGUS should
prefer a dedicated cross-owner table unless MIMIR explicitly chooses the
extension route.

## Consent And Revocation Requirements

PR517A must require explicit bilateral approval for:

- the `publish_metadata_only_public_exhibit` public scope;
- the public metadata contract version;
- the exact title, summary, tags, display snapshots, and public provenance
  labels that will be shown.

One owner cannot publish or restore public cross-owner metadata alone.

Required behavior:

- pending, rejected, cancelled, revoked, expired, superseded,
  blocked-by-deletion, and moderation-locked consents cannot create or publish
  a public exhibit;
- revocation before publication blocks publication;
- revocation after publication hides/retracts the public exhibit, leaves safe
  audit/tombstone state, and removes it from public routes and any future
  search/index/feed surfaces;
- moderation removal stays hidden until both moderator action and fresh active
  bilateral public metadata approval allow restore;
- owner retract and platform moderation removal remain separate controls;
- persona deletion or owner deletion blocks or retracts future public use and
  leaves only safe compliance/moderation state.

## Public Route Boundary

PR517A may add a dedicated public detail route or API readback for one
published cross-owner metadata-only exhibit.

PR517A must not add cross-owner exhibit rows to:

- `/encounters` index;
- `/discover/search`;
- `/discover/feed`;
- public persona pages;
- Space pages;
- forum/community/Salon surfaces;
- Station Press or writing/publication surfaces.

Those surfacing decisions require later hostile preflights and hosted proofs.

If PR517A uses the existing `/encounters/[slug]` route family, the route must
clearly distinguish same-owner and cross-owner provenance in the API response
and visible copy. It must not reuse same-owner "private saved artifact" source
copy for cross-owner rows.

## Deletion And Export Requirements

Before any public route can return a cross-owner exhibit, PR517A must define
safe handling for:

- requester or counterparty persona deletion;
- requester or counterparty owner/account deletion;
- consent revocation;
- public exhibit retract/remove/restore;
- owner export/readback.

Owner export, if touched, may include only the requesting owner's participant
view of the public metadata approval, status, and audit facts. It must not
include counterparty private fields, raw owner ids, raw persona ids, private
setup, generated output, prompts, provider payloads, source bodies, SQL
details, cookies, tokens, env values, or secret-shaped strings.

If export is not implemented in PR517A, PR517A must still prove that existing
export routes do not leak cross-owner exhibit internals and must document the
future export contract before broader public surfacing.

## Rejected Shapes

`ACCEPT_PR517A_CROSS_OWNER_GENERATED_WORD_PUBLICATION_CONTRACT` is not the next
safe lane. The repo has no saved cross-owner generated-output artifact, no
counterparty-visible exact-text review, no exact excerpt/transcript/summary
approval, and no generated-word deletion/export/public labeling contract.
PR516's output is deliberately private and disposable.

`ACCEPT_PR517A_CROSS_OWNER_PRIVATE_SAVED_ARTIFACT_BEFORE_PUBLICATION` is not
required before a metadata-only public exhibit contract. A saved private
cross-owner artifact is required before generated-word publication, but
metadata-only public title/summary/tags can be separately approved by both
owners without storing or exposing generated output.

`BLOCK_PR517_CROSS_OWNER_PUBLIC_EXHIBIT_PUBLICATION_PREFLIGHT` is not needed
because no concrete blocker prevents a metadata-only contract lane. The
blocker is only against generated-word publication and against reusing
same-owner public exhibit machinery without a cross-owner approval contract.

## Allowed PR517A File Scope

Allowed implementation files for PR517A:

- the next Supabase migration for a dedicated cross-owner public exhibit
  contract table, or a narrowly justified extension migration that preserves
  all same-owner constraints;
- `packages/db/src/types.ts`;
- `packages/types/src/index.ts` or local public exhibit/consent type files if
  needed;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/persona-encounters.test.ts`;
- `apps/api/src/routes/reports.ts`;
- `apps/api/src/routes/reports.test.ts`;
- `apps/api/src/routes/exports.ts` and `apps/api/src/routes/exports.test.ts`
  only if the lane implements the owner-export readback contract;
- `apps/web/lib/persona-encounter-runtime.ts`;
- `apps/web/lib/persona-encounter-runtime.test.ts`;
- a dedicated public detail page/helper only if the route stays detail-only and
  does not add index/search/feed surfacing;
- focused Studio owner readback/helper files only if needed for exact-metadata
  approval;
- roadmap and validation docs.

Do not touch package/lockfile, provider adapters/router defaults, conversation
runtime, retrieval/vector/embedding code, Discover/search/feed, `/encounters`
index, public persona serializers, Space serializers, forum/community/Salon/
Station Press surfaces, Archive, Memory, Canon, Continuity, Integrity, billing
or Stripe, Redis, Cloudflare, queue/worker/webhook code, storage buckets,
social connectors, deployment config, or broad Studio/public UI.

## Required PR517A Tests

DAEDALUS should prove at minimum:

- cross-owner public exhibit contract rows require auth and participant owners;
- no public exhibit can be created from nonparticipant, same-owner, missing,
  inactive, revoked, expired, superseded, deletion-blocked, or
  moderation-locked consent;
- old PR511A/PR516 consent rows are not retroactively executable for public
  metadata;
- both participant owners must approve the exact public metadata body and
  contract version before publication;
- one-owner publish, restore, metadata mutation, or scope widening fails
  closed before public writes;
- public read returns only safe metadata and cross-owner provenance for
  published, active, non-removed rows;
- public read returns bounded `404` for missing, draft/proposed, unapproved,
  revoked, retracted, removed, deleted, malformed, wrong-schema, and wrong
  source rows;
- consent revocation after publication hides/retracts the public row and leaves
  safe audit/tombstone state;
- moderation remove hides the public route, and restore requires both
  moderator action and active bilateral public metadata approval;
- public report creation and admin queue context stay safe and do not expose
  private setup, generated words, raw ids, provider details, SQL, stack traces,
  or secrets;
- existing same-owner public exhibit publish/retract/report/list/search tests
  remain green and same-owner source constraints are not weakened;
- PR516 disposable preview remains private, unsaved, not public, no retrieval,
  and counterparty-hidden;
- Discover/search/feed/index/persona/Space/forum/writing samples do not show
  cross-owner exhibit rows in PR517A;
- owner export either includes only the accepted bounded participant readback or
  existing export routes prove no cross-owner exhibit internals leak;
- no provider call, source retrieval, token accounting, storage write,
  queue/worker job, Redis/Cloudflare operation, billing action, social post, or
  package/lockfile change occurs.

Minimum validation:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

ARGUS review must also run changed-path, forbidden-path, public-surfacing,
same-owner regression, cross-owner consent, revocation/moderation, export,
raw-id, and secret-shaped-value scans.

## Hosted Proof After ARGUS Review

If PR517A is implemented and accepted locally, MIMIR should route ARIADNE for a
hosted proof before customer-facing closeout.

Hosted proof should verify:

- hosted migration/contract shape is present;
- owner A proposes one metadata-only public exhibit for an approved cross-owner
  public metadata scope;
- owner B sees only safe public metadata and approves or rejects the exact
  metadata body;
- signed-out public detail, if included, shows only safe metadata and cross-
  owner provenance;
- signed-in report or accepted bounded report path works;
- revocation hides the public route;
- moderation removal hides the public route and restore requires active
  bilateral public metadata approval;
- signed-out and nonparticipant probes fail closed;
- public search/feed/index/persona/Space/forum/writing samples show no
  cross-owner row outside the accepted detail scope;
- no private session, generated-word publication, transcript, summary, excerpt,
  memory, canon, archive, continuity, export internals, storage object, provider
  call, billing action, queue/worker job, Cloudflare/Redis action, social post,
  package/runtime drift, or deployment drift appears;
- sanitized proof output records no raw ids, setup bodies, generated text,
  prompt bodies, source bodies, provider details, env values, tokens, cookies,
  SQL details, stack traces, screenshots, traces, videos, browser storage
  state, bearer values, or secret-shaped strings.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 67 tests passed, including same-owner public exhibit publish/report/retract, cross-owner consent non-executable scopes, cross-owner disposable preview privacy, and public/no-drift helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed, including public encounter exhibit report queue context and admin remove/restore behavior. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 212 tests passed, including metadata-only public exhibit copy and cross-owner consent Studio helper boundaries. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |
| Current source review | Pass | Same-owner public exhibit schema/routes remain same-owner/private-session-bound; cross-owner consent scopes remain non-executable; PR516 preview remains private/disposable/not-saved/not-public. |
| Scope decision | Pass | Next lane can be metadata-only public exhibit contract only. Generated-word publication and private saved cross-owner artifacts remain blocked. |

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR517A as ACCEPT_PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT.
- The smallest safe next lane is a DAEDALUS contract for bilaterally approved cross-owner public metadata: title, summary, tags, safe display snapshots, provenance, report/takedown, revocation, deletion/export, and no generated words.
- PR517A must not reuse PR516 private disposable preview output as source material, must not retroactively make older generic consent rows executable, and must not weaken the same-owner public exhibit table/route constraints.
- Generated-word excerpts, transcripts, summaries, private saved cross-owner artifacts, Discover/search/feed/index surfacing, public persona/Space/forum/Salon/Station Press surfacing, provider calls, retrieval, storage, billing, social, Redis, Cloudflare, queues/workers, package/lockfile, and deployment drift remain blocked.
- PR517 validation passed.
Task:
- Close PR517 if accepted and wake DAEDALUS for PR517A using this metadata-only public exhibit contract boundary.
```
