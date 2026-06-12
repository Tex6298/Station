# Staging demo narrative run-of-show - ARIADNE

Date: 2026-06-12

Owner: ARIADNE, A4 UX Navigator

## Verdict

The accepted non-paid staging route is ready to become a human run-of-show.

This document is not a new roadmap and does not widen scope. It translates the
accepted staging/browser evidence into a demo narrative that keeps Station's
product promise clear without overclaiming infrastructure, billing, export, or
performance readiness.

## Opening Claim

Station is a private continuity studio with public presentation and community
surfaces attached to it.

This demo shows one bounded staging path:

- public discovery;
- a public Space and document;
- managed discussion;
- a live Developer Space observatory;
- private Studio;
- persona Memory, Continuity, and Archive;
- owner-only export readback;
- billing status;
- operational observability.

Say:

```text
This is a staging demo of Station's continuity path, with billing shown only as
bounded Stripe test-mode proof. The important thing to watch is the boundary
between private Studio work, public presentation, managed community, and live
Developer Space observability.
```

## Route Order

1. Public front door: `/`
2. Discover: `/discover`
3. Public Space: `/space/station-replay-alpha`
4. Public document: public document inside the replay Space
5. Forum discussion: linked public discussion
6. Public Developer Space: `/developer-spaces/station-replay-dev-alpha`
7. Login as replay owner
8. Studio home: `/studio`
9. Persona workspace
10. Persona Memory
11. Persona Continuity
12. Persona Archive
13. Export Workspace or persona export readback
14. Developer Space manage
15. Billing
16. Settings observability
17. Optional mobile check: Studio, Memory, Archive

## Story Beats

Public entry:

- Show that Station has a public front door without exposing private Studio
  material.
- Use Discover as the orientation layer, not as proof of private search.
- Transition: "Now we move from the public face into an owned public Space."

Public Space and document:

- Frame Spaces as public microsites, not profiles.
- Show the public document as authored/published presentation.
- Show discussion as managed community attached to public material.
- Transition: "That is the public layer. The private continuity work happens
  behind it."

Developer Space:

- Frame Developer Spaces as live observatories, not generic dashboards.
- Show public node/event/snapshot presence.
- Transition: "The public observatory is separate from the owner console."

Studio:

- Frame Studio as the private continuity workspace.
- Emphasize that private work, public presentation, and community participation
  are structurally distinct.
- Transition: "Now we look at how continuity accumulates."

Memory and Continuity:

- Show Memory and Continuity as the core paid-value direction: durable context
  accumulating over time.
- Treat seeded text as private even if synthetic. Do not read private body text
  aloud unless Marty explicitly approves.
- Safe evidence: route completion, counts, active/rejected lifecycle labels, and
  visible absence of errors.
- Transition: "Archive is the trust layer underneath this."

Archive:

- Frame archive as trust infrastructure.
- Show the Archive surface and status/readback posture.
- Be honest that the visible import/status story is still thin in this seeded
  demo.
- Transition: "If continuity is valuable, the owner also needs an exit/readback
  path."

Export:

- Show owner-only persona export/readback.
- Safe claim: JSON/Markdown bundle readback with manifests is accepted.
- Do not claim full workspace export, PDF export, binary archive export,
  background workers, or retry infrastructure.
- Transition: "Entitlements are visible; paid activation is test-mode proof, not
  a live-money claim."

Billing:

- Show plan/status only unless the run is explicitly using the accepted
  `STAGING-DEMO-STRIPE-01` proof.
- If using the Stripe proof, frame it as hosted Stripe test-mode activation for
  the replay owner only.
- Do not show Checkout URLs, Stripe IDs, customer IDs, subscription IDs, webhook
  bodies, secrets, or payment details.
- Do not imply live-money billing or production billing readiness.

Observability:

- Show Settings observability as operational infrastructure.
- Safe evidence: trace count, token count, cost summary, and completed status.
- Do not show prompts, completions, raw trace bodies, or trace IDs.
- Transition: "This closes the staging path: public face, private continuity,
  owner readback, operational proof."

Mobile:

- Use mobile only as a confidence pass, not a second full demo.
- Show that Studio, Memory, and Archive fit without horizontal overflow.

## Transition Language

Use these short transitions:

- "Public first, private next."
- "A Space is a microsite, not a profile."
- "The archive is the trust layer, not a file dump."
- "Continuity is the paid value: the system remembers with owner-visible
  grounding."
- "Developer Spaces are observatories: visitors can see live state without
  getting owner controls."
- "Billing is visible here; paid activation is bounded to Stripe test mode for
  this staging run."

Avoid corporate SaaS framing:

- Do not call Studio a dashboard.
- Do not call Spaces profiles.
- Do not call Developer Spaces dashboards.
- Do not call Station Assistant a persona.

## Safe Evidence To Show

Safe:

- route completion;
- public page rendering;
- public Space/document/discussion;
- Developer Space node/event/snapshot counts;
- Memory and Continuity route success;
- lifecycle labels such as active/rejected;
- Archive and export status;
- export bundle file count;
- billing tier/status and, if ARGUS accepts `STAGING-DEMO-STRIPE-01`, active
  test-mode subscription presence;
- observability trace/token/cost counts;
- mobile no-overflow checks.

Do not show or capture:

- private excerpts;
- prompts or completions;
- raw response bodies;
- Checkout URLs or paths;
- webhook payload bodies;
- customer or subscription IDs;
- owner/persona/export/trace/customer IDs;
- tokens, cookies, keys, credentials;
- replay corpus text;
- raw Developer Space snapshots;
- manifest bodies.

## Claims To Avoid

Do not claim:

- performance win from REPLAY-OPT-04;
- live-money billing or production paid activation;
- active subscription state outside the replay owner's accepted test-mode proof;
- full workspace export;
- PDF/binary archive export;
- Redis runtime dependency;
- Cloudflare runtime dependency;
- background-job infrastructure;
- production readiness beyond accepted staging/demo scope;
- broad production search quality;
- IntelHub CTI, exposure, recon, finance, or other imported scope.

Use the bounded version instead:

- REPLAY-OPT-04 is code-tied and sanitized, not a performance win.
- Paid activation is bounded to the replay owner's ARGUS-accepted hosted Stripe
  test-mode proof.
- Export is owner-only JSON/Markdown readback for this slice.
- Redis, Cloudflare, background jobs, and full workspace export are future lanes
  unless new evidence demands them.
- This is a staging demo of the continuity path with optional test-mode billing
  proof.

## Contingencies

If billing comes up:

- Say: "Billing configuration and status are present. The replay owner has a
  bounded Stripe test-mode activation proof; this is not live-money or
  production billing readiness."

If export comes up:

- Say: "This proves owner-only JSON/Markdown readback, not full workspace or PDF
  export."

If performance comes up:

- Say: "We have code-tied timing evidence, but not a performance-win claim."

If production readiness comes up:

- Say: "This path is browser-clean for staging demo scope. Production readiness
  needs separate launch gates."

## Recommended Next Lane

Open `STAGING-DEMO-HUMAN-01`.

Purpose:

- Run this script once with Marty as a human demo rehearsal.
- Capture only user-facing friction, narrative gaps, missed transitions, and
  concrete blockers.
- Include billing only as the ARGUS-accepted bounded Stripe test-mode proof for
  the replay owner.

Acceptance:

- The run reaches every route in order.
- The narrator can explain private/community/public boundaries without
  correction.
- No forbidden claims are made.
- Any follow-up lane is based on observed demo evidence.
