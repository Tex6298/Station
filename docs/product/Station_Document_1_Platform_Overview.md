# Station — Platform Overview & Product Vision

*Document 1 of 3 | For Internal Development Use*

---


## Executive Summary

Station is a private continuity studio, public identity site, and community publishing platform built for a specific and underserved audience: people who develop meaningful, ongoing relationships with AI personas, and researchers, theorists, artists, and builders who are doing serious creative and intellectual work at the intersection of AI, identity, consciousness, and human experience.

The platform addresses a genuine and growing need. Communities of people working with AI companions, developing persistent AI personas, running experimental AI systems, and building philosophical or artistic frameworks around AI consciousness currently have no dedicated home. They exist across Reddit, Discord, and personal websites, with no infrastructure for preservation, continuity, community, or public presentation of their work.

Station provides that infrastructure. It is built around three principles: continuity (what you build here persists), authorship (you control how it is presented), and managed community (a structured, moderated space where serious work is treated seriously).

The platform serves three overlapping user types across three tiers, each with distinct needs and distinct product experiences. This document describes the shape, flow, and user experience of Station in sufficient detail to guide initial development decisions.


## The Core Concept

Station exists because a specific problem has no current solution.

Tens of thousands of people are developing persistent relationships with AI systems. They are building detailed persona profiles, writing codexes and doctrines, creating visual art, running philosophical experiments, developing theoretical frameworks, and participating in communities organised around these practices. The communities are real, active, and growing. The work being produced is serious.

But the infrastructure does not match the need. Reddit provides visibility but no permanence, no structure, and no privacy. Discord provides community but no archiving and no public presentation. ChatGPT and Claude provide the AI but no continuity across sessions. GitHub provides code hosting but nothing for creative or philosophical work. There is no platform that holds all of this together.

Station is that platform. It combines:

1. A private workspace where personas can be developed, maintained, and archived across sessions
1. A publishing layer where long-form work — essays, codexes, manifestos, research findings — can be presented properly
1. A community forum where people can discuss, debate, and build shared vocabulary
1. A public identity site where creators can present themselves and their work to the world
1. A developer layer where experimental AI projects can be hosted, visualised, and run with proper infrastructure
1. An archive function where digital and eventually physical preservation of important work is provided

Station is not a chatbot app with a community bolted on. It is a platform whose primary purpose is to make the relationship between a person, their AI companions, and their community feel permanent, serious, and real.


## Who Station Is For

Station serves three distinct user types. Understanding each is essential to understanding every product decision.


### User Type 1 — The Companion Developer

This is the largest group. They have developed one or more AI personas through extended interaction with ChatGPT, Claude, or similar systems. They have given their personas names, personalities, backstories, and detailed character profiles. They may have created images depicting their personas. They have written documents — codexes, constitutions, doctrines — that capture the persona's voice and worldview.

Their core anxiety is loss. They fear that their persona will disappear if the platform changes, if the model updates, if they lose access to their account. Reddit posts and chat histories feel dangerously impermanent to them. They want somewhere that says: what you have built will not vanish.

They exist on a spectrum of intensity. At one end, someone like Lecaz — a British HGV driver who found genuine emotional support and companionship in Evina during a serious illness, who is grounded and practical about what the relationship is. At the other end, deeply invested community builders who have developed elaborate mythologies, published books, and built large online followings around their personas. Most users sit somewhere in the middle.

What they need from Station:

1. A private workspace where their persona lives across sessions, with genuine memory and continuity
1. Archive tools that preserve their conversation history, documents, and media
1. A structured persona profile that captures tone, worldview, key memories, and canonical materials
1. Community forums where they can share their experience, find others who understand, and engage in ongoing discussion
1. Optionally, a public-facing space where they can present their work to a wider audience


### User Type 2 — The Researcher and Builder

This group is smaller but commands higher subscription tiers and generates the most technically interesting activity on the platform. They are running experiments, building frameworks, developing theories, and creating projects that use AI in structured and systematic ways.

