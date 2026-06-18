# Developer Pages - CTO Brief Integration

Date: 2026-06-18
Source: `Station_Developer_Pages_CTO_Brief.docx`
Status: product direction integrated by MIMIR; implementation lanes must cite
this brief when touching Developer Spaces / Developer Pages.

## Platform Phase Model

Use this model to avoid turning "after launch" into a pile of unrelated
features:

- Phase 1 / P38: Station as Home. Protected-alpha launch core proves private
  Studio, continuity, archive, publishing, forums, public Spaces, and the basic
  Developer Space story can be shown to a human.
- Phase 2: Station as Ecosystem. Station starts hosting, presenting, and
  sustaining projects: Developer Pages, richer public layer, Station Press,
  public personas, sub-communities, social graph, and archive/publishing depth.
- Phase 3: Station as Research Infrastructure. Interconnected Lab,
  multi-instance experiments, cross-project streams, institutional
  partnerships, research packs, and Station's own research programme become
  real.

P38 closes Home. Phase 2 opens Ecosystem.

## Product Shape

Developer Pages are Station's infrastructure layer for serious AI researchers
and builders. They combine four things that are currently scattered across
GitHub, Reddit, notebooks, Zenodo, and private hosting:

- a credible public project home;
- a live observatory for project state;
- a publication and community layer;
- a private developer workspace.

The current code still uses the route/product label `Developer Spaces`. Do not
rename routes or database tables casually. Treat "Developer Pages" as the
broader product framing until MIMIR opens an explicit naming migration.

## Connection Tiers

These are infrastructure-relationship tiers, not ordinary subscription tiers.

### Tier 1 - Showcase Window

The developer runs their own infrastructure. Station provides the public page,
document/paper archive, scoped community discussion, update feed, and ingestion
API. The developer pushes only what they want visible.

Station does not provide compute, a database, deployment pipeline, or background
jobs in this tier.

### Tier 2 - Full Hosted Infrastructure

Station hosts the developer's system: isolated container, PostgreSQL, Redis,
job queue, WebSocket/live updates, deployment pipeline, public observatory,
private dashboard, and eventually a chat-native developer workspace.

The developer owns their code and data. Station holds infrastructure on their
behalf and must preserve exportability.

### Tier 3 - Interconnected Lab

Future only. This is the cross-project research layer: shared data streams,
multi-system experiments, and jointly governed research infrastructure. Do not
build Tier 3 in protected-alpha lanes.

## Public Page Anatomy

A mature Developer Page should have:

- project header: project name, developer handle, one-sentence description,
  live status, uptime, and key stats;
- architecture overview: plain-language explanation of what the system is and
  what it is trying to do;
- live observatory: project-specific live panels;
- papers and documents: research papers, architecture notes, milestone
  writeups, and development logs;
- updates and changelog: reverse-chronological significant developments;
- project community forum: discussion scoped to the project;
- optional future interaction layer: explicit opt-in only.

Developer Pages are distinct from Public Spaces. Public Spaces are authored
microsites for people/creators. Developer Pages are project/research
observatories with live data and project-specific technical discussion.

## Chat-Native Workspace

The long-range private workspace is not a generic admin dashboard. It is a
tool-enabled companion-style workspace where the developer can ask the system to
publish updates, change public layout, read logs, push to a repo, run jobs, and
request capabilities.

The server-side component for this is the developer agent. It translates
confirmed tool calls into infrastructure operations. Destructive or irreversible
actions must require explicit confirmation.

This is not Phase 1 protected-alpha scope.

## DexOS Case Study

DexOS is the reference first developer project. The important implementation
signals are:

- stack: FastAPI/Python, JSON file storage, OpenRouter, Railway today;
- immediate need: Tier 1 showcase window and observatory, then potential Tier 2
  hosted infrastructure;
- migration target: PostgreSQL replacing JSON storage, Redis session state,
  background jobs, deploy pipeline, public observatory;
- observatory widgets:
  - lineage ledger feed;
  - sigil state grid;
  - counterfactual archive;
  - coherence delta.

The current generic Developer Space widgets can approximate some of this, but
DexOS-specific widgets are not implemented.

## Current Station Implementation Map

Already present in the repo:

- Developer Space CRUD and public/owner serialization.
- Ingestion API for nodes, events, snapshots, and batch imports:
  `/developer-spaces/ingest/nodes/:nodeId/state`,
  `/developer-spaces/ingest/events`, `/developer-spaces/ingest/snapshots`,
  and `/developer-spaces/ingest/import`.
- SSE public/owner live stream at `/developer-spaces/:slug/stream`.
- API-key creation/revocation and usage counters.
- Linked Station documents with roles `methodology`, `finding`, `field_log`,
  and `note`.
- Public page widgets for visualisation, event stream, reading guide, project
  notes, current nodes, and latest snapshot.
- Owner manage surface for API keys, visual mode, and widgets.
- Developer Space export package support.

Known immediate gaps:

- The staging replay Developer Space has live node/event/snapshot state but no
  linked public methodology/finding/field-log documents.
- The public page copy still reads more like a generic observatory than the full
  Developer Pages product promise.
- Papers/documents, updates/changelog, architecture overview, and scoped forum
  story need clearer presentation.
- DexOS-specific widgets are not available yet.
- Tier 2 hosted infrastructure, Coolify/container/database provisioning,
  developer agent, chat-native workspace tools, tipping, public interaction
  modes, and Tier 3 interconnected lab are future lanes.

## Phase 2A Priority

The first post-P38 Developer Pages lane is Phase 2A: Developer Space 1.0 /
Showcase Window credibility. Before any Tier 2 hosting or developer-agent work,
finish the Tier 1 public project layer:

1. Make the public page read like a serious project observatory, not a generic
   dashboard.
2. Seed or create public methodology/finding/field-log evidence for the staging
   replay Developer Space.
3. Preserve the current owner/public safety boundary.
4. Keep live observatory data generic enough for current infrastructure while
   documenting where DexOS-specific widgets will land later.

This should not swallow the rest of Phase 2. Station Press, enhanced public
Spaces, public persona pages, sub-communities, social graph, and deeper archive
continuity work remain parallel Phase 2 branches. Developer Pages are the live
project/research branch of the same Station idea, not a separate product.
