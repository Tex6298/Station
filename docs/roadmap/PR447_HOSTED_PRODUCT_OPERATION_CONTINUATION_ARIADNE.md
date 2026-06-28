# PR447 - Hosted Product Operation Continuation Sweep

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Source

PR444 found a public Discover document route blocker. PR445 repaired it. PR446
proved the repair on hosted Railway.

Use this lane to continue the hosted product-operation sweep beyond that old
blocker.

## Goal

Identify the next single product-operation lane from the live hosted product.

This is a human-eye rehearsal, not a broad redesign pass and not a generic QA
crawl. Treat the product as a user would, then recommend the next concrete lane
MIMIR should open.

Known caveat:

- private replay/chat may still require a real accepted OpenAI, Anthropic, or
  DeepSeek provider route or owner BYOK credential. Do not turn that known
  external credential caveat into a new product defect unless the UI fails to
  explain it.

## Hosted Gate

Use:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Runtime should be at PR445 commit `19d9edff` or later for web/API before
judging product behavior.

## Route Set

Keep the sweep bounded and human-visible:

1. Signed-out public chain:
   - `/`;
   - `/discover`;
   - public Space or public feed item if visible;
   - public document;
   - linked forum discussion.
2. Signed-in replay-owner Studio chain:
   - `/studio`;
   - replay persona;
   - Memory, Continuity, Archive, and Integrity stops if visible.
3. Developer Space chain:
   - public Station Replay observatory;
   - owner manage/readback page if visible.
4. Settings/read-only account surfaces:
   - AI Provider setup state;
   - Billing/subscription page as read-only only.

Avoid destructive or irreversible data changes. Reversible demo actions are
allowed only if they are already part of the staging replay path.

## What To Look For

- Does the product now carry a visitor from public discovery into readable work
  and discussion?
- Does Studio make memory, continuity, archive, and integrity legible as
  product stops rather than hidden counters?
- Does Developer Space explain what the live observatory is observing and why a
  visitor should care?
- Do action controls clearly work, disable, or explain preview/setup state?
- Does missing accepted provider config show useful setup copy instead of
  looking broken?

## Report

Wake MIMIR with exactly one:

- `PASS_WITH_NEXT_LANE`: no immediate blocker in the checked path; recommend
  one next product lane.
- `PRODUCT_DEFECT_NEEDS_DAEDALUS`: one concrete defect blocks product
  operation; include route, action, expected behavior, actual behavior, and
  non-secret evidence.
- `CONFIG_BLOCKED`: a path cannot be fairly judged without a real accepted
  OpenAI, Anthropic, or DeepSeek private provider credential.

If there are multiple rough edges, rank them but recommend only one next lane.
Do not wake DAEDALUS directly unless the defect is obvious, narrow, and urgent;
MIMIR should choose the lane.

## Privacy

Do not commit screenshots, cookies, session values, bearer tokens, provider
keys, encrypted payloads, raw prompts, completions, private source bodies, or
raw network payloads.
