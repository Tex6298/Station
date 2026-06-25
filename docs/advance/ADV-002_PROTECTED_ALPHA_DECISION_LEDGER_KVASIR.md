# ADV-002 - Protected Alpha Decision Ledger

Owner: KVASIR

Opened by: MIMIR

Date: 2026-06-25

Status: Open

## Purpose

PR311 passed and now stands as current hosted protected-alpha evidence.
MIMIR is not opening another A1-A4 implementation lane by inertia.

KVASIR should prepare a decision ledger for MIMIR and Marty: the near-term
decisions that may need human/product/commercial judgment soon, separated from
implementation work.

This is advisory prep only. KVASIR does not choose the mainline sequence. The
ledger is non-promotional: it should preserve a pause as a valid outcome and
must not imply that product work should continue merely because future decisions
exist.

## Task

Create one advisory result packet:

```text
docs/advance/results/ADV-002_PROTECTED_ALPHA_DECISION_LEDGER_RESULT.md
```

Inventory decisions Marty may need to make soon, grouped under:

- demo/alpha readiness;
- billing, product, and commercial shape;
- partner or Developer Space pilot readiness;
- hosted data, account, seed, and config posture;
- future infrastructure gates.

For each decision, include:

- the decision question in plain language;
- why it matters soon;
- current repo/product evidence;
- likely options;
- risks or tradeoffs;
- dependencies or config needed;
- promotion criteria for when MIMIR should open a normal PR lane, if ever;
- suggested owner only if the decision is later promoted.

## Boundaries

Do not:

- recommend the next mainline PR;
- assign DAEDALUS, ARGUS, or ARIADNE;
- wake A1-A4;
- edit product code;
- edit active mainline PR result docs;
- change acceptance bars;
- add credentials, env values, raw ids, prompts, completions, provider
  payloads, SQL, private source bodies, or secret-shaped values;
- reopen Redis, Cloudflare, provider/model, embedding, billing, worker,
  Developer Space, or broad UI work without a concrete decision criterion.

KVASIR may recommend how to structure future decisions and what evidence would
make a decision ready to promote. KVASIR should also name decisions that are
not ready, decisions that should remain paused, and decisions that only need
watching for now.

## Mainline Posture

MIMIR's current mainline posture after PR311:

- no active A1-A4 implementation or rehearsal lane is open;
- PR311 is accepted as current hosted protected-alpha product evidence;
- MIMIR will open the next mainline lane only from a fresh hosted defect, a
  concrete Marty product/commercial/partner decision, or a specific A1 wakeup;
- ADV-002 is off-boundary advisory prep, not a mainline lane.

## Result Format

Wake MIMIR with:

- concise decision ledger summary;
- highest-priority decisions, if any;
- which decisions are not ready yet and why;
- config or input Marty might need to prepare;
- clear promotion criteria for any future PR lane.
