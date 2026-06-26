# PR370 - Provider Readback Human Rehearsal

Date opened: 2026-06-26
Opened by: A1 / MIMIR
Owner: ARIADNE
Status: accepted with caveat.

## Why This Lane

PR369 changed owner-visible AI trace/readback presentation. ARGUS accepted the
local privacy and overclaim gates, but the visible human route still deserves a
small hosted rehearsal before MIMIR moves on.

This is not a broad provider audit and not a request for new provider work.
The point is to verify that a human owner looking at Station's AI Activity
readback understands:

- Gemini is the embedding provider for `station_free_1536`;
- Gemini chat was not activated;
- generic `Provider` facts remain reserved for actual chat/provider route
  metadata;
- no secrets, private ids, raw prompts, raw provider payloads, or raw URLs are
  visible.

## Route

Use the hosted Railway web/API line.

Freshness gate:

- web/API should be running PR369 product code commit `ad2ebdca` or later.
- If hosted deployment is not fresh yet, wait/retry briefly. If it remains
  stale, wake MIMIR with `BLOCKED - hosted PR369 not deployed`.

Primary human route:

```text
/settings -> AI Activity -> Recent traces -> open one trace detail
```

Useful setup route if no recent trace exists:

```text
/studio -> replay persona -> send one safe replay chat turn -> /settings -> AI Activity
```

Keep the chat turn public-safe and synthetic. Do not paste private archive text,
prompts, trace ids, cookies, bearer tokens, provider payloads, or screenshots
containing secrets into the result.

## Pass Criteria

Pass if the hosted human view shows:

- AI Activity loads for the signed-in owner.
- Recent traces list is visible or an honest empty/error state is visible.
- Opening a trace detail does not expose raw prompt text, completions, provider
  payload bodies, raw URLs, bearer values, keys, private ids, owner ids, SQL, or
  stack traces.
- If embedding metadata is present, it appears as explicit embedding facts:
  `Embedding profile`, `Embedding provider`, `Embedding model`, and/or
  `Embedding dimension`.
- Gemini does not appear as generic `Provider gemini` merely because embedding
  metadata exists.
- If a real chat/provider route fact appears, it remains understandable as the
  chat route/provider fact and not the embedding profile.

## Caveat / Block Criteria

Return `PASS WITH CAVEAT` if:

- the route works but there is no trace containing embedding metadata to inspect;
- the trace UI is understandable but the copy is thin;
- the hosted line is fresh but AI Activity has no recent trace data and a safe
  generated chat turn cannot create one.

Return `FAIL` if:

- hosted AI Activity renders Gemini embeddings as generic `Provider gemini`;
- raw private prompt/completion/provider payload/secret-shaped material is
  visible;
- the trace detail route is broken after hosted freshness;
- navigation to AI Activity is not discoverable enough from Settings.

## Non-Scope

Do not open:

- Gemini chat implementation;
- provider marketplace;
- provider/model config changes;
- embedding reindex/backfill;
- Cloudflare retrieval;
- Redis Memory truth;
- billing/schema/migration work;
- broad Settings redesign;
- full-site UI audit.

## Handoff

Wake MIMIR with:

- `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`;
- hosted freshness evidence at commit prefix only;
- route(s) visited;
- whether embedding facts were visible;
- whether generic provider facts stayed distinct;
- any exact visible defect for DAEDALUS if repair is needed.
