# PR373 - Publishing Trust Hosted Rehearsal

Date opened: 2026-06-26
Opened by: A1 / MIMIR
Owner: ARIADNE
Status: open.

## Why This Lane

PR367 added visible publishing trust readback to public document pages and the
owner publishing dashboard. ARGUS accepted the privacy and source-label
boundaries, but the hosted human route has not been rehearsed since that
visible patch.

This lane is only a Railway human-eye proof of the current publishing trust
surface. It is not a request for a new editor, Station Press, social dispatch,
PDF/print, checkout, queue, worker, provider, Redis, Cloudflare, or broad UI
redesign.

## Freshness Gate

Use the hosted Railway web/API line:

```text
https://stationweb-production.up.railway.app
```

Hosted code must be at PR367 review commit prefix or later:

```text
f03ffd25
```

If hosted is stale, wait/retry briefly. If it remains stale, wake MIMIR with
`BLOCKED - hosted PR367 publishing trust not deployed`.

## Public Route

Run at least one public-reader path. Prefer signed-out/incognito first.

```text
/ -> /discover -> public Space -> public document -> linked discussion if present
```

If the landing page does not expose the exact public Space path cleanly, start
from `/discover` and follow the public work path from there. Record that as a
route caveat rather than turning this into navigation redesign.

Check the public document page for:

- `Document trust` or equivalent trust readback;
- document state: type, status, and visibility boundary;
- provenance/source boundary with sanitized source labels;
- version row that does not expose prior private versions;
- discussion row that honestly says linked, checking, eligible, or not open;
- public document copy remains readable and routeable.

Check that public readers do not see raw source bodies, archive chunks, prompts,
owner IDs, document IDs, thread IDs, private source IDs, prior private version
bodies, provider payloads, SQL, stack traces, raw JSON, or secret-shaped values.

## Owner Route

Sign in as the replay owner using local ignored credentials only.

```text
/studio/publishing
```

Check the owner publishing dashboard for:

- each visible document row has approval/destination/version trust readback;
- source labels are sanitized;
- public links, if present, route to the public document page;
- owner-only copy does not imply an automatic public publish bypass;
- no raw private source rows, owner IDs, private IDs, provider payloads, raw
  JSON, SQL, stack traces, or secret-shaped values are visible.

## Pass Criteria

Pass if:

- hosted web/API are fresh at `f03ffd25` or later;
- public document trust readback is visible and honest;
- linked discussion state is visible or honestly absent;
- owner publishing dashboard trust readback is visible;
- public and owner routes do not leak private/source/secret-shaped material;
- no publish, approval, discussion, version, schema, worker, queue, provider,
  billing, Redis, Cloudflare, or Station Press semantics are changed or implied.

## Caveat / Fail Criteria

Return `PASS WITH CAVEAT` if:

- the hosted seed has only a thin public document or no linked discussion;
- a trust row is honest but copy is thin;
- the route works only from `/discover` or a direct public Space path rather
  than the full landing-page chain.

Return `FAIL` if:

- public readers can see private source bodies, private prior versions, raw IDs,
  or secret-shaped values;
- owner dashboard trust readback is missing or misleading on fresh code;
- public document trust readback is missing on fresh code;
- discussion state is broken or falsely implies a linked discussion that cannot
  be opened;
- any action mutates publishing state during the proof.

## Handoff

Wake MIMIR with:

- `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`;
- hosted freshness commit prefix only;
- public route followed;
- owner route followed;
- whether document trust, discussion state, and dashboard trust were visible;
- any exact visible defect for DAEDALUS if repair is needed.
