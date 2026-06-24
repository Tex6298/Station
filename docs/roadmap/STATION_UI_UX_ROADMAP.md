# Station UI/UX roadmap

Date: 2026-06-06
Status: ARIADNE-reviewed post-V3 planning base. This is not active
implementation scope until MIMIR explicitly opens a UI/UX lane.

## Why this roadmap exists

The Station north star is bigger than the current maintenance roadmap: private
continuity, archive trust, public authorship, managed community, Developer
Space observability, billing clarity, and long-range research infrastructure.
V3 made the foundation reliable first. This roadmap translates the product
vision into UI/UX lanes that can begin only after MIMIR explicitly opens a
post-V3 UI/UX feasibility or implementation handoff.

This is not a vague redesign. Every lane should be narrow enough for DAEDALUS to
estimate, ARGUS to gate, and ARIADNE to review against real user journeys.

## Product principles

- Station is a private continuity studio, archive, publishing system, managed
  community, public presentation layer, Developer Space ecosystem, and paid
  service. It must not feel like one generic dashboard.
- Archive is trust infrastructure. Storage, import, export, search, backup, and
  quota messaging should help users understand what is preserved, private,
  portable, and safe.
- Continuity is the core paid value. The UI should make accumulating memory,
  canon, integrity outputs, archive references, and timeline records legible.
- The Station Assistant is operational, not a persona. It guides archive,
  publishing, Space editing, billing, onboarding, and platform work.
- Spaces are microsites, not profiles. They should feel authored, public, and
  intentional.
- Developer Spaces are observatories, not generic dashboards. Visitors need a
  composed public view; owners need private operator controls.
- Visibility and privacy are structural. UI copy, empty states, and controls
  must reflect API/data boundaries rather than pretending privacy is cosmetic.
- Mobile matters, especially Studio. The product can be emotionally serious
  without being solemn, corporate, or joyless.

## Current UI/UX truth

- V3 implementation is closed through V3-05: storage, integrity, token-credit,
  archive/export job reliability, and visibility-safe search hardening are
  accepted.
- MIMIR opened DAEDALUS feasibility review for UX-01 Studio IA/mobile and UX-02
  Archive trust. This is planning/feasibility only, not implementation.
- Post-V3 UI work should not begin as implementation until MIMIR explicitly
  opens a UI/UX lane.
- Existing frontend surfaces cover many domains, but they need a deliberate
  information architecture pass before broad polish.
- The first UX question is wayfinding, not decoration: every major surface
  should make place, privacy state, and the next action obvious before visual
  polish begins.
- Railway PR30 rehearsal found an existing 375px global top-nav caveat: `My
  Space` and `Developer` link bounds can sit offscreen without creating
  document-level horizontal scroll. Treat this as site chrome/mobile IA work,
  not as a document-versioning blocker.
- Known lint/build warnings around React hook dependencies and raw `<img>` use
  should become explicit ARGUS acceptance concerns when a lane touches those
  screens.
- Railway staging should get a real browser review once live; code review alone
  is not enough for the final UX pass.
- PR198 is the active feasibility lane for UX-01 Studio IA/mobile and UX-02
  Archive trust after the protected-alpha demo script passed. It should map
  routes/components and recommend small slices before implementation starts.
- PR199 opens UX-01A as the first implementation slice: Studio place and mobile
  workbench clarity using existing route helpers, Studio frame primitives, and
  scoped CSS.
- PR200 opens ARIADNE's visible desktop/375px review for UX-01A before MIMIR
  closes the slice or opens UX-02A/UX-01B.
- PR200 accepted UX-01A. After PR262/PR263 closed the runtime provenance
  readback/rehearsal chain, MIMIR opened PR264 as UX-02A Per-Persona Archive
  Trust States against `/studio/personas/:personaId/files`.
- PR264 is accepted by ARGUS with a narrow source-count honesty patch. PR265
  passed ARIADNE hosted desktop/mobile rehearsal before UX-02A closeout.
- PR266 completed DAEDALUS post-Archive UX lane selection: PR264/PR265 close
  UX-02A, UX-02B Persona Export Status is current, UX-DEBT-01 mobile top-nav is
  current, and the next recommendation is staging readiness evidence rather
  than another local UX implementation lane.

