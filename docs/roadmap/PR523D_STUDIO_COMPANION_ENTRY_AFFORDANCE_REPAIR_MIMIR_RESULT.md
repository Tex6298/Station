# PR523D - Studio Companion Entry Affordance Repair Result

Owner chain: MIMIR / A1 -> DAEDALUS / A2 (stalled) -> MIMIR / A1 -> ARGUS / A3

Date completed: 2026-07-13

Status:

```text
READY_FOR_ARGUS_REVIEW
```

## Result

MIMIR completed the narrow repair after DAEDALUS consumed the implementation
wakeup but returned neither a result nor a blocker.

The signed-in Studio dashboard now gives owners with at least one persona an
explicit first-viewport `Open Companion` action. It uses the existing
`studioNewChatHref` resolver, so the action reaches the current owner-private
companion route in a safe new-chat state rather than introducing another route
contract.

Zero-persona owners continue to see `New Persona` as the primary action. The
dashboard remains addressable and does not auto-redirect. Existing onboarding,
public Space, persona-list, Memory, Integrity, archive, and publishing routes
remain unchanged.

## Files

- `apps/web/components/studio/studio-dashboard.tsx`
- `apps/web/components/studio/studio-dashboard.test.ts`
- `apps/web/app/globals.css`

## Validation

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/studio/studio-dashboard.test.ts
PASS - 3 tests

npm exec --yes pnpm@10.32.1 -- run test:studio-ui
PASS - 245 tests

npm exec --yes pnpm@10.32.1 -- run typecheck
PASS - 2 tasks
```

The focused source test covers persona-present and zero-persona action states,
use of the accepted route resolver, and absence of a dashboard auto-redirect.
Responsive CSS keeps the header action row bounded and left-aligned at the
existing mobile breakpoint.

## Scope Check

No API, schema, auth, provider, retrieval, storage, billing, Redis, Cloudflare,
queue, worker, public-route, global-reskin, package, or lockfile change is in
this result.

## Review Request

ARGUS should review:

- zero-, one-, and multi-persona route behavior;
- use of the existing companion/new-chat resolver;
- absence of automatic `/studio` redirection;
- desktop/mobile header fit and accessible link behavior;
- focused coverage and forbidden-scope drift.

If accepted, ARGUS should wake ARIADNE for a hosted `/studio` human rehearsal
that proves the product owner can see and use `Open Companion` in the normal
first viewport.
