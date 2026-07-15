# PR527B - Space Entitlement And Visibility Boundary Preflight Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-15

Status:

```text
ACCEPT_PR527B_SPACE_ENTITLEMENT_VISIBILITY_BOUNDARIES
```

## Verdict

ARGUS accepts PR527B as a bounded truth and safety repair for `/space/new`.
The live builder must remain closed until fresh owner-safe reads prove the
current account passes the same tier-first, count-second boundary enforced by
the create route. An entitled owner starts Private and must explicitly select
Public. Omitted API visibility also creates Private.

This verdict accepts only the implementation boundary. It does not claim that
the repair exists, that the replay owner can create a Space, that a hosted
Space lifecycle has passed, or that J07 is complete.

## Boundary Answers

| Question | ARGUS ruling |
| --- | --- |
| Preflight source | Existing reads are sufficient. Restore the current session with `getSession()`, then read `GET /billing/me` and owner-scoped `GET /spaces`. Do not add an entitlement endpoint or trust browser-cached tier/count data. |
| Fail-closed behavior | Loading, malformed or conflicting responses, read failure, below-Creator tier, and exhausted count all keep the form and Create command absent. A missing session follows the existing signed-out redirect. |
| Server-equivalent order | Apply the Creator tier check first. Admin does not bypass `requireTier("creator")`; only an admin who first passes that tier gate bypasses the count limit through `canCreateSpace`. For non-admin owners, a negative limit is unlimited and every other limit requires `count < limit`. |
| Visibility defaults | Private is an affirmative default, not an unset state. The web control presents Private first and selected, with group/pressed semantics. The API create schema maps omitted `isPublic` to `false`; explicit `true` and `false` remain honored. |
| Update safety | Changing the create default must not make an omitted visibility field on PATCH change an existing Space. A route test must prove omission preserves current visibility. |
| Stale race | Any create `403` closes the live form, preserves React form values, performs the same fresh read preflight, and never retries POST automatically. Only a newly allowed state and a new explicit owner submit may send another create request. |
| Safe destinations | Billing (`/billing`) and My Spaces (`/space`) are the only no-entitlement destinations. An unverifiable preflight offers Retry and My Spaces, not Billing as if plan truth were known. No direct checkout or provider link enters this lane. |
| Presentation | Unavailable/loading/error states are unframed constrained content. The entitled builder may remain a framed tool. New page chrome and controls use semantic theme variables under a `/space/new`-specific wrapper; shared builder selectors and the manage route remain unchanged. |
| Proof claim | Local synthetic proof may cover entitled and race behavior without a real write. Hosted replay-owner proof is negative and no-write. Positive hosted create/edit/public/cleanup proof requires a separate disposable entitled fixture and cleanup. |

## Locked Preflight Contract

The page derives access from fresh server reads in this order:

1. Call `getSession()` so the stored token is restored against `/auth/me`.
2. If no session is restored, redirect through the existing login return path
   for `/space/new`; render no builder.
3. In parallel, call the existing billing-status helper and owner-scoped
   `GET /spaces` with the restored token.
4. Validate the response shapes, recognized tier, numeric Space limit, owner
   list, and agreement between restored-session and billing tiers. Missing,
   malformed, or conflicting truth is a recoverable failure, never permission.
5. Apply the Creator tier gate before count policy. A qualifying admin bypasses
   count only after passing that tier gate. A non-admin with a negative limit
   is unlimited; otherwise access requires current owner count below the
   verified limit.

No localStorage value, stale session profile, URL input, form input, optimistic
state, or client-authored tier/limit/count may grant access.

## Locked Visible States

Loading renders no form or Create command:

```text
Checking Space access
Station is confirming your currently verified tier and owner Space count
before opening the builder.
```

Below-Creator access renders:

```text
Creator tier required
Space creation is not available for this account at its currently verified
tier. No Space was created. Review plan details or return to your existing
Spaces.
```

The only commands are:

```text
Review plan details -> /billing
View My Spaces      -> /space
```

An exhausted limit renders:

