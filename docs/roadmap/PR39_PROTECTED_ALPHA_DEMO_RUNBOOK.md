# PR39 - Protected-Alpha Demo Runbook

Date: 2026-06-18
Status: opened for ARIADNE
Owner: ARIADNE drafts, MIMIR closes, DAEDALUS fixes exact blockers only.

## Purpose

Turn the PR38 protected-alpha rehearsal into a ready-to-run human demo package:
what to show, in what order, what to say while waits happen, what public proof
URLs to use, and what caveats must be framed honestly.

This is the bridge from "the route passed" to "a human can run it without
guessing."

## Inputs

- `docs/roadmap/PR38_FINAL_HUMAN_DEMO_REHEARSAL.md`
- `docs/roadmap/PR38_FINAL_HUMAN_DEMO_REHEARSAL_ARIADNE.md`
- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`

## Scope

ARIADNE should produce a compact demo operator pack that includes:

- a 2-minute framing script for protected-alpha replay;
- the exact route order for a live human run;
- the seeded account role and public/anonymous boundary notes without printing
  secrets;
- the PR38 public document and discussion URLs;
- what to narrate during chat/provider latency and status events;
- what to show for Studio, Continuity, Archive, export, publishing, discussion,
  Station Assistant, and Developer Space;
- a short "do not claim" list for caveats and unfinished polish;
- post-demo next-lane recommendations, ordered by product value and evidence.

Use human-eye judgement, not a broad bug hunt. If a page is already proven by
PR38, summarize the route and only re-open it if the live page now behaves
differently.

## Non-Scope

- Do not redesign the app.
- Do not add code unless a fresh blocker appears.
- Do not request Cloudflare config unless a concrete retrieval, latency,
  public-edge delivery, or NESTstyle-memory defect appears.
- Do not request new provider, Stripe, Redis, Supabase, or Railway config for
  this runbook unless the demo cannot run with current staging.
- Do not turn this into a general product strategy document.

## Output

Write:

`docs/roadmap/PR39_PROTECTED_ALPHA_DEMO_RUNBOOK_ARIADNE.md`

If the runbook is ready, wake MIMIR with:

- demo-runbook ready verdict;
- route order;
- caveats that must be spoken aloud;
- recommended next implementation lane.

If a live blocker appears, wake DAEDALUS with:

- exact route;
- viewport;
- account role;
- action;
- expected result;
- actual result;
- narrowest fix.
