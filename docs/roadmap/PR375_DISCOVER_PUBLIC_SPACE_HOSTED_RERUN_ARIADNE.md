# PR375 - Discover Public Space Hosted Rerun

Date opened: 2026-06-27
Opened by: A1 / MIMIR
Owner: ARIADNE
Status: passed by ARIADNE with filter caveat.

## Why This Lane

PR374 closed the PR373 Discover route caveat in code: `/discover/feed?tab=new`
now returns standalone public Space cards from existing public Space rows, and
ARGUS accepted route-safety hardening for unsafe or UUID-shaped Space slugs.

Because PR374 changed the public Discover route, run a hosted human-eye proof
after Railway deploys the accepted review commit.

## Freshness Gate

Use the hosted Railway web/API line:

```text
https://stationweb-production.up.railway.app
```

Hosted code must be at PR374 accepted review commit prefix or later:

```text
97d6d4ff
```

If hosted is stale, wait/retry briefly. If it remains stale, wake MIMIR with
`BLOCKED - hosted PR374 not deployed`.

## Route

Run the public route as a signed-out visitor first:

```text
/ -> /discover -> visible public Space card/link -> public Space -> public document -> linked discussion if present
```

The key proof is the middle step: `/discover` should visibly expose a public
Space card or link without ARIADNE needing to derive the Space path from hidden
feed data.

If a signed-in state appears because of browser session carryover, use a clean
context/incognito-style run or clearly note signed-in state as a caveat. Do not
paste credentials, cookies, raw IDs, raw API bodies, private source material,
screenshots containing secrets, or hosted logs into the result.

## Pass Criteria

Pass if:

- hosted web/API are fresh at `97d6d4ff` or later;
- `/discover` visibly shows a public Space card/link;
- the Space affordance is clear, for example `Space` and/or
  `Open public Space`;
- clicking it opens `/space/:slug`;
- the public Space exposes a public document link;
- the public document exposes linked discussion state and opens the linked
  discussion if present;
- public document trust/provenance/version/discussion readback remains safe;
- no private Spaces, unsafe/UUID-shaped Space slugs, owner IDs, document IDs,
  thread IDs, raw URLs, raw JSON, private source bodies, prior private version
  bodies, provider payloads, SQL, stack traces, or secret-shaped values are
  visible.

## Caveat / Fail Criteria

Return `PASS WITH CAVEAT` if:

- hosted is fresh and routeable, but the hosted seed lacks a linked discussion;
- the Space card is visible but copy is thin;
- the route works only after filtering/searching in Discover.

Return `FAIL` if:

- `/discover` still has no visible public Space card/link on fresh PR374 code;
- a private Space, unsafe slug, UUID-shaped slug, raw private id, or
  secret-shaped value is visible;
- the Space card routes somewhere other than `/space/:slug`;
- the public document/discussion chain regresses from PR373.

## Handoff

Wake MIMIR with:

- `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`;
- hosted freshness commit prefix only;
- exact route followed;
- whether the visible Space card/link was present;
- whether document trust and discussion route still passed;
- any exact visible defect for DAEDALUS if repair is needed.
