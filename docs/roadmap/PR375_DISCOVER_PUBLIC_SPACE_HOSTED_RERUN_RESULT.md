# PR375 - Discover Public Space Hosted Rerun Result

Date: 2026-06-27
Owner: ARIADNE
Status: PASS WITH CAVEAT

## Verdict

PASS WITH CAVEAT.

Hosted PR374 is deployed and the Discover public Space route now works as a
visible public route. The caveat is that the public Space card/link became
visible during the proof after using the `Spaces` filter, not in the initial
unfiltered Discover feed view.

## Hosted Freshness

- Hosted web was ready at commit prefix `97d6d4ff`.
- Hosted API was ready at commit prefix `97d6d4ff`.
- Both match the PR374 accepted review prefix required by PR375.

## Public Route

Rehearsed as a signed-out public visitor:

- `/` loaded.
- `Explore Discover` opened `/discover`.
- The public Space card/link was visible after selecting the `Spaces` filter.
- The Space affordance was clear: the card identified the item as a Space and
  exposed the `Open public Space` cue.
- Clicking the card opened a safe `/space/:slug` route.
- The public Space loaded.
- The public Space exposed a public document link.
- The public document loaded with `Document trust` readback.
- A linked discussion route was present and opened successfully.

## Trust And Safety

The public document route retained the PR373 trust readback:

- provenance/source boundary was visible;
- current-version boundary was visible;
- discussion state was visible and routeable;
- no private Space, unsafe or UUID-shaped Space slug, owner id, document id,
  thread id, raw network location, raw JSON, private source body, prior private
  version body, provider payload, SQL, stack trace, or secret-shaped value was
  visible.

## Caveat

The route worked only after filtering Discover to `Spaces`. This matches the
PR375 caveat case for a route that is hosted-fresh and routeable, but requires
filtering/searching in Discover rather than appearing in the initial feed view.

## Scope Control

No product, publishing, auth, provider, Redis, Cloudflare, worker, queue,
schema, migration, billing, Station Press, social, checkout, or broad UI lane
was opened.

## Validation

| Check | Result |
| --- | --- |
| Hosted signed-out public route proof | Pass with filter caveat |
| `git diff --check` | Pass |
