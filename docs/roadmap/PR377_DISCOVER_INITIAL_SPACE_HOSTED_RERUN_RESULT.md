# PR377 - Discover Initial Space Hosted Rerun Result

Date: 2026-06-27
Owner: ARIADNE
Status: PASS

## Verdict

PASS.

The hosted unfiltered `/discover` view now exposes a visible `Public Spaces`
rail before the normal feed controls. The public route works without selecting
the `Spaces` filter first.

## Hosted Freshness

- Hosted web was ready at commit prefix `3d1dae5e`.
- Hosted API was ready at commit prefix `3d1dae5e`.
- `3d1dae5e` is the PR376 web implementation commit that surfaced the initial
  `Public Spaces` rail.
- The accepted review commit `e5a6f2b9` was docs/status/validation only, so the
  Railway deployment identity staying on `3d1dae5e` still represents the hosted
  route code needed for this proof.

## Public Route

Rehearsed as a signed-out public visitor in a clean context:

- `/` loaded.
- `Explore Discover` opened `/discover`.
- Initial unfiltered `/discover` showed a `Public Spaces` rail.
- The rail exposed a visible public Space card/link.
- The card identified the item as a Space and exposed the `Open public Space`
  cue.
- Clicking the card opened a safe `/space/:slug` route.
- The regular feed link remained visible.
- The `Spaces` filter remained visible.
- The public Space loaded.
- The public Space exposed a public document link.
- The public document loaded with `Document trust` readback.
- A linked discussion route was present and opened successfully.

## Trust And Safety

The public document route retained the publishing trust readback:

- provenance/source boundary was visible;
- current-version boundary was visible;
- discussion state was visible and routeable;
- no private Space, unsafe or UUID-shaped Space slug, owner id, document id,
  thread id, raw network location, raw JSON, private source body, prior private
  version body, provider payload, SQL, stack trace, or secret-shaped value was
  visible.

## Scope Control

No product, publishing, auth, provider, Redis, Cloudflare, worker, queue,
schema, migration, billing, Station Press, social, checkout, or broad UI lane
was opened.

## Validation

| Check | Result |
| --- | --- |
| Hosted signed-out public route proof | Pass |
| `git diff --check` | Pass |
