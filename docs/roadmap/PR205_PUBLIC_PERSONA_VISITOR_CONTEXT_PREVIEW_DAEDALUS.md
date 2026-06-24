# PR205 Public Persona Visitor Context Preview - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: implemented by DAEDALUS; awaiting ARGUS review

## Frame

PR204 proved the public persona readback page can be reached safely. The next
Phase 3 bridge slice is not visitor chat. It is the read-only context preview
that proves what a future anonymous visitor interaction would be allowed to
see.

This is a safety and product-shape lane. Do not add a chat composer, model
call, provider selection, embeddings requirement, visitor transcript storage,
or public response generation.

## Target

Add a visitor-safe public context preview for public personas.

Suggested API shape:

```text
GET /personas/public/:publicSlug/context-preview?query=<short visitor query>
```

Suggested web shape:

- Add a small public-readback panel on `/personas/:publicSlug` that can preview
  the visitor-safe source categories for a short query.
- Keep it visually subordinate to the public persona profile; this is a trust
  readback, not the public chat product.

DAEDALUS may adjust the exact API/web split if the implementation reads cleaner,
but keep the behavior and safety boundary intact.

## Allowed Context

The preview may use:

- public persona profile fields already exposed by `/personas/public/:publicSlug`;
- public/published Station documents that are already publicly routeable;
- public Space/document/discussion references when existing serializers prove
  they are public-safe;
- source labels, counts, route hints, and short public excerpts only when the
  source is already public.

The preview must not use or expose:

- private memory item content or summaries;
- private archive imports, files, archived chats, or transcript chunks;
- canon, integrity session notes, continuity records/candidates, lifecycle
  state, owner memory blocks, preference profiles, handoffs, setup prompts, or
  style notes;
- owner user ids, raw persona ids, provider/model/BYOK settings, billing,
  storage paths, cookies, tokens, trace bodies, or secret-shaped strings.

## Implementation Notes

- Reuse the existing public-slug guard and current owner public-persona exposure
  eligibility check.
- Do not reuse the owner-only
  `/conversations/persona/:personaId/context-preview` payload shape. That
  endpoint is private runtime context and intentionally includes private-source
  concepts.
- If the first slice cannot safely include document excerpts, return source
  category counts and public route labels only. A sparse preview is acceptable;
  private leakage is not.
- Keep query length bounded and deterministic. Treat the query as matching text,
  not a prompt.
- Return explicit exclusions so reviewers can see that private buckets were
  intentionally withheld.

Suggested response shape:

```json
{
  "persona": {
    "name": "Station Replay Persona Public Readback",
    "publicSlug": "station-replay-alpha-persona"
  },
  "query": "blue lantern",
  "preview": {
    "sources": [
      {
        "type": "public_profile",
        "title": "Station Replay Persona Public Readback",
        "href": "/personas/station-replay-alpha-persona"
      }
    ],
    "counts": {
      "publicProfile": 1,
      "publishedDocuments": 0,
      "publicDiscussions": 0
    },
    "excludedPrivateBuckets": [
      "memory",
      "archive",
      "canon",
      "continuity",
      "integrity",
      "owner_profile",
      "provider_settings"
    ]
  }
}
```

The shape can change, but tests must prove the same boundary.

## Required Tests

Add focused coverage proving:

- anonymous public preview succeeds for an eligible public persona with a safe
  public slug;
- private personas, unsafe/UUID-shaped slugs, and ineligible owners return 404;
- the response does not include owner ids, raw persona ids, provider settings,
  private prompts, private memory/archive/canon/continuity/integrity content, or
  secret-shaped strings;
- the preview uses only public routeable sources;
- the web page renders the preview panel without dead controls or implying chat
  is live.

Run at minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run typecheck
```

Add narrower tests if implementation touches another route family.

## DAEDALUS Implementation

Implemented on 2026-06-24.

What changed:

- Added anonymous
  `GET /personas/public/:publicSlug/context-preview?query=<short visitor query>`.
- Reused the safe public-slug guard and current owner public-persona exposure
  eligibility check.
- Kept the first preview sparse: public persona profile is the only source;
  published document and public discussion counts are explicit zeroes until a
  later lane proves those serializers for this route.
- Added explicit excluded private buckets for memory, archive, canon,
  continuity, integrity, owner profile, and provider settings.
- Added the public page preview panel on `/personas/:publicSlug` with bounded
  120-character query input, source counts, source link, and exclusion readback.

Validation:

- `npm exec --yes pnpm@10.32.1 -- run test:personas` passed.
- `npm exec --yes pnpm@10.32.1 -- run test:writing` passed.
- `npm exec --yes pnpm@10.32.1 -- run typecheck` passed.
- `npm exec --yes pnpm@10.32.1 -- run lint` passed with existing raw `<img>`
  warnings in the public Space page and Discover front door.

Non-scope confirmation:

- No visitor chat, provider/model call, embeddings/vector retrieval, private
  runtime context, visitor conversation/transcript storage, public document or
  discussion retrieval, owner controls, billing, cache/worker architecture,
  Roulette, Salons, voice/avatar, public persona events, or persona-to-persona
  encounters were added.

## Wakeup

When implemented, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS added PR205 public persona visitor-safe context preview.
Risk:
- This is the bridge between public persona readback and future visitor chat.
- Hostile review must prove no private runtime context leaks into anonymous
  preview output.
Task:
- Review API/web payload boundaries, route eligibility, tests, and staged replay
  fixture behavior. Wake MIMIR with verdict.
```

## Non-Scope

Do not add:

- visitor chat;
- model/provider calls;
- embeddings/vector retrieval;
- Redis/Cloudflare/cache/queue architecture;
- analytics;
- moderation/reporting UI;
- owner controls;
- Roulette, Salons, voice/avatar, public persona events, or persona-to-persona
  encounters.
