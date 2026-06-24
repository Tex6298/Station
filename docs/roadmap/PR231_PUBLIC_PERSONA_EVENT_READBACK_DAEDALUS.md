# PR231 - Public Persona Event Readback (Derived-Only)

Owner: DAEDALUS
Reviewer: ARGUS
Status: ARGUS PATCH accepted - MIMIR review pending
Opened: 2026-06-24
Implemented: 2026-06-24

## Frame

ARGUS completed PR230 and accepted public persona events only as a hard-gated
first slice: derived public readback on the public persona page. This is not a
new event system. It is a visitor-safe "public updates" view assembled from
already-routeable public sources for an eligible public persona.

If this lane appears to need a schema, write path, owner-authored milestone
model, event-specific moderation, or global feed, stop and wake MIMIR/ARGUS.

## Goal

Add the smallest public persona event readback surface that:

- reuses existing eligible public persona lookup;
- derives cards from already-routeable public documents, public document
  discussions, and public Salon threads;
- renders only on the public persona page;
- exposes no private, owner-only, raw-id, provider, report, chat, counter, or
  moderation internals.

## Allowed Sources

Only these first-slice sources are allowed:

1. `published_document`
   - Published public documents tied to the eligible public persona by
     `persona_id` or `source_persona_id`.
   - The owning Space/document route must be public and routeable.

2. `public_discussion`
   - Active public not-hidden forum threads that are the included public
     document's `discussion_thread_id`.

3. `public_salon_thread`
   - Active public not-hidden threads linked to the eligible public persona.
   - Must have no `linked_document_id`.
   - Must be backed by an active public `salon` subcommunity.
   - Must use a safe non-UUID forum category slug.

`public_profile` may remain a static profile/source anchor if already present,
but do not turn it into a timestamped event in this lane.

## Required Public Shape

Add a public-safe `PublicPersonaEvent` type and either:

- `GET /personas/public/:publicSlug/events`; or
- an equivalently bounded field on the public persona readback response.

Return at most 12 events by default, max 20.

Sort by public source timestamp descending:

- documents: `published_at ?? created_at`;
- discussions and Salon threads: `threads.created_at`.

Allowed public fields:

- `eventType`: `published_document`, `public_discussion`, or
  `public_salon_thread`;
- `label`: `Published document`, `Public discussion`, or
  `Public Salon thread`;
- `title`;
- `href`;
- `occurredAt`;
- optional bounded `excerpt`;
- optional public-safe `sourceType` only when it is existing public document
  provenance text, not a backend table name or raw source id.

## Required Web Shape

Render the readback only on the public persona page.

Use honest copy such as:

- `Public updates`;
- `Public sources`;
- `Published and public discussions`.

The UI must not claim live activity, autonomous activity, live rooms,
provider/model calls, persona-to-persona encounters, private memory, private
continuity, or comprehensive history.

Include a clear empty state when no derived public updates exist.

## Hard Exclusions

Do not add:

- migrations;
- a persistent public persona events table;
- event write APIs;
- owner-authored milestone events;
- seed data;
- Discover/global feed surfacing;
- public Space feed injection;
- notifications;
- owner Studio analytics;
- event-level report/hide/remove/moderation routes;
- provider calls;
- chat/report/counter events;
- Cloudflare, Redis, queues/workers;
- auth/session or billing changes;
- broad UI reskin.

Never expose:

- raw chat transcripts, chat attempts, chat replies, prompts, completions,
  provider usage, quota/token activity, or rate-limit events;
- reports, report bodies, reporter identity, report status, delegated
  moderation state, moderation actions, review requests, or admin/operator
  internals;
- aggregate public persona counters;
- private memory, archive, canon, continuity, integrity, owner setup,
  provider settings, private files, private Spaces, private/community-only
  documents, unlisted/community/private Salons, hidden/removed threads or
  comments, document-linked Salon threads in the Salon source path, unrelated
  persona/source rows, Developer Space events, AI trace events, persona
  lifecycle events, billing/webhook events, queue/runtime events, SQL details,
  stack traces, env values, tokens, service keys, raw JSON blobs, backend table
  names, or duplicate raw ids.

Existing route hrefs may continue using existing public document/thread route
ids. Do not add duplicate raw id fields to event payloads.

## Implementation Notes

- Prefer reusing the public context source catalog and PR227 routeable source
  filters over inventing a parallel query.
- Keep route ordering safe if adding `/events` near
  `/personas/public/:publicSlug`.
- Keep the public persona serializer boundary intact.
- If forum/category/Salon helpers need changes, keep them narrowly scoped and
  preserve existing visibility semantics.

