# PR496 - Workspace Export Package Contract Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date: 2026-07-06

Status: Open

## Why This Lane

PR495G is closed. The repeated Discern companion wakeup is stale because
PR485A-E and PR494A-B already translated the safe companion-home/product
behavior. Token top-up closure is still blocked by the dedicated Basic/private
proof-account requirement, and live Archive connector hosted proof remains
config-bound.

The next unblocked customer-facing product-depth question is Workspace Export.
PR483A made `/studio/export` honest about scope, but it deliberately stopped at
readback. Station still lacks an accepted contract for whether owners can create
a real account/workspace-level portable manifest package.

## Task

Run hostile preflight for:

```text
PR496A - Owner Workspace Export Package Contract
```

Decide whether DAEDALUS can safely implement the smallest owner-only workspace
export package slice now, or whether this needs a design-first/blocker result.

Treat this as a product contract, not a broad export rebuild.

## Existing Truth To Inspect

Use current repo evidence before deciding:

- PR483A `/studio/export` scope/readback truth;
- existing owner-only persona archive manifest/package creation;
- existing owner-only Developer Space archive manifest/package creation;
- existing owner-only Project manifest/package creation;
- current `export_packages` table, package kind constraints/types, package
  bundle readback, operational quota behavior, and export tests;
- Station Assistant/export route copy and `/studio/export` entry points.

## Candidate Safe Shape

If accepted, PR496A should be the smallest real package contract:

- owner-only authenticated workspace/account manifest package;
- created from `/studio/export` or a close existing owner export surface;
- stored and read back using the existing export package pattern if safe;
- JSON/Markdown manifest plus portable bundle readback, matching existing
  package privacy posture;
- high-level workspace inventory only: personas, Spaces, Developer Spaces,
  Projects, public/published document references, existing export package
  classes/counts, and excluded/future material;
- explicit trust notes that public copies remain separate and private source
  bodies are not bundled;
- no public route, anonymous download, share URL, signed URL, or cross-owner
  package access.

## Required ARGUS Decision

Return exactly one of:

```text
ACCEPT_PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT
DESIGN_FIRST_WORKSPACE_EXPORT_PACKAGE
BLOCKED_WORKSPACE_EXPORT_PACKAGE_WITH_REASON
REJECT_NO_SAFE_WORKSPACE_EXPORT_PACKAGE
```

If accepted, name:

- exact files/routes/helpers DAEDALUS may touch;
- whether a schema/package-kind migration is allowed in PR496A;
- exact manifest sections allowed;
- exact manifest sections forbidden;
- required API/web/helper tests;
- whether ARIADNE hosted proof is required after ARGUS review.

If not accepted, name the smallest unblock lane or exact external blocker.

## Guardrails

Do not allow PR496A to add:

- raw private document bodies, archive bodies, chat transcripts, source text, or
  original uploaded files;
- storage paths, signed URLs, package download URLs, shareable private URLs, or
  public export access;
- PDF generation, binary archives, Station Press, print-on-demand, original-file
  packaging, backup/redundancy, restore drills, retention/expiry enforcement,
  disaster-recovery claims, or managed backup claims;
- provider/model calls, prompts, completions, Redis, Cloudflare, workers,
  queues, recurring jobs, billing, Stripe, live-money behavior, social posting,
  Archive connector pulls, OAuth/API credentials, or external integrations;
- broad `/studio/export` reskin, global CSS import, or unrelated product
  polishing.

## Sensitivity Rules

Any accepted manifest/readback must avoid:

- raw ids where not already safe and owner-facing;
- owner user ids;
- raw source ids;
- storage ids/paths;
- SQL/table details;
- stack traces;
- hosted logs;
- cookies/tokens/credentials;
- provider payloads;
- secret-shaped values;
- private source excerpts.

## Handoff

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- MIMIR closed PR495G as accepted.
- The repeated Discern companion wakeup is stale; PR485A-E and PR494A-B already
  translated the safe companion-home behavior and PR494 closed the remaining
  delta as duplicate/unsafe/skin.
- PR496 opens the next unblocked customer-facing product-depth question:
  whether Workspace Export can move from readback map to a real owner-only
  workspace package contract.
Task:
- Hostile-preflight PR496A Owner Workspace Export Package Contract.
- Accept the smallest safe package contract, or return DESIGN_FIRST/BLOCKED/
  REJECT with the exact reason and smallest unblock lane.
```
