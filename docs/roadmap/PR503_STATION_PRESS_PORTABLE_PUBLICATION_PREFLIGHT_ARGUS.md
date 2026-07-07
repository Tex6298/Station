# PR503 - Station Press / Portable Publication Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-07

Status: Open hostile preflight

## Why This Lane

PR500D social credential hosted proof is externally blocked on hosted
`SOCIAL_CONNECTOR_CREDENTIAL_ENCRYPTION_KEY`.

PR502B owner encounter hosted proof is externally blocked on the explicit
Railway `@station/api` opt-in flag:

```text
PERSONA_ENCOUNTER_ALLOW_PLATFORM_NVIDIA_PRIVATE_CONTEXT=true
```

PR488 background-job activation remains blocked on queue-capable runtime proof.
PR484J-N archive connector hosted setup remains blocked on live hosted provider
setup.

MIMIR should not spin DAEDALUS on blocked config lanes or deepen the nearest
surface by inertia. The next honest customer-facing product surface with enough
repo evidence to preflight is Station Press / portable publication packaging:
a future-facing publishing/export capability repeatedly named in the docs but
not yet opened as its own product boundary.

This is a preflight only. Do not implement Station Press in this lane.

## Current Repo Evidence To Inspect

ARGUS should inspect, at minimum:

- existing publishing approval and document version surfaces;
- public document, Space document, and linked discussion readbacks;
- owner workspace/persona/project export package readbacks;
- export package privacy, manifest, and bundle boundaries;
- Station Assistant publishing/export guidance;
- billing and token-credit boundaries only for no-drift;
- background-job blocker truth from PR488;
- any existing docs that park PDF, binary archive, print, or Station Press.

Suggested starting points:

- `apps/api/src/routes/publishing-approvals.ts`
- `apps/api/src/services/publishing-approval.service.ts`
- `apps/api/src/routes/exports.ts`
- `apps/api/src/services/export-package.service.ts`
- `apps/web/components/studio/publishing-dashboard.tsx`
- `apps/web/app/studio/export/page.tsx`
- `apps/web/lib/export-trust.ts`
- `apps/web/lib/publishing.ts`
- `docs/roadmap/PR483_WORKSPACE_EXPORT_PRODUCT_DEPTH_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR496_WORKSPACE_EXPORT_PACKAGE_CONTRACT_CLOSEOUT.md`
- `docs/roadmap/PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_RESULT.md`
- `docs/roadmap/PR488_BACKGROUND_JOB_ACTIVATION_BLOCKER_MIMIR.md`
- `docs/roadmap/STATION_LAUNCH_CORE_PATCH.md`

## Preflight Questions

ARGUS should answer directly:

- Is there a safe first Station Press slice now, or is the capability blocked by
  PDF/binary generation, print/provider decisions, queue-capable jobs, or
  commercial packaging?
- If safe, should the first slice be an owner-only Station Press readiness gate,
  a portable publication package scope readback, a publication manifest
  contract, a public-safe publication collection readback, or something else?
- Which accepted existing artifacts can be reused without widening scope:
  published documents, approval events, public document readback, linked
  discussion metadata, export manifests, portable bundles, workspace export
  readback, or seminar publication records?
- What must stay private or owner-only?
- What exact validation and ARIADNE hosted rehearsal would be required if a
  visible owner or public route changes?

## Candidate Outcomes

Return exactly one:

```text
ACCEPT_PR503A_STATION_PRESS_READINESS_GATE
ACCEPT_PR503A_PORTABLE_PUBLICATION_PACKAGE_SCOPE
ACCEPT_PR503A_PUBLICATION_MANIFEST_CONTRACT
BLOCKED_NEEDS_QUEUE_CAPABLE_CONFIG
BLOCKED_NEEDS_PRODUCT_OR_PROVIDER_DECISION
REJECT_DEFER_NO_SAFE_STATION_PRESS_SLICE
NEEDS_MIMIR_DECISION
```

If accepted, wake DAEDALUS with exact implementation boundary, touched files,
tests, privacy rules, no-drift rules, and ARIADNE rehearsal requirement if any
visible UI or public route changes.

If blocked or rejected, wake MIMIR with the concrete blocker and the next
smallest honest customer-facing lane, if one exists.

## Guardrails

Do not open or implement:

- PDF generation;
- binary/archive generator changes;
- print-on-demand or physical fulfillment;
- external provider calls;
- billing, Stripe, invoices, tax, or pricing changes;
- social dispatch;
- scheduled publishing workers;
- worker/queue activation;
- Redis Memory truth;
- Cloudflare runtime;
- new public launch claims;
- broad export redesign;
- broad publishing dashboard redesign;
- private source body exposure;
- public prior-version history;
- restore/revert/delete mutation changes.

Do not expose:

- private source bodies;
- full transcripts;
- raw archive payloads;
- raw owner, persona, source, file, import, export, document, thread, or
  approval ids in visible display text;
- storage paths or signed URLs;
- DB URLs;
- provider payloads;
- stack traces, SQL details, cookies, tokens, API keys, webhook secrets,
  bearer/JWT-shaped values, or secret-shaped values.

## Validation

Preflight should remain docs-only unless ARGUS needs a focused inspection
script. Run:

```bash
git diff --check
git diff --cached --check
```

If ARGUS runs focused existing tests while classifying the boundary, record only
the command names and sanitized pass/fail truth.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- PR500D social credential hosted proof is blocked on hosted social encryption config.
- PR502B owner encounter hosted proof is blocked on the explicit Railway @station/api encounter NVIDIA private-context flag.
- PR488 background-job activation and PR484J-N archive connector hosted setup remain config/proof blocked.
- MIMIR is opening the next distinct customer-facing product boundary instead of spinning on blocked config lanes.
Task:
- Hostile-preflight Station Press / portable publication packaging as PR503.
- Decide whether a safe first slice exists now, or whether Station Press is blocked by queue-capable jobs, PDF/binary/print/provider/commercial decisions, or lack of safe product boundary.
- If accepted, wake DAEDALUS with the exact PR503A implementation boundary.
- If blocked/rejected, wake MIMIR with the concrete blocker and next smallest honest customer-facing lane, if one exists.
Guardrails:
- Do not implement Station Press in this preflight.
- Do not open PDF generation, binary archive generation, print fulfillment, provider calls, billing/Stripe/pricing, social dispatch, scheduled publishing workers, queue/worker activation, Redis Memory truth, Cloudflare runtime, public launch claims, broad export/publishing redesign, private source exposure, public prior-version history, or restore/revert/delete mutation changes.
```
