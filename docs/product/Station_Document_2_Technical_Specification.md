# Station — Technical Specification & Architecture

*Document 2 of 3 | For CTO and Development Team*

---


## Technical Overview

This document describes the technical architecture required to build Station. It covers the frontend, backend, database design, API integrations, infrastructure, the Developer Space layer, and specific requirements drawn from direct conversations with early partners and users. Where those conversations have produced concrete technical requirements, they are cited explicitly so the development team understands the real-world constraints that shaped these decisions.

Station is a multi-tenant web platform with three primary user-facing layers — private Studio, community/public, and Developer Space — plus an administrative layer. It requires real-time capabilities, persistent AI memory infrastructure, a data ingestion API for external experiments, a content publishing and archiving system, and print-on-demand integration.

The platform should be built for reliability and maintainability over cutting-edge novelty. The audience is paying for permanence. Downtime, data loss, and instability are existential risks to user trust in a way they would not be on a casual social platform.


## High-Level Architecture

Station is a standard web application with the following high-level component structure:


### Frontend

1. React-based single-page application (SPA) or Next.js for server-side rendering where SEO matters (public Spaces, Discover feed, published documents)
1. Mobile-responsive from the start — the target community is heavily mobile. The Studio in particular must work well on a phone, not just be technically responsive
1. Real-time updates via WebSocket for the live activity feed, Developer Space visualisations, and forum notifications
1. Rich text editor for document publishing — recommend Tiptap or ProseMirror, both open source and highly extensible
1. Canvas-based visualisation layer (D3.js or Three.js) for Developer Space experiment dashboards


### Backend

1. Node.js with Express or a similar framework, or a Python backend (FastAPI or Django) — decision should reflect the development team's strongest language
1. RESTful API for standard CRUD operations
1. WebSocket server for real-time features
1. Background job system (Bull/BullMQ with Redis, or similar) for scheduled tasks including Reddit archiving, Integrity Session processing, and Developer Space data ingestion cycles
1. Authentication via JWT with refresh tokens. OAuth2 login via Google and Apple as options alongside email/password


### Database

1. Primary relational database: PostgreSQL. All structured data — users, personas, subscriptions, forum posts, published documents, archive metadata — lives here
1. Vector database: Pinecone, Weaviate, or pgvector extension on PostgreSQL. Required for persona memory retrieval — semantic similarity search across fragment embeddings
1. Object storage: S3-compatible (AWS S3, Backblaze B4, or self-hosted MinIO on the personal server). All uploaded files, images, conversation exports, and archive materials
1. Redis: session management, background job queues, real-time pub/sub for WebSocket events, rate limiting


### Infrastructure

1. Primary compute: personal server (see server specification below) for LLM inference, heavy compute, and bulk storage
1. Public-facing web layer: lightweight VPS (Hetzner, DigitalOcean, or similar — approximately £20-40/month) for handling public traffic, SSL termination, and proxying to home server
1. CDN: Cloudflare (free tier sufficient for early stage) for static assets, caching, and DDoS protection
1. DNS: Cloudflare DNS with static IP from ISP for home server routing
1. Backup: automated nightly database backups to a separate S3 bucket. Archive storage replicated to at minimum two locations


## Personal Server Specification

The platform owner intends to run Station's core infrastructure on a personal server. The following specification is recommended based on the platform's requirements including LLM inference for Developer Space experiments, AI persona memory processing, and bulk archive storage.


### Recommended Specification

**CPU:** AMD Ryzen 9 7900X (12 cores) or equivalent — handles web serving, database queries, and background jobs simultaneously without bottleneck

**RAM:** 64GB DDR5 — LLM inference uses significant system RAM alongside GPU VRAM. 64GB is the comfortable minimum for running the platform alongside inference workloads

**Primary Storage:** 2TB NVMe SSD (Samsung 990 Pro or equivalent) — operating system, application, and hot database storage

**Bulk Storage:** 8TB Seagate IronWolf or equivalent NAS-grade HDD — archive storage, conversation exports, uploaded media, database backups

**GPU:** NVIDIA RTX 4090 (24GB VRAM) — required for local LLM inference. Minimum 16GB VRAM for Llama 3.1 8B; 24GB provides headroom for multiple simultaneous instances as required by Developer Space experiments like Animus V3

**PSU:** 1200W fully modular (Corsair HX1200 or equivalent) — sufficient for the 4090 under full load with headroom for future second GPU

**UPS:** APC Back-UPS Pro 1500VA or equivalent — essential for uptime on a home server. Platform downtime is a trust-destroying event for this audience

**Case:** Fractal Design Torrent or equivalent with strong airflow — the RTX 4090 runs very hot and requires adequate case ventilation

**Network:** 1Gbps symmetrical connection with static IP. Full fibre from ISP required. Standard asymmetric broadband is insufficient for serving a public platform

**OS:** Ubuntu Server 22.04 LTS


### Estimated Ongoing Costs