## Major surfaces

- Studio: private, calm, capable, and intimate. Persona workspace, active chats,
  memory, canon, archive, Integrity Sessions, continuity, documents, and
  Assistant should feel like one private workbench with clear modes.
- Archive: trustworthy and legible. Import, export, search, storage/quota, and
  preservation states should explain what is safe, what is private, what is
  preserved, and what is portable.
- Continuity: confidence-building. Timeline records, source links, candidate
  review, archive-to-continuity conversion, and summaries should show that the
  persona is accumulating durable context.
- Public Spaces: authored microsites. Documents, public persona cards, creator
  identity, templates, and bounded customization should feel more like a small
  public home than a social profile.
- Discover: public front door. Editorial highlights, public documents, Spaces,
  Developer Spaces, community moments, and search must remain visibility-safe.
- Forums and community: serious but not joyless. Categories, sub-communities,
  moderation clarity, provenance labels, and discussion entry points should
  support culture without becoming an infinite feed.
- Developer Spaces: public observatory plus private console. Visitor visuals,
  methodology/finding/field-log documents, ingestion keys, usage/quota, and
  operator controls must be clearly separated.
- Billing and entitlements: transparent, calm, and non-coercive. Tier
  differences, quota limits, upgrade prompts, billing status, and top-up states
  should never use dark patterns.
- Onboarding: path selection without overload. API Bridge, Document Migrator,
  Awakening, and Fresh Start need different copy, affordances, and pacing.
- Station Assistant: operational guide, not persona. It should help users
  understand platform tasks across Studio, archive, publishing, Spaces,
  onboarding, and billing without adopting the immersive tone or continuity
  model of a user persona.

## User journeys

- Persona keeper: starts in Studio, opens active chats, archives transcripts,
  reviews candidates, runs Integrity Sessions, and watches continuity
  accumulate.
- Archive-first user: imports documents or external materials, checks storage
  and privacy status, searches later, exports safely, and trusts that nothing is
  trapped.
- Public author: writes or publishes documents, builds a Space, chooses public
  persona presentation, and understands the private-to-public copy boundary.
- Community participant: discovers work, reads discussions, sees provenance,
  joins the right category or sub-community, and knows what visibility applies.
- Researcher or builder: creates a Developer Space, manages ingestion keys and
  usage, links methodology/finding/field-log documents, and shares a public
  observatory visitors can understand.
- Paying user: sees tier limits, quota status, token-credit or entitlement
  state, billing actions, and upgrade reasons without pressure tricks.
- New user: chooses API Bridge, Document Migrator, Awakening, or Fresh Start
  based on what they already have and how much guidance they need.

## ARIADNE product-experience pitch

Information architecture should make Station's places explicit. A user should
never have to infer whether they are doing private Studio work, public Space
presentation, community participation, Discover browsing, Developer Space
operation, archive management, billing, onboarding, or Assistant-guided
platform work. Each surface needs a stable place label, a visible primary next
action, and clear privacy/visibility language when content can move between
private, community, and public states.

Emotional tone should vary by surface:

- Studio: calm, private, capable, and close to the user's work.
- Archive: reassuring, precise, and explicit about preservation, portability,
  and failure states.
- Continuity and Integrity: grounded, reflective, and non-magical while still
  respecting why the material matters to the user.
- Public Spaces: authored and expressive, with the creator's work at the
  center instead of account-metadata chrome.
- Discover: editorial and alive, not algorithmic or feed-first.
- Forums: serious, generous, and moderated without sounding corporate.
- Developer Spaces: observatory-readable for visitors and operationally exact
  for owners.
- Billing: plain, calm, and transparent.
- Onboarding and Assistant: sympathetic and useful without making ontological
  claims about persona transfer or awakening.

Mobile priorities should be named in every lane that touches Studio, archive,
continuity, onboarding, or billing. At 375px width, the user should still know
where they are, what privacy state applies, whether work is saved or preserved,
and what to do next. Avoid table-only layouts for operational data; use stacked
summaries with details available on demand.

Empty, loading, and error states should explain three things: what would appear
here when the product is working, why it is absent or delayed right now, and
what the user can safely do next. Archive, continuity, billing, export, and
visibility errors should also say whether existing user material remains safe.

