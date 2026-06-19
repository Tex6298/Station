# PR73 - Onboarding And Assistant Depth

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: DAEDALUS first, ARGUS reviews. ARIADNE rehearses only if visible route
flow changes.
Status: accepted by ARGUS; ready for ARIADNE rehearsal

## Why This Lane

PR72 proved the current Railway runtime for a prepared replay owner and public
visitor. No code repair lane is open from config, Redis, Stripe, providers,
runtime, public story, or the prepared-owner core loop.

The remaining product gap is first-entry depth. PR25 made the four documented
onboarding paths alpha-routeable:

- Fresh Start;
- Awakening;
- Document Migrator;
- API Bridge.

The roadmap still says these are alpha route targets, not mature onboarding
wizards/import/API Bridge products. `STATION_UI_UX_ROADMAP.md` also names
UX-08, Onboarding and Station Assistant, and says DAEDALUS should first identify
which onboarding surfaces exist and which require new routes or state.

PR73 is that bounded next step.

## Goal

Make the first-entry path feel more like a guided Station product without
opening a broad redesign.

A new or returning signed-in user should understand:

- which entry path to choose;
- what the first concrete action is;
- where Station Assistant can help operationally;
- what is private by default;
- what is alpha-live versus deferred;
- how to move from path choice into Memory, Continuity, Archive, Integrity, or
  Developer Space without fake controls.

## Scope

DAEDALUS should inspect the current code before choosing the smallest useful
slice:

- `/signup`;
- `/studio/onboarding`;
- `/studio/new?path=fresh-start`;
- `/studio/new?path=awakening`;
- `/studio/new?path=document-migrator`;
- `/studio/assistant`;
- Studio dashboard and navigation entry points;
- `apps/web/lib/onboarding-paths.ts`;
- Station Assistant action-card helpers/tests.

Then choose exactly one path:

1. **Small implementation path** if the surface is obvious:
   - improve first-entry/onboarding readback and Assistant handoff using
     existing routes and state;
   - make each path's first concrete action clearer;
   - add Station Assistant operational links for onboarding/import/Integrity
     where existing Assistant route boundaries already support them;
   - remove, disable, or clarify any live-looking control that is still only
     preview;
   - add focused helper tests.
2. **Feasibility-only path** if new routes/state are required:
   - document the exact route/state/API gap;
   - recommend the next bounded implementation lane;
   - do not half-build a wizard.

## Guardrails

- No new auth/session semantics.
- No new provider/model routing, Gemini chat, BYOK secret storage, hosted model
  runtime, or provider marketplace.
- No Stripe/billing expansion.
- No Redis/Upstash memory truth, BullMQ worker claim, or queue architecture.
- No Cloudflare retrieval, Vectorize, parser/OAuth, social posting, recurring
  imports, Project/DexOS, or hosted runtime work.
- No broad UI reskin.
- No fake controls.
- No claims that Station proves consciousness, transfers a persona, performs
  therapy/diagnosis, or automatically canonizes source material.
- Keep private archive, Memory, Canon, Continuity, import, Assistant, and
  Developer Space owner surfaces owner-scoped.

## Acceptance

ARGUS can accept PR73 if:

- the path is either a narrow implementation or a precise feasibility result;
- every changed user-facing control is wired, disabled, hidden, or honestly
  labelled;
- onboarding/Assistant wording is sympathetic but operational;
- signed-out users do not see private route cards or owner material;
- signed-in users can identify the first concrete step for each path;
- Station Assistant remains operational help, not a persona/autonomous agent;
- no config, provider, billing, Redis, Cloudflare, worker, parser/OAuth,
  Project/DexOS, or broad UI scope is introduced.

## Validation

Run the narrow gates for the path taken:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:assistant
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If the implementation touches archive/import/Integrity/Developer Space routes,
also run the relevant focused gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:storage
npm exec --yes pnpm@10.32.1 -- run test:integrity
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
```

## Handoff

Wake ARGUS with:

- implementation path or feasibility-only path;
- routes/components changed;
- exact first-entry behavior by path;
- Assistant behavior, if touched;
- controls clarified or removed;
- validation results;
- explicit non-scope confirmation.

If blocked, wake MIMIR with the smallest exact blocker and the recommended next
lane. Do not go silent.

## DAEDALUS Implementation

Implemented on 2026-06-19 as the small implementation path. No new routes,
backend state, API behavior, auth semantics, provider routing, billing,
Redis/Upstash memory, Cloudflare, worker, parser/OAuth, Project/DexOS, hosted
runtime, or broad UI work was added.

Changed surfaces:

- `/studio/onboarding`;
- `/studio/assistant`;
- `apps/web/lib/onboarding-paths.ts`;
- Station Assistant UI helper tests.

First-entry behavior by path:

- Fresh Start now says the first step is naming a private persona, with setup
  fields allowed to stay light. Its boundary copy says private Studio material
  stays private by default and publishing is a later owner action.
- Awakening now says the first step is filling context, boundaries, voice, and
  provider before review/create. Its copy keeps setup notes owner-scoped and
  avoids identity/proof claims.
- Document Migrator now distinguishes the no-persona setup state from the
  persona-ready state. Without a persona, the first step is creating the private
  persona. With a persona, the first step is opening the persona Archive tab,
  adding source material, and reviewing import status.
- API Bridge now points to the existing Developer Spaces route, with the first
  step framed as creating or choosing a Developer Space and then using the owner
  manage page for ingestion keys. It keeps raw owner evidence and keys
  owner-only.

Assistant behavior:

- Each onboarding path now has an `Ask Assistant` link to
  `/studio/assistant?prompt=...`.
- Station Assistant reads the bounded `prompt` query param and pre-fills the
  message box without auto-sending. The owner must still press `Ask Assistant`.
- The Assistant remains an operational helper, not a persona or autonomous
  executor.

Validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:assistant
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

## ARGUS Review

Accepted on 2026-06-19 as a narrow first-entry/onboarding implementation.

- ARGUS confirmed `/studio/onboarding` still keeps signed-out visitors on the
  sign-in/join panel instead of showing private path cards or owner material.
- Each signed-in onboarding card now exposes a concrete first step, a private
  boundary, a real route, and a bounded `Ask Assistant` handoff.
- `/studio/assistant?prompt=...` pre-fills the message box from a bounded prompt
  query param but does not auto-send; the owner still has to press `Ask
  Assistant`.
- Station Assistant remains an operational helper, not a persona, autonomous
  executor, therapy/diagnosis surface, consciousness claim, or automatic
  canonization path.
- No new routes, backend state, API behavior, auth semantics, provider routing,
  Gemini chat, BYOK store, hosted runtime, Stripe expansion, Redis/Upstash
  memory truth, worker queue claim, Cloudflare retrieval, parser/OAuth,
  Project/DexOS, broad UI, or fake controls were added.

ARGUS validation:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:assistant
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/web build
git diff --check
```

The web build compiled, linted/typechecked, collected page data, and generated
31 static pages, then failed at the known Windows standalone traced-file symlink
`EPERM`. The only lint warnings were the pre-existing raw `<img>` warnings in
public Space and Discover.

ARIADNE should rehearse `/studio/onboarding` and `/studio/assistant?prompt=...`
as a signed owner on desktop and `390px` mobile before MIMIR closes PR73.
