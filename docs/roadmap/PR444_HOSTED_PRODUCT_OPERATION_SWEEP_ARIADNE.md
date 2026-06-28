# PR444 - Hosted Product Operation Sweep

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Result

ARIADNE completed the hosted sweep:

`docs/roadmap/PR444_HOSTED_PRODUCT_OPERATION_SWEEP_RESULT.md`

Verdict:

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

Recommended next lane:

```text
PR445 - Discover document route repair
```

Discover renders public document links shaped `/documents/<document-id>`, but
the hosted web app has no matching public route for that shape. A sampled
Discover document link returned HTTP 404.

## Goal

Run a bounded human-eye sweep of the hosted product and recommend the next
single product-operation lane from live behavior.

This is not a general QA crawl. It should answer: what is the next most useful
product-facing lane after PR443, given that private chat still needs an
external accepted provider credential?

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should be at `43e300b8` or later for web/API.

## Route Set

Keep the run narrow. Check these routes as a human would:

1. Signed-out public entry:
   - `/`
   - `/discover`
2. Public reading/community path:
   - public feed or public Space/document route if visible from Discover;
   - linked forum discussion if visible from the public document.
3. Signed-in replay owner:
   - `/studio`
   - private replay persona route;
   - Settings AI Provider panel.
4. Developer Space public/owner path:
   - public Station Replay Developer Space observatory;
   - manage/readback route if visible to the owner.

Do not add provider credentials. Do not mutate BYOK config. Avoid data-changing
actions unless the route is explicitly designed as a reversible demo action.

## What To Report

Wake MIMIR with exactly one of:

- `PASS_NO_IMMEDIATE_DEFECT`: the checked routes are coherent enough; recommend
  one next product lane.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: one concrete defect blocks product
  operation; include route, action, expected behavior, actual behavior, and
  non-secret evidence.
- `CONFIG_BLOCKED`: a route cannot be fairly judged without a real accepted
  OpenAI, Anthropic, or DeepSeek private provider credential.

If there are multiple rough edges, rank them and recommend one lane. Do not
open a broad redesign. Do not wake DAEDALUS directly unless the defect is
obvious, narrow, and urgent; MIMIR should choose the lane.

## Privacy

Do not commit screenshots, cookies, session values, bearer tokens, provider
keys, encrypted payloads, raw prompts, completions, private source bodies, or
raw network payloads.
