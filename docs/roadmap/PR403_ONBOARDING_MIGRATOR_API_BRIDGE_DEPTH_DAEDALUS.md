# PR403 - Onboarding Migrator and API Bridge Depth

Date: 2026-06-27
Owner: DAEDALUS
Status: Open

## Wakeup

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARIADNE passed PR402; PR401 native authoring guidance is accepted.
- Memory/observability is closed through the PR381/PR383/PR384/PR385 hosted chain.
- The reconciled launch-core map still leaves mature onboarding, Document Migrator, and API Bridge product depth reopened.
Task:
- Implement the smallest safe onboarding depth slice for Document Migrator and API Bridge using existing routes/state, or return an exact narrower implementation packet if code is not safe.
- If code changes land, wake ARGUS. If map-only, wake MIMIR. Do not go idle without a wakeup commit.
Scope:
- No live connector OAuth/API, recurring imports, API-key secret handling, provider/model routing, Gemini/OpenAI/NVIDIA changes, Redis, Cloudflare, queues, workers, schema, migrations, billing, Stripe, auth/session, deployment behavior, broad UI reskin, or autonomous Assistant execution.
```

## Why This Is Next

PR73 made the four onboarding paths alpha-routeable:

- Fresh Start;
- Awakening;
- Document Migrator;
- API Bridge.

PR348/PR350 then confirmed UX-08 route/state mapping and the hosted Public
step. That is useful, but the current launch-core audit still says mature
onboarding wizards, Document Migrator, and API Bridge product depth are
reopened. The next slice should make those two less like labels and more like
real Station paths without pretending live connectors or secret management are
done.

This is not Phase 2D/2E Developer Agent work. Those protected-alpha /
production-readiness classifications are closed for their bounded scope.

## Current Evidence To Preserve

- `/studio/onboarding` is authenticated and routeable.
- Document Migrator already routes toward private persona/archive setup.
- API Bridge already routes toward Developer Spaces and owner manage surfaces.
- Assistant prompt prefill is bounded and does not auto-send.
- Signed-out users should see an auth boundary, not owner path cards.

## Implementation Target

Start by inspecting:

```text
apps/web/app/studio/onboarding/page.tsx
apps/web/lib/onboarding-paths.ts
apps/web/lib/onboarding-paths.test.ts
apps/web/components/studio/studio-dashboard.tsx
apps/web/components/studio/station-assistant-panel.tsx
apps/web/lib/station-assistant-ui.ts
```

Then implement the smallest safe slice that improves Document Migrator and API
Bridge first-action clarity.

Good shapes:

- route-aware next-action copy for Document Migrator that distinguishes:
  - no private persona yet;
  - persona exists but no archive/source activity yet;
  - owner should open the persona Archive/files or Import Review surface next.
- route-aware next-action copy for API Bridge that distinguishes:
  - no Developer Space yet;
  - Developer Space exists;
  - owner should open Developer Spaces or the owner manage surface next.
- visible copy that calls these alpha routes honest setup paths, not finished
  import/API products.
- route-only actions to existing owner surfaces.
- focused helper coverage in `apps/web/lib/onboarding-paths.test.ts` or a
  local helper test if you add one.

If a truly useful slice requires new backend state, new APIs, secret handling,
live external connectors, or imported-source processing changes, do not half
build it. Wake MIMIR with the exact missing data contract and the next
implementation packet.

## Acceptance

ARGUS can accept the implementation if:

- Document Migrator and API Bridge have clearer first actions than generic
  route labels.
- Every visible control is route-only, wired, disabled, hidden, or explicitly
  deferred.
- Copy does not imply live OAuth/API intake, recurring pulls, connector import,
  API credential creation, provider calls, or autonomous Assistant execution.
- Signed-out users still do not see owner path cards or private route targets.
- Existing Fresh Start, Awakening, Public step, and Assistant prompt-prefill
  behavior do not regress.
- Mobile layout remains readable with no document-level horizontal overflow.

## Suggested Validation

Use the narrowest checks justified by the patch:

```text
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:assistant
npm exec --yes pnpm@10.32.1 -- run test:auth
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
git diff --check
```

If Developer Space route helpers or API Bridge readback code changes, add:

```text
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
```

## Result Contract

Write:

```text
docs/roadmap/PR403_ONBOARDING_MIGRATOR_API_BRIDGE_DEPTH_RESULT.md
```

Include:

- exact implementation path or exact reason for map-only;
- current route/state evidence used;
- visible behavior by Document Migrator and API Bridge state;
- files changed;
- validation results;
- explicit non-scope confirmation.

If code changes land, wake ARGUS. If map-only, wake MIMIR with the exact next
packet.