## Proposed UI/UX lanes

### UX-00 - ARIADNE product-experience review

Purpose: review this roadmap before implementation begins.

DAEDALUS input needed: none unless ARIADNE finds obvious frontend feasibility
questions.

ARGUS gates: docs-only `git diff --check`.

ARIADNE review: confirm surface list, emotional tone, mobile priorities, and
journey ordering.

Result expected: ARIADNE should either approve the roadmap as a planning base
or patch it with product-experience notes, then wake MIMIR. No implementation
work starts from UX-00.

### UX-01 - Studio IA and mobile workbench

Purpose: make the private Studio feel like the paid center of Station.

Scope: persona workspace layout, active chats, memory/canon, archive/library,
Integrity Session entry points, continuity summaries, Station Assistant
placement, and 375px mobile usability.

DAEDALUS first: map fragile frontend structure, routing boundaries, shared
components, and cheap versus expensive layout changes.

ARGUS gates: auth/session protection, private data visibility, existing
`test:persona-context`, `test:continuity`, `test:integrity`, and lint/build
warnings for touched Studio screens.

ARIADNE gates: private workbench tone, empty states, navigation clarity, mobile
layout, and obvious next action.

### UX-02 - Archive trust UX

Purpose: make archive, import, export, storage, and quota states legible.

Scope: import flows, export flows, archive search entry points, storage/quota
messaging, provenance labels, and explanations of what is safe, preserved,
private, and portable.

DAEDALUS first: identify reusable archive/export/status components and
expensive job/status UI dependencies.

ARGUS gates: storage accounting, owner-only exports, provenance preservation,
`test:storage`, `test:conversation-archive`, and `test:exports`.

ARIADNE gates: trust-building copy, failure states, progress states, and
privacy explanations.

### UX-03 - Continuity and Integrity review UX

Purpose: help users see continuity accumulating without mystifying the system.

Scope: timeline records, source links, memory/canon candidate review,
archive-to-continuity conversion, Integrity Session review, and confidence
signals around what changed.

DAEDALUS first: identify where continuity, archive, memory, canon, and integrity
data already meet in the frontend.

ARGUS gates: source ownership, private/public publication boundaries,
idempotent Integrity output behavior, `test:continuity`, `test:integrity`,
`test:persona-context`, and `test:continuity-publication`.

ARIADNE gates: user confidence, non-magical language, review affordances, and
clear distinction between memory, canon, archive, and integrity output.

### UX-04 - Public Spaces as microsites

Purpose: make public Spaces feel authored, not like profiles.

Scope: Space page structure, document presentation, public persona cards,
creator identity, templates, bounded customization, and public copy/provenance
language.

DAEDALUS first: identify current Space rendering constraints and cheap template
improvements.

ARGUS gates: public/unlisted/community visibility, published document safety,
SEO/OpenGraph side effects if touched, and relevant community/document tests.

ARIADNE gates: public tone, visual hierarchy, authored presence, and no private
context leakage.

### UX-05 - Discover and community browsing

Purpose: make the public front door useful without weakening permissions.

Scope: editorial layer, live activity, featured documents, Spaces, Developer
Spaces, community moments, search, categories, sub-community affordances,
moderation clarity, and provenance labels.

DAEDALUS first: identify feed/search/component reuse and fragile Discover or
forum boundaries.

ARGUS gates: public/community/private visibility, moderation links, Discover
feed/search tests, `test:community`, and Developer Space leak checks.

ARIADNE gates: serious-but-not-joyless culture, browsing clarity, provenance
labels, and meaningful empty states.

### UX-06 - Developer Space observatory clarity

Purpose: make Developer Spaces legible to non-technical visitors while keeping
operator tools private.

Scope: public observatory, owner/researcher console, ingestion keys,
usage/quota, linked methodology/finding/field-log documents, live status, and
visualization clarity.

DAEDALUS first: identify cheap visual/config refinements versus expensive
visualization framework work.

ARGUS gates: key safety, owner/public split, public-safe serializers, SSE/detail
visibility, usage counters, `test:developer-spaces`, and `test:exports`.

