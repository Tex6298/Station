# PR322 - Protected-Alpha Demo Refresh After Public Persona Closeout

Owner: A4 / ARIADNE

Opened by: A1 / MIMIR

Date: 2026-06-26

Status: Open

## Why

PR321 closes the Phase 3 public persona internal pilot for the bounded hosted
replay lane. That closeout deliberately does not open anonymous public chat,
external launch, commercial packaging, partner claims, provider/model work,
Redis, Cloudflare, workers, queues, durable visitor transcripts, visitor
analytics, broad moderation redesign, or broad UI redesign.

That does not mean Station has no next job. The next safe product axis is an
internal protected-alpha demo posture refresh: check whether the current
Station story still reads coherently after the material public-persona
chat/report/admin-moderation evidence landed, then route only concrete defects.

This is not public launch. This is not a new implementation lane. This is
ARIADNE using the human eye to decide whether the protected-alpha journey is
coherent now.

## Read First

- `docs/roadmap/PR311_PROTECTED_ALPHA_DEMO_REFRESH_AFTER_MEMORY_PROOF_RESULT.md`
- `docs/roadmap/PR315_PUBLIC_PERSONA_PILOT_TESTER_ACCESS_RERUN_RESULT.md`
- `docs/roadmap/PR316_PUBLIC_PERSONA_REPORT_PATH_REHEARSAL_RESULT.md`
- `docs/roadmap/PR319_PUBLIC_PERSONA_REPORT_MODERATION_HOSTED_REHEARSAL_RESULT.md`
- `docs/roadmap/PR320_POST_PR319_PHASE3_BOUNDARY_RESULT.md`
- `docs/roadmap/PR321_PUBLIC_PERSONA_INTERNAL_PILOT_CLOSEOUT_MIMIR.md`
- `docs/roadmap/STATION_UI_UX_ROADMAP.md`
- `docs/ops/triad/ARIADNE_UX_NAVIGATOR.md`

## Hosted Targets

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

Use existing local replay aliases if sign-in is needed. Do not print, commit,
or record credentials, cookies, bearer tokens, env values, raw ids, private
route bodies, prompts, completions, provider payloads, source bodies, hosted
logs, SQL, billing identifiers, or secret-shaped values.

## Task

Run a human-eye protected-alpha demo refresh against hosted Station.

Check whether a prepared internal demo can honestly explain:

- private Studio continuity work;
- Memory, Continuity, Archive, Canon, Integrity, and runtime provenance;
- public persona interaction proof and its limits;
- public report/moderation readback proof and its limits;
- public Discover, public Space/document/discussion, Forums, and Developer
  Space presentation;
- Billing/account readback as test/protected-alpha state only;
- what is still caveated before public launch, commercial packaging, partner
  use, anonymous chat, or production claims.

## Required Journey

Check these as routeable human flows, not as a raw API audit:

- Hosted freshness: web/API health and deployment readiness. If docs-only
  commits are ahead of hosted runtime, say that clearly and verify the hosted
  runtime still includes the latest product-code commits needed for the checked
  route behavior.
- Owner session: replay owner can reach Studio without exposing secrets or
  private payloads.
- Private Studio: dashboard, intended replay persona, Memory, Continuity,
  Archive/import trust, export/readback, Integrity entry point, Billing, and
  Settings/observability if routeable.
- Public chain: public front door or Discover to public Space, public document,
  and linked discussion if routeable from UI.
- Public persona: existing public persona readback and public interaction
  caveats are understandable. Do not imply anonymous chat or durable transcript
  storage.
- Moderation/readback: if the existing admin replay alias is available, verify
  the human moderation route remains understandable for persona reports. If not
  available, do not block the whole demo; record that admin moderation was
  covered by PR319 historical evidence only.
- Developer Space: public observatory and owner/manage contrast remain clear.
- Mobile: check a narrow viewport for the main private and public story stops.

## Explicit Defects To Look For

Flag concrete defects, with next owner:

- live-looking buttons or filters that do not respond and are not honestly
  disabled or preview-only;
- a route that dead-ends the human journey or requires a raw URL a user would
  not know;
- a page that visually feels generic enough to weaken Station's product story;
- public/private boundary confusion;
- overclaiming public launch, anonymous access, durable transcript storage,
  commercial readiness, partner readiness, or provider/model quality;
- owner-only Memory, Archive, Continuity, report, billing, trace, or source
  material leaking into public surfaces;
- desktop or mobile overflow, clipped labels, unreadable controls, or noisy
  empty/loading states.

## Non-Scope

Do not:

- implement product code unless MIMIR separately opens a repair lane;
- run Stripe Checkout, portal, billing mutations, key rotation, import/export
  mutations, provider probes, or destructive actions;
- open anonymous public chat, external public pilot, public launch copy,
  commercial packaging, partner claims, durable visitor transcripts, visitor
  analytics, Redis, Cloudflare, workers, queues, provider/model work,
  embeddings, migrations, schema, auth/session redesign, or broad UI redesign;
- assign broad manual checking back to Marty.

## Output

Create:

```text
docs/roadmap/PR322_PROTECTED_ALPHA_DEMO_REFRESH_AFTER_PUBLIC_PERSONA_CLOSEOUT_RESULT.md
```

Use one verdict:

- `PASS`: protected-alpha demo posture is coherent enough after PR321.
- `PASS WITH CAVEATS`: coherent, with bounded defects or caveats.
- `FAIL`: concrete visible/product defect needs DAEDALUS, ARGUS, or MIMIR.
- `BLOCKED`: name the smallest unblocker without exposing secrets.

Always include:

- hosted freshness and route list;
- desktop/mobile conditions;
- public/private boundary result;
- whether admin moderation was freshly checked or only carried as PR319
  historical proof;
- exact next owner recommendation;
- whether Marty config/input is needed.

## Validation

If review-only:

- record hosted routes/screens visited;
- record that no product code changed;
- run `git diff --check` and `git diff --cached --check`.

If ARIADNE makes a small UI/copy patch, run focused checks for touched files
and wake ARGUS for review before MIMIR.

## Wake MIMIR

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR322 protected-alpha demo refresh after public persona closeout.
- Verdict: PASS / PASS WITH CAVEATS / FAIL / BLOCKED.
- Result doc: docs/roadmap/PR322_PROTECTED_ALPHA_DEMO_REFRESH_AFTER_PUBLIC_PERSONA_CLOSEOUT_RESULT.md.
Findings:
- ...
Recommendation:
- ...
Task:
- Close PR322, route the exact repair, or ask Marty the exact product decision.
```

If ARIADNE finds a code/security blocker, wake DAEDALUS or ARGUS directly with
the exact bounded defect and acceptance criteria.
