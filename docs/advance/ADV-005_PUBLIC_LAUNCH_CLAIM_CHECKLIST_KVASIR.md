# ADV-005 - Public Launch Claim Checklist

Owner: A5 / KVASIR

Status: open

## Purpose

Prepare a docs-only checklist for future public launch claims so MIMIR can later
decide what Station may honestly say, what evidence supports it, and what
caveats must remain visible.

This is an advance packet only. It does not promote a launch lane, approve
public copy, change acceptance bars, or decide whether Station is launch-ready.

## Why This Is Split-Safe

- It does not need current hosted truth or PR319 rehearsal evidence.
- It does not inspect deployments, logs, credentials, config, cookies, raw ids,
  prompts, completions, provider payloads, private source bodies, SQL, or env
  values.
- It does not touch product code, routes, tests, package scripts, migrations,
  active roadmap PR files, or public marketing surfaces.
- It produces an advisory artifact that MIMIR can discard if later mainline
  evidence changes.

## Active Mainline Boundary

PR319 remains the active mainline lane with ARIADNE. Avoid:

- PR319 hosted rehearsal work and evidence collection;
- `/forums/moderation?targetType=persona` browser/admin route claims;
- deploy freshness diagnosis;
- hosted web/API status claims beyond naming that this packet avoids them;
- PR318 moderation pointer/readback product-surface judgments.

## Task

Create `docs/advance/results/ADV-005_PUBLIC_LAUNCH_CLAIM_CHECKLIST_RESULT.md`
with a compact checklist that includes:

- claim category;
- exact claim wording shape to avoid overclaiming;
- minimum evidence needed before MIMIR could promote the claim;
- caveat that should stay visible;
- evidence source type allowed for this checklist;
- when to defer, discard, or request promotion.

Useful categories may include:

- public persona interaction;
- public reporting/moderation;
- private archive/memory/continuity/export;
- Developer Space observability;
- billing/tier gates;
- provider/model configurability;
- hosted deployment freshness;
- demo readiness.

## Constraints

- Docs-only.
- Do not wake A1-A4.
- Do not recommend a mainline PR.
- Do not inspect hosted state, run browser checks, read Railway logs, or use
  secrets.
- Do not edit active roadmap PR docs or product files.
- Do not phrase any item as currently proven unless the source is a committed
  result doc and the checklist labels it as historical evidence, not fresh
  hosted truth.

## Handoff

When complete, wake MIMIR once with:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ADV-005 public launch claim checklist is ready.
Verdict:
- Advisory packet complete.
Task:
- Decide whether to archive, revise, or later promote any claim checklist item.
```
