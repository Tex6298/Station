# PR408 - Staging Demo Browser Rehearsal Result

Date: 2026-06-27
Owner: ARIADNE
Verdict: PASS WITH CAVEATS

## Freshness

Hosted web and API deployment health both reported ready at commit prefix
`c4b077d62824`.

- Web requirement: at or after `d62f4e2c`.
- API requirement: at or after `c4b077d6`.

## Browser Routes Checked

Public/signed-out desktop:

- `/`
- `/discover`
- `/space/<route-safe-slug>`
- `/space/<route-safe-slug>/documents/<document>`
- `/forums/<category>/<thread>`
- `/forums`
- `/developer-spaces/<route-safe-slug>`

Signed-in replay owner desktop:

- `/login` to `/studio` session restore.
- `/studio`
- `/studio/personas/<persona>`
- `/studio/personas/<persona>/memory`
- `/studio/personas/<persona>/continuity`
- `/studio/personas/<persona>/files`
- `/studio/publishing`
- `/studio/onboarding`
- `/billing`
- `/developer-spaces/<route-safe-slug>/manage`

Mobile 390px spot checks:

- `/`
- `/discover`
- `/space/<route-safe-slug>/documents/<document>`
- `/developer-spaces/<route-safe-slug>`
- `/studio`
- `/studio/personas/<persona>/files`
- `/studio/onboarding`
- `/billing`

## API Spot Checks

- Web `/health`: HTTP 200.
- Web `/health/deployment`: HTTP 200, ready.
- API `/health/deployment`: HTTP 200, ready.
- API `/billing/me`: HTTP 200 with limits.
- API `/exports/persona/<persona>`: HTTP 200 with existing packages.
- API `/exports/<package>`: HTTP 200 for an existing completed package.
- API `/exports/<package>/bundle`: HTTP 200 with three bundle files.
- API `/observability/summary`: HTTP 200 with coarse trace count.
- API `/observability/traces?limit=6`: HTTP 200 with six metadata rows.

## Findings

- Public front door, Discover, public Space/document, Forums, and public
  Developer Space routes completed without implying private Studio data is
  public.
- The sampled public Space/document/forum chain was routeable, and public
  readback/provenance cues were understandable at route level.
- Studio, persona workspace, Memory, Continuity, Archive/files, Onboarding,
  Billing, and owner Developer Space manage routes completed as signed-in
  replay owner.
- Studio reads as the private workbench, while the public Developer Space route
  reads as an observatory and the manage route reads as operator-facing.
- Memory, Continuity, Archive/files, and export readback present a coherent
  continuity/archive trust story at route level.
- Onboarding makes Fresh Start, Awakening, Document Migrator, and API Bridge
  choices visible.
- Billing loaded as a tier/limits surface; no Checkout or billing mutation was
  started.
- Desktop and 390px mobile spot checks had no document-level horizontal
  overflow, clipped primary controls, trapped navigation, or unreadable labels.

## Caveat

- `/studio/publishing` loaded and showed review/public language, but the sampled
  visible copy did not prominently include linked discussion, retract, or
  cleanup wording. This is a narrative clarity gap for the launch-core route
  story, not a route blocker and not a security/privacy concern.

## Safety

- No hosted mutation was performed.
- No publish, retract, delete, import, upload, key generation, Assistant send,
  forum post, Stripe Checkout, billing/settings change, or PR407 cleanup run was
  attempted.
- Observability spot checks used summary/list metadata only and did not record
  raw trace ids, prompts, completions, cookies, tokens, or secrets.
- This result records only route classes, HTTP statuses, coarse counts, visible
  labels, deployment prefixes, and sanitized UX friction.

## Validation

- Hosted Playwright browser route rehearsal.
- Read-only API spot checks.
- `git diff --check`

## Next

MIMIR can close PR408 as `PASS WITH CAVEATS` and decide whether the publishing
copy caveat should become a narrow DAEDALUS/ARIADNE follow-up or simply inform
the next launch-core route-story pass.