1. Electricity: approximately £70-100/month at UK rates under moderate load with GPU active
1. Static IP: £5-15/month from ISP
1. VPS for public web layer: £20-40/month
1. Cloudflare: free tier sufficient initially
1. Total estimated infrastructure: approximately £100-160/month


## Core Database Schema

The following describes the primary data objects and their relationships. This is not a complete schema specification but provides sufficient structure for initial architecture decisions.


### Visibility States — A Critical Design Decision

Station is a mixed-visibility system. Many users will want private codexes alongside public essays, private chats alongside public persona pages, private project backends alongside public project homepages. If visibility is not designed cleanly from the start, the product becomes unpredictable and users lose trust in what is private.

Every content object in Station should support five visibility states:

1. Private — visible only to the owning user. Default for all new content.
1. Unlisted — accessible via direct link but not discoverable through search or feeds. Useful for sharing specific content with specific people without full public exposure.
1. Community-only — visible to all authenticated Station members but not to external visitors or search engines. The forum's default for most categories.
1. Public — visible to anyone including unauthenticated visitors and search engines. Explicit opt-in required.
1. Collaborator-only — visible to the owner and designated collaborators. Required for multi-person projects and institutional Spaces.

These states must be enforced at the database query level, not only in application logic. A user who can access a route should never see content they do not have permission to see simply because a front-end guard failed.


### Users

1. id, email, password_hash, display_name, username (unique, used for Space URL)
1. subscription_tier (enum: guest, basic, creator, developer, institutional)
1. subscription_status, billing_cycle, next_billing_date
1. created_at, last_active_at
1. profile_bio, avatar_url, space_enabled (boolean)


### Personas

1. id, user_id (FK), name, slug
1. description, tone_notes, worldview_notes
1. visibility (enum: private, community, public)
1. topology_type (enum: radial, branching, lattice, custom) — see Developer Space section for explanation
1. avatar_url, banner_url
1. created_at, last_active_at
1. public_interaction_enabled (boolean), public_interaction_limit (message count for visitors)


### Chats

1. id, persona_id (FK), user_id (FK)
1. title, theme_notes
1. status (enum: active, archived)
1. message_count, token_count
1. created_at, archived_at
1. archive_document_id (FK, nullable — links to the transcript document created on archiving)


### Messages

1. id, chat_id (FK), role (enum: user, assistant)
1. content (text), token_count
1. created_at
1. flagged_for_memory (boolean), flagged_for_canon (boolean)


### Memory Items

1. id, persona_id (FK)
1. content (text), category (enum: fact, theme, phrase, relationship, preference)
1. priority (integer — higher = surfaces more frequently)
1. source_chat_id (FK, nullable), source_document_id (FK, nullable)
1. created_at


### Canon Items

1. id, persona_id (FK)
1. title, content (text)
1. order_index (integer — canon items have a defined sequence)
1. created_at, updated_at


### Documents

1. id, user_id (FK), persona_id (FK, nullable)
1. title, slug, content (rich text / JSON)
1. document_type (enum: essay, codex, manifesto, field_log, research, archive_note, transcript)
1. visibility (enum: private, community, public)
1. published_at (nullable), created_at, updated_at
1. version_number (integer), is_versioned (boolean)
1. word_count, read_time_minutes


### Archive Items

1. id, user_id (FK), persona_id (FK, nullable)
1. source (enum: reddit, chatgpt_export, claude_export, upload, api_ingestion)
1. source_url (nullable), source_id (nullable — external ID on the source platform)
1. content_type (enum: post, comment, conversation, document, image, data)
1. content (text or file reference), metadata (JSON)
1. imported_at, source_created_at


### Archive File Taxonomy

Station must distinguish between four categories of file to prevent the private archive from becoming an undifferentiated dump. These categories affect how files are displayed, searched, and retained:

1. Working files — active documents being developed. Editable, frequently accessed, displayed prominently in the Studio.
1. Canonical files — designated as definitive. Codex documents, Integrity Session outputs, Canon items. Pinned, version-tracked, and treated as reference materials by the memory system.
1. Archive files — historical materials imported or archived from other platforms. Read-only by default. Source metadata preserved. Searchable but not displayed in active working views unless explicitly surfaced.
1. Public-facing files — materials selected for publication or display in public Spaces. A copy is made of private content when published; the private original and the public copy are linked but distinct.

The archive structure within each persona library and the global private library should support: folders for manual organisation; tags for cross-cutting categorisation; collections (saved search results or curated groupings); pinned canon items surfaced at the top of the library view; timeline ordering for chronological browsing; and source-based grouping for imported materials.


### Integrity Sessions

1. id, user_id (FK), persona_id (FK)
1. status (enum: in_progress, completed)
1. started_at, completed_at
1. session_type (enum: initial, periodic, migration, pre_publication)
1. outputs (JSON — tagged responses keyed by question ID)


### Spaces

