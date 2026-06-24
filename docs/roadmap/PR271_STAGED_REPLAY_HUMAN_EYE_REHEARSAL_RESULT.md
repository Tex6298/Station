# PR271 - Staged Replay Human-Eye Rehearsal Result

Owner: A4 / ARIADNE
Status: pass with caveats
Date: 2026-06-24

## Verdict

PASS WITH CAVEATS.

The staged replay is coherent enough for MIMIR's next product/backend decision.
The owner path is routeable, session-stable, and legible as private Studio work;
the public paths preserve the boundary between private continuity/archive work,
community participation, and public presentation. The remaining issues are
bounded product-quality and content-state follow-ups, not blockers.

## Hosted Freshness

- Web `/health` returned `ok:true`.
- API `/health` returned `ok:true`.
- Web `/health/deployment` returned `ok:true`, `ready:true`, branch `main`,
  service `@station/web`, and commit prefix `c2cf0cb48ca7`.
- API `/health/deployment` returned `ok:true`, `ready:true`, branch `main`,
  service `@station/api`, and commit prefix `c2cf0cb48ca7`.

## Routes And Conditions

- Replay-owner desktop `1440x960`: Studio dashboard, replay persona home,
  Memory, Continuity/runtime context, Archive/import trust, Billing, and
  Developer Space owner console.
- Anonymous desktop `1440x960`: public home, Discover, Forums, Developer
  Spaces index, public Developer Space, and one routeable public content link
  opened from public navigation.
- Replay-owner mobile `390x844`: Studio dashboard, Continuity, Archive,
  Billing, public Developer Space as owner, Discover, and Forums.
- Anonymous mobile `390x844`: public Developer Space, Discover, and Forums.

No Stripe Checkout/test-card flow was started. No import, export, billing,
publishing, key, capability, or runtime mutation was performed.

## What Works

- Private Studio reads as owner-only continuity work, not a generic dashboard:
  the dashboard, persona tabs, Memory, Continuity, Archive, Integrity, and
  Assistant affordances are positioned clearly.
- Continuity/runtime context explains what feeds persona continuity without
  presenting private source material as magic or public truth.
- Archive trust makes owner-only source material, completed imports,
  needs-review state, and storage/quota readback visible without implying global
  Archive/Export completion.
- Billing is understandable and not dark-patterned: current plan, subscription
  status, entitlements, token-credit separation, and available plans are clear.
- Public Discover and Forums route cleanly and preserve the public/community
  distinction.
- Public Developer Space reads as a live observatory/readback surface, not a
  generic dashboard, and anonymous visitors do not see owner controls.
- Developer Space owner console preserves the boundary between ingestion keys,
  usage, evidence, exports, confirmations, and public observatory readback.
- Desktop and mobile checks found no page-level horizontal overflow, clipped
  primary controls, unreadable text, application crash, unresolved template text,
  bearer token, secret-shaped value, SQL/connection string, stack trace, hosted
  log, raw prompt, provider payload, or private route body.
- Station does not appear to import IntelHub CTI/exposure/recon/finance scope in
  these surfaced flows.

## Caveats

- DAEDALUS or MIMIR: Discover's right rail can remain in a `Persona Roulette /
  Drawing...` state after the rest of the page is ready. This is not blocking,
  but it should become either a resolved public item or an honest empty state
  before a polished demo.
- DAEDALUS or MIMIR: the public Developer Space shows data-backed readback, but
  the status badge can still read `Connecting`. If a persistent live connection
  is not guaranteed, consider relabeling this state around latest readback
  rather than live connection.
- DAEDALUS/content seed: one public forum category description contains a small
  encoding artifact around the provider-list dash. This is low severity but
  visible in the public forum list.
- MIMIR: global Archive/Export shells, downloadable bundles/workers, and richer
  public story density remain known post-foundation caveats. The owner Archive
  and Developer Space export/readback controls are visible, but this review did
  not open private manifests or copy private payloads.

## Recommendation

MIMIR can treat PR271 as accepted for staging with caveats. The smallest next
decision is whether to open a tiny DAEDALUS polish lane for the Discover loading
state, public Developer Space live/readback label, and forum content artifact,
or carry them as non-blocking demo notes while higher-priority staging lanes
continue.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr271-staged-replay-human-eye.spec.js --reporter=line --workers=1`
- Final pass used settled main-content waits and checked hosted desktop/mobile
  public and owner surfaces.
- Local screenshots were used for human-eye review only and are not committed.
- No product code changed.
