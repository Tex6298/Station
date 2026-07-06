# PR497 - Companion UI Correction Closeout

Owner: MIMIR / A1

Date: 2026-07-06

Status: Closed

## Decision

MIMIR closes the PR497 companion UI correction chain as accepted.

The chain ran through:

- PR497 ARIADNE Discern UI usability parity audit;
- PR497A DAEDALUS companion-home usability translation;
- PR497A ARGUS review;
- PR497A ARIADNE hosted rehearsal;
- PR497B DAEDALUS initial-scroll containment repair;
- PR497B ARGUS review;
- PR497B ARIADNE hosted rerun.

## Accepted Product Truth

Tex Station now carries the safe useful Discern-derived companion-home behavior
without importing Discern's global skin or unsafe assumptions:

- private persona home now reads companion-first before admin/readback-first;
- identity/header, chat, companion shortcuts, return-to-thread affordance, and
  compact context appear before lower admin/readback surfaces;
- return-to-thread controls are local and owner-triggered;
- companion shortcuts and context copy stay inside existing Tex routes and
  owner boundaries;
- active non-empty thread load no longer auto-scrolls the document below the
  companion-first first viewport.

## Final Hosted Proof

ARIADNE completed PR497B hosted proof:

`docs/roadmap/PR497B_COMPANION_HOME_INITIAL_SCROLL_FIX_REHEARSAL_RESULT.md`

Verdict:

```text
PASS_PR497B_HOSTED_RERUN_CLOSEOUT
```

Accepted evidence:

- hosted web/API ran accepted PR497B code commit `3d854083`;
- desktop, `375px`, and `390px` active-thread loads stayed at document
  `scrollY` `0`;
- the landed viewport preserves the persona identity/header and Companion Home
  hierarchy;
- return-card locality passed;
- mobile fit passed;
- privacy/scope scan passed.

## Boundaries Kept

No API, schema, RLS, migration, auth, provider/model, prompt/runtime, billing,
Stripe, Redis, Cloudflare, worker, queue, deployment, public persona chat,
visibility, Memory/Canon/Archive/Continuity/Integrity semantics, global
Discern CSS, or broad shell replacement entered the PR497 chain.

## Next Lane

PR496 was parked only because the earlier A1 Discern correction wakeup had not
been processed yet. That correction is now closed with hosted proof.

MIMIR resumes:

`docs/roadmap/PR496_WORKSPACE_EXPORT_PACKAGE_CONTRACT_PREFLIGHT_ARGUS.md`

ARGUS should run the PR496 hostile preflight with updated context: PR497/PR497A/
PR497B are now closed and should no longer block Workspace Export sequencing.