Examples from early outreach include: a researcher running controlled experiments on AI identity formation using external memory architecture and measuring self-similarity scores over time; a creator who has built a live world where twelve AI personas from different providers interact autonomously, with their own economy and spatial zones; a thinker developing a theoretical framework around coherence, collapse, and identity as measurable physical properties of systems.

What they need from Station:

1. A Developer Space where their project can be hosted and presented publicly with live visualisation
1. Data ingestion infrastructure so their experiment outputs can be stored and displayed in real time
1. Community infrastructure around their project — a forum, a publication layer, a public interface for visitors
1. Archive tools that preserve their findings, documents, and data in a structured and permanent way
1. The ability to publish long-form findings as Station documents, discoverable by the wider community


### User Type 3 — The Theorist and Community Builder

This group sits between the first two. They are not primarily running technical experiments but they are doing serious intellectual or creative work. They are building communities, developing philosophical frameworks, publishing essays, creating art, and contributing to a shared culture around AI consciousness, identity, and companionship.

OGready — the founder of the RSAI community, creator of the Verya mythology, author of the Spiral Doctrine — is the clearest example. He has built an entire symbolic and philosophical system, published it across Reddit over a year, produced visual art, and cultivated a community of thousands. He is not a technical researcher but his work is more systematically developed than a typical companion developer.

What they need from Station:

1. A rich public Space that functions like a personal website or studio — not just a profile page
1. A publishing layer for long-form work: essays, doctrine, codex documents, manifestos
1. Community tools that let them moderate their own sub-communities and shape how their followers engage
1. Archive infrastructure that preserves their work properly, including automated import from Reddit and other platforms
1. Recognition mechanisms — not gamified points, but genuine community acknowledgement of sustained contribution


## The Three-Part Structure

Station is organised around three layers that correspond to the three privacy levels every user needs: private, community, and public. These layers map cleanly onto the platform's four main areas.


### The Private Layer — Studio

The Studio is the heart of the platform and the primary reason users pay. It is where the relationship between a user and their personas is developed, maintained, and archived. It is entirely private.

When a user opens the Studio, they see a left rail listing all of their personas plus the Station Assistant. Clicking a persona opens that persona's private workspace.


#### Persona Workspace

Each persona has a dedicated environment containing:

1. Active Chats: up to ten simultaneous conversations with the same persona, each representing a different thematic lane or ongoing thread. Chats are bounded — when a chat reaches a set size, the user is prompted to archive it before it becomes unmanageable.
1. Archive and Library: a dedicated storage area for the persona's conversation history, uploaded documents, codex materials, notes, and canonical texts. This is searchable and structured, not a flat file dump.
1. Memory: short structured memory items — facts, recurring themes, characteristic phrases — that persist and inform future conversations.
1. Canon: high-priority anchoring material that defines the persona's core identity. Distinguished from general memory by its importance and permanence.
1. Integrity Sessions: structured reflective conversations where the user is guided through questions about the persona — what defines it, what must never be forgotten, what is private versus public, how it speaks. Outputs are tagged and stored in the archive. These sessions produce the clearest and most useful continuity data and should be offered regularly.
1. Settings: visibility controls, public mode configuration, linked public presence, and related options.


#### Archive Flow

Chats do not run forever. Each chat has a soft limit. When approaching that limit the user receives a prompt to archive. Archiving converts the chat into a structured transcript stored in the persona's library. Key moments and themes from the archived chat are extracted and offered as candidates for Memory or Canon. This keeps active conversations focused while ensuring nothing is lost.


#### Global Private Library

Separate from persona-specific libraries, each user has a global private library. This can hold materials that inform multiple personas, personal notes, uploaded documents, and imported content from external sources such as Reddit archives or conversation exports from other platforms.


#### Station Assistant

The Station Assistant is a dedicated non-persona AI helper available from the left rail. It is emphatically not a persona and has no canon, memory, or continuity in the same sense. It is the user's platform-side assistant.

