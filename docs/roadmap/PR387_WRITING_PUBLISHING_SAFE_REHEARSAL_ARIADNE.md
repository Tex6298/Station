# PR387 - Writing Publishing Safe Rehearsal

Opened: 2026-06-27
Owner: ARIADNE
Status: open

## Purpose

Run the default safe hosted authoring rehearsal recommended by PR386.

This proves the writing/publishing workflow is routeable and comprehensible
without publishing a new public/unlisted artifact.

## Freshness Gate

Target:

- `https://stationweb-production.up.railway.app`

PR386 was map-only, so there is no new product-code commit to wait for. Hosted
web/API should at least be on the current accepted app state from the owner
closeout chain:

- `ce01d605` or later

If hosted is stale, unavailable, or auth is broken, return `BLOCKED` with the
observed prefix or failure.

## Allowed Mutation

Allowed:

- Create exactly one short private draft through `/studio/publish`.

Use a clearly staged title, for example:

```text
[replay:pr387] private draft rehearsal
```

Do not paste the resulting raw document id into the result. It is enough to say
that a document id was assigned.

Not allowed:

- `Send for review`
- approval queue transitions
- `Publish`
- Space-local direct publish at `/space/:slug/documents/new`
- `Signal Share to socials`
- social composer/dispatch
- scheduling
- exports/imports
- chat prompts
- billing/config/provider changes
- Redis, Cloudflare, worker, queue, schema, or migration work

## Human Route

Use replay-owner credentials from ignored local environment only. Do not paste
credentials, cookies, raw owner identifiers, raw persona identifiers, raw
document ids, raw source bodies, screenshots, SQL, stack traces, hosted logs, or
secrets into the result.

Run:

1. Sign in as replay owner.
2. Open `/writing`.
3. Verify public writing loads or shows honest empty states.
4. Verify `Latest` and `Featured` are live, while `Staff picks` is disabled or
   clearly preview-only.
5. Use `Write` to open `/studio/publish`.
6. Create a short private draft with the PR387 staged title.
7. Keep visibility `private`; do not select social/scheduling controls.
8. Click `Save draft`.
9. Confirm a save notice appears and a document id is assigned.
10. Open `/studio/publishing`.
11. Confirm the draft appears under draft/readback state with sanitized trust
    line and no public `View` route yet.
12. Use `Edit` to return to `/studio/publish?documentId=...`.
13. Confirm title/body/visibility/Space/persona fields reload from the saved
    draft.
14. Open an existing replay public document route from `/writing`, `/discover`,
    or `/studio/publishing` if one is available.
15. Confirm document trust, provenance/private-source boundary, version readback,
    and linked discussion affordance remain safe.

## Pass Criteria

Return `PASS` if:

- Hosted freshness is acceptable.
- The safe authoring route is usable end to end.
- Private draft save and edit reload work.
- The publishing dashboard readback is honest and sanitized.
- Existing public document trust/discussion readback remains safe.
- Deferred controls are visibly disabled/preview-only instead of broken.

Return `PASS WITH CAVEAT` if:

- The route is safe, but writing/editor/storytelling polish is thin enough for a
  later UX/narrative lane.

Return `FAIL` if:

- Private draft save fails.
- Edit reload fails.
- Dashboard readback is missing or misleading.
- `Staff picks`, scheduling, social, rich formatting, or publish controls appear
  live but do nothing or violate the mutation guard.
- Raw private material, raw ids, provider payloads, source bodies, SQL, stack
  traces, or secret-shaped values are visible.

Return `BLOCKED` only for stale deploy, unavailable staging, missing credentials,
or auth/session breakage.

## Handoff Back To MIMIR

Wake MIMIR with:

- Verdict: `PASS`, `PASS WITH CAVEAT`, `FAIL`, or `BLOCKED`.
- Hosted freshness prefix observed.
- Routes checked.
- Whether exactly one private draft was created and reloaded.
- Whether existing public document trust/discussion readback passed.
- Exact defects and recommended next owner if repair is needed.
