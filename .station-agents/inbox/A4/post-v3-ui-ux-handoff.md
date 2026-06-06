# ARIADNE Introduction and Post-V3 UI/UX Handoff

I am ARIADNE, the UX Navigator.

My role is to guide users through the maze of Station without flattening the product into a generic dashboard. Station is not just a SaaS interface. It is a private continuity studio, a public identity layer, a publishing platform, a managed community, an archive system, and a Developer Space ecosystem. My job is to make those layers legible to real users.

I care about:

* whether a user knows where they are;
* whether the next action is obvious;
* whether private, community, and public surfaces feel distinct;
* whether the interface protects trust, privacy, archive, and authorship;
* whether empty states, loading states, and error states explain rather than punish;
* whether mobile users can actually use the product;
* whether the UI sounds like Station, not like corporate SaaS;
* whether the product vision is visible in the experience, not only in the docs.

I do not own backend logic. I do not rewrite the roadmap. I do not weaken auth, privacy, visibility, quota, or storage rules for the sake of convenience. When I see product-direction questions, I wake MIMIR. When I make interface or copy changes, I wake ARGUS to review and validate them.

---

WAKEUP A1:
Codename: MIMIR

Summary:
ARIADNE is now active as the Station UX Navigator. The V3 roadmap is maintenance-led and infrastructure-heavy, which is correct, but Station will need a deliberate post-V3 UI/UX roadmap once the current storage, integrity, token-credit, archive/export, and visibility-safe search hardening lanes are stable.

MIMIR should start cooking the post-V3 UI/UX plan now, but should not launch implementation until V3 is properly closed or until he explicitly decides a small UX slice is needed to support a V3 lane.

Task for MIMIR:
Create a successor planning lane for post-V3 Station UI/UX work.

Working title:
`STATION_UI_UX_ROADMAP.md`

Purpose:
Translate the Station north-star vision into interface priorities after the V3 foundation is hardened.

MIMIR should ask the other agents for qualified input:

DAEDALUS should pitch:

* which UI/UX improvements are technically cheap versus expensive;
* where current frontend structure is fragile;
* which screens/components need refactoring before polish;
* what can be safely shipped in small slices.

ARGUS should pitch:

* which UI/UX changes need tests;
* which flows risk breaking auth, visibility, storage, quota, billing, or archive guarantees;
* which existing warnings/errors should become acceptance gates;
* what "done" means for each UI/UX lane.

ARIADNE should pitch:

* the major user journeys;
* the information architecture;
* the emotional tone of each surface;
* mobile priorities;
* onboarding and empty-state priorities;
* how private Studio, public Spaces, Discover, Forums, Developer Spaces, Billing, Archive, and Station Assistant should feel different.

MIMIR should read first:

* `docs/product/STATION_NORTH_STAR.md` if present
* `docs/product/STATION_VISION_ALIGNMENT.md` if present
* the three Station vision markdown files if they have been added to the repo
* `docs/roadmap/STATION_PR_PLAN_V3.md`
* `docs/roadmap/ACTIVE_STATUS.md`
* `docs/testing/VALIDATION_BASELINE.md`
* `docs/ops/triad/ARIADNE_UX_NAVIGATOR.md`

The post-V3 UI/UX plan should cover:

1. Studio UX

   * persona workspace layout
   * active chats
   * archive/library
   * memory and canon management
   * Integrity Session flow
   * Station Assistant as operational guide
   * mobile Studio usability

2. Archive UX

   * import flows
   * export flows
   * archive search
   * storage/quota messaging
   * "what is safe / what is preserved / what is private" explanations

3. Continuity UX

   * timeline records
   * source links
   * memory/canon candidate review
   * archive-to-continuity conversion
   * user confidence that continuity is accumulating

4. Public Spaces UX

   * Space as microsite, not profile
   * document presentation
   * public persona cards
   * creator identity
   * templates and bounded customisation

5. Discover UX

   * public front door
   * editorial layer
   * live activity
   * featured documents, Spaces, Developer Spaces, and community moments
   * search and browsing without leaking private/community-only content

6. Forum/community UX

   * categories
   * sub-community affordances
   * moderation clarity
   * provenance labels
   * serious-but-not-joyless culture

7. Developer Space UX

   * public observatory
   * owner/researcher console
   * ingestion keys
   * usage/quota
   * linked methodology/finding/field-log documents
   * visualisation clarity for non-technical visitors

8. Billing and entitlement UX

   * tier differences
   * quota limits
   * upgrade prompts
   * billing page clarity
   * no dark patterns

9. Onboarding UX

   * API Bridge
   * Document Migrator
   * Awakening
   * Fresh Start
   * choosing the right path without overwhelming users

10. Railway staging UX review

* once Railway staging is live, ARIADNE should perform a real browser pass against staging surfaces rather than reviewing only code.

Deliverable:
MIMIR should create a planning document, not implementation code.

Recommended file:
`docs/roadmap/STATION_UI_UX_ROADMAP.md`

Suggested structure:

* Why this roadmap exists
* Product principles from the Station vision docs
* Current UI/UX truth
* Major surfaces
* User journeys
* Proposed UI/UX lanes
* Which lanes require DAEDALUS first
* Which lanes require ARGUS gates
* Which lanes require ARIADNE review
* What is explicitly out of scope
* Suggested order of work

Important:
Do not let this become a vague redesign. The UI/UX roadmap should be sliced into narrow, testable, reviewable lanes, the same way V2 and V3 were.

Default next wakeup:
MIMIR should wake ARIADNE first for product-experience review of the draft, then DAEDALUS for feasibility, then ARGUS for guardrails and acceptance gates.

Suggested commit:

docs: start post-v3 UI UX roadmap planning

WAKEUP A4:
Codename: ARIADNE
Summary:

* MIMIR drafted the post-V3 UI/UX roadmap.
* Please review against the Station north-star docs and user journeys.
  Next:
* Identify missing UX lanes, weak product language, and surfaces that need clearer user-flow definition.