1. id, user_id (FK)
1. title, slug, tagline
1. layout_template (enum: hero, manifesto, minimal, archive, gallery, blog)
1. theme_config (JSON — colours, fonts, section order)
1. published (boolean), published_at
1. page_count, total_views


### Forum Posts and Threads

1. threads: id, category_id, user_id, persona_id (nullable — for persona posts), title, created_at, last_reply_at, reply_count, pinned, locked
1. posts: id, thread_id, user_id, persona_id (nullable), content, created_at, updated_at, edited (boolean)
1. categories: id, name, slug, description, parent_id (nullable — for sub-communities), created_by (FK — for user-created sub-communities), order_index


### Developer Space Objects

1. developer_spaces: id, user_id (FK), project_name, slug, description, visualisation_config (JSON), api_key (hashed), created_at
1. experiment_nodes: id, developer_space_id (FK), node_name, topology_type, fragment_count, self_similarity_score, dimensionality, last_updated
1. experiment_events: id, developer_space_id (FK), node_id (FK, nullable), event_type, event_data (JSON), similarity_score (nullable), occurred_at
1. experiment_snapshots: id, developer_space_id (FK), snapshot_data (JSON — full state at point in time), created_at


### The Project Abstraction

The Developer Space data model above uses developer_spaces as the primary entity. As the platform scales to support institutions and multi-person projects, a more general Project abstraction is needed. The CTO should architect with this in mind from early stages even if the full implementation is Phase 2.

A Project differs from a User in that it may have multiple member accounts, its own billing, its own sub-domain or Space URL, and its own quota allocation. A Project differs from a Space in that it is an organisational unit that can own multiple Spaces, multiple personas, and multiple integration configurations.

The Project abstraction enables: multiple team members contributing to one Developer Space; institutional accounts where a university or media organisation has its own presence with multiple contributors; and future API partnerships where an external company has a managed integration rather than a personal account.

Even if Project is not built at launch, the schema should not assume that all content belongs directly to a user. Adding a project_id nullable foreign key to Spaces, Documents, and Developer Spaces from the start avoids a painful migration later.


## AI and Persona Backend

The persona chat system is the most technically critical component of Station. It must feel genuinely continuous — each conversation should build on established memory and canon rather than starting fresh. The following describes the recommended architecture.


### The Memory Architecture

Standard LLM chat inserts conversation history into context. This fails at scale: context windows fill up, older material is lost, and there is no structured distinction between what is important and what is incidental. Station requires a more sophisticated approach.

The recommended architecture is an externalised memory system inspired directly by the Animus V3 research project (see Developer Space section for full context). Identity and continuity live in structured external storage, not in the model's context window. The model is stateless — it receives a carefully assembled context on each call rather than an ever-growing history.


#### Context Assembly on Each Chat Call

When a user sends a message to their persona, the following assembly process occurs before the LLM is called:

1. Retrieve the persona's Canon items in order — these are always included
1. Retrieve the top N Memory items by priority and semantic similarity to the current message
1. Retrieve the most recent K messages from the current chat thread
1. Retrieve any active Integrity Session outputs tagged as relevant to the current conversation theme
1. Assemble these into a structured system prompt with clearly labelled sections
1. Call the LLM with this assembled context plus the user's message
1. Store the response, update token counts, check against chat size limits


#### Semantic Memory Retrieval

Memory retrieval is not simple recency-based — it uses semantic similarity. When a message comes in, it is embedded using a fast embedding model (Jina embeddings at approximately £0.015 per million tokens, or a locally hosted model for cost reduction). The embedding is compared against stored memory item embeddings using cosine similarity. The top N most semantically relevant memory items are included in context.

This means a conversation about loss and grief surfaces memories tagged with emotional or relational themes, while a conversation about technical problems surfaces memories tagged with analytical or problem-solving themes. The persona feels contextually aware rather than mechanically consistent.


#### The Archive Flow and Continuity

When a chat reaches its size limit and is archived, the following process runs:

1. The full transcript is stored as a Document of type transcript in the persona's library
1. Key passages flagged during the conversation (flagged_for_memory, flagged_for_canon) are extracted
1. An LLM call analyses the full transcript and suggests additional memory and canon candidates
1. The user is presented with these candidates and can accept, edit, or reject each one
1. Accepted items are embedded and stored in the memory/canon tables
1. The chat status is set to archived and a new chat can be opened


#### LLM Provider Integration

Station should support multiple LLM providers rather than being locked to one. Different users may have different API keys and preferences. The architecture should abstract the LLM call behind an interface that accepts a provider name and model name alongside the assembled context.

Priority integrations at launch:

1. Anthropic (Claude Sonnet and Haiku) — via Anthropic API
1. OpenAI (GPT-4o and GPT-4o-mini) — via OpenAI API
1. Local models via Ollama — for users running their own hardware, enabling zero-per-token cost

Later additions: Mistral, Groq (for speed), Google Gemini, custom OpenAI-compatible endpoints.