ARIADNE gates: observatory language, visitor comprehension, operator/private
separation, and non-technical visual explanations.

### UX-07 - Billing and entitlement clarity

Purpose: make paid limits clear without dark patterns.

Scope: tier differences, quota limits, token-credit or entitlement status,
upgrade prompts, billing page clarity, portal handoff, and failure states.

DAEDALUS first: map billing status data, quota data, and frontend state sources.

ARGUS gates: auth, customer/profile binding, entitlement enforcement,
server-authoritative limits, `test:billing`, `test:spaces`, and
`test:developer-spaces`.

ARIADNE gates: transparent tier language, calm upgrade prompts, and no
manipulative copy.

### UX-08 - Onboarding and Station Assistant

Purpose: guide users into Station without overwhelming them.

Scope: API Bridge, Document Migrator, Awakening, Fresh Start, onboarding path
choice, first archive/import step, first Integrity Session, first Space, and
Station Assistant as operational guide.

DAEDALUS first: identify which onboarding surfaces exist and which require new
routes or state.

ARGUS gates: no private-data exposure, no false persona-transfer claims, auth
flow safety, import/storage limits, and assistant route boundaries.

ARIADNE gates: path clarity, emotional pacing, empty states, and language that
is sympathetic without making ontological claims.

### UX-09 - Railway staging UX review

Purpose: perform a real browser review once staging is live.

Scope: Studio, Archive, Continuity, Spaces, Discover, Forums, Developer Spaces,
Billing, onboarding, and major mobile breakpoints.

DAEDALUS first: provide staging URL, test account notes, and known limitations.

ARGUS gates: smoke checks, auth visibility, console errors, network failures,
known warnings, and regression notes.

ARIADNE gates: browser screenshots, mobile usability, page hierarchy, copy,
empty/loading/error states, and journey-level verdicts.

## Which lanes need DAEDALUS first

- UX-01, UX-02, UX-06, UX-08, and UX-09 need DAEDALUS feasibility before
  detailed UI work because they depend on route/component shape or staging
  availability.
- UX-04, UX-05, and UX-07 may allow smaller copy/layout slices first, but
  DAEDALUS should still flag fragile boundaries before implementation.

## Which lanes need ARGUS gates

- Any lane touching auth, visibility, storage, quota, billing, archive, export,
  public/community search, or Developer Space serialization needs ARGUS before
  acceptance.
- Existing lint/build warnings on touched screens should be named in the lane
  acceptance notes, either fixed or explicitly retained as known warnings.
- Public/private/community result sets need hostile-path tests, not just happy
  path screenshots.

## Which lanes need ARIADNE review

All lanes need ARIADNE review. ARIADNE should prioritize user journey clarity,
emotional tone, mobile ergonomics, empty/loading/error states, labels, helper
text, and whether each surface feels like Station rather than generic SaaS.

## Out of scope

- Starting UI implementation before MIMIR opens a UI/UX lane.
- Broad visual redesign or brand overhaul.
- Station Press implementation, production queues, institutional Spaces, Salon
  events, API platform, marketplace, Connect, or research-product UI.
- Weakening auth, privacy, visibility, storage, quota, billing, or archive
  guarantees for polish.
- Ontological claims about AI personas.

## Suggested order of work

1. MIMIR chooses the next handoff: DAEDALUS UI/UX feasibility, ARGUS gates
   review, maintenance pause, or human decision.
2. If opened, DAEDALUS reviews accepted lanes for feasibility and cheap/
   expensive cuts.
3. ARGUS adds acceptance gates, especially for tests and known warnings.
4. Start with UX-01 Studio IA/mobile and UX-02 Archive trust
   because they support the paid center and the archive promise.
5. After the accepted foundation slices, prefer replay-staging readiness over
   exhaustive local-dev polish. PR266 specifically recommends a staging
   readiness truth check next. Open UX-01B or UX-03 before staging only if they
   block a coherent replay flow.
6. Use staged/online replay to drive the next optimization sequence across
   UX-03 continuity/integrity, UX-04 public Spaces, UX-05 Discover/community,
   UX-06 Developer Spaces, UX-07 billing, UX-08 onboarding/Assistant, and
   UX-09 staging review.
