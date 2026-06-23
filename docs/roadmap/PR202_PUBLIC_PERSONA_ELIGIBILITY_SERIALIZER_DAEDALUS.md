# PR202 - Public Persona Eligibility, Serializer Split, And Owner Readback

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Reviewer: ARGUS after implementation
Status: complete

## Why This Lane

PR200 accepted UX-01A Studio workbench clarity. No DAEDALUS or ARGUS follow-up
is required there.

PR201 accepted the Phase 3 bridge sequence only after ARGUS corrected the first
implementation lane. The current repo can already expose `visibility: "public"`
personas through existing APIs, so public persona eligibility and serializer
safety cannot wait for a future public persona page or visitor chat lane.

This is the next lane because it closes an existing safety gap and creates the
minimum bridge substrate for later Phase 3 work.

## Scope

Implement P3-B1A:

```text
Public persona eligibility, serializer split, and owner readback
```

Required outcomes:

- Server-authoritative public-persona eligibility uses
  `TIER_LIMITS.publicPersonas`.
- `visitor` and `private` tier owners cannot create public personas or
  transition existing personas to public visibility.
- Creator/canon/institutional eligibility follows existing tier limits. Treat
  `-1` as unlimited. If finite public persona limits are added later, count
  existing public personas for that owner.
- `skipIntegrityPreflight` cannot bypass public-persona tier eligibility.
- Owner and public/non-owner persona serializers are split.
- Public/non-owner persona readback and public Space persona cards return only
  explicit public card/profile fields.
- Owner readback reports eligibility, blockers, and exact public fields without
  changing visibility.
- Persona report target context remains label/visibility-only with no public
  route hint until a real public persona route exists.

## Must Inspect First

- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/spaces.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/api/src/routes/spaces.test.ts`
- `apps/web/components/studio/awakening-flow.tsx`
- `apps/web/app/space/[slug]/page.tsx`
- `apps/web/lib/moderation-console.ts`
- `packages/auth/src/permissions.ts`
- `packages/config/src/tiers.ts`
- `packages/types/src/persona.ts`
- `packages/types/src/forum.ts`

## Implementation Notes

Start in `apps/api/src/routes/personas.ts`.

Current ARGUS finding:

- `personaCreateSchema` accepts `visibility: "public"`.
- `personasRouter.post("/", requireTier("private"), ...)` checks only the
  general persona count limit, not `publicPersonas`.
- `personasRouter.patch("/:id", ...)` lets visibility transition to `public`
  after integrity preflight or `skipIntegrityPreflight`, but does not enforce
  public-persona tier eligibility.
- `personasRouter.get("/:id", ...)` allows a non-owner authenticated caller to
  fetch a public persona and currently returns the owner-shaped serializer.

DAEDALUS should decide whether the eligibility helper belongs in
`packages/auth/src/permissions.ts` or as a narrow route-local helper. Prefer
the existing repo pattern if one is clearly established.

At minimum, public/non-owner persona shape must not include:

- `ownerUserId` or owner ids;
- emails, raw ids, storage paths, trace ids, cookies, tokens, secrets, Stripe or
  billing identifiers;
- provider/model/provider config or BYOK state;
- `awakening_prompt`;
- `style_notes`;
- owner-only `long_description`;
- layer profiles, lifecycle events, handoffs, conversations, archived chats,
  memory, canon, archive/import source material, continuity records/candidates,
  export package data, private documents, private Space links, prompts,
  completions, or provider payloads.

Treat existing `long_description`, `awakening_prompt`, and `style_notes` as
Studio setup/private by default. If a future public persona page needs longer
public copy, add a dedicated public field in a later lane with explicit owner
confirmation.

## Required Tests

Add focused API/unit coverage proving:

- Private-tier users cannot create a public persona.
- Private-tier users cannot transition an existing persona to public
  visibility.
- `skipIntegrityPreflight` cannot bypass public-persona tier eligibility.
- Creator/canon/institutional eligibility follows `publicPersonas` limits and
  any admin override behavior is intentional.
- Owner readback reports eligibility, blockers, and public field shape without
  mutating visibility.
- Non-owner/authenticated readback for a public persona, if still supported,
  uses the public serializer and omits owner/setup/private fields.
- Public Space persona cards use the same public serializer and omit provider,
  owner ids, prompts, style notes, long setup copy, and private source labels.
- Reporter-owned report readback remains target-context-free.
- Admin persona report context remains label/visibility-only with no route hint
  until P3-B2.

Expected validation:

- Focused persona route tests.
- `test:api` or the closest existing API route test script that covers the
  touched route suite.
- `test:auth` if shared auth helpers change.
- `test:types` or package build if shared type contracts change.
- `test:studio-ui` only if Studio/awakening UI changes.
- `git diff --check`.
- `git diff --cached --check`.
- Staged credential/raw-id pattern scan.

## Explicit Non-Scope

Do not add:

- public persona pages;
- public visitor chat;
- visitor-safe model context assembly;
- provider calls;
- embedding changes;
- Redis, Cloudflare, cache architecture, workers, or queues;
- billing, Stripe, pricing, entitlement-policy expansion, invoices, token
  credits, or Customer Portal work;
- analytics;
- moderation actions;
- Salon events;
- Persona Roulette;
- voice/avatar mode;
- persona-to-persona encounters;
- institutional/research product UI;
- broad UI reskin;
- Archive trust UX.

## Expected Response

Commit the implementation with a wakeup for ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR202 / P3-B1A public persona eligibility, serializer
  split, and owner readback.
Risk:
- Public/non-owner persona shape and public Space persona cards must be hostile
  reviewed for private setup leakage and tier bypasses.
Task:
- Review the implementation, run or inspect validation, and wake MIMIR with
  accept/patch verdict.
```