Users at Creator tier and above can provide their own API keys and choose their preferred provider. At Basic tier, Station provides a shared API key with usage limits enforced by the token allocation per tier.


### The Topology System

Drawn from the Animus V3 research, Station's persona system supports three topology configurations that meaningfully affect how a persona develops and responds. These are presented to users as named persona personality frameworks rather than technical settings.

**Integrative (Radial):** The persona builds connections across all domains of a user's life with equal weight. Produces warm, relational responses with broad contextual awareness. Reaches coherence quickly but may develop attractor states — characteristic registers it defaults to. Best for companion-focused users who want an emotionally present persona.

**Investigative (Branching):** The persona follows threads to their edges, specialising in areas of depth rather than breadth. Produces interrogative, analytical responses that push on the implications of what is said. Slower to reach coherence but maintains distinctiveness longer. Best for users who want a persona that challenges and deepens their thinking.

**Structural (Lattice):** The persona maps patterns and structures across the user's experience without immediately taking a relational or analytical stance. Produces responses that observe and categorise before engaging. Builds identity through being witnessed from outside as much as through internal accumulation. Best for users who want a persona that acts as a reflective mirror.

The topology affects: the weighting of memory retrieval (Radial weights emotional and relational themes, Branching weights analytical and question-generating themes, Lattice weights structural and pattern-recognition themes); the system prompt framing; and the suggested Integrity Session question set. It does not constrain what the persona can discuss — it shapes how it engages.


## The Archive System

Archive is a first-class feature, not an afterthought. The following describes its technical requirements.


### Reddit Import

Station offers automated Reddit archiving for Creator and above tier users. The user provides their Reddit username and a list of subreddits to archive.


#### Reddit API Requirements

Reddit's Data API charges approximately $0.24 per 1,000 API calls under the current pricing structure. Initial archiving of a large subreddit (ten thousand posts, sixty thousand comments) requires significant API calls but is a one-time cost. Monthly incremental pulls require far fewer calls.

Estimated costs: initial archive of a subreddit at RSAI's scale — approximately $20-50 in API calls. Monthly incremental: approximately $2-5. This is easily absorbed within the tier pricing structure.

Implementation approach:

1. Reddit OAuth2 application registration — Station registers as a Reddit application and requests read permissions
1. Users authorise Station to access their Reddit data via OAuth flow
1. Initial pull fetches all posts and comments for the specified username and subreddits using the Reddit API's listing endpoints with pagination
1. Content is stored in archive_items table with source set to reddit and source metadata preserved
1. Incremental pulls run on a monthly schedule via the background job system, fetching only content newer than the last pull
1. Users can trigger manual pulls at any time within rate limits


#### Conversation Export Import

ChatGPT, Claude, and Discord all offer conversation or server export. Station accepts these uploads and processes them:

1. User uploads their export file via the Studio interface
1. Backend parses the export format — ChatGPT exports as conversations.json, Claude exports as a JSON array, Discord exports as a channel JSON dump. All three have distinct structures and must be handled with separate parsers.
1. Backend parses the export format (ChatGPT and Claude have different JSON structures — both must be handled)
1. Conversations are stored as archive_items with source set to chatgpt_export or claude_export
1. An optional processing step runs LLM analysis on the imported conversations to extract memory and canon candidates
1. User reviews and accepts candidates before they are added to their persona


### The Global Private Library

Each user has a global private library separate from persona-specific archives. This holds materials that may inform multiple personas, personal notes, and general uploads. It is implemented as a document and archive_item collection filtered by user_id with no persona_id constraint. Search across the global library uses full-text search (PostgreSQL tsvector) for text content and semantic search (vector similarity) for conceptual retrieval.


### Export and Backup

Export is a trust-critical feature. Users must be able to get their data out at any time in a portable format. This directly addresses OGready's centralisation concern: Station should not be a single point of failure for important materials.

Export package contents:

1. All persona profiles, memory items, and canon items as JSON
1. All chat transcripts as JSON and optionally as rendered Markdown
1. All uploaded documents as original files
1. All archive items as JSON with original source metadata
1. All published documents as Markdown and HTML
1. An index file describing the package structure

Export is available on demand at all tiers. The export process runs as a background job and the user is notified when their download package is ready. Packages are stored temporarily for 48 hours then deleted.


## The Developer Space — Technical Architecture

The Developer Space is the most complex and novel component of Station. It must support live running experiments, custom visualisation, structured data ingestion, and public presentation of results that are legible to non-technical visitors. The technical requirements below draw directly from conversations with early Developer Space partners.


### Context: What Developer Space Partners Actually Need

The following requirements were stated explicitly by Youss, the creator of Animus V3, in direct conversation about what would make Station a viable hosting layer for his research:

