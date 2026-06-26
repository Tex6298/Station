# PR377 - Discover Initial Space Hosted Rerun

Date opened: 2026-06-27
Opened by: A1 / MIMIR
Owner: ARIADNE
Status: passed by ARIADNE.

## Why This Lane

PR376 patched the PR375 filter caveat: unfiltered `/discover` now renders a
`Public Spaces` rail above normal feed controls when the already-loaded feed
contains safe public Space items.

Because this changes the visible Discover route, run the hosted human-eye proof
after Railway deploys the accepted PR376 commit.

## Freshness Gate

Use the hosted Railway web/API line:

```text
https://stationweb-production.up.railway.app
```

Hosted code must be at PR376 accepted review commit prefix or later:

```text
e5a6f2b9
```

If hosted is stale, wait/retry briefly. If it remains stale, wake MIMIR with
`BLOCKED - hosted PR376 not deployed`.

## Route

Run as a signed-out visitor in a clean context:

```text
/ -> /discover -> Public Spaces rail/card -> public Space -> public document -> linked discussion if present
```

Do not select the `Spaces` filter before proving the rail. The key proof is that
the public Space entrypoint is visible in the initial unfiltered Discover view.

Do not paste credentials, cookies, raw IDs, raw API bodies, private source
material, screenshots containing secrets, or hosted logs into the result.

## Pass Criteria

Pass if:

- hosted web/API are fresh at `e5a6f2b9` or later;
- initial unfiltered `/discover` shows a `Public Spaces` rail or equivalent
  visible public Space card/link;
- the public Space card/link has a clear Space affordance and opens
  `/space/:slug`;
- the regular feed and `Spaces` filter still remain usable;
- public Space -> public document -> linked discussion works when the hosted
  seed has a linked discussion;
- document trust/provenance/version/discussion readback remains safe;
- no private Spaces, unsafe/UUID-shaped Space slugs, owner IDs, document IDs,
  thread IDs, raw URLs, raw JSON, private source bodies, prior private version
  bodies, provider payloads, SQL, stack traces, or secret-shaped values are
  visible.

## Caveat / Fail Criteria

Return `PASS WITH CAVEAT` if:

- the initial public Space rail is visible, but hosted seed lacks a linked
  discussion;
- the card is visible and routeable, but copy is thin;
- the route requires scrolling but not filtering/searching.

Return `FAIL` if:

- the public Space entry is still only visible after filtering/searching;
- a private Space, unsafe slug, UUID-shaped slug, raw private id, or
  secret-shaped value is visible;
- the public Space card routes somewhere other than `/space/:slug`;
- public document/discussion trust regresses from PR375.

## Handoff

Wake MIMIR with:

- `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`;
- hosted freshness commit prefix only;
- exact route followed;
- whether the initial unfiltered Space rail/card was visible;
- whether document trust and discussion route still passed;
- any exact visible defect for DAEDALUS if repair is needed.
