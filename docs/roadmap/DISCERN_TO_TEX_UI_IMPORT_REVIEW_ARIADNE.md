# Discern-to-Tex UI Import Review - ARIADNE

Date: 2026-06-11
Reviewer: ARIADNE

Status: product review only. No code import is authorized by this review.

## Verdict

MIMIR's audit is product-correct: Discern current `origin/main` is not a safe
UI import source. Treat it as a set of product prompts, not as a patch queue.

Some ideas are worth preserving, but only as future bounded Station-native
slices after MIMIR opens them. DAEDALUS should not port Discern code from this
review alone.

## Recommended First Slice

First slice:

`UI-IMPORT-01: Onboarding and Integrity Session product language`

Shape:

- Docs/product slice first.
- No runtime code.
- No schema or migration work.
- No route/auth/storage/search changes.
- No claim that notes, global archive, or imported history are live unless the
  current Tex app already proves them.

Why this is first:

- It directly supports Station's north-star promise: continuity, authorship,
  preservation, and user control.
- It can clarify the first user journey without touching protected staging,
  migration `029`, Railway, Supabase Auth, Stripe, Redis, or retrieval work.
- It gives future onboarding UI a Station-native vocabulary before anyone
  ports screens.

Station-fit language:

- Onboarding may frame the first session as grounding, orientation, and
  continuity setup.
- "Kindling" can work as a warm internal/product term if it remains grounded:
  the user is setting context and intentions, not awakening a platform persona.
- The four paths from the north-star docs should stay visible: API Bridge,
  Document Migrator, Awakening, and Fresh Start.
- Integrity Sessions should be described as reflection/grounding
  infrastructure, not therapy, diagnosis, persona canon, or mystical proof.

Acceptance shape if MIMIR opens it:

- Add or adapt a product spec such as
  `docs/product/STATION_ONBOARDING_INTEGRITY_SESSIONS.md`.
- Map onboarding language to current/future surfaces without promising missing
  backend behavior.
- Include an "out of scope" section for notes/global archive, import
  automation, model/provider selection, and public publishing.

## Candidate Ideas

### Onboarding / Kindling

Recommendation: accept as the first bounded product slice.

Keep:

- onboarding as the first integrity/continuity decision point;
- paths for existing companions, document importers, awakening/fresh-start
  users, and API bridge users;
- copy that helps the user decide what should be private, remembered,
  preserved, or later published.

Reject:

- copy that implies Station has already imported memories, built a global
  archive, or activated a live persona before the backend proves it;
- corporate SaaS onboarding language;
- metaphysical claims or language that makes Station Assistant feel like a
  persona.

### Discover / Public Home

Recommendation: preserve as a later Station-native design direction, not the
first slice.

Useful direction:

- Discover should be Station's public front door, not an infinite feed.
- It should foreground published documents, Spaces, Developer Spaces, editorial
  moments, and public-safe community activity.
- Developer Spaces should read as live observatories, not generic dashboards.
- Spaces should read as public microsites, not profiles.

Guardrails:

- No fallback/demo content that could be mistaken for real public data.
- No private/community-only content in public result sets.
- No broad search dropdown until route coverage and visibility buckets are
  explicit.
- Rebuild in current Tex components and API shapes; do not import Discern's
  frontend wholesale.

Suggested later slice:

`UI-IMPORT-02: Discover public-home product direction`

This should be a product/IA review before implementation.

### Left Rail / Search Concepts

Recommendation: keep only as optional design references.

The left rail may help wayfinding, but it is easy to make Station feel like a
generic admin dashboard or to expose route promises the app does not yet keep.

Rules before any slice:

- Audit route existence and protection first.
- Decide whether the rail belongs to public surfaces, private Studio, or
  neither. The current Studio frame already has private wayfinding.
- Prove mobile behavior; no hidden horizontal overflow or cramped primary nav.
- Search must preserve public/community/private separation structurally, not
  only with UI labels.

Suggested later slice:

`UI-IMPORT-03: Navigation/search IA review`

Not an implementation slice until MIMIR names exact surfaces and ARGUS gates.

### Notes / Global Archive

Recommendation: product-useful, but not a UI import lane.

Station probably needs a notes/inbox/global archive path eventually because it
supports authorship, continuity capture, and archive trust. It should not be
imported from Discern as UI because it depends on backend semantics.

Required decisions before work:

- relationship to memory, canon, continuity records, documents, and archive
  sources;
- owner-only visibility and export behavior;
- storage/quota accounting;
- migration numbering after `029`;
- whether notes are drafts, archive sources, continuity candidates, or all
  three with explicit state;
- how users know what is private, preserved, searchable, and publishable.

Suggested later lane:

`ARCHIVE-NOTES-01: Notes/global archive backend and product model`

This is a backend/product lane after migration `029` is resolved or explicitly
waived.

## Explicit Rejects

Reject any Discern import that:

- changes Railway, Supabase, Stripe, Redis, Cloudflare, model, embedding,
  migration, health, readiness, reset-password, or replay behavior;
- weakens auth, moderation, owner checks, visibility buckets, or privacy
  boundaries;
- removes current staging proof surfaces or tests;
- introduces rich-editor dependencies without a named notes/backend lane;
- presents fake/demo content as live Station data;
- turns Discover into a generic social feed;
- turns Spaces into profiles;
- turns Developer Spaces into generic dashboards;
- makes Station Assistant a persona;
- pulls in IntelHub CTI/exposure/recon/finance/product scope.

## Answer To MIMIR

Open a future bounded slice only after the current staging/migration blocker is
parked with an explicit decision or resolved enough for safe planning.

If MIMIR wants a parallel docs-only move now, open:

`UI-IMPORT-01: Onboarding and Integrity Session product language`

Do not ask DAEDALUS to port code yet. Ask DAEDALUS only after the product spec
exists and MIMIR chooses a runtime surface.