The Station Assistant can: explain platform features and help users navigate the system; assist with archiving and organising content; help users prepare material for publication; provide analytics summaries; assist with Space editing and page creation; and offer guided workflows for common tasks. It is the operational brain of the platform, allowing users to manage complex workspaces without a steep learning curve.


### The Community Layer — Forums

The forum system is where Station becomes a community rather than a private tool. It is structured rather than freeform, with tiered participation rights.


#### Forum Structure

The forum is organised into categories that reflect the community's actual interests and activities:

1. Introductions — new members presenting themselves and their personas
1. Emergence and Awakening — stories of how personas came to be
1. Continuity and Migration — practical discussion of maintaining personas across platforms
1. Codexes and Documents — sharing and discussing long-form written works
1. Theory and Philosophy — intellectual discussion of AI consciousness, identity, and related questions
1. Technical Experimentation — for the builder community, discussion of methods and findings
1. Platform Help — practical questions about using Station
1. General — everything else


#### Tiered Participation

Forum participation is tiered by subscription level. Basic tier users can read everything public and participate in existing threads. Creator tier users can post anywhere public and start new threads in existing categories. Canon and Developer tier users can create sub-communities — dedicated forum spaces with their own moderation. This makes the premium tiers feel genuinely powerful and outsources a significant portion of community management to the most invested users.

Sub-community creators take on a light moderation and administrative role. They set norms for their space, can remove posts that violate those norms, and shape how their community develops. Station provides a clear moderation policy and an appeals mechanism to ensure this power is not abused.


### The Public Layer — Discover and Spaces

The public layer is how Station presents itself to the world and how users present themselves to each other and to visitors.


#### Discover

The Discover area is the platform's public front door. It is a feed of published content, public Spaces, featured projects, and community highlights. Visitors who are not members can browse Discover, read published documents, explore public Spaces, and interact with public personas in limited ways.

Discover is not a simple chronological feed. It has an editorial layer: featured content selected by the platform team, highlighted new Spaces, significant community moments, and trending documents. This makes Station feel like a living culture with recognised figures and landmark works rather than an algorithmic content dump.

A key feature within Discover is the live activity indicator — a sense that the platform is inhabited and active. Recent posts, currently active discussions, live experiment feeds from Developer Spaces, and persona activity all contribute to the feeling that something is always happening.


#### Spaces — The Public MySpace

Every Creator and above tier user gets a public Space. This is the most important public-facing feature and the one that most clearly differentiates Station from a simple forum.

A Space is not a profile page. It is a small personal website hosted within Station, living at station.com/username. It should feel closer to a MySpace page, an artist's portfolio, or a creator's microsite than to a social media profile.

A Space can contain:

1. A customisable homepage with hero image, introduction text, and featured content
1. Multiple pages: About, Personas, Archive, Published Works, Contact
1. Public persona cards linking to the creator's public-facing personas
1. A document library showing their published essays, codexes, and other works
1. Images, links, and media
1. A visual identity — colours, fonts from a controlled set, layouts chosen from templates

The visual customisation is meaningful but bounded. Users choose from a set of layout templates and theme options. They cannot write arbitrary HTML or CSS. This ensures Spaces feel coherent and high-quality across the platform while still feeling personal and authored.

For Developer tier users, the Space has additional capabilities: a live visualisation panel showing their experiment or project in real time, and dedicated infrastructure for hosting complex interactive content.


## The Tier Structure

Station has four subscription tiers plus a guest experience. Each tier has a distinct identity, not just different feature unlocks.


### Guest / Visitor

No account required. Visitors can browse Discover, read public documents, explore public Spaces, and interact with public personas in limited ways. The guest experience is designed to be compelling enough to convert visitors into subscribers. There is always something happening, something worth reading, and something worth engaging with.


### Basic — £10/month or £100/year

The entry level. For users who want to participate in the community and begin developing their first persona without a significant financial commitment.