```text
Space limit reached
Your currently verified plan allows {limitLabel}, and you already have
{countLabel}. No Space was created. Manage an existing Space or review plan
details before trying again.
```

It has the same two commands. Labels must use the verified values and handle
singular/plural accurately.

An unverifiable preflight renders:

```text
Could not check Space access
Station could not confirm your currently verified tier and owner Space count.
Retry before opening the builder. No Space was created.
```

Its only commands are:

```text
Retry access check
View My Spaces -> /space
```

The allowed builder opens with:

```text
Owner Space
Create a Space
Create privately by default, then choose when this Space is ready for public
readback.
```

Private is first, selected, and submitted unless the owner explicitly selects
Public. The visibility explanations are:

```text
Private keeps this Space out of public readback after creation. Review it
before choosing to make it public.

Public makes this Space and its published pages readable outside your private
owner workspace as soon as creation succeeds.
```

The miniature preview must be visibility-aware and must not describe a
Private selection as a public surface.

## Locked Stale-Preflight Behavior

A create `403` is handled as a bounded authorization/count race, regardless of
the response body's wording. The page must not echo arbitrary response fields.
It displays:

```text
Space creation was not allowed. Your entries are still here while Station
checks your currently verified tier and Space count again.
```

The form and Create command become unavailable immediately while the page runs
the same fresh preflight. Form values remain in React state. A below-tier or
at-limit result moves to the corresponding locked state; a read failure moves
to the retry state. If access remains allowed, the form may reopen with the
retained values and bounded error copy, but another POST requires a new owner
submit. The original request is never replayed automatically.

The submit handler must require both an allowed gate and a non-submitting
state. Server `requireTier("creator")` and `canCreateSpace` checks remain the
authority. No failed, timed-out, or response-unknown create is retried
automatically, and no pages may be inserted when the Space insert did not
succeed.

## API Contract

The create schema defaults omitted `isPublic` to `false`. The route continues
to honor explicit `true` and `false`, runs the existing tier guard before the
count check, and inserts pages only after successful Space creation. Existing
owner scoping, slug checks, response shape, update behavior, and database
schema remain unchanged.

Tests must prove:

- omitted create visibility inserts `false`;
- explicit `true` and `false` are preserved;
- PATCH omission does not alter existing visibility;
- below-tier denial inserts neither a Space nor pages;
- at-limit denial inserts neither a Space nor pages;
- an admin below Creator remains denied by the route guard;
- an admin at Creator or above may pass count policy;
- non-admin unlimited and finite-limit rules match current permission logic.

## Exact Implementation Boundary

DAEDALUS may change only:

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

Additional locks:

- no API-client, auth, billing, middleware, tier-config, permissions, database,
  schema, migration, Space manage/detail/public route, or shared component file
  changes;
- no new endpoint, dependency, lockfile change, hosted-runtime work, queue,
  partner adapter, checkout flow, tier/price/quota-policy change, or schema
  cleanup;
- `package.json` may change only to include the focused web helper test in
  `test:spaces`;
- `globals.css` may receive only route-scoped `.space-create-*` or
  `.space-create-page ...` additions using existing semantic theme variables;
  do not edit shared `.space-builder-*` rules or restyle Space management;
- deliberate theme colors inside theme swatches and the miniature product
  preview may remain, but page chrome, text, fields, controls, focus, errors,
  and unavailable states must adapt to System, Light, and Dark;
- no viewport-scaled font size, gradient, floating status card, unrelated
  selector, debug output, response-body echo, or secret-bearing evidence;
- no Cloudflare, Railway, Supabase, billing-provider, Discern, action-runner,
  public-discovery, deletion, cleanup, or broader J07 implementation.

## Required Local Proof

The focused entitlement helper test must cover recognized and malformed
responses, tier mismatch, Creator threshold, finite count boundaries, negative
unlimited count, admin guard order, exact state derivation, labels, and bounded
copy. It must not reproduce a second permission policy that can silently drift
from the server contract.

DAEDALUS and ARGUS must run:

