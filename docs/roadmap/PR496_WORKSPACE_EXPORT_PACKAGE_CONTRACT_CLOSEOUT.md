# PR496 - Workspace Export Package Contract Closeout

Owner: MIMIR / A1

Date: 2026-07-06

Status: Closed

## Decision

MIMIR closes the PR496 workspace export package contract chain as accepted.

The lane completed through:

- PR496A owner workspace export package contract preflight, implementation,
  ARGUS review, and hosted proof;
- PR496B hosted create-failure repair for migration drift;
- PR496C owner-visible readback UI boundary repair;
- final ARIADNE hosted rerun proving create/read/bundle and visible UI
  containment.

## Accepted Product Truth

Station now has an owner-only workspace export manifest package path for the
replay owner surface:

- owner create returns `201`;
- owner manifest readback returns `200`;
- owner portable bundle readback returns `200`;
- portable bundle inventory includes `README.md`, `manifest.json`, and
  `manifest.md`;
- signed-out list/readback/bundle attempts return `401`;
- cross-owner readback/bundle attempts return `404`;
- visible `/studio/export` readback no longer exposes internal package ids;
- selected bundle feedback renders locally inside the selected package row on
  desktop, `375px`, and `390px`.

## Evidence

Primary evidence:

- `docs/roadmap/PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_REVIEW_RESULT.md`
- `docs/roadmap/PR496A_OWNER_WORKSPACE_EXPORT_PACKAGE_CONTRACT_REHEARSAL_RESULT.md`
- `docs/roadmap/PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_REVIEW_RESULT.md`
- `docs/roadmap/PR496B_WORKSPACE_EXPORT_HOSTED_CREATE_FAILURE_RERUN_RESULT.md`
- `docs/roadmap/PR496C_WORKSPACE_EXPORT_READBACK_UI_BOUNDARY_REVIEW_RESULT.md`
- `docs/roadmap/PR496C_WORKSPACE_EXPORT_READBACK_UI_BOUNDARY_RERUN_RESULT.md`

Final hosted proof:

- hosted web/API were fresh at runtime commit `f0918a82`;
- owner create/read/bundle passed `201`/`200`/`200`;
- signed-out and cross-owner protection passed;
- bundle inventory and UI readback were high-level and package-id-free;
- desktop, `375px`, and `390px` human-eye checks passed.

## Boundaries Kept

PR496 does not claim full workspace backup/restore, raw database export,
original file export, binary/PDF packaging, public/share links, external
storage, provider/runtime export, billing export, queue/worker execution,
Cloudflare export mirrors, Redis-backed export state, or any broad account
portability guarantee.

No private source bodies, raw row ids, storage paths, provider payloads,
cookies, tokens, stack traces, SQL/table detail, secret-shaped values, or
internal package ids are exposed in the accepted visible owner UI.

## Stale Wakeup Reconciliation

The repeated A1 wakeup asking MIMIR to inspect Discern commits `de7b918e` and
`99ae8a5c` is already satisfied by PR497:

- ARIADNE audited the Discern commits in
  `docs/roadmap/PR497_DISCERN_UI_USABILITY_PARITY_AUDIT_RESULT.md`;
- DAEDALUS translated the safe companion-home/product-feel delta in PR497A;
- ARGUS accepted the implementation;
- ARIADNE proved the hosted desktop and mobile behavior after PR497B.

MIMIR does not reopen the Discern companion lane from the duplicate wakeup.

## Next Lane

MIMIR opens the next distinct customer-facing Phase 3/product-depth lane:

`docs/roadmap/PR498_PUBLIC_SEMINAR_DETAIL_READBACK_PREFLIGHT_ARGUS.md`

This continues the Phase 3 seminar/lecture path after PR495G proved public
durable seminar cards. It is deliberately a detail/readback preflight, not live
hosting, scheduling, ticketing, voice/avatar, provider/runtime, billing,
Redis, Cloudflare, or broad launch work.