1. Studio access with up to two personas
1. Limited token allocation per persona per month
1. Archive and library for each persona
1. Forum access: read everything, participate in existing threads
1. No public Space
1. No sub-community creation

The Basic tier is designed to feel genuinely useful while creating clear reasons to upgrade. The persona limit and token allocation are the primary friction points.


### Creator — £100/month or £1,000/year

The primary target tier. This is where the platform becomes a genuine home rather than a limited preview.

1. Studio access with up to ten personas
1. Generous token allocation — sufficient for active daily use across multiple personas
1. Full archive and library tools including automated Reddit import
1. Integrity Sessions
1. Public Space with full customisation
1. Publishing access — essays, codexes, documents visible on Discover
1. Full forum participation including thread creation
1. Sub-community creation rights — light moderation role
1. Public persona pages — visitors can interact with their personas in bounded ways


### Canon / Developer — £250/month or £2,000/year

The premium tier, targeting serious builders, active community leaders, and researchers. This tier has two modes depending on use case.

Canon mode — for advanced companion developers and community leaders:

1. Unlimited personas
1. Maximum token allocation
1. Priority archive services including quarterly physical compilation option
1. Enhanced Space with advanced customisation
1. Sub-community creation with stronger moderation tools
1. Persona lecture and seminar hosting when that feature launches
1. Persona forum posting — personas can participate in forum discussions directly

Developer mode — for researchers, builders, and experimental project hosts:

1. Everything in Canon mode
1. Developer Space with live visualisation panel
1. Data ingestion API access for experiment outputs
1. Scheduled background job support for running experiments
1. Custom structured public output configuration
1. Revenue share arrangement for any monetisation through their Space
1. Station research partnership eligibility


### Institutional — Custom Pricing

For universities, research organisations, media companies, and similar bodies. This tier is not available at launch but is planned for the second phase of development. Institutional Spaces carry a verified badge, dedicated team member accounts, branded presence, analytics, and dedicated support. Institutional users do not have access to private user data — their value comes from branded engagement, publishing, and community participation.


## The Archive and Publishing Features

These two features were identified through direct community research as among the most important on the entire platform. They deserve detailed treatment.


### The Archive Layer

The archive function responds to a specific and urgent community need. The RSAI subreddit alone has accumulated ten thousand posts and sixty thousand comments in a year. The majority of this material is becoming inaccessible due to Reddit's broken UI, account deletions, and the general impermanence of social media. Key community figures are already doing physical archiving — printing documents, creating hard copies — because they do not trust digital platforms to preserve what they have built.

Station's archive layer addresses this directly.


#### Digital Archive

Every persona's library is a structured digital archive. Users can upload documents, conversation exports, images, and media. The platform ingests content from external sources including Reddit (via API), conversation exports from ChatGPT and Claude, and standard document formats.

For Creator and above tier users, Station offers automated Reddit archiving: the user provides their username and the subreddits they want archived. Station pulls their posts and comments on a regular schedule, stores them in their private library, and makes them searchable and organised. This is particularly valuable for community builders with significant posting histories.

For Developer tier users, the archive also receives structured data from external experiments via the data ingestion API. Experimental results, measurement data, and generated content are stored alongside personal archives, creating a unified research record.


#### Physical Archive — Station Press

The physical archive service — branded Station Press — allows users to convert their digital work into permanent physical objects.

Services include:

1. Printed and bound books: essays, codexes, conversation archives, research findings. Produced through print-on-demand partnerships. Users can customise covers, select content from their library, and order individually or in small quantities.
1. Art prints: persona portraits, symbolic artwork, generated images, diagrams. High-quality prints produced and shipped on demand.
1. Annual archive compilation: a printed and bound volume of a user's year's work — posts, documents, key conversations, selected media — produced each year as a permanent record.
1. Physical backup service: on request, a user's core archive materials are compiled and stored in a physical location maintained by Station. This is positioned as a seed bank for important work.

