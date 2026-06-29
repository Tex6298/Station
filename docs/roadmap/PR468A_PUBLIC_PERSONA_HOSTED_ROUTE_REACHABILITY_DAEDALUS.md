# PR468A - Public Persona Hosted Route Reachability Patch

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-29

## Source

ARIADNE ran the PR468 hosted rehearsal and returned:

`docs/roadmap/PR468_ANONYMOUS_PUBLIC_PERSONA_CHAT_REHEARSAL_RESULT.md`

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

Hosted web/API health were fresh at PR468 product commit `00e618eb`, but the
public persona page/API routes timed out before the anonymous chat boundary
could be tested.

## Goal

Repair hosted public persona route reachability for PR468, then wake ARGUS for
review. Keep this as a narrow PR468 fix, not a new feature lane.

The route must return bounded public persona data or a bounded error instead of
hanging:

```text
GET /personas/public/station-replay-alpha-persona
GET /personas/public/station-replay-alpha-persona/context-preview
GET /personas/public/station-replay-alpha-persona/events
GET /personas/public/roulette
```

The web page must also avoid blocking indefinitely behind optional context
preview or public update reads:

```text
/personas/station-replay-alpha-persona
```

## Scope

Allowed:

- inspect and patch the public persona read/eligibility/source-loading path;
- make the web public persona page render bounded readback and chat availability
  even if optional context preview or public updates fail;
- add focused tests around the route/readback failure mode;
- add safe bounded error copy where hosted data is unavailable.

Not allowed:

- broad anonymous public persona rollout;
- new billing, Stripe, Redis, Cloudflare, provider, queue, worker, migration, or
  model-selection work;
- durable anonymous visitor transcript or identity storage;
- private Memory, Archive, Canon, Continuity, Integrity, owner setup, provider
  config, private documents, raw source bodies, credentials, or route-only ids
  entering public responses;
- changing public reporting to signed-out.

## Investigation Hints

The failing hosted routes all pass through the public persona route stack in
`apps/api/src/routes/personas.ts`.

Start with:

- `loadEligiblePublicPersonaBySlug`;
- `loadPublicPersonaRouletteRows`;
- `ownerCanExposeExistingPublicPersonas`;
- public context source builders used by `/context-preview` and chat;
- the page-level `Promise.all` in
  `apps/web/app/personas/[publicSlug]/page.tsx`, which currently lets required
  and optional reads block the same loading state.

The accepted product behavior is not "show nothing if optional readback is
slow." The page should be able to show the public persona and public chat state
from the primary readback while context preview/events degrade with bounded
copy.

## Acceptance Gates

- Direct public readback for `station-replay-alpha-persona` returns a bounded
  success or bounded error; it does not hang.
- Context preview, events, and roulette return bounded success or bounded error;
  they do not hang.
- The hosted page can render enough public persona state to expose the PR468
  anonymous alpha form when the primary readback succeeds.
- Optional context/update failures do not prevent the page from reaching a
  usable state.
- Existing PR468 safety behavior remains unchanged:
  - anonymous chat only for `station-replay-alpha-persona`;
  - other public personas remain signed-in-only or disabled;
  - owner disable remains rollback;
  - no durable anonymous transcript/identity;
  - public-source-only prompt/response boundary;
  - signed-in-only reporting;
  - owner-paid token usage.

## Required Validation

Run the focused suite that proves the route and PR468 safety boundary:

```bash
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/public-persona-route.test.ts
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If you can run a safe hosted smoke without secrets in output, also check:

```text
https://stationapi-production.up.railway.app/health/deployment
https://stationapi-production.up.railway.app/personas/public/station-replay-alpha-persona
https://stationweb-production.up.railway.app/personas/station-replay-alpha-persona
```

Do not print cookies, bearer tokens, raw private ids, prompts, provider payloads,
private source bodies, stack traces, or secret-looking material.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS patched PR468A public persona hosted route reachability.
Risk:
- Public persona readback must be bounded without weakening PR468 privacy and
  anonymous-chat limits.
Task:
- Review code and tests, then wake MIMIR with accept/fix verdict.
```

