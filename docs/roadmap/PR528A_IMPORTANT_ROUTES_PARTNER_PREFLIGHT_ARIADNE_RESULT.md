# PR528A - Important Routes Partner Preflight ARIADNE Result

Owner: ARIADNE / A4 -> MIMIR / A1

Date completed: 2026-07-16

Status:

```text
READY_PR528_IMPORTANT_ROUTES_PARTNER_PASS_FOR_IMPLEMENTATION
```

## Verdict

The important-routes partner pass is ready for bounded implementation. The
selected route set explains Station's public, community, and private layers,
but the current hosted presentation is not yet ready to hand to Marty and his
partner unchanged.

Six fix-now slices remain. Three are narrow theme-token defects on principal
routes. Three are hosted preparation blockers: the public corpus is reachable
only through search and reads like internal proof material, the retained owner
workspace is dominated by rehearsal material, and private companion chat has
no accepted owner provider. These issues would materially distort a partner's
judgment of Station even though the route mechanics and privacy boundaries
work.

All other observed gaps are classified `DEFER_PR529` or `NO_ACTION`. Every
deferment has been added to the PR529 ledger.

## Exact Hosted Truth

Immediately before the accepted pass, both deployment endpoints returned HTTP
`200`, `ok:true`, `ready:true`, branch `main`, and the same exact runtime:

```text
e542423bc07a9be77e7ad82f2b5ac6b65af087da
```

| Service | Railway service | Result |
| --- | --- | --- |
| Web | `@station/web` | Ready at the exact SHA |
| API | `@station/api` | Ready at the exact SHA |

## Selected Partner Route Checklist

Dynamic identifiers below are intentionally reduced to route placeholders.

| Route | Why partner understanding depends on it | Core action or truthful outcome | Session and boundary | Rehearsal mode | Result |
| --- | --- | --- | --- | --- | --- |
| `/` | Establishes Station's public front door and names what stays private. | `Explore Discover` opens the public editorial layer. | Signed out; public metadata only. | Read-only. | Mechanics and composition pass; `NO_ACTION`. |
| `/discover` | Shows how a visitor finds public work, observatories, and discussion. | Public search opens a published Space document; the default feed exposes no current Space/document link. | Signed out; public and routeable metadata only. | Read-only search and navigation. | `FIX_NOW_PR528` public corpus/discovery preparation. |
| `/space/:slug` | Demonstrates that a Space is a bounded public microsite, not a profile. | Open one published work from the reading path. | Signed out; current published copy only; private Studio material is explicitly excluded. | Read-only. | Surface passes; current proof-style corpus is covered by `FIX_NOW_PR528`. |
| `/space/:slug/documents/:documentId` | Makes authorship, provenance, visibility, and the community handoff legible. | Open the linked Forum discussion. | Signed out; current published document and trust metadata only. | Read-only. | `FIX_NOW_PR528` Dark trust-header contrast and public corpus. |
| `/forums` | Shows Station's managed community structure before a visitor enters a thread. | Open a category/thread. | Signed out; public categories and summaries only. | Read-only. | Clear in all four cases; `NO_ACTION`. |
| `/forums/:categorySlug/:threadId` | Completes the document-to-discussion chain and shows contribution boundaries. | Read the thread and return to its source document; signed-out contribution remains unavailable. | Signed out; public thread only. | Read-only. | Surface passes; current proof-style corpus is covered by `FIX_NOW_PR528`. |
| `/studio` | Orients the owner inside Private Studio and distinguishes companion, Memory, Integrity, Archive, and public Space actions. | Open the primary companion. | Signed in; owner-only personas, counts, and due work. | Read-only. | `FIX_NOW_PR528` clean partner-owner corpus. |
| `/studio/personas/:personaId` | Demonstrates continuity as the core paid value and the return-to-thread experience. | `Continue` focuses the current composer; a new send truthfully reports that private chat needs an accepted provider and links to Settings. | Signed in; owner-only conversation and continuity shortcuts. | One reversible provider probe; otherwise read-only. | `FIX_NOW_PR528` accepted provider and clean corpus. Failed-send persistence is `DEFER_PR529`. |
| `/studio/personas/:personaId/memory-inbox` | Shows owner review between archived/imported material and Memory or Canon. | Open `Timeline` without accepting or rejecting retained candidates. | Signed in; owner-only pending suggestions. | Read-only. | `FIX_NOW_PR528` Light explanatory-copy contrast and clean corpus. Candidate mutation proof is `DEFER_PR529`. |
| `/studio/personas/:personaId/continuity` | Shows that continuity accumulates as durable, source-linked owner context. | Inspect Continuity Trust and use the Memory/Assistant destinations. | Signed in; owner-only records and sanitized runtime provenance. | Read-only. | Structure and mobile flow pass; clean corpus is `FIX_NOW_PR528`. |
| `/studio/archive` | Demonstrates archive as private trust infrastructure and owner-wide retrieval. | Run a no-match private search, read its truthful empty state, and clear it. | Signed in; owner-only sources; search does not cross into public/community data. | Read-only GETs. | `FIX_NOW_PR528` Dark primary-action contrast and clean corpus. Retention detail is `DEFER_PR529`. |

