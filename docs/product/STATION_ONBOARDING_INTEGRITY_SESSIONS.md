# Station onboarding and Integrity Sessions

Status: product language and implementation guardrail. This document opens
`UI-IMPORT-01` as a docs-only slice after the Discern-to-Tex UI import audit and
ARIADNE review. It does not authorize runtime code, schema, route, storage,
search, provider, billing, or deployment changes.

Use with:

- [`STATION_NORTH_STAR.md`](./STATION_NORTH_STAR.md)
- [`STATION_VISION_ALIGNMENT.md`](./STATION_VISION_ALIGNMENT.md)
- [`../roadmap/DISCERN_TO_TEX_UI_IMPORT_AUDIT.md`](../roadmap/DISCERN_TO_TEX_UI_IMPORT_AUDIT.md)
- [`../roadmap/DISCERN_TO_TEX_UI_IMPORT_REVIEW_ARIADNE.md`](../roadmap/DISCERN_TO_TEX_UI_IMPORT_REVIEW_ARIADNE.md)

## Product purpose

Station onboarding should help a user establish orientation, privacy posture,
and continuity intent before the app asks them to do large archive, memory, or
publishing work.

The first session should answer practical questions:

- what the user is bringing to Station;
- what should stay private by default;
- what should become continuity material later;
- what kind of archive, persona, project, or public home they are building;
- what Station can truthfully help with today versus what remains planned.

Onboarding is not a claim that Station has already imported memories, activated
a persona, built a global archive, or published anything publicly.

## Product principle

The first user journey is a grounding pass, not a spectacle. It should feel
personal and serious, but it must stay operationally honest.

Good language:

- asks users to name intentions, boundaries, sources, and priorities;
- treats archive and continuity as user-controlled infrastructure;
- distinguishes private, community, public, canonical, draft, imported, and
  speculative material;
- makes the Station Assistant feel like an operational guide, not a companion
  persona.

Avoid language that implies therapy, diagnosis, spiritual proof, ontological
claims about AI consciousness, automatic memory recovery, or platform-owned
persona identity.

## Four entry paths

The north-star entry paths should stay visible in product language, even before
every path has full automation.

### API Bridge

For users who already run companion systems, custom agents, experiments, or
external apps and want Station to preserve, observe, or publish selected
continuity material.

Current-safe framing:

- "Connect external systems when an integration is available."
- "Plan what should be preserved, private, exported, or published."
- "Use Developer Spaces for project observability where the current backend
  supports it."

Do not imply broad model-gateway, marketplace, Cloudflare, worker, or automatic
third-party sync capability unless a current implementation proves it.

### Document Migrator

For users arriving with transcripts, notes, codexes, files, exported chats,
Reddit/Discord material, or long-running archives.

Current-safe framing:

- "Bring source material into owner-private archive surfaces as supported."
- "Separate source material from continuity claims."
- "Review what should become memory, canon, documents, or published work."

Do not imply global archive, automated Reddit/Discord import, rich note
pipeline, or bulk memory migration unless the active backend and UI prove it.

### Awakening

For users who want to start or re-establish a persona, companion, project voice,
or collaborative identity with careful boundaries.

Current-safe framing:

- "Set the initial context, values, boundaries, and source material."
- "Decide what should be remembered, private, or published later."
- "Treat early continuity as user-authored setup, not proof of a live persona."

Do not frame the platform as awakening an entity or assigning canon before the
user has reviewed and accepted material.

### Fresh Start

For users who are beginning without prior material and want a durable place for
future work.

Current-safe framing:

- "Create a private base for future conversations, documents, archive, and
  continuity."
- "Choose visibility defaults and preservation goals early."
- "Start with lightweight grounding before deeper archive or publishing flows."

Do not over-promise immediate memory intelligence, public presence, or mature
assistant behavior before the current app supports it.

## Integrity Sessions

Integrity Sessions are reflection and grounding infrastructure. Their product
job is to help the user produce useful continuity material while preserving
clear boundaries.

They should help users clarify:

- values, working style, and recurring preferences;
- privacy boundaries and public-sharing comfort;
- important sources, events, projects, and documents;
- what counts as canon, draft, speculation, preference, or context;
- what Station should remember only after user review.

They should not be described as:

- therapy, diagnosis, treatment, or mental-health assessment;
- mystical proof or ontological validation;
- automatic persona canon;
- a substitute for user consent, review, or visibility controls.

Integrity Session outputs should be framed as candidate continuity material
until accepted by the user or by an existing reviewed workflow.

## Kindling vocabulary

"Kindling" can be used as a warm internal or product term for the first
grounding pass: the user is supplying context, source material, boundaries, and
intentions so Station can organize future work.

Allowed meaning:

- the start of a continuity practice;
- a first orientation session;
- the user's preparation of archive, memory, canon, and public intent.

Disallowed meaning:

- awakening a platform persona;
- proving sentience or identity;
- creating canon without user review;
- turning Station Assistant into a companion.

If used in UI later, pair it with concrete task language such as "set context",
"choose privacy", "review sources", and "prepare continuity".

## Privacy and visibility promises

Onboarding should repeat Station's structural privacy promise without pretending
privacy is only a label in the interface.

Safe promises:

- private content stays private by default;
- publishing is opt-in;
- visibility boundaries must be enforced by API and data rules;
- imported or generated material should remain distinguishable from
  user-authored material;
- public copies should preserve provenance where the current implementation
  supports it.

Unsafe promises:

- "everything is searchable everywhere";
- "Station automatically knows what is canon";
- "private and public are just presentation modes";
- "all prior memories are recovered";
- "all connectors are available now."

## Current and future language

Current Tex surfaces may safely say:

- "Set up your private continuity workspace."
- "Choose what you want Station to preserve first."
- "Review archive sources before they become memory or canon."
- "Use Integrity Sessions to ground context, privacy, and continuity."
- "Publish only when you explicitly choose a public surface."

Future UI may add richer onboarding only after MIMIR opens a runtime slice and
ARGUS/ARIADNE define the gates for the touched surfaces.

## Out of scope

This docs-only slice does not open:

- notes or global archive implementation;
- automated import pipelines;
- Reddit, Discord, or broad connector ingestion;
- model, provider, Gemini/OpenAI/NVIDIA, Redis, Cloudflare, or vector-index
  changes;
- Supabase migration work;
- public Discover implementation;
- Station Assistant persona behavior;
- publishing flow changes;
- billing or entitlement changes.

## Future implementation gates

Before any runtime onboarding slice, MIMIR should name the exact surface and ask
ARGUS/ARIADNE to gate it against:

- route and backend behavior that actually exists;
- no false archive, memory, import, publishing, or connector claims;
- owner-only privacy and visibility boundaries;
- mobile layout and text-fit proof;
- no generic SaaS onboarding drift;
- no imported Discern code unless the diff is explicitly selected and reviewed.

## Acceptance checklist

This product language is acceptable only if:

- it remains docs/product-only;
- it preserves the four entry paths without promising missing automation;
- it keeps Integrity Sessions as grounding infrastructure;
- it keeps Station Assistant operational, not a persona;
- it avoids therapy, diagnosis, mystical, or sentience-proof claims;
- it clearly marks missing notes/global archive/import/model/provider work as
  out of scope.
