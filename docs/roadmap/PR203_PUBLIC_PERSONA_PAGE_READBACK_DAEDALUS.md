# PR203 - Public Persona Page Readback

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Reviewer: ARGUS after implementation; ARIADNE after ARGUS accepts public safety
Status: open

## Why This Lane

PR202 closed the existing public persona eligibility and serializer safety gap.
The next Phase 3 bridge step is a real public persona page/readback with no
visitor chat.

This lane should prove a visitor can open an opted-in public persona page and
see only explicit public profile material. It should not become public persona
interaction, model context assembly, visitor chat, analytics, or a broad public
surface redesign.

## Scope

Implement P3-B2:

```text
Public persona page/readback, no visitor chat
```

Required outcomes:

- Add a public persona page route only for personas that are public and
  eligible under the PR202 gates.
- Use the PR202 public serializer as the data boundary.
- Show only explicit public profile/readback fields: name, avatar, short
  description, visibility, and any dedicated public copy/slug fields added by
  this lane.
- Keep private Studio setup fields private: owner ids, raw ids, provider/BYOK
  fields, `longDescription`, `awakeningPrompt`, `styleNotes`, lifecycle data,
  memory, canon, archive, continuity, exports, private documents, prompts,
  completions, provider payloads, billing IDs, storage paths, trace IDs, and
  cookies/tokens/secrets.
- If public Space persona cards link to the new page, use the same public
  persona route contract and public serializer.
- Update report target context only if the public route exists safely: public
  persona reports may get a safe route hint; private personas must still have
  no route hint.

## Route Contract Guard

Do not expose a raw persona id as the public URL just because it is convenient.

DAEDALUS should inspect the schema/migration patterns and choose the narrowest
safe route contract:

- Prefer a dedicated public slug/public handle if it can be added narrowly and
  tested.
- If a safe public route identifier requires a broader schema/backfill/product
  decision, stop and wake MIMIR with route options instead of implementing a raw
  id public route.
- If an existing safe identifier already exists, document why it is safe and
  use it consistently across API, web route, Space cards, and report context.

## Must Inspect First

- `apps/api/src/lib/persona-serialization.ts`
- `apps/api/src/routes/personas.ts`
- `apps/api/src/routes/personas.test.ts`
- `apps/api/src/routes/spaces.ts`
- `apps/api/src/routes/spaces.test.ts`
- `apps/api/src/routes/reports.ts`
- `apps/api/src/routes/reports.test.ts`
- `apps/web/app/space/[slug]/page.tsx`
- `apps/web/components/discover/discover-front-door.tsx`
- `packages/types/src/persona.ts`
- `packages/db/src/types.ts`
- existing migration/schema patterns for adding public slugs or public copy

## Implementation Notes

Keep the first page quiet and factual. A public persona page can be sparse if
the data is sparse. It should not invent companion behavior or promise chat.

Acceptable page content:

- persona name;
- avatar if present;
- public short description;
- visibility/public status;
- "public readback" style copy explaining that private Studio memory, archive,
  canon, continuity, and setup notes are not shown;
- links back to public Space/public documents only if those links already have
  safe public route contracts.

Avoid:

- marketing hero treatment;
- chat composer;
- provider/model badges;
- private setup prose;
- public context preview;
- analytics panels;
- owner controls on public view.

## Required Tests

Add focused coverage proving:

- Public persona page/readback returns only public serializer fields.
- Private persona page/readback is not available to public visitors.
- Below-tier or ineligible public transitions remain blocked from PR202.
- Public Space persona cards, if linked, use the safe route identifier and still
  omit private fields.
- Reports route hints are added only for public personas with a safe public
  route, if this lane adds route hints at all.
- Private persona reports still have no safe public route hint.
- Web route renders the public page without private setup fields.

Expected validation:

- `npm exec --yes pnpm@10.32.1 -- run test:personas`
- `npm exec --yes pnpm@10.32.1 -- run test:spaces`
- `npm exec --yes pnpm@10.32.1 -- run test:reports`
- `npm exec --yes pnpm@10.32.1 -- run test:writing` or a focused web route
  test if Discover/Space public UI helpers change
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`
- `git diff --cached --check`
- Staged credential/raw-id pattern scan

## Explicit Non-Scope

Do not add:

- visitor chat;
- persona-to-persona encounters;
- visitor-safe model context assembly;
- provider calls;
- embeddings;
- Redis, Cloudflare, cache architecture, workers, or queues;
- billing, Stripe, pricing, entitlement-policy expansion, invoices, token
  credits, or Customer Portal work;
- analytics;
- moderation actions beyond safe route-hint/readback adjustments;
- Salon events;
- Persona Roulette;
- voice/avatar mode;
- institutional/research product UI;
- broad public site reskin;
- Archive trust UX.

## Expected Response

If implemented, commit with a wakeup for ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR203 / P3-B2 public persona page readback.
Risk:
- Public route identifier, public persona page payload, Space card links, and
  report route hints must be hostile reviewed for raw-id/private setup leakage.
Task:
- Review the implementation and wake MIMIR with accept/patch verdict. If safe,
  recommend ARIADNE visible public-page review next.
```

If blocked by route identifier/schema/product decision, wake MIMIR with the
specific options and tradeoffs instead of going quiet.