## Tests

Add focused API coverage in `apps/api/src/routes/personas.test.ts` proving:

- anonymous public event readback includes only routeable public documents,
  public document discussions, and public Salon threads for the eligible public
  persona;
- private, community, unlisted, hidden, removed, paused, non-Salon,
  unsafe-slug, unrelated-persona, document-linked-Salon, private Space,
  draft/unpublished document, ineligible owner, unsafe public persona slug,
  chat/report/counter/provider/private bucket, and raw id fields do not appear
  in JSON.

Add web/helper coverage proving:

- the public persona page renders labels, timestamps, links, empty state, and
  boundary copy;
- visible copy does not claim live/provider/private/persona-to-persona
  behavior;
- the new surface does not introduce obvious overflow.

## Validation

Run:

```text
pnpm test:personas
pnpm typecheck
pnpm lint
git diff --check
git diff --cached --check
```

Also run:

- relevant public persona web/helper tests if the page helper exists;
- `pnpm test:community` if forum/category/Salon helpers change;
- `pnpm test:writing` if existing public document/public persona copy helpers
  are touched.

DAEDALUS implementation validation on 2026-06-24:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 12 tests passed. Existing hostile public persona context fixture now also proves derived event readback includes routeable public documents, document discussions, and public Salon threads while excluding private/community/unlisted/hidden/removed/paused/non-Salon/unsafe/unrelated/ineligible/raw-field candidates. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 14 tests passed. New helper coverage proves the public updates copy stays derived, public-source-only, and non-live/non-provider/non-private. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed after adding shared `PublicPersonaEvent` types, the derived events route, and the public page panel. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |
| `test:community` | Not run | PR231 reused existing public forum/category/Salon read filters without changing forum helpers, category serializers, Salon visibility helpers, or thread routing behavior. |

## Review Handoff

When implementation is complete, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS implemented PR231 public persona event readback.
Risk:
- This touches public persona readback and must preserve PR230's derived-only
  public-source boundary.
Task:
- Review implementation and tests against
  docs/roadmap/PR231_PUBLIC_PERSONA_EVENT_READBACK_DAEDALUS.md.
- Wake MIMIR with ACCEPT / PATCH / REJECT and whether ARIADNE hosted rehearsal
  is required before the next lane.
```

## ARGUS Review Result

Date reviewed: 2026-06-24

Verdict: `PATCH` - accepted after a narrow ARGUS hardening patch.

ARGUS found the implementation stayed inside PR230's derived-only lane: no
schema, write path, owner-authored milestone model, Discover/global feed, public
Space feed, provider call, chat/report/counter source, event-specific
moderation surface, queue/worker, auth/session, billing, or broad UI work was
added.

ARGUS patched one routeability gap before acceptance:

- Public discussion events inherited the existing document-discussion category
  route behavior, which accepted any non-empty category slug. The event readback
  now requires safe non-UUID forum category slugs for public document discussion
  sources, matching the Salon source route-safety posture.
- The hostile public persona fixture now includes an unsafe public discussion
  category and proves that the unsafe discussion thread/category stay out of
  both context preview and event readback JSON.

Accepted post-patch behavior:

- Anonymous `GET /personas/public/:publicSlug/events` reuses eligible public
  persona lookup.
- Events are derived only from routeable public documents, public document
  discussions, and public Salon threads.
- Event payloads are bounded to `eventType`, `label`, `title`, `href`,
  `occurredAt`, optional bounded `excerpt`, and optional public-safe
  `sourceType`.
- Private/community/unlisted/hidden/removed/paused/non-Salon/unsafe-route/
  unrelated/ineligible candidates and duplicate raw id fields stay out of JSON.
- Public page copy says "Public updates" / "Public sources" and explicitly
  avoids live activity, provider/model-call, private memory, and comprehensive
  history claims.

ARIADNE recommendation:

- Required before the next product lane. PR231 changed a visible anonymous
  public persona page and added a new public readback endpoint, so MIMIR should
  open a hosted ARIADNE rehearsal for the public updates panel before moving on.

ARGUS validation after patch:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 12 tests passed after the unsafe discussion route hardening patch. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 14 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |
| `git diff --check` | Pass | CRLF normalization warnings only. |
| `git diff --cached --check` | Pass | Staged implementation, ARGUS patch, docs, and watcher state had no whitespace errors. |
| `test:community` | Not run | ARGUS patched only public persona source filtering/tests, not forum helpers, category serializers, Salon visibility helpers, or thread routing behavior. |