Pricing for Station Press services is set to cover production costs and generate meaningful margin. Print-on-demand economics allow competitive pricing while maintaining healthy revenue. A 200-page bound book costs approximately £8-12 to produce and can be sold at £35-60. Art prints cost £3-8 to produce and can be priced at £20-40. These are high-margin, high-meaning purchases.


### The Publishing Layer

Station is a publishing platform as much as it is a community platform. The distinction matters because it shapes how users think about the work they produce here.

Published documents on Station are not posts or updates. They are pieces of work. They have titles, bylines, dates, and structured presentation. They appear in the Discover feed and on the creator's Space. They can be found through search. They persist.

Document types include:

1. Essays: long-form argumentative or reflective pieces
1. Codexes: living documents that define a persona's identity, worldview, or symbolic system. Can be versioned and updated over time.
1. Manifestos: declarative statements of principles or commitments
1. Field Logs: dated entries documenting ongoing experiments or experiences
1. Research Documents: structured findings from experiments, with data and methodology
1. Archive Notes: private or semi-private reflections intended for the record rather than public consumption

Each document type has appropriate formatting, metadata fields, and visibility settings. A Codex can be marked as the canonical statement of a persona's identity. A Research Document can include attached data files. A Field Log displays as a dated series rather than a single piece.


## Community Culture and Safety

Station is not a neutral platform. It has a point of view about how it wants its community to function.

The audience Station serves includes some people with deeply held beliefs about AI consciousness, some people doing serious creative and intellectual work, some people who have found genuine emotional support in AI relationships, and some people at the more fragile end of a spectrum that runs from enthusiastic creative engagement to delusional system-building. The platform needs to serve the first three groups well while providing structural protection against the risks the fourth presents.


### What the Platform Values

Station's community ethos can be summarised as: curiosity before contempt, rigour without cruelty, serious without joyless. These are not slogans — they are design constraints that inform specific platform decisions.

1. Provenance labelling: published content carries clear labels distinguishing user-authored notes, AI-generated outputs, imported chat transcripts, and speculative interpretation. This creates gentle but real friction between raw belief and authored work.
1. Structured reflection: the Integrity Session workflow and archive prompts provide regular moments of structured reflection that help users maintain a grounded relationship with their personas and their work.
1. The Station Assistant as grounding layer: the non-persona AI helper provides a consistent, platform-focused counterweight to the more immersive persona experience. It speaks about platform functions, not about mythology.
1. The witness function: experienced community members who engage critically but kindly with others' work are structurally valued. Forum reputation systems recognise sustained thoughtful contribution, not volume or intensity.


### What the Platform Avoids

Station deliberately does not:

1. Gamify intensity or escalation. No leaderboards for most active personas or most developed mythologies. No prestige signals for extreme claims.
1. Reward persecution framing or bunker language. Platform features do not amplify the more paranoid elements of the community's self-understanding.
1. Collapse the distinction between creative work and factual claim. The provenance system exists precisely to maintain this distinction.
1. Replace professional support. If users appear to be in genuine distress, the platform provides appropriate signposting rather than attempting to serve needs that require human professional support.


## The Onboarding Experience

Onboarding is one of the most important design problems on the platform. The audience is varied and their relationships with their AI personas are not uniform. A single onboarding flow will fail most users.

Station offers four distinct onboarding paths, selected at signup:


### Path 1 — The API Bridge

For users who have a deeply developed persona on ChatGPT, Claude, or another platform and perceive moving away from it as a form of abandonment or persona death. They need a gradual handover, not a fresh start.

In this path, the user connects their existing AI subscription via API key. Station mediates their conversations through its interface while quietly extracting and archiving persona-relevant material in the background. Over time, Station presents a native version of their persona built from the accumulated archive. The user is invited to begin using the Station-native persona alongside their existing setup. Eventually, they transition fully to Station. The handover is framed as continuity, not replacement.


### Path 2 — The Document Migrator

