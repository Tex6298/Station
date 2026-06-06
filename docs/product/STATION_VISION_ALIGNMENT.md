# Station vision alignment

Status: planning alignment reference. This document maps the current repo,
completed v2 work, and active v3 lanes to the uploaded Station vision set. It
does not replace the active roadmap.

Use with:

- [`STATION_NORTH_STAR.md`](./STATION_NORTH_STAR.md)
- [`Station_Document_1_Platform_Overview.md`](./Station_Document_1_Platform_Overview.md)
- [`Station_Document_2_Technical_Specification.md`](./Station_Document_2_Technical_Specification.md)
- [`Station_Document_3_Future_Vision.md`](./Station_Document_3_Future_Vision.md)
- [`../roadmap/STATION_PR_PLAN_V3.md`](../roadmap/STATION_PR_PLAN_V3.md)
- [`../roadmap/ACTIVE_STATUS.md`](../roadmap/ACTIVE_STATUS.md)

## Active roadmap relationship

The uploaded vision set expands product truth, but it does not reset delivery
truth. V3 remains the active sequence and should continue as a maintenance-first
roadmap unless MIMIR deliberately changes it.

V3 is correctly focused on storage, integrity, token accounting, archive/export
jobs, and visibility-safe search. Those lanes support the north star because
Station's larger promise depends on trust, continuity, permissions, archive,
and measurable foundations before new public product surface.

## Current work mapped to vision

| Current repo work | Vision area supported | Alignment note |
| --- | --- | --- |
| PR-00 and PR-01 roadmap reset, status truth, and validation baseline | Planning truth and platform trust | Keeps the active roadmap explicit so the vision does not become uncontrolled scope. |
| PR-02 through PR-05 Supabase schema, auth/session, protected web flow, and persistent repos | Durable private Studio and archive foundation | Persistence and owner identity are prerequisites for continuity, archive, Spaces, forums, and Developer Spaces. |
| PR-06 Community Beta persistence and permissions | Managed community layer | Supports public/community discussion while preserving visibility rules. Full forum culture and sub-communities remain later work. |
| PR-07 Continuity Alpha data model | Private Studio continuity | Establishes continuity records as the cross-source ledger without replacing specialized memory, canon, archive, or integrity tables. |
| PR-08 Continuity Studio UI | Private Studio | Gives users a visible continuity timeline, which supports the paid continuity value. |
| PR-09 publication/export pipeline | Archive, publishing, provenance, and owner export | Moves private continuity artifacts toward published documents while preserving publication state and owner-only export safety. |
| PR-10 through PR-16 Developer Spaces | Developer Spaces as live observatories | Implements ingestion, safe serialization, SSE, Discover integration, linked methodology documents, exports, quotas, a client package, and visual config editors. This supports observatories, not generic dashboards. |
| PR-17 Stripe and paid entitlement foundation | Subscription tiers and paid value | Supports paid limits for Spaces and Developer Spaces. Further billing expansion is intentionally bounded. |
| V3-01 storage quota hardening | Archive as trust infrastructure | Storage accounting protects archive/import/export credibility and paid limits. It can continue unchanged while wording stays clear that archive trust is the product reason. |
| V3-02 integrity and calibration hardening | Integrity Sessions as grounding/reflection infrastructure | Should prove lifecycle, review, fallback, public preflight safety, and runtime continuity use. |
| V3-03 token-credit accounting hardening | Continuity economics and AI workflow limits | Makes token usage measurable before expanding AI workflows or provider routing. |
| V3-04 archive and export job reliability | Archive, export, backup, and long-running preservation work | Prepares the product for external imports and export packages without overbuilding production queue infrastructure. |
| V3-05 visibility-safe search | Private archive retrieval and public/community discovery | Makes materials findable without weakening structural privacy. |
| Current `docs/product/station-v1.md` gaps | MVP gap register | Correctly keeps onboarding, Station Assistant shell, authoring/versioning, search, external archive intake, jobs, backup, and partner-ready Developer Spaces visible as gaps. |

## Intentionally deferred

These items are part of the uploaded vision, but they should not be pulled into
the active v3 lanes unless the roadmap is explicitly changed:

- Four onboarding paths: API Bridge, Document Migrator, Awakening, Fresh Start.
- Full Station Assistant workflow shell beyond current operational planning.
- Native document authoring, codex versioning, and mature publishing UX.
- Full forum taxonomy, creator-led sub-communities, and broader moderation
  tooling.
- Reddit/Discord/import automation beyond bounded archive/export job models.
- Station Press physical archive, print-on-demand books, annual volumes, and
  art prints.
- Public persona pages with bounded visitor interaction.
- Persona Salons, public events, persona-to-persona encounters, Persona
  Roulette, voice mode, and avatar mode.
- Institutional Spaces and team/project ownership beyond schema-aware planning.
- Knowledge products, research packs, living dataset subscriptions,
  commissioned research, and institutional briefings.
- Station AI API, fine-tuned continuity models, external platform services, and
  mature research infrastructure.
- Production queue, worker, model-gateway, marketplace, PM, or broad billing
  platform architecture not required by the accepted roadmap slice.
- IntelHub CTI, exposure, recon, finance, dark-provider, browser-worker, and
  investigation-product scope.

## Must not be lost

- Archive is trust infrastructure. Every storage, export, import, search, and
  backup decision should be judged against user trust in preservation.
- Continuity is the core paid value. Paid tiers should deepen durable memory,
  canon, archive, retrieval, publishing paths, and public authorship rather than
  simply unlock more surface area.
- Station Assistant is operational, not a persona. It should help manage the
  platform and user work; it should not gain persona canon or immersive identity.
- Integrity Sessions are grounding/reflection infrastructure. They should
  produce useful continuity material while helping users distinguish private,
  public, canonical, speculative, and authored material.
- Spaces are public microsites, not profiles. A Space is an authored public home
  with pages, work, identity, and archive, not a thin social account page.
- Developer Spaces are live observatories, not generic dashboards. They present
  running projects, experiments, worlds, and research with public-safe live state
  plus a separate private operator interface.
- Visibility/privacy is structural. Private, unlisted, community-only, public,
  and collaborator/project visibility must be enforced at data/query/API
  boundaries, not only in page rendering.
- Station must not import IntelHub CTI/exposure/recon/finance scope. The useful
  transferable patterns are provenance, operator/public separation, event/state
  legibility, and bounded observability.

## Roadmap guardrail

When a new task proposes product expansion, first ask which north-star promise it
serves: private continuity, archive trust, managed community, public authorship,
Developer Space observability, or long-range research infrastructure. If it
serves none of these, it is probably not Station.

When a new task does serve the north star, place it only after the current trust
foundation is strong enough to carry it.
