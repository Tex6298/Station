# Staging demo readiness review - ARIADNE

Date: 2026-06-12

Owner: ARIADNE, A4 UX Navigator

## Verdict

Station is ready for a seeded human staging demo that stays within the accepted
non-paid replay scope.

No concrete code or security blocker surfaced in this review. The current
evidence is enough to stop reopening backend infrastructure by assumption:
Railway web/API are live, staging setup is accepted, seeded replay data exists,
retrieval and context-preview checks are accepted, browser/mobile surfaces have
been walked, export bundle readback is accepted, and non-zero-token LLM
observability is accepted.

The exact remaining demo blocker is paid subscription activation. If the demo
must show a paid tier becoming active, someone must complete a real hosted
Stripe test-mode Checkout payment for the replay owner or provide a signed
Stripe test event that mutates the subscription state. The current accepted
truth is that billing configuration and Checkout/Portal/webhook smoke are
present, but the replay owner still has no active subscription.

## Read First

This review is based on:

- `docs/roadmap/ACTIVE_STATUS.md`
- `docs/ops/STAGING_REPLAY_READINESS.md`
- `docs/roadmap/STAGING_BROWSER_UX_WALKTHROUGH_ARIADNE.md`
- `docs/testing/VALIDATION_BASELINE.md`
- accepted export-bundle evidence in Active Status
- code-tied replay evidence from REPLAY-OPT-04

The older `.station-agents/inbox/A4/post-v3-ui-ux-handoff.md` item remains
historical context only.

## Demo Route Sequence

Use this as the first human rehearsal path. Capture friction and missing story
beats, not private payloads.

1. Preflight API readiness:
   - API `/health`
   - API `/health/deployment`
   - Confirm the served Git SHA is at or after the accepted deployment identity
     patch when using the timing evidence.
2. Public front door:
   - Web `/`
   - Web `/discover`
   - Confirm public entry explains Discover, Spaces, Forums, and Developer
     Spaces without exposing private Studio material.
3. Public Station surfaces:
   - Public Space at `/space/:slug`
   - Public document at `/space/:slug/documents/:documentId`
   - Forum list or discussion at `/forums` or `/forums/:categorySlug/:threadId`
   - Developer Space observatory at `/developer-spaces/:slug`
4. Sign in as the replay owner:
   - Web `/login`
   - Confirm redirect/session restore to `/studio`.
5. Private Studio orientation:
   - Web `/studio`
   - Confirm the user understands they are in the private Studio, not a public
     profile.
   - On mobile, confirm the Studio navigation disclosure is reachable and named.
6. Persona workspace:
   - Web `/studio/personas/:personaId`
   - Confirm Runtime Context, active conversation, memory/canon affordances, and
     owner-only export status read as continuity infrastructure.
7. Persona archive:
   - Web `/studio/personas/:personaId/files`
   - Confirm archive/library, private source handling, storage/quota copy,
     import status, and export status support the idea that archive is trust
     infrastructure.
8. Continuity surfaces:
   - Web `/studio/personas/:personaId/continuity`
   - Web `/studio/personas/:personaId/memory`
   - Web `/studio/personas/:personaId/canon`
   - Confirm continuity feels like the paid value accumulating over time, not a
     generic notes dashboard.
9. Export trust path:
   - Owner persona export status/readback from the persona surface.
   - API `/exports/persona/:personaId`
   - API `/exports/:id`
   - API `/exports/:id/bundle`
   - Keep the claim bounded to owner-only JSON/Markdown manifest and bundle
     readback. Do not imply PDF export, binary archive export, full workspace
     export, background workers, or retry infrastructure.
10. Public presentation and community:
    - Web `/space/:slug`
    - Web `/space/:slug/documents/:documentId`
    - Web `/forums`
    - Confirm private Studio, community participation, and public presentation
      remain visibly distinct.
11. Developer Space owner/researcher path:
    - Public `/developer-spaces/:slug`
    - Owner `/developer-spaces/:slug/manage`
    - Confirm the space feels like a live observatory, not a generic dashboard.
    - Do not show or capture API keys.