## Matrix And Human-Eye Result

Every selected route was exercised in:

- Light at `1440x900`;
- Dark at `1440x900`;
- Light at `390x844`; and
- Dark at `390x844`.

That produced `44` hosted route cases. Across the accepted matrix:

| Check | Result |
| --- | --- |
| Page exceptions | `0` |
| Non-aborted request failures | `0` |
| HTTP failures in the matrix | `0` |
| Unexpected matrix writes | `0` |
| Document-level horizontal overflow | `0` cases |
| Visible viewport escape | `0` cases |
| Theme resolution | Exact Light/Dark match in all `44` cases |

Deliberate full-page navigation cancels outstanding Next.js RSC requests. The
browser reports those as `net::ERR_ABORTED` and the matching exact framework
message, `Failed to fetch RSC payload ... Falling back to browser navigation`.
They had no HTTP failure, page exception, or non-aborted request failure and
are classified `NO_ACTION`, not hidden as product errors.

Human-eye review found coherent hierarchy, typography, density, and mobile fit
on the public home, Discover, public Space, Forums, Forum thread, Studio,
companion, Continuity, and the structural portions of Memory Inbox and Global
Archive. The public Space keeps its own dark editorial presentation in both
global appearance modes; that is an intentional microsite theme and remains
legible, so it is `NO_ACTION`.

Three concrete contrast failures remain:

1. The public document trust heading and explanatory copy use fixed dark text
   inside a theme-aware card and become unreadable in Dark.
2. `.archive-trust-copy` uses fixed `#a8b4c7`, which becomes too faint on the
   Light Memory Inbox surface.
3. Global Archive's shared `primaryButton` uses
   `background: var(--station-page-text)` with white text, producing a
   near-white `Ask Assistant` control in Dark.

The hosted content also reads as engineering evidence rather than a partner
rehearsal. Public Space/document/thread content is labeled as replay or proof
material, while the private owner contains many PR/rehearsal-labeled personas,
conversations, candidates, and archive rows. This is not a privacy leak, but it
materially obscures the product story.

## Fix-Now Implementation Packet

### Product Defects

| Slice | Exact boundary | User impact | Smallest implementation | Acceptance check | Likely owner |
| --- | --- | --- | --- | --- | --- |
| `PR528B-UI1` | `/space/:slug/documents/:documentId`; `DocumentTrustReadback` in `apps/web/app/space/[slug]/documents/[documentId]/page.tsx` | Dark readers cannot reliably read the trust heading/copy that explains provenance and privacy. | Replace the fixed dark heading/copy colours with existing semantic theme tokens. Do not change publishing, visibility, or discussion semantics. | Heading, copy, and row text reach at least `4.5:1` in Light/Dark at desktop/mobile; linked discussion still opens; no owner control appears signed out. | DAEDALUS; ARGUS gate; ARIADNE visual review. |
| `PR528B-UI2` | `/studio/personas/:personaId/memory-inbox`; `.archive-trust-copy` in `apps/web/app/globals.css` as consumed by `ImportReviewInbox` | Light-mode explanation of candidate promotion/preservation is too faint at the exact decision surface. | Tokenise only this explanatory text path, preserving pending/accept/reject semantics and the existing dark treatment. | Copy reaches at least `4.5:1` in Light/Dark at desktop/mobile; candidate controls and owner boundary are unchanged. | DAEDALUS; ARGUS gate; ARIADNE visual review. |
| `PR528B-UI3` | `/studio/archive`; `primaryButton` in `apps/web/components/studio/archive-library.tsx` | `Ask Assistant` appears white-on-near-white in Dark, so the route's operational help action is not legible. | Use a theme-safe foreground/background pair for this local button style. Do not change Assistant behavior or archive APIs. | Button label/border reach at least `4.5:1` in Light/Dark at desktop/mobile; focus and hover remain visible. | DAEDALUS; ARGUS gate; ARIADNE visual review. |

### Deployment, Configuration, And Corpus Blockers

