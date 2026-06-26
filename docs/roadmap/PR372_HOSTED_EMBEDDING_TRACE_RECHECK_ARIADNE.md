# PR372 - Hosted Embedding Trace Recheck

Date opened: 2026-06-26
Opened by: A1 / MIMIR
Owner: ARIADNE
Status: open.

## Why This Lane

PR371 fixed the PR370 hosted data-shape caveat by copying existing safe
embedding profile metadata into conversation trace metadata. ARGUS accepted the
patch, but the visible hosted proof should be run after the Railway deploy is
fresh.

This is a human-eye recheck only. Do not broaden into provider work, chat-model
work, retrieval quality tuning, Settings redesign, or private archive testing.

## Freshness Gate

Use the hosted Railway web/API line:

```text
https://stationweb-production.up.railway.app
```

Before judging the route, confirm hosted code is fresh enough to include PR371
product commit prefix:

```text
b9459d84
```

If hosted is stale, wait/retry briefly. If it remains stale, wake MIMIR with
`BLOCKED - hosted PR371 not deployed`.

## Route

Run this as the replay owner using local ignored credentials. Do not commit,
paste, screenshot, or summarize credentials, cookies, bearer tokens, raw trace
IDs, raw owner IDs, raw private IDs, raw response bodies, prompts,
completions, provider payload bodies, raw URLs, stack traces, SQL, provider
keys, or secret-shaped values.

Human route:

```text
/studio -> replay persona chat -> send one safe synthetic chat turn
/settings -> AI Activity -> Recent traces -> newest conversation trace detail
```

Safe synthetic chat text:

```text
Give a one-sentence readiness check for provider-route metadata.
```

## Pass Criteria

Pass if the hosted human view shows:

- Settings and AI Activity load for the signed-in replay owner.
- The newest conversation trace detail opens.
- Trace facts include explicit embedding readback such as:
  - `Embedding profile station_free_1536`;
  - `Embedding provider gemini`;
  - `Embedding model gemini-embedding-2`;
  - `Embedding dimension 1536`.
- Gemini does not appear as generic `Provider gemini` from embedding metadata.
- No Gemini chat activation, Gemini chat copy, provider marketplace, or
  paid-provider selection is implied.
- No provider keys, raw URLs, raw prompts, completions, provider payload bodies,
  vectors, private archive text, owner ids, raw trace ids, SQL, stack traces,
  or secret-shaped values are visible.

## Caveat / Block Criteria

Return `PASS WITH CAVEAT` if:

- hosted is fresh and the route works, but no trace can be generated;
- trace detail opens and is safe, but embedding metadata is still absent.

Return `FAIL` if:

- embedding metadata renders as generic `Provider gemini`;
- raw private or secret-shaped material is visible;
- the trace detail route is broken on fresh PR371 code;
- the safe chat turn creates no AI Activity entry and the UI gives no honest
  explanation.

## Non-Scope

Do not open:

- Gemini chat;
- provider marketplace;
- provider config/secrets;
- embedding reindex/backfill;
- Cloudflare retrieval;
- Redis Memory truth;
- billing/schema/migration work;
- broad Settings redesign;
- private archive ingestion.

## Handoff

Wake MIMIR with:

- `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`;
- hosted freshness commit prefix only;
- route(s) visited;
- whether explicit embedding facts were visible;
- whether generic provider facts stayed distinct;
- any exact visible defect for DAEDALUS if repair is needed.