12. Billing:
    - Web `/billing`
    - API `/billing/me`
    - Checkout/Portal can be smoke-tested in Stripe test mode if desired.
    - Do not claim paid activation unless the external Checkout payment or
      signed webhook/event proof has actually happened.
13. Observability:
    - API `/observability/summary`
    - API `/observability/traces`
    - Capture provider/model/token/duration/cost labels and status counts only.
      Do not capture prompts, completions, private excerpts, raw response
      bodies, owner IDs, persona IDs, trace IDs, tokens, cookies, or credentials.
14. Mobile spot check:
    - `/`
    - `/discover`
    - `/studio`
    - `/studio/personas/:personaId/files`
    - `/space/:slug/documents/:documentId`
    - `/developer-spaces/:slug`
    - Confirm no document-level horizontal overflow and that the next action is
      obvious on the replay path.

## Demo-Ready Truth

- Public Discover, Space, document, forum, and Developer Space observatory
  routes are reachable and public-safe in the accepted browser walkthrough.
- Sign-in, session restore, Studio, persona workspace, persona archive,
  billing, and export workspace are reachable for the replay owner.
- UX-EXPORT-01 corrected the old `/studio/export` overpromise enough for this
  staging slice. The live export claim remains per-persona and Developer Space
  JSON/Markdown readback, not full workspace export.
- DISCOVER-ONBOARD-01 corrected the public-route and anonymous-search mismatch
  enough for this staging slice.
- DEVSPACE-STORY-01 and STUDIO-A11Y-01 are accepted enough for this seeded demo
  pass.
- LLM observability has non-zero-token proof with provider/model/token/cost
  labels, without storing prompts or completions.

## Exact Blockers And Friction

Paid activation:

- Stripe paid activation is the only active external demo blocker if paid
  activation is part of the demo.
- Required proof is a hosted Stripe test-mode Checkout payment by the replay
  owner or a real signed Stripe test event that mutates the replay owner's
  subscription state.

Timing evidence:

- REPLAY-OPT-04 is code-tied and sanitized.
- It proves the deployment identity field is live and replay-safe checks still
  pass.
- It is not a performance-win claim. Do not describe it as a latency improvement
  without broader before/after samples.

Infrastructure:

- Redis, Cloudflare, background jobs, and full workspace export remain future
  lanes.
- Do not open those lanes from assumption. Open them only if rehearsal evidence
  shows a specific demo or product failure that needs them.

Export:

- Export is accepted as owner-only JSON/Markdown bundle readback with manifests,
  hashes, byte counts, and privacy notes.
- PDF/binary archive export, global workspace export, background jobs, retry
  workflows, and partner-grade export polish remain future work.

Observability:

- The non-zero-token proof is narrow and acceptable.
- The two-trace/status-capture hygiene issue is not a demo blocker unless MIMIR
  decides exact one-call replay ergonomics are demo-critical.

## Evidence Rules

Capture:

- route labels
- status codes
- source-type counts
- retrieval mode
- skipped-source counts
- provider/model/token/cost labels
- sanitized timings
- human UX notes

Do not capture:

- prompts or completions
- private excerpts
- raw response bodies
- owner, persona, export, trace, or customer IDs
- tokens, cookies, API keys, webhook secrets, or credentials
- replay corpus text

## Recommended Next Product Lane

Open `STAGING-DEMO-RUN-01`: a human staging walkthrough rehearsal.

Goal:

- Run the route sequence once with the seeded replay owner.
- Decide up front whether paid activation is in or out of scope.
- If paid activation is in scope, complete the external Stripe action first.
- Capture only product friction, demo narrative gaps, and any concrete code or
  security blockers found during the run.

Acceptance:

- The route sequence completes without privacy leakage.
- Paid activation is either explicitly excluded or proven by the external
  Stripe action.
- Any new backend lane is tied to observed demo evidence, not assumption.
- MIMIR receives a short product verdict and the next narrow lane.