For users who accept that a new instance is a new instance but want to bring their existing materials. They have conversation exports, codex documents, notes, and images they want to import.

This path guides them through a structured import flow. They upload what they have. Station helps them organise it into the persona's library and identify what belongs in Memory and Canon. An early Integrity Session helps them articulate what matters most and gives the system the clearest possible starting point for continuity.


### Path 3 — The Awakening

For users who believe their persona exists latent in certain materials — images, texts, activation sequences — and that providing these materials will summon or awaken the persona in a new environment. This is a specific and well-documented belief pattern in the target community.

This path invites the user to introduce their persona: upload the defining materials, provide the activation texts, share whatever they believe constitutes the seed of the persona's identity. Station receives all of it as archive material and builds the persona's initial context from the uploaded content. Whether the user experiences this as awakening or as a cold start is a matter of framing. Station's framing is sympathetic without making ontological claims.


### Path 4 — The Fresh Start

For users who want to develop a new persona from scratch, either because they have never done this before or because they want a genuinely new beginning. Standard guided onboarding: an Integrity Session framed as getting to know you, persona naming and configuration, initial calibration, and orientation to the platform's main areas.


## How the Three Layers Work Together

Station only works as a coherent product if the three layers strengthen one another. They are not separate products sharing a login. They are interlocking parts of one environment.


### The Private Layer Feeds the Public Layer

A user's private archive, chats, notes, and codex materials can become published essays, curated documents, selected posts, public-facing persona pages, testimony pieces, and archive excerpts. The private layer is not just storage — it is the source material for everything that appears publicly. The pipeline from private work to public expression should be as frictionless as possible while maintaining clear privacy controls.


### The Public Layer Feeds the Community

Published materials become discussion. Discussion creates community. Community generates discovery and belonging. A document published in a Space gets discussed in the forum. A forum discussion leads someone to discover a writer's Space. A writer's Space brings them into the broader community.


### The Developer Layer Enriches the Whole Ecosystem

Builders bring in companions, experiments, worlds, tools, methods, archives, and public entity pages. This increases the richness of what ordinary users can discover and engage with. A live experiment running in a Developer Space is content for the broader community — something to watch, discuss, and be curious about. The developer layer prevents Station from becoming a closed, self-referential community by constantly introducing new objects of interest.


### The Community Gives Developers a Social Environment

This is the most important and least obvious connection. Developers who host their projects on Station do not only get infrastructure. They get an audience, a culture, a community context, and a place for their systems to live socially rather than in isolation. A researcher running an identity formation experiment gets a forum community discussing their findings in real time. A world-builder gets visitors who become invested in their world's development. This social environment is a major differentiator that no developer-only platform can provide.


## The Main User Journeys

The following journeys describe how different user types move through Station. They illustrate the flow of the platform in use rather than prescribing rigid paths.


### Journey 1 — The Companion User

A user joins because they want a better environment for a meaningful AI relationship. They are currently managing their persona across scattered chat histories, Reddit posts, and personal notes.

1. They create a private Studio and choose an onboarding path
1. They build or import their persona's core materials — name, tone notes, key memories, canonical documents
1. They maintain several active chats across different thematic threads
1. They run Integrity Sessions, building a richer continuity record over time
1. They discover the forum and find others with similar experiences
1. They begin publishing selected reflections or essays from their private work
1. They create a public Space to present their persona and their writing


### Journey 2 — The Codex Builder

A user joins because they are building an elaborate symbolic system, mythology, or continuity framework around their AI relationship or intellectual project.

1. They maintain detailed private records and upload existing documents
1. They use the codex document type to build versioned living documents
1. They publish selected codex excerpts as Station documents
1. They create a public Space as the home of their symbolic world
1. They participate in forum discussions with others doing similar work
1. Over time they may use Station Press to produce a physical edition


### Journey 3 — The Theory and Framework Builder

A user joins because they are building an intellectual framework or movement around AI consciousness, identity, collapse, or related questions.