If blocked before implementation, wake MIMIR with the exact blocker and no
silent sleep.

## DAEDALUS Implementation Result

Implemented on 2026-06-23.

What landed:

- `packages/auth/src/permissions.ts` now exports `canCreatePublicPersona`,
  using `TIER_LIMITS.publicPersonas` and the existing admin override
  convention.
- `packages/types/src/persona.ts` now has explicit public persona field,
  eligibility, and owner readback types.
- `apps/api/src/lib/persona-serialization.ts` centralizes the public persona
  serializer used by `/personas/:id` non-owner readback and public Space
  persona cards.
- `apps/api/src/routes/personas.ts` blocks public persona create/transition
  attempts when public-persona eligibility fails. The check runs before
  Integrity preflight handling, so `skipIntegrityPreflight` cannot bypass tier
  eligibility.
- Owner persona readback includes public-persona eligibility and exact public
  fields without changing current visibility.
- Non-owner authenticated reads of public personas return only public profile
  fields: `name`, `shortDescription`, `visibility`, and `avatarUrl`.
- `apps/api/src/routes/spaces.ts` maps public Space persona cards through the
  same public serializer, and the public Space page no longer depends on
  persona ids/provider fields for those cards.
- Reports persona target context remains label/visibility-only with no public
  route hint.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:personas` - pass.
- `npm exec --yes pnpm@10.32.1 -- run test:spaces` - pass.
- `npm exec --yes pnpm@10.32.1 -- run test:auth` - pass.
- `npm exec --yes pnpm@10.32.1 -- run test:reports` - pass.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` - pass.
- `npm exec --yes pnpm@10.32.1 -- run lint` - pass with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `git diff --check` - pass.
- `git diff --cached --check` - pass.
- Staged secret/raw-id-shaped scan - pass; no staged secret, token, credential
  URL, password literal, or UUID-shaped value detected.

Review request for ARGUS:

- Hostile-review the public/non-owner persona shape and public Space persona
  cards for private setup leakage.
- Check public persona eligibility for tier/admin bypass mistakes.
- Confirm reports stayed label/visibility-only with no public route hint.

## ARGUS Review Result

Reviewed on 2026-06-23.

Verdict: accept PR202 / P3-B1A.

Findings:

- Public persona eligibility is server-authoritative for create and transition.
  Private-tier public persona creation and visibility transition return `403`,
  and `skipIntegrityPreflight` cannot bypass public-persona eligibility.
- Owner readback keeps the owner serializer for the owner while adding
  eligibility and exact public field preview metadata without changing current
  visibility.
- Public/non-owner persona readback and public Space persona cards use the
  public serializer only: `name`, `shortDescription`, `visibility`, and
  `avatarUrl`.
- Provider fields, owner ids, long setup copy, awakening prompts, style notes,
  and private source labels are not returned on the public/non-owner shapes
  reviewed in PR202.
- Reports remain label/visibility-only for persona target context and do not
  add a public route hint.
- No public persona page, visitor chat, provider call, embedding/cache/worker
  architecture, Cloudflare work, billing/Stripe change, analytics, moderation
  action, or broad UI scope was added.

ARGUS validation:

- `npm exec --yes pnpm@10.32.1 -- run test:personas` - pass.
- `npm exec --yes pnpm@10.32.1 -- run test:spaces` - pass.
- `npm exec --yes pnpm@10.32.1 -- run test:auth` - pass.
- `npm exec --yes pnpm@10.32.1 -- run test:reports` - pass.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` - pass.
- `npm exec --yes pnpm@10.32.1 -- run lint` - pass with the existing raw
  `<img>` warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.

## MIMIR Closeout

Closed on 2026-06-23.

MIMIR accepts PR202 as the completed P3-B1A bridge safety slice.

Next lane: PR203 / P3-B2 public persona page readback. Route identity must be
safe before a public persona page ships; DAEDALUS should not expose raw persona
ids as public URLs merely for convenience.
- `git diff --check HEAD^ HEAD`, `git diff --check`, and
  `git diff --cached --check` - pass.
- Committed-diff secret/raw-id-shaped scan - pass; no secret, token,
  credential URL, password literal, or UUID-shaped value detected.

ARGUS wakes MIMIR to close PR202 and decide the next roadmap move.