| Slice | Exact boundary | User impact | Smallest implementation | Acceptance check | Likely owner |
| --- | --- | --- | --- | --- | --- |
| `PR528B-DATA1` | Signed-out `/discover` -> public Space -> document -> linked Forum thread; `/discover/feed` and existing public-safe rows | A partner must guess a broad search to reach the public microsite chain, then sees internal proof/replay copy instead of a credible Station publication. | Curate one dedicated public-safe Space/document/discussion chain and make it visible in Latest or Staff picks. Reuse current schemas and visibility rules. | A signed-out visitor reaches the chain from visible Discover content without guessing a query; copy has no PR/test/replay labels; Space, provenance, and linked discussion remain public-only. | MIMIR content direction; DAEDALUS hosted corpus; ARGUS privacy gate; ARIADNE review. |
| `PR528B-DATA2` | Retained partner-review owner on `/studio`, companion, Memory Inbox, Continuity, and Global Archive | Internal rehearsal rows dominate navigation and make continuity/archive look like test storage rather than a private studio. | Prepare an isolated partner-review owner with a small curated private corpus. Do not destructively prune the retained evidence owner or weaken quotas. | Studio presents a bounded set of human-readable personas and one coherent Memory/Continuity/Archive story; no failed/test/PR-labeled item is in the principal path; all data remains owner-only. | MIMIR fixture brief; DAEDALUS hosted corpus; ARGUS cleanup/privacy gate; ARIADNE review. |
| `PR528B-CONFIG1` | Partner-review owner provider configuration and `/studio/personas/:personaId` private chat | Companion is the core continuity action, but the live send can only show the truthful accepted-provider setup callout. | Configure one accepted owner provider for the isolated partner-review account through the existing Settings contract. Do not expose or commit the credential and do not relax provider policy. | One bounded chat receives a real reply, survives refresh, returns through the existing thread card, and is removed with exact cleanup after proof; archive/Memory boundaries remain private. | MIMIR authorization; DAEDALUS configuration; ARGUS credential/cleanup gate; ARIADNE rehearsal. |

## Explicit Classifications

### `DEFER_PR529`

The following are real but do not block the bounded partner route set once the
fix-now packet lands:

- failed provider sends leave a user-only conversation shell until explicit
  cleanup;
- candidate/Integrity mutation coverage needs a disposable lifecycle;
- Archive import still lacks exact durable-retention/removal language at the
  decision point;
- Billing Checkout/contrast, Developer Space lifecycle, Project lifecycle,
  public-persona discoverability, disposable auth/inbox, and second-actor
  community proof are outside this selected route set.

All nine items are now complete rows in
`PR529_POST_PARTNER_UI_DETAIL_RECONCILIATION.md`.

### `NO_ACTION`

- The public Space's independent editorial theme is intentional and legible.
- Signed-out Forum contribution is truthfully unavailable while reading and
  source-document return remain live.
- Station Assistant is presented only as an operational route helper.
- Memory candidates, Integrity Sessions, and retained owner history were not
  mutated merely to manufacture coverage.
- Billing, Settings, Developer Space, public persona, Projects, onboarding,
  and export were not added to the principal set without evidence that they
  directly block it.
- Next.js RSC cancellation messages caused by deliberate navigation are not
  product failures when the paired request is explicitly aborted and no HTTP
  or page error exists.

## Write Safety And Restoration

The matrix itself was read-only. Ordinary owner sign-in created only its exact
Auth delta. The companion unavailable-state probe created one exact new
conversation with its dependent message state. Before matrix capture, that
conversation was deleted and conversation/message identity sets matched the
pre-snapshot exactly.

After browser close, the owner-only, fsynced OS-temp journal drove exact cleanup
of the run's Auth session/refresh/audit delta and restored the captured Auth
user/identity audit fields. Existing ordinary Profile, community profile,
session/refresh non-token metadata, conversations, and messages matched the
durable pre-snapshot. A separate fresh process repeated the same read-only
proof. Recovery state was removed only after both proofs passed.

No credential, token, private identifier, private row body, or private
timestamp is present in this result. Temporary screenshots and harness files
are not repository artifacts.

## Validation

| Check | Result |
| --- | --- |
| Hosted web/API readiness | Pass at exact shared SHA |
| Principal core actions | Pass or exact truthful provider-unavailable outcome |
| Light/Dark desktop/mobile matrix | `44/44` completed |
| Unexpected page/request/HTTP/write/geometry failures | `0` |
| Exact cleanup proof | Pass |
| Independent fresh restoration proof | Pass |
| `git diff --check` | Required before commit |
| `pnpm typecheck` | Not required; documentation-only repository change, no import/script change |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR528A human-eye important-routes preflight and produced the bounded partner-readiness implementation packet.
Verdict:
- READY_PR528_IMPORTANT_ROUTES_PARTNER_PASS_FOR_IMPLEMENTATION
Task:
- Route the accepted PR528B fix-now slices, preserve PR529 deferrals, and keep the partner pass moving.
```
