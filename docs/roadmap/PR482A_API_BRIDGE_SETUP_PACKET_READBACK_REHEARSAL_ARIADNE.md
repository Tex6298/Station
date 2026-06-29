# PR482A - API Bridge Setup Packet Readback Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted owner read-only proof

## Why This Rehearsal

ARGUS accepted PR482A after a narrow setup-label redaction patch:

`docs/roadmap/PR482A_API_BRIDGE_SETUP_PACKET_READBACK_REVIEW_RESULT.md`

The remaining risk is hosted product truth. PR482A added an owner-only API
Bridge setup packet on the existing Developer Space manage route. The live
Railway app must prove that an owner can read the packet on desktop and 390px
mobile without key/secret leakage, mutation behavior, live sends, external
connector claims, or infrastructure overreach.

This is read-only. Do not generate or rotate keys, send ingestion payloads,
create events, call external APIs, or exercise live-send/dry-run behavior.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at app commit `7f8aabcc` or later, or at
     the deploy-equivalent app commit if later commits are docs/state only;
   - the owner Developer Space manage route visibly includes the PR482A API
     Bridge setup packet.
2. Owner route:
   - sign in as the staging owner;
   - open one routeable owner Developer Space manage route such as
     `/developer-spaces/:slug/manage`;
   - verify desktop rendering is readable with no horizontal overflow,
     clipped controls, overlapping text, or broken panel layout.
3. Mobile route:
   - repeat the owner manage route at 390px mobile;
   - verify the packet, route examples, header names, payload-family labels,
     tier rows, key-status readback, and next actions remain readable with no
     horizontal overflow or clipped primary controls.
4. Setup packet content:
   - placeholder routes are placeholders only and do not show a live key,
     token, cookie, owner id, raw internal id, SQL/table detail, stack trace,
     hosted log, provider payload, or secret-shaped value;
   - header examples are names only, such as `X-Station-Developer-Key`,
     `Content-Type`, `X-Station-Webhook-Id`, and `X-Station-Signature`;
   - payload-family content is label/readback only, not raw payload bodies,
     prompts, private evidence, source text, or connector credentials;
   - key state is limited to no-key/key-present/last-four style readback and
     never reveals a full ingestion key or signing secret;
   - Tier 1 current plus Tier 2/Tier 3 future/blocked truth remains visible.
5. Setup-label redaction:
   - if hosted staging already has, or can safely create without secret use, a
     Developer Space name/label containing URL, token/key/secret assignment,
     UUID, bearer, or key-shaped material, verify the setup packet summary
     redacts it;
   - if no safe route exists to create such a seed without broadening scope,
     report `SEED_OR_ROUTE_BLOCKER` only if all other checks pass and the
     missing redaction seed is the only gap.
6. No mutation behavior:
   - do not click Generate key or rotate/generate controls unless an existing
     key-control baseline is deliberately scoped separately;
   - no packet action should send ingestion, create observed-runtime rows,
     trigger live dry-run, call external APIs, call providers/models, upload
     files, start billing/Stripe actions, provision runtime, touch
     Cloudflare/Redis/workers/queues, deploy repos, run Developer Agent actions,
     apply schema changes, or run migrations.
7. Safety:
   - no full ingestion key, signing secret, raw payload, private evidence,
     prompt, raw id, cookie, token, SQL/table detail, stack trace, provider
     payload, hosted log, or secret-shaped value appears in UI or visible
     errors.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_BRIDGE_BOUNDARY_FAIL
SEED_OR_ROUTE_BLOCKER
```

Use `PASS_READY_TO_CLOSE` only if hosted owner desktop/mobile readback,
content boundaries, no-mutation behavior, and secret-safety checks pass.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for visible defects such as missing packet,
broken layout, misleading live-send/action copy, broken tier truth, unsafe
header/route/payload text, or key-state display problems.

Use `PRIVACY_OR_BRIDGE_BOUNDARY_FAIL` if any full key, signing secret, raw
payload, private evidence, prompt, raw id, cookie, token, SQL/table detail,
stack trace, provider payload, hosted log, secret-shaped value, or public
owner-only setup exposure appears.

Use `SEED_OR_ROUTE_BLOCKER` if hosted staging lacks a routeable owner Developer
Space manage route or cannot safely prove setup-label redaction without
broadening the lane.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR482A hosted owner API Bridge setup packet rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_BRIDGE_BOUNDARY_FAIL | SEED_OR_ROUTE_BLOCKER
Task:
- Close PR482A, wait for deploy, route the smallest repair, or choose the seed/route unblock.
```
