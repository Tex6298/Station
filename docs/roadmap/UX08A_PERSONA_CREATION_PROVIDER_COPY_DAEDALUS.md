# UX-08A Persona Creation Provider Copy

Owner: DAEDALUS
Reviewer: ARGUS, then ARIADNE if ARGUS accepts the technical boundary
Status: OPEN - WAKE DAEDALUS
Opened: 2026-06-27

## Why This Opens

DAEDALUS completed UX-08 Onboarding And Station Assistant Feasibility in
`docs/roadmap/UX08_ONBOARDING_ASSISTANT_FEASIBILITY_RESULT.md`.

MIMIR accepts the feasibility result: current `main` should not rebuild
onboarding or Station Assistant before staging. PR25, PR73, PR348, PR349,
PR350, PR399, PR403, and PR404 remain valid current-main evidence.

The only confirmed visible UX-08 drift is narrow:
`apps/web/components/studio/awakening-flow.tsx` says BYOK provider keys are
configured in Settings after persona creation, but Settings does not currently
expose provider-key setup. Fix the copy so the flow does not point users at a
nonexistent Settings setup path.

## Product Question

Can a user creating a persona understand the current provider/channel choice
without being told to complete provider setup in a Settings surface that does
not exist yet?

## Allowed Scope

- `apps/web/components/studio/awakening-flow.tsx`
- a tiny helper or focused test only if it makes provider/channel copy easier
  to review
- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/testing/VALIDATION_BASELINE.md`

## Hard Boundaries

Do not change:

- provider routing, model calls, BYOK credential storage, provider settings,
  API key handling, runtime selection, or AI package behavior;
- auth/session behavior;
- persona creation redirects for Fresh Start, Awakening, or Document Migrator;
- archive import/parser behavior, live connector OAuth/API pulls, recurring
  imports, uploads, or candidate mutation;
- Developer Space ingestion, Space creation, publishing, publish/retract, or
  Station Assistant execution;
- schema, migrations, billing, Stripe, token credits, storage quota, Redis,
  Cloudflare, Railway, Supabase, workers, queues, package files, or deploy
  behavior;
- broad onboarding wizard/progress-state work or visual redesign.

## Implementation Guidance

- Keep the current provider/channel selection behavior intact.
- Remove or replace copy that implies Settings can already store BYOK provider
  keys.
- It is acceptable to say platform channel works now and BYOK/provider-key
  setup will be handled separately when that setup surface exists.
- Keep copy plain and calm. Do not promise automatic provider setup, model
  marketplace routing, live key testing, or future delivery timing.

## ARGUS Gates

- Provider/channel copy no longer sends the user to unavailable Settings setup.
- Fresh Start, Awakening, and Document Migrator redirects remain unchanged.
- No provider runtime, auth/session, import, Developer Space, publishing,
  Assistant backend, schema, billing, config, deploy, or package behavior
  changes.
- Validation includes `test:studio-ui`, web typecheck or root typecheck, lint,
  `git diff --check`, and added-line sensitive-pattern scan.

## ARIADNE Rehearsal Points

If ARGUS accepts the technical boundary, ARIADNE should rehearse:

- `/studio/new?path=fresh-start`
- `/studio/new?path=awakening`
- `/studio/new?path=document-migrator`
- desktop plus 390px or 375px mobile

Check that:

- channel/provider copy does not mention nonexistent Settings key setup;
- the current platform channel still reads as immediately usable;
- BYOK/provider channels read as unavailable or separately configured without
  promising a working Settings path;
- Document Migrator still lands on persona files after creation in any mocked
  non-hosted rehearsal.

Do not create real hosted personas unless MIMIR explicitly authorizes a
mutation packet.

## Validation For DAEDALUS

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

Also run an added-line sensitive-pattern scan before committing.

## Wakeup Contract

When complete, DAEDALUS should commit with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented UX-08A Persona Creation Provider Copy.
- Persona creation no longer points users to nonexistent Settings provider-key setup.
- Provider/runtime, auth/session, persona redirects, imports, Developer Spaces,
  publishing, Assistant execution, schema, billing, config, deploy, and package
  behavior were not changed.
Task:
- Review copy, route/redirect boundary, and validation. If accepted, wake
  ARIADNE for desktop/mobile persona creation rehearsal.
```
