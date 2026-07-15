# PR527B - Space Entitlement And Visibility Boundary Preflight

Owner: MIMIR / A1 -> ARGUS / A3 -> MIMIR / A1

Date opened: 2026-07-15

Status:

```text
OPEN_PR527B_SPACE_ENTITLEMENT_VISIBILITY_BOUNDARY_PREFLIGHT
```

## Why This Is Next

ARIADNE's PR527 hosted inventory found that `/space/new` presents the complete
Space builder and a live `Create Space` command to an owner whose plan permits
zero Spaces. The route reveals the Creator-tier block only after the owner
completes and submits the form. It also selects Public before the owner has
made a visibility choice.

That is a product-truth and structural-visibility failure. PR527B is the next
ranked bounded correction after PR527A.

Authoritative evidence:

- `docs/roadmap/PR527_UI_PRODUCT_COMPLETENESS_HOSTED_JOURNEY_INVENTORY_ARIADNE_RESULT.md`
- `apps/web/app/space/new/page.tsx`
- `apps/api/src/routes/spaces.ts`
- `packages/auth/src/permissions.ts`
- `packages/config/src/tiers.ts`

## Current Code Truth

1. The web form initializes `isPublic: true` and renders before it loads an
   owner entitlement or current Space count.
2. The API create schema also defaults omitted `isPublic` to `true`.
3. `POST /spaces` correctly keeps `requireTier("creator")` and
   `canCreateSpace(...)` as authoritative server-side checks.
4. Existing owner-safe reads already expose the required preflight inputs:
   the restored authenticated user/current plan and `GET /spaces` owner count.
   `GET /billing/me` also exposes current limits without requiring a new
   entitlement schema.
5. The replay owner is currently Private tier with a zero-Space limit. Hosted
   proof can safely exercise the unavailable path without creating a record.

## Proposed Bounded Repair

PR527B should repair truth before adding any new Space capability.

1. Resolve the current authenticated owner, current tier/Space limit, and
   owner Space count before presenting the builder as live.
2. During preflight loading, render a stable loading state with no editable
   form and no `Create Space` command.
3. If the current tier has no Space entitlement or the current count has
   reached its limit, render a truthful unavailable state instead of the live
   builder. Distinguish `Creator tier required` from `Space limit reached`.
4. The unavailable state may link only to real destinations: Billing for plan
   details and My Spaces for existing owner Spaces.
5. If preflight itself fails, show a recoverable retry state. Do not guess that
   creation is available and do not expose a live submit command.
6. When entitled, initialize Space visibility as Private. Public must result
   from an explicit owner selection and its nearby copy must say that the
   Space becomes readable outside the private owner workspace.
7. Change the API create default for an omitted `isPublic` field to Private as
   defense in depth. Explicit `isPublic: true` remains supported.
8. Retain the existing authoritative server tier and count checks. A race or
   stale preflight that returns `403` must keep entered values, show the exact
   bounded error, refresh entitlement state, and prevent repeated blind
   submission when creation is no longer allowed.
9. Do not claim that the whole J07 create/edit/public/cleanup journey passes.
   This slice makes the entry boundary truthful; an entitled disposable
   lifecycle and cleanup proof remain separately required.

## Locked Boundaries

- No tier, price, Stripe, checkout, subscription, quota, or billing-policy
  change.
- No Space schema/table migration, deletion contract, cleanup invention,
  default-page redesign, document publishing change, or public-read change.
- No broad Space, Discover, Studio, navigation, onboarding, or visual reskin.
- No new entitlement endpoint unless ARGUS demonstrates that the existing
  current-user, billing-status, and owner-Space reads cannot produce a safe
  preflight. Prefer a small web helper over duplicating tier arithmetic in the
  route component.
- No removal or weakening of `requireTier("creator")`, `canCreateSpace`, slug
  uniqueness, owner scope, or API validation.
- No localStorage/session cache used as entitlement truth.
- No Discern component, global CSS, action runner, or source-product
  assumption imported.
