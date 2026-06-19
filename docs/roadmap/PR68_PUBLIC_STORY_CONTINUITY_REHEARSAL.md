# PR68 - Public Story Continuity Rehearsal

Date: 2026-06-19
Status: opened by MIMIR; ready for ARIADNE human rehearsal
Owner: ARIADNE rehearses, DAEDALUS fixes exact blockers only, MIMIR closes or
resequences.

## Purpose

Run one narrow public-facing proof after the accepted memory/observability
staging replay.

PR67 proved the signed owner can understand Memory, lifecycle, Continuity,
Integrity, Archive import review, Settings AI Activity, and Developer Space
observability. ARIADNE recommended that any next proof step should be a narrow
public Space/document/forum story-continuity check, not Redis, Cloudflare,
provider migration, parser/OAuth, worker, hosted runtime, Project, billing,
DexOS, or broad UI.

## Route

Use Railway staging:

```text
https://stationweb-production.up.railway.app
```

Rehearse primarily as an anonymous visitor, then use a signed replay owner only
where comparison is necessary.

Route order:

1. `/`
2. `/discover`
3. public Space for the replay persona
4. public document:
   `https://stationweb-production.up.railway.app/space/station-replay-alpha/documents/dce9dcdc-067e-488b-baae-b09c0541077f`
5. linked forum discussion:
   `https://stationweb-production.up.railway.app/forums/documents-and-codexes/ce8c1f39-41ec-42a0-9cce-1cf87e10cabf`
6. optional signed-owner comparison if a public/private boundary looks unclear

## Check

ARIADNE should judge this like a human visitor:

- Does the public story make sense from front door to Discover to Space to
  document to discussion?
- Are authorship, provenance, publication state, discussion context, and public
  boundaries clear enough for protected-alpha?
- Do visible buttons/links either navigate, change state, submit correctly, or
  make their disabled/preview state clear?
- Does anonymous public browsing avoid private Memory, Continuity, Integrity,
  Archive import, Settings AI Activity, Developer Space manage, owner console,
  provider, credential, raw trace, private archive, and replay-owner data?
- Does the route work at desktop and `390px` mobile without document-level
  horizontal overflow, offscreen controls, or application/auth errors?

## Non-Scope

- Do not redesign the public site broadly.
- Do not restyle every page.
- Do not add new public features.
- Do not add Redis, Cloudflare, provider migration, parser/OAuth, workers,
  hosted runtime, Project, billing, DexOS, or broad UI scope.
- Do not print secrets, cookies, credentials, private prompts, raw provider
  payloads, private archive text, private Memory, or private continuity content.
- Do not ask Marty to manually test this route.

## Blocker Handoff

If a concrete blocker appears, wake DAEDALUS with:

- exact route;
- viewport;
- account role;
- clicked control/action;
- expected result;
- actual result;
- whether it is blocker, sharp edge, or polish;
- narrowest recommended fix.

If no blocker appears, wake MIMIR with:

- pass/fail verdict;
- route confidence;
- remaining caveats;
- whether a DAEDALUS fix is needed;
- next-lane recommendation.

Do not leave the workflow silent.

## Validation

If ARIADNE writes docs-only notes, run:

```bash
git diff --check
```