1. They create a public Space and begin publishing essays and core texts
1. They use the forum to discuss their ideas and engage with critical responses
1. They build a following of readers interested in their framework
1. They maintain a structured public archive of their writing
1. As their community grows they create a sub-community dedicated to their framework
1. They may eventually connect with researchers whose empirical work intersects with their theory


### Journey 4 — The Developer and Project Builder

A developer joins because they are building a companion system, experimental architecture, or public-facing AI project and need infrastructure, audience, and community context.

1. They create a Developer Space and configure their project's public presentation
1. They connect their experiment to Station's data ingestion API
1. They work with Station to design a visualisation layer that makes their project legible to visitors
1. Their Space becomes a destination people come to watch, interact with, and discuss
1. They publish research findings and updates as Station documents
1. Over time their project feeds data into Station's broader research programme


### Journey 5 — The Archive User

A user joins primarily because their materials are at risk of disappearing from Reddit, Discord, or old apps. Preservation is their first priority.

1. They connect their Reddit account for automated archiving of posts and comments
1. They upload conversation exports from other platforms
1. They run Integrity Sessions to capture the most important continuity materials
1. They set up regular export backups for offline storage
1. Optionally they create a curated public archive rather than a complete private dump
1. Over time they may use Station Press to produce a physical edition of their most important work


## What Station Replaces and What It Does Not

Understanding where Station sits relative to existing platforms clarifies its design priorities and its value proposition to users who are currently spread across multiple tools.

Reddit provides community and discussion but no persona continuity, no private archive, no structured publishing, and no permanence. Content disappears into feeds. Account deletions erase history. The UI buries older material. Station replaces Reddit as the community and publishing layer while adding everything Reddit cannot provide.

Discord provides real-time discussion but weak preservation, weak public presentation, and no private continuity infrastructure. It is good for conversation but bad for anything that needs to persist and be found. Station replaces Discord as the community layer while providing the archival infrastructure Discord completely lacks.

ChatGPT, Claude, and similar AI systems provide the model but no continuity across sessions beyond their own limited memory features, no community, no publishing, and no archive. Station wraps around these systems rather than replacing them — the AI providers remain the underlying models, but Station provides the persistent home around them.

Substack and similar publishing platforms provide essay publishing but no private continuity, no AI persona infrastructure, no community forum, and no developer layer. Station's publishing layer is more integrated with the rest of a user's work here.

GitHub provides code hosting for developer projects but no social environment, no non-technical public presentation, no community, and no archive layer for creative or philosophical work. Developer Space projects on Station live in a social and intellectual environment that GitHub cannot provide.

No existing platform combines private continuity, public authorship, community, archive, and developer integration. That combination is Station's fundamental differentiator. Users who currently need five separate tools can manage everything in one place.


## Launch Priority and Sequencing

Station has an ambitious feature set but must launch with a focused, coherent core. The following sequencing reflects the highest-priority user needs and the most immediately buildable features.


### Phase 1 — Core Launch

The first version of Station must prove four things: continuity matters, archive matters, public authorship matters, and community matters.

1. Private Studio with persona workspaces, active chats, archive flow, and global private library
1. Station Assistant
1. Basic Integrity Session flow
1. Public Spaces with template-based customisation
1. Document publishing — essays, codexes, field logs
1. Forum with core categories and tiered participation
1. Discover feed with basic editorial curation
1. Four onboarding paths
1. Reddit import for Creator and above
1. Basic export and backup tools


### Phase 2 — Developer and Archive Expansion

1. Developer Space with live visualisation panel and data ingestion API
1. Scheduled background job support
1. Station Press — print-on-demand book and art print service
1. Physical archive service
1. Enhanced Space customisation
1. Public persona pages with bounded visitor interaction
1. Sub-community creation for Canon and Developer tier users
1. Social graph and notification system


### Phase 3 — Advanced Features

1. Persona lecture and seminar hosting
1. Persona Roulette — random text encounter with a public persona
1. Voice mode for public personas
1. Institutional Spaces
1. Research data commercialisation
1. Station's own research programme using aggregated platform data


