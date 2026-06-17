# PR22 - Station Assistant Operations

Date: 2026-06-17
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS implementation, ARGUS review, ARIADNE human rehearsal after
review because `/studio/assistant` is a visible launch-core surface.

## Why This Lane Is Next

PR10 through PR21 made the launch-core surfaces more real: publishing reads and
queue state, private archive search, durable imports, external parsers, import
candidate review, quotas, Reddit/Discord intake, and the owner-facing Import
Review Inbox.

The Station Assistant exists, but it is still mostly a summary and generic
guidance surface. The launch-core definition of sufficient says a test user
should be able to use Station Assistant to understand and operate the core flow.
After PR21, that means Assistant should route a signed-in owner to the exact
next operational stop without pretending to be a persona or making unsafe
automatic changes.

## Goal

Make `/studio/assistant` a trustworthy operational map over the current
launch-core system:

> Station Assistant can inspect owner-safe status, explain what needs attention,
> and offer live, exact actions for archive/import review, private search,
> Memory/Canon candidate review, publishing, integrity, export readiness, and
> quota/config issues.

This is not an autonomous agent lane. It is a safer operator surface over
existing owner-scoped APIs and routes.

## Current Baseline

- `/assistant/summary` returns owner-scoped counts and recent rows.
- `/assistant/message` classifies broad intents and returns generic text/actions.
- `/studio/assistant` displays counts, starter prompts, a text box, and action
  links.
- Assistant has no persona Canon/Memory and must stay that way.
- PR21 now gives a first-class Import Review Inbox at
  `/studio/personas/:personaId/files`.
- PR12 gives owner-scoped archive search at `/studio/archive`.
- Persona export bundles and publishing approval readbacks already exist.

## Scope

Assistant API/service behavior:

- Extend the Assistant summary/reply model with typed operational action cards.
- Cards should include stable fields such as `id`, `kind`, `label`, `detail`,
  `href`, `priority`, and optional safe counts/status.
- Generate exact links where possible:
  - pending import-backed Memory/Canon candidates -> persona Archive page;
  - failed or processing imports -> persona Archive page or global Archive;
  - private archive search -> `/studio/archive` with query/filter context where
    useful;
  - draft or queued publishing work -> `/studio/publishing` or
    `/studio/publish`;
  - integrity gaps -> persona calibration/integrity route;
  - export readiness -> persona Archive/export status or `/studio/export`;
  - quota/config issues -> the existing relevant Studio/settings/billing route.
- Preserve owner scoping for every source table read.
- Cap all snippets/source labels/error summaries. Do not return raw archive
  bodies, full transcripts, storage paths, tokens, provider keys, or private
  source dumps.
- Assistant replies must keep the existing posture:
  `operational_helper_not_persona`.
- If an action is only a future/deferred capability, label it as deferred or do
  not show it as a live action.

Web behavior:

- Update `/studio/assistant` so action cards are clearly actionable and all
  visible buttons/links do something real.
- Preserve dense Studio/workbench styling and mobile usability.
- Show why each priority action appears, in product language a human can trust.
- Keep starter prompts, but make their answers surface the same action cards
  instead of generic advice.
- Empty states should answer:
  - what is safe right now;
  - what should be added or reviewed next;
  - who can see it.

## Out Of Scope

- Autonomous tool execution or multi-step agent planning.
- Adding an LLM provider requirement.
- Writing directly to persona Memory or Canon from Assistant.
- Publishing, exporting, starting an Integrity Session, or mutating candidates
  automatically from Assistant without an explicit existing route/action.
- Redis memory truth, Cloudflare retrieval, vector reindexing, workers, live
  Reddit/Discord pulls, billing redesign, social posting, or UI reskin.

## Required Tests

- Owner summary includes exact action cards for:
  - pending import candidates;
  - failed imports;
  - drafts/publishing queue work;
  - missing export backup;
  - missing integrity work where the fixture supports it.
- Other owners do not see another user's action cards or row identifiers.
- Assistant responses do not include raw private transcript/archive content,
  storage paths, provider keys, or secret-shaped strings.
- Intent replies reuse the same typed actions and preserve
  `operational_helper_not_persona` guardrails.
- `/studio/assistant` helper tests cover action-card rendering, disabled/deferred
  copy if present, and mobile-safe wrapping.

## Validation

Minimum local gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:assistant
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:exports
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add publishing or integrity tests if implementation touches those services
instead of only reading their state.

## Handoff To ARGUS

Wake A3 / ARGUS with:

- exact Assistant API/service response-shape changes;
- searched/read source tables and cap policy;
- owner/non-owner proof;
- raw-private-data leak checks;
- UI files changed;
- validation commands and results;
- deferred capabilities that are intentionally not live.

ARGUS should review owner scoping, private text leakage, fake action controls,
unsafe mutation implications, and any accidental Assistant-as-persona drift.

If ARGUS accepts, wake ARIADNE for desktop and 375px `/studio/assistant`
human-eye rehearsal.