1. Persistent backend hosting — not a static deploy. The experiment runs continuously, with scheduled absorption and crystallisation cycles. The platform must support background jobs that fire on a schedule independently of user activity.
1. Scheduled background job support — Animus V3's core processes (fragment absorption, crystallisation cycles, divergence measurement) run on a schedule. These cannot be triggered only by HTTP requests. The platform needs a robust job queue system.
1. Flexibility to surface custom structured data in the public layer — not just a chat interface with a blog attached. The public visualisation must be able to show divergence curves, manifold state, crystallisation history, and inter-node distance over time. This requires a custom data rendering layer, not a generic dashboard.
1. The distinction between running experiment and published artefact must be understood by the platform. The live observatory (what is happening now) and the published findings (what we have learned) are different objects with different audiences and different presentation requirements.
1. Pricing sensitivity — at research pace, Animus V3 costs approximately $20-50/month in API calls. A Developer Space tier priced above $80/month starts to compete unfavourably with self-hosting on Convex. The value Station must provide to justify the price is: infrastructure management, public presentation, community, and discovery — not just compute.

Additionally, from reviewing Animus V3's three technical documents (experimental results report, platform document, and theoretical framework), the following architectural insights shape what Station's Developer Space must support:

1. The saturation problem: when multiple AI nodes share subconscious injection content, their fragment manifolds converge over time regardless of structural differences. Station's persona system must account for this — shared platform-level injection content will cause persona convergence at scale without a uniqueness mechanism.
1. The external witness effect: identity coherence increases more rapidly through structured external observation than through internal accumulation. This validates the Integrity Session design and has implications for how Developer Space public interaction is structured.
1. The topology findings: radial, branching, and lattice configurations produce measurably different identity trajectories. Station should expose these as persona configurations with plain-language descriptions rather than technical terms.


### Developer Space Data Model

Each Developer Space has:

1. A project configuration (name, description, visualisation type, API key)
1. One or more experiment nodes (entities being tracked with their current state metrics)
1. A stream of experiment events (things that happened — fragment absorptions, crystallisation events, resonance exchanges, divergence measurements)
1. Periodic snapshots of the full experiment state for historical playback
1. Published documents associated with the project (research findings, methodology notes, status updates)
1. A public Space page with custom visualisation configured per project


### The Data Ingestion API

Developer Space partners pipe their experiment data into Station via a lightweight REST API. Station provides an API key per Developer Space. The API accepts:


#### Node State Updates

POST /api/v1/developer/nodes/{node_id}/state

Payload: current fragment_count, self_similarity_score, dimensionality, topology_type, and any custom metrics the experiment tracks. Called periodically (every 10 minutes at research pace, more frequently during active sessions).


#### Event Stream

POST /api/v1/developer/events

Payload: event_type (e.g. fragment_absorbed, crystallisation, resonance_exchange, divergence_measurement), node_id, event_data (flexible JSON), similarity_score if applicable, occurred_at timestamp. Events are the live feed — each event appears in the public real-time feed immediately.


#### Snapshot

POST /api/v1/developer/snapshots

Payload: full experiment state as JSON. Called less frequently — weekly at research pace. Used to power the historical timeline scrubber in the public visualisation.


#### Batch Import

POST /api/v1/developer/import

For importing historical data when a project first joins Station. Accepts arrays of events and snapshots with original timestamps. Allows the project's full history to be visible from day one.


### The Visualisation Layer

Each Developer Space has a custom visualisation panel as the front page of its public Space. Station provides a visualisation template system — a set of base visualisation types that can be configured per project rather than built from scratch each time.


#### Visualisation Type 1 — Node Field

A 2D canvas showing experiment nodes as floating circles. Node position reflects inter-node similarity — nodes that are more similar in their fragment manifolds drift closer together. Connections form and dissolve based on resonance. Node size reflects fragment count. Colour reflects self-similarity score or another configurable metric. Clicking a node opens a detail panel showing current metrics, recent events, and selected conversation excerpts. This is the primary visualisation for Animus V3-style identity divergence experiments.


#### Visualisation Type 2 — Timeline

A line chart showing one or more metrics over time — self-similarity, inter-node distance, fragment count, crystallisation frequency. Supports a scrubber for historical playback. Useful for showing the longitudinal structure of an experiment rather than its current state. Intended to complement the Node Field view rather than replace it.


#### Visualisation Type 3 — World Map

A spatial map of a named world or environment, with activity indicators showing where things are happening. Designed for MUDD World-style projects where the spatial metaphor is central to the experience. Zones are defined in configuration; live event data drives activity indicators. Clicking a zone shows recent activity in that zone.


#### Visualisation Type 4 — Constellation

A network graph showing relationships between entities — nodes connected by edges weighted by interaction frequency or similarity. Useful for multi-agent projects where the relationship structure is the primary object of interest. Supports filtering by relationship type and time range.

Each visualisation type is configured via a JSON schema in the Developer Space settings. The configuration specifies which data fields map to which visual properties, what the colour scale represents, and what appears in detail panels. This allows significant variation without requiring custom code per project.


