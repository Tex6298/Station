# PR40 - Developer Pages Phase 2A Alignment

Date: 2026-06-18
Status: accepted by ARGUS, ready for MIMIR closeout and ARIADNE staging recheck
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rechecks if visible staging
surfaces change.

## Purpose

Open the first post-P38 Ecosystem lane without confusing it for more
protected-alpha launch-core proof.

P38 closed Station as Home. PR40 starts Phase 2A: Developer Space 1.0 /
Developer Pages Showcase Window credibility. This should productise what is
already emerging in the repo: public project pages with live signal,
methodology, field logs, project documents, public/private boundaries, and
ingestion endpoints.

References:

- `docs/product/DEVELOPER_PAGES_CTO_BRIEF.md`
- `docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md`

## Current Truth

The repo already has meaningful Tier 1 mechanics:

- Developer Space create/manage/public detail.
- Node/event/snapshot/batch ingestion API.
- SSE live updates.
- API key management.
- Linked documents for `methodology`, `finding`, `field_log`, and `note`.
- Public observatory widgets.
- Owner manage surface.
- Developer Space usage and export support.

The staging replay Developer Space still has the demo caveat ARIADNE called
out: live state exists, but there are zero linked public methodology/finding/
field-log documents. It therefore reads thinner than the Developer Pages brief.

## Scope

Implement the first bounded Phase 2A alignment slice:

- Extend the staging replay seed path/corpus so
  `station-replay-dev-alpha` can seed public linked Developer Space documents:
  at least one methodology/architecture note, one finding or milestone note,
  and one field log/update.
- Keep seeded text synthetic, public-safe, and clearly non-production. Do not
  copy private project data or imply DexOS is already onboarded.
- Make the public Developer Space page present linked documents as serious
  project evidence: methodology, findings, field logs, notes/papers, or similar
  role-aware language. Avoid a generic "Project notes" bucket if role-specific
  labels are available.
- If cheap and safe, improve the public page copy so it reflects the Developer
  Pages shape: architecture overview, live observatory, documents/updates, and
  public/private boundary.
- Preserve the current route/table names unless a tiny display-copy change is
  enough. Do not start a rename from Developer Spaces to Developer Pages.
- Update tests so public linked documents remain visible only when their
  document status/visibility/link visibility are public, and owner-only draft
  documents remain hidden from public reads.
- Update docs/status with what Phase 2A covers and what remains future.

## Non-Scope

- No full Phase 2 programme.
- No Station Press, physical archive, public persona pages, sub-communities, or
  social graph implementation in this lane.
- No project ownership abstraction or nullable `project_id` migration yet.
- No Tier 2 hosted runtime.
- No Coolify, Docker/container provisioning, per-project PostgreSQL
  provisioning, Redis provisioning, Bull/BullMQ queue implementation, or
  deployment pipeline.
- No chat-native developer workspace or developer agent tools.
- No `publish_to_page`, `update_layout`, `read_logs`, `push_to_repo`,
  `run_job`, `update_observatory`, or `request_capability` tool execution.
- No DexOS-specific widget framework beyond documenting where it belongs.
- No tipping/donation mechanism.
- No public interaction layer, constitutional simulator, adversarial archive, or
  multi-instance experiment.
- No Tier 3 Interconnected Lab.
- No Cloudflare lane unless a concrete public-edge/retrieval defect appears.

## Sequencing Notes

The broader Phase 2 sequence should remain:

1. Phase 2A - Developer Space 1.0: Showcase Window, live observatory,
   methodology/field-log/project legitimacy.
2. Phase 2B - Project abstraction and ownership model.
3. Phase 2C - Hosted developer runtime.
4. Phase 2D - Chat-native developer workspace and developer agent.
5. Phase 2E - Archive, publishing, Station Press, public persona expansion,
   sub-communities, and social graph.

Do not merge subscription tiers with developer connection tiers. Creator/Canon/
Developer access and Tier 1/Tier 2/Tier 3 connection depth are different
concepts.

## Acceptance

- The staging replay seed can create or update public Developer Space evidence
  documents and link them to `station-replay-dev-alpha`.
- Public Developer Space reads expose the public linked methodology/finding/
  field-log evidence without owner IDs, keys, tokens, private prompts, raw
  private payloads, or private draft bodies.
- Owner reads still include owner-only linked drafts where appropriate.
- The public page no longer makes the seeded Developer Space feel like it has
  only live counters and no project evidence.
- Phase 2/3 ambitions from the CTO brief are documented as future, not implied
  as shipped.

## Validation

Run the narrow relevant gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run replay:seed:validate
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

If touched code reaches Discover/community/document routing, also run:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
```

## ARGUS Review Ask

ARGUS should review:

- public/private linked-document safety;
- whether public Developer Space copy overclaims Tier 2 hosted infrastructure,
  DexOS onboarding, tipping, interaction modes, or chat-native developer agent;
- whether seeded demo evidence is clearly synthetic/non-production;
- whether existing Developer Space API contracts remain compatible;
- whether scope stayed inside Phase 2A.

## ARIADNE Recheck Ask

If ARGUS accepts visible frontend changes, ARIADNE should check the public
`/developer-spaces/station-replay-dev-alpha` page as a human visitor:

- Does it read like a serious Developer Page prototype rather than a generic
  dashboard?
- Are methodology/finding/field-log documents visible and understandable?
- Are private boundaries still obvious?
- Does it avoid claiming Tier 2 hosted infrastructure or DexOS-specific widgets
  are live?

## ARGUS Review Result

ARGUS accepts PR40 for MIMIR closeout, 2026-06-18.

- Public reads remain bounded to `link_visibility = public` links whose
  documents are both `published` and `public`; owner reads can still include
  owner-only draft links.
- DAEDALUS's API tests cover anonymous detail/SSE reads, public methodology/
  finding/field-log evidence, owner-only draft hiding, and owner visibility.
- ARGUS patched replay seed source refs from object payloads to stable public
  strings (`document:<role>:<slug>`) so event/snapshot refs stay compatible with
  the existing `sourceRefs: string[]` API contract.
- ARGUS also tightened Developer Space copy so owner-only linked drafts are not
  counted as public evidence in owner view.
- Seeded evidence remains synthetic, public-safe, and explicitly
  non-production.
- No route/table rename, Project abstraction, Tier 2 hosted runtime, Coolify/
  container/database provisioning, Redis/queue pipeline, developer agent,
  chat-native tool execution, DexOS-specific widgets, tipping, public
  interaction layer, Tier 3, or Cloudflare lane was added.

Validation passed or reproduced the known local caveat:

```bash
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run test:developer-space-client
npm exec --yes pnpm@10.32.1 -- run replay:seed:validate
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

The web build compiled, linted/type-checked, and generated 30 pages before
reproducing the known Windows Next standalone symlink `EPERM` failure. ARIADNE
should recheck `/developer-spaces/station-replay-dev-alpha` after deploy/seed.