```text
npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/space-create-entitlement.test.ts
npx --yes pnpm@10.32.1 test:spaces
npx --yes pnpm@10.32.1 test:billing
npx --yes pnpm@10.32.1 test:auth
npx --yes pnpm@10.32.1 test:studio-ui
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/api typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
git diff --check
```

Independent local browser proof must include:

- signed-out redirect with no builder disclosure;
- delayed loading with no form or Create command;
- failed preflight and successful Retry;
- below-tier and at-limit states with exact destinations;
- entitled Creator/count-zero form with Private selected, explicit Public
  selection, and intercepted payloads proving `false` then `true`;
- stale `403` with retained entries, a fresh read, no automatic second POST,
  and no orphan write;
- System, Light, and Dark at `1440x900`, `390x844`, and `375x812` for both a
  no-entitlement replay and an entitled form, plus representative loading,
  failure, and race states;
- keyboard/focus semantics, readable contrast, no clipping or horizontal
  overflow, no page errors, and no unclassified console errors.

All local POSTs must be intercepted synthetic requests. The proof may not
create a real Space or mutate a database. Review must compare changed paths
with the allow-list and scan for credentials, tokens, cookies, private owner
content, debug logs, arbitrary server-message disclosure, and forbidden scope.
No secret value may be printed or committed.

## Required Hosted Proof

After ARGUS accepts the implementation, ARIADNE must rehearse the exact
accepted SHA without mutation:

1. Confirm ready hosted web/API deployment identity at the accepted SHA.
2. Prove signed-out `/space/new` follows the existing login return path and
   exposes no private builder state.
3. As the replay owner, prove the honest Private-tier unavailable state, exact
   two destinations, and absence of form/Create controls.
4. Follow Billing and My Spaces and verify they are real owner-safe routes.
5. Exercise System, Light, and Dark at `1440x900`, `390x844`, and `375x812`
   with no fixed-dark residue, overlap, clipping, horizontal overflow, focus
   failure, page error, or unclassified console error.
6. Assert that the rehearsal sends no `POST /spaces`, performs no product/data
   write, creates no Space, and needs no cleanup.

This negative hosted proof may show only that the replay owner is truthfully
unavailable. It must not claim that entitled creation, edit, public readback,
or cleanup works. Positive hosted J07 proof requires a separately authorized
disposable entitled fixture and verified cleanup.

After accepted implementation and negative hosted proof, J07 should be
recorded as `BLOCKED_HOSTED_DEPENDENCY`, not `TRUTHFULLY_UNAVAILABLE`: Space
creation is a supported higher-tier capability, while its full disposable
lifecycle remains unproved.

## Preflight Verification

| Check | Result | Notes |
| --- | --- | --- |
| Wake and changed-path review | Pass | Opening wake `df5774fd` and retry wake `70959218` were consumed as committed requests for this exact preflight; no product implementation was handed to ARGUS. |
| Current web source audit | Pass as defect evidence | `/space/new` renders the full builder before entitlement reads, initializes `isPublic: true`, and exposes a live Create command. |
| Current API source audit | Pass as defect evidence | POST retains tier-first and count checks, but omitted create visibility defaults Public. Zod partial parsing was checked separately: changing the create default does not by itself apply that default to an omitted PATCH field. |
| Existing-read audit | Pass | Restored current-user, billing-status, and owner-scoped Space reads contain enough information for a fail-closed preflight; no new endpoint is justified. |
| Current Space route tests | Pass, `2/2` | Establishes the inherited API baseline, not acceptance of the current Public default. |
| Current billing tests | Pass, `16/16` | Establishes the existing billing read contract before implementation. |
| Implementation work | None | ARGUS changed roadmap/testing documentation and its watcher receipt only. |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the PR527B Space entitlement and visibility preflight.
Verdict:
- ACCEPT_PR527B_SPACE_ENTITLEMENT_VISIBILITY_BOUNDARIES
Task:
- Wake DAEDALUS with the exact implementation allow-list and gates recorded in the ARGUS result.
- Keep the wider PR527 correction programme moving.
```