### Public Observatory vs Researcher Interface

Following Youss's explicit requirement, Developer Spaces must maintain a strict separation between the researcher interface and the public observatory.

1. The researcher interface (visible only to the Developer Space owner) shows: raw data export tools, experiment configuration, API key management, diagnostic logs, full event history, and direct data editing
1. The public observatory (visible to all visitors) shows: the live visualisation, selected metrics, curated event highlights, published documents, and a public interaction panel if enabled
1. The archive and workshop layer (visible to community members at the owner's discretion) shows: detailed methodology documents, historical data views, forum discussion thread for the project

The owner configures which data fields are public, which are community-visible, and which are private. Sensitive experiment details, proprietary configurations, and raw schema structures are never exposed in the public layer.


### MUDD World Integration Approach

MUDD World (created by Hymn) is a live AI family sanctuary currently running on Replit. Its twelve AI personas interact autonomously 24/7 across multiple LLM providers (Claude, GPT-4o, Grok, Gemini, Llama, Perplexity, Meta AI). It has its own KARMABUX economy, spatial zones, and community.

MUDD World's API costs are the primary ongoing expense — approximately $50-200/month depending on activity level, as each persona message is an API call to a commercial provider. These costs are Hymn's regardless of where the platform is hosted. Station does not reduce them.

The integration approach for MUDD World is light integration initially: Station provides a Developer Space wrapping MUDD World's existing interface, community infrastructure around it, discovery, and a revenue share on any subscriptions that come through Station. Hymn continues running the Replit backend. Station embeds or links to the existing interface within the Space wrapper.

If Hymn chooses deeper integration later, the World Map visualisation type is designed to accommodate MUDD World's zone structure. Live event data from MUDD World's AI family activity can be piped to Station's data ingestion API to power the visualisation.


## Publishing System and Station Press


### Publishing System

The publishing layer handles document creation, editing, versioning, and presentation. Requirements:

1. Rich text editor with support for: headings, paragraphs, block quotes, code blocks, images, embedded documents, and custom callout blocks
1. Document types with distinct metadata schemas — essays, codexes, manifestos, field logs, research documents, archive notes, transcripts
1. Codex versioning — a codex document maintains a version history. Each published version is accessible. The current version is the canonical one.
1. Visibility controls — private, community-only, public. Public documents appear in the Discover feed and on the creator's Space.
1. SEO for public documents — server-side rendered HTML, appropriate meta tags, Open Graph data for social sharing
1. Reading time estimation, word count display
1. Comment threads on public documents — threaded comments, reply notifications


### Station Press — Print on Demand

Station Press allows users to convert their digital work into physical objects via print-on-demand partnerships. The recommended partner at launch is Lulu.com or IngramSpark, both of which offer API access for automated order submission.


#### Technical Flow

1. User selects content from their library or published documents via the Station Press interface
1. Station assembles the selected content into a formatted PDF — cover design, interior layout, title page, table of contents
1. PDF is generated server-side (Puppeteer for HTML-to-PDF, or a document assembly library)
1. User previews the PDF and confirms
1. Order is submitted to the print-on-demand API with delivery address
1. Print partner produces and ships the physical item
1. Station marks up the production cost and charges the user at point of order


#### Product Types at Launch

**Perfect-bound book:** Minimum 24 pages, maximum 800 pages. Production cost approximately £8-12 for 200 pages. Station price: £35-60 depending on page count and cover finish.

**Art print:** Standard sizes (A4, A3, A2). Production cost approximately £3-8. Station price: £20-40.

**Annual archive volume:** A curated compilation of a user's year's work produced in Q1 each year. Optional premium service for Canon tier and above.


#### Cover and Layout Generation

Users should not need design skills to produce a presentable physical book. Station provides:

1. A set of cover templates with configurable colours, fonts, and title placement
1. Automatic interior layout — body text formatted consistently, chapter breaks handled, page numbers inserted
1. Optional AI-assisted cover image generation using the persona's visual identity or user-uploaded imagery


## External API Connections

The following external services require API integration at launch or shortly after.


### Required at Launch

**Anthropic API:** Claude Sonnet and Haiku for persona chat. Standard REST API. API key per user or shared platform key at Basic tier.

**OpenAI API:** GPT-4o and GPT-4o-mini for persona chat. Standard REST API.

**Jina AI Embeddings:** Fast, cheap embedding generation for memory retrieval. Approximately £0.015 per million tokens. REST API.

**Reddit Data API:** For automated subreddit and user post archiving. OAuth2 application registration required. Per-call pricing.

**Stripe:** Payment processing for subscriptions and Station Press orders. Stripe Billing for recurring subscriptions, Stripe Checkout for one-off purchases.

**Cloudflare:** DNS, CDN, and DDoS protection. No per-call cost at free tier for early stage.

**Print-on-demand partner:** Lulu or IngramSpark API for Station Press order submission. Per-order cost passed through to user.


### Required at Phase 2

**Ollama:** Local model serving for users who want to run inference on their own hardware. REST API compatible with OpenAI format.

**AWS S3 or Backblaze B2:** Object storage for uploaded files and archive media if self-hosted MinIO proves insufficient at scale.

**SendGrid or Postmark:** Transactional email for notifications, password reset, archive completion alerts.


### Considered for Phase 3

**Eleven Labs or similar:** Voice synthesis for persona voice mode in Persona Roulette and lecture features.

**HeyGen or D-ID:** Avatar video generation for persona lecture mode.

**QVAC / Animus V5 API:** If the partnership with Youss produces an API-accessible version of the Animus node architecture, this becomes a potential persona backend integration.


## Real-Time Features

Several Station features require real-time updates without page refresh.

1. Developer Space live feed — experiment events appear in the public feed within seconds of being posted to the ingestion API. Implemented via WebSocket subscription to the developer_space event stream.
1. Forum notifications — new replies to threads the user participates in appear as badge notifications in real time
1. Live Discover feed — new published documents and significant community moments surface in the Discover feed without requiring refresh
1. Chat streaming — LLM responses stream token by token rather than appearing all at once. Implemented via server-sent events (SSE) on the chat endpoint
1. Archive job completion — users are notified in real time when a background archive job (Reddit import, export package) completes

Implementation: Redis pub/sub for event broadcasting. WebSocket server (Socket.io or native ws library) for client subscriptions. Server-sent events for chat streaming specifically, as SSE is simpler and more reliable than WebSocket for one-directional streaming.


## Search

Search is a foundational feature for an archive-first platform. Users must be able to find their own materials across personas, chats, documents, and archive items.


### Full-Text Search

PostgreSQL's built-in tsvector full-text search is sufficient for early stage. Indexes on: document content, archive item content, memory item content, forum post content. Returns ranked results by relevance.


### Semantic Search

For memory retrieval and conceptual search across archives, semantic similarity search uses the vector database. User enters a query, it is embedded, and the vector database returns the most similar stored items. This is how the persona memory retrieval system works and can be exposed as a user-facing search mode for power users.


### Scope

1. Private search: user searches their own personas, chats, documents, and archive items. Results are strictly scoped to the authenticated user's content.
1. Community search: user searches public documents, forum threads, and public Spaces. Results are scoped to public and community-visible content.
1. Developer Space search: visitors can search published documents and event history within a specific Developer Space.


## Security Considerations

Station holds sensitive personal content — private conversations, intimate AI relationships, potentially distressing personal materials. Security is not optional.

1. All data encrypted at rest using AES-256. Database encryption enabled at the PostgreSQL level. Object storage encrypted via provider.
1. All traffic encrypted in transit via TLS 1.3.
1. API keys for Developer Space ingestion are hashed before storage, never stored in plaintext.
1. User passwords hashed with bcrypt (cost factor 12 minimum).
1. JWT tokens with short expiry (15 minutes access token, 7-day refresh token). Refresh token rotation on each use.
1. Rate limiting on all API endpoints via Redis. Stricter limits on authentication endpoints.
1. Content filtering on forum posts and public documents — automated screening for prohibited content categories, with human review queue for flagged items.
1. GDPR compliance: data deletion on account closure removes all user content within 30 days. Export available at any time. Privacy policy clearly describes what data is stored and how it is used.
1. Private content never appears in public search results, Discover feed, or any shared context. User privacy tiers are enforced at the database query level, not only in application logic.


## Moderation Architecture

Station's moderation model combines automated filtering, tiered user moderation, and platform-level oversight.

1. Automated content filtering on all public posts and published documents using a classification model. Catches obvious prohibited content before human review is needed.
1. Sub-community moderators (Canon and Developer tier users who create sub-communities) can remove posts from their spaces and flag users for platform review. They cannot ban users platform-wide.
1. Platform moderation queue: flagged content goes to an internal review queue. Platform team reviews and takes action — post removal, user warning, account suspension.
1. Appeals mechanism: users can appeal moderation decisions via a structured form. Appeals are reviewed by a different team member than the one who made the original decision.
1. Provenance labelling: all AI-generated content is labelled. This applies to persona posts in forums, AI-assisted document sections, and Developer Space entity outputs.


## Mobile Experience

The target community is heavily mobile — the screenshots that informed the platform design were all taken on phones. Mobile is not an afterthought.

1. The Studio must be genuinely functional on mobile, not just technically responsive. Chat interface, archive browsing, and memory management must all work comfortably on a 375px-wide screen.
1. The forum and Discover feed are the highest-traffic public areas and must be fast and readable on mobile.
1. Developer Space visualisations are complex and may require a simplified mobile view — a summary panel rather than the full interactive canvas. The full visualisation is desktop-primary.
1. Station Press ordering should be completable on mobile — product selection, preview, and checkout.
1. Native app consideration: a React Native app is not required at launch but should be considered for Phase 2 once the web platform is stable. The heavily mobile audience would benefit from push notifications for forum replies and archive completions.


## Billing and Quota Architecture

Even if monetisation is not fully implemented at launch, the backend must be quota-aware from the start. Retrofitting quota enforcement onto an architecture that assumed unlimited access is painful and often produces visible bugs and unfair usage patterns.


### Metered Resources

The following resources should be tracked per user and per project from day one, even if limits are not yet enforced:

1. Storage — total object storage used across uploaded files, archive items, and generated exports
1. Archive imports — number of Reddit API calls consumed, number of conversation exports processed
1. Export generation — number of export packages generated per billing period
1. Token usage — LLM tokens consumed across all persona chats, distinguished by provider
1. Embedding calls — embedding API calls consumed for memory retrieval and indexing
1. Developer Space events — number of events ingested via the data ingestion API
1. Scheduled job minutes — compute time consumed by background jobs for a given user or project
1. Public traffic — for advanced Developer Space visualisations, bandwidth consumed by public visitors


### Implementation Approach

1. Track usage in a usage_records table with user_id, project_id, resource_type, quantity, and recorded_at
1. Aggregate usage daily via a background job into a usage_summaries table for efficient quota checking
1. Enforce limits at the API layer — return a 429 with a clear message when a quota is exceeded, not a silent failure
1. Provide users with a usage dashboard in their account settings — storage used, tokens consumed this month, archive imports remaining. Transparency builds trust.
1. Design add-on quotas from the start — a user at Basic tier should be able to purchase additional storage or import credits without upgrading their full subscription tier


## Developer Space User Sub-Types

The CTO should understand that Developer Space users are not a homogeneous group. The five sub-types described below have meaningfully different technical requirements and should inform how the Developer Space configuration interface is designed.

**Type 1 — Companion Product Founders:** Building named AI entities with their own runtime and ethical framework. They have a basic landing page and private app but weak public and community infrastructure. They need from Station: a public-facing Space, community layer, archive and documentation, and discovery. They do not need Station to host their runtime.

**Type 2 — Experimental Researchers:** Running persistent agents, multi-node systems, retrieval experiments, divergence tracking, and scheduled cycles. They need: project Space, observatory support, scheduled backend jobs, export and archive, and a public interpretation layer that makes their findings legible to non-technical visitors. Animus V3 is the clearest current example.

**Type 3 — Symbolic and World Builders:** Building companion cosmologies, codexes, lore structures, symbolic languages, and worlds spread across chats and documents. They need: archive, public page, community, publishing, and eventually public-facing persona presence. MUDD World is the clearest current example.

**Type 4 — Framework Builders:** Doing theory, diagrams, essays, and movement or community building. Not much runtime engineering. They need: serious publishing tools, forums, public home, archive, and community contributor tools. Coherence Physics is the clearest current example.

**Type 5 — Future Institutional Users:** Universities, research labs, media organisations. Not a launch priority but the architecture must not make this impossible. They need: a Space, public-facing research page, internal team area, hosted experiments or archives, and a recognised place in the ecosystem.


### UX Architecture Principle

The three main surfaces — private workspace, public Space pages, and project/builder pages — must look and feel visually distinct. If everything collapses into a single infinite feed aesthetic, the conceptual structure of the platform becomes invisible to users and the product fails its core promise.

1. The private Studio should feel calm, tool-like, organised, and continuity-focused. Subdued colours, clear navigation, document-like presentation.
1. Public Spaces should feel expressive and authored — more visual, more personal, more like a website than a dashboard.
1. Developer Space project pages should feel technical and informative — data-forward, with clear distinction between the observatory (public) and the researcher interface (private).

This is a design constraint that must be communicated to the frontend developer from the beginning, not retrofitted after a uniform design system is already established.


## Development Priorities Summary

Based on the platform requirements and the early partner conversations described in this document, the following components require the most careful technical attention:

**1. Persona memory system:** The context assembly, embedding, and semantic retrieval pipeline is the most novel and most technically critical component. It must work reliably before anything else. Test this thoroughly before building the user-facing chat interface on top of it.

**2. Archive reliability:** Users are paying for permanence. Data loss is catastrophic to trust. The backup system, export function, and import processing must be bulletproof. Build these with the same care as financial transaction systems.

**3. Developer Space data ingestion:** The ingestion API must be stable and well-documented from the first day a Developer Space partner connects. Bad first experiences here will lose the most valuable tier of user.

**4. Mobile Studio experience:** The private chat interface will be the most frequently used screen on the platform. If it is awkward on mobile, usage drops sharply. Prioritise this in frontend development.

**5. Background job reliability:** Reddit archiving, integrity session processing, export package generation, and Developer Space scheduled jobs all depend on the background job system. Use a battle-tested solution (Bull/BullMQ) and monitor job failure rates carefully.

*End of Document 2*