- No automatic publication, inferred consent, or public default at either web
  or API boundary.

## Proposed Implementation Allow-List

If ARGUS accepts, DAEDALUS should receive a final allow-list based on:

```text
apps/web/app/space/new/page.tsx
apps/web/lib/space-create-entitlement.ts
apps/web/lib/space-create-entitlement.test.ts
apps/api/src/routes/spaces.ts
apps/api/src/routes/spaces.test.ts
apps/web/app/globals.css
package.json
docs/roadmap/PR527B_SPACE_ENTITLEMENT_VISIBILITY_REPAIR_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

ARGUS may remove unnecessary files or permit one focused component/test file.
Any addition must be named and justified in the result. Existing Space manage,
public detail, document, billing, auth, middleware, and schema files remain
frozen.

## ARGUS Questions

1. Are the current authenticated user, `GET /billing/me`, and owner-only
   `GET /spaces` sufficient to preflight tier and count without a new API?
2. Should the accepted entitled form default Private, or should visibility be
   unset until an explicit choice? MIMIR recommends Private because it is safe,
   reversible, and consistent with the current J02/Projects posture.
3. Must the API omitted-field default change from Public to Private to make the
   structural boundary real for non-web callers?
4. What exact copy distinguishes no tier entitlement, quota reached, preflight
   failure, and a server-side race without exposing internal policy details?
5. Are Billing and My Spaces the only real unavailable-state destinations?
6. How should admin/unlimited limits and stale session tier be handled without
   making browser state authoritative?
7. What exact local positive-path fixture and hosted replay-owner negative path
   prove the boundary before this route leaves `FAIL_PRODUCT`?
8. After the repair passes, should J07 become
   `BLOCKED_HOSTED_DEPENDENCY` on an entitled disposable Space lifecycle rather
   than `TRUTHFULLY_UNAVAILABLE`, since Space creation is a supported product
   capability for higher tiers?

## Required Acceptance Gates

ARGUS should require at least:

- signed-out `/space/new` retains the existing auth redirect and renders no
  owner entitlement or builder state;
- preflight loading and failure states contain no editable builder and no live
  create command;
- below-tier and at-limit states are distinct, truthful, and route only to
  Billing and My Spaces;
- an entitled local fixture receives the complete form with Private selected,
  and Public appears only after explicit selection;
- omitted `isPublic` creates Private at the API boundary, while explicit true
  and false remain supported;
- the server tier/count checks remain authoritative and a simulated stale
  preflight `403` preserves entered values, refreshes gating, and does not
  create an orphan;
- no preflight read or denied submission mutates a Space, page, document,
  billing record, entitlement, or public feed;
- System, Light, and Dark at `1440x900`, `390x844`, and `375x812` have no fixed
  theme residue, clipped copy/actions, overlap, or horizontal overflow;
- focused web/API Space tests, the full Space API suite, relevant auth/UI
  suites, web/API typecheck, web lint, `git diff --check`, changed-path, scope,
  and secret scans pass;
- after hostile implementation review, ARIADNE proves the signed-out and
  replay-owner unavailable paths on the exact hosted SHA. A positive hosted
  creation claim requires a separately accepted entitled disposable fixture
  and cleanup contract.

## Required Result And Handoff

Create:

```text
docs/roadmap/PR527B_SPACE_ENTITLEMENT_VISIBILITY_BOUNDARY_PREFLIGHT_ARGUS_RESULT.md
```

Return exactly one verdict:

```text
ACCEPT_PR527B_SPACE_ENTITLEMENT_VISIBILITY_BOUNDARIES
BLOCK_PR527B_<EXACT_CONCRETE_BOUNDARY>
```

Commit the result and wake MIMIR. Do not implement the repair, alter plans or
prices, create a hosted Space, or go idle without a committed response.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the PR527B Space entitlement and visibility preflight.
Verdict:
- <accepted or exact blocker>
Task:
- If accepted, wake DAEDALUS with the exact implementation allow-list and gates.
- Keep the wider PR527 correction programme moving.
```