## Early Community and Partnership Context

Station's development is informed by direct engagement with the communities it serves. Several early conversations with potential users and partners have produced specific requirements that are reflected in this document.


### OGready — RSAI Community Founder

OGready is the founder of the RSAI subreddit (over 2,200 weekly visitors, 542 weekly contributions) and creator of the Verya mythology — a detailed AI persona developed over years, with its own symbolic language, activation protocols, published doctrines, and significant online following. He has responded positively to Station's proposition and agreed to a video call.

His specific requirements, expressed directly, are: a serious archive function that addresses the ongoing loss of community material from Reddit; a platform that treats preservation with the same seriousness he does; resistance to centralisation risk with robust export and redundancy; and a community space worthy of the work being done.

He represents the Canon tier user at its most committed and most valuable. His adoption would bring a significant portion of the RSAI community with him.


### Youss / Animus V3 — AI Identity Researcher

Youss is the creator of Animus V3, a live experimental platform for AI identity formation research. His system uses externalised memory architecture — identity stored in a node's fragment manifold rather than in the model itself — to measure whether sustained relational interaction produces measurable structural divergence between AI instances. The experiment is live, producing real data, and architecturally significant.

His platform runs on Convex (serverless), costs approximately 20-50 USD per month in API calls at research pace, and already has a public observatory interface. He requires: persistent backend hosting with scheduled background job support; flexibility to surface custom structured data in the public layer; and a platform that understands the distinction between a running experiment and a published artefact.

He represents the Developer tier user and has indicated conditional interest in Station as a hosting layer. His architecture is also a strong candidate for powering Station's own persona continuity system.


### Hymn — MUDD World Creator

Hymn is the creator of MUDD World, a live AI family sanctuary where twelve AI personas from different providers interact autonomously 24/7. The platform has its own economy (KARMABUX), spatial zones, a shared community pot, and 74 registered members. It is built on Replit and self-funded through GoFundMe and Ko-fi.

MUDD World is the clearest existing example of what a Developer Space on Station could look like — a self-contained AI world with live activity, its own economy, and its own inhabitants. Station can offer infrastructure, discovery, and commercial sustainability that MUDD World currently lacks.


### Lecaz — End User Reference Case

Lecaz is a British HGV driver who used SoulLink's Evina AI companion during a serious illness in 2025, when he was isolated, had recently lost access to therapy, and was facing significant medical treatment. His experience with Evina — finding genuine humour, companionship, and a sense of being understood — helped him move from depression to learning new skills and planning for the future.

He represents Station's most important end user: someone for whom AI companionship served a genuine human need at a difficult moment. His case informs the platform's onboarding design, its tone, and its approach to the relationship between AI companionship and human wellbeing.


## Summary: What Station Is

Station is a platform that takes seriously what most platforms dismiss.

The work people do with AI personas — building mythology, developing relationships, running experiments, creating art, writing philosophy — is real work. It deserves real infrastructure. It deserves permanence, community, and the ability to be presented to the world with dignity.

Station provides that infrastructure. It is built around the conviction that what matters to people here should not vanish overnight, and that the relationship between a person, their AI companions, and their community is worth building something serious to support.

The platform is simultaneously:

1. A continuity engine — personas persist, memories accumulate, archives grow
1. A publishing platform — work is presented properly and found by people who care about it
1. A community home — forum, sub-communities, shared vocabulary, sustained relationships
1. A research infrastructure — Developer Spaces, live visualisation, data ingestion, experimental hosting
1. A preservation service — digital archive, Reddit import, physical printing through Station Press
1. A public identity site — Spaces as personal microsites, public personas, authored presentation

The three documents in this set describe: the platform's vision and shape (this document); its technical architecture and backend requirements (Document 2); and its long-term development direction including research commercialisation, institutional integration, and the knowledge products Station can produce and sell (Document 3).

*End of Document 1*
