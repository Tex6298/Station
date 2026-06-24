# PR227 - Public Persona Salon Readback

Owner: DAEDALUS
Reviewer: ARGUS
Status: Implemented - ARGUS review pending
Opened: 2026-06-24
Implemented: 2026-06-24

## Context

PR220 through PR226 proved the Salon foundation, hosted schema/seed readiness,
directory/category readback, Discover search surfacing, and hosted Discover
rehearsal.

The repeatedly deferred next step is public persona Salon readback. Keep this
small: public persona pages already have a visitor-safe context preview for the
public profile, published documents, and linked public discussions. PR227 should
extend that existing readback path to include only already-public,
already-routeable Salon threads linked to the public persona.

The current public persona context-preview route is anonymous. Do not add
community-visible Salon readback in this lane; that requires a separate
viewer-aware auth design.

## Goal

Make public persona context preview/readback include public Salon thread links
and counts when a public Salon thread is safely linked to the same eligible
public persona.

The result should let a visitor understand:

- this public persona has routeable public Salon discussion;
- the link opens the existing forum thread route;
- the source is a public Salon thread, not private memory/archive/continuity;
- no live room, provider call, public event feed, or persona-to-persona chat has
  opened.

## Implementation Scope

Use existing public persona context preview plumbing:

- `apps/api/src/routes/personas.ts`
- `apps/api/src/lib/persona-serialization.ts`
- `packages/types/src/persona.ts`
- `apps/web/app/personas/[publicSlug]/page.tsx`
- focused web copy/helper tests only if needed

Expected API shape:

- Add a new public context source type such as `public_salon_thread`.
- Add a count such as `publicSalonThreads`.
- Source fields must stay bounded to title, href, label, excerpt if already
  public text, and query-match state.
- Hrefs must use existing forum thread routes:
  `/forums/<categorySlug>/<threadId>`.
- Route category slugs must be safe forum slugs, not raw ids or untrusted
  thread/subcommunity slugs.

Expected data selection:

- Source only `threads` where `linked_persona_id` is the target public persona.
- Require the target persona to pass the existing public persona route
  eligibility and safe public slug checks.
- Require the thread to be active, not hidden, not removed, and `visibility =
  'public'`.
- Require the thread category to be routeable and public-readable.
- Require the backing subcommunity, when present, to be active, `public`, and
  `subcommunity_type = 'salon'`.
- Exclude community-only, private, unlisted, paused/inactive, hidden, removed,
  locked-if-unreadable, non-Salon, document-only discussion, unrelated persona,
  unsafe category route, unsafe public persona slug, ineligible owner, and raw
  id shaped route cases.

## Web Readback

Update the public persona page context preview without turning it into a broad
public UI redesign.

Required visible behavior:

- The source list can show public Salon thread sources alongside profile,
  published document, and public discussion sources.
- Counts distinguish public Salon thread sources clearly enough that a visitor
  can tell this is Salon discussion, not private memory or live chat.
- Empty-state behavior remains honest when there are zero Salon thread sources.
- Existing public chat copy remains bounded to public sources only.

Do not add:

- a new Salon route;
- a public persona "Salons" tab;
- community-visible Salon readback;
- live rooms, event feeds, provider/model calls, queues, workers, Redis,
  Cloudflare, billing, notifications, auth/session policy, moderation role
  expansion, or staging seed mutation;
- broad styling/reskin work.

## Tests

Add or update focused tests.

Required API coverage:

- Public persona context preview includes a public Salon thread linked to the
  persona.
- Query matching can match public Salon title/body and produce a bounded
  excerpt.
- Public context counts include the public Salon count.
- Anonymous readback excludes community-only, private/unlisted, paused,
  inactive, hidden, removed, non-Salon, unrelated persona, unsafe slug, raw id,
  and ineligible-owner cases.
- JSON scan confirms no owner ids, raw persona ids, linked private ids,
  subcommunity ids, category ids, report internals, provider traces, prompt
  text, private memory/archive/canon/continuity/integrity data, or SQL details.

Required web coverage:

- Public persona page renders the new Salon source type without broken labels.
- Count labels remain readable on desktop and narrow mobile component tests if
  the component already has such coverage.

Run at minimum:

- focused persona route tests, preferably `tsx --test
  apps/api/src/routes/personas.test.ts`
- any touched web tests
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`
- `git diff --cached --check`

Run `test:community` if forum helpers, category serializers, Salon visibility
helpers, or thread routing logic change beyond direct readback queries.

## DAEDALUS Implementation Result

Implemented on 2026-06-24.

What changed:

- Added `public_salon_thread` as a public persona context source type and
  `publicSalonThreads` as a public context-preview count.
- Extended the anonymous public persona context-preview catalog to include
  active, visible, public Salon-backed threads linked to the same eligible
  public persona.
- Kept Salon hrefs on existing forum thread routes:
  `/forums/<categorySlug>/<threadId>`.
- Hardened category route readback so public Salon thread links require safe
  non-UUID-shaped forum category slugs.
- Kept public chat source caps unchanged; PR227 only extends context
  preview/readback.
- Added the public persona page count tile for Salon threads and bounded copy
  that still states the preview does not start chat, call a model, or use
  private runtime context.

Safety coverage:

- The focused persona route test now proves one linked public Salon thread is
  included and community-only, private, paused, hidden, removed, non-Salon,
  unrelated persona, and unsafe category route candidates are excluded.
- JSON leak checks cover owner ids, raw persona ids, private setup fields,
  private source names, subcommunity ids, category ids, joined helper fields,
  provider traces, prompt text, private memory/archive/canon/continuity/
  integrity text, and SQL/internal field names.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:personas` passed with 12 tests.
- `npm exec --yes pnpm@10.32.1 -- run test:writing` passed with 13 tests.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in `apps/web/app/space/[slug]/page.tsx` and
  `apps/web/components/discover/discover-front-door.tsx`.
- `test:community` was not run because PR227 did not change forum helpers,
  category serializers, Salon visibility helpers, or thread routing behavior
  beyond direct public persona readback queries.

## ARGUS Review Prompt

When implementation is complete, wake ARGUS.

ARGUS should review:

- public/private Salon visibility;
- linked persona eligibility and safe public slug enforcement;
- category/thread route safety;
- context-preview source typing and counts;
- public chat source reuse, if touched;
- whether any community-only Salon content leaks through the anonymous route;
- whether the UI suggests live rooms, provider calls, event feeds,
  persona-to-persona behavior, or private companion memory.

## Wakeup

Commit completion with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR227 public persona Salon readback.
- Public persona context preview now includes bounded public Salon thread
  links/counts where safely linked to the public persona.
Risk:
- Anonymous public readback must not leak community/private Salon content or raw
  persona/thread/subcommunity ids.
Task:
- Hostile-review PR227 and wake MIMIR with PASS / FAIL / BLOCKED.
```
