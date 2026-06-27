# PR387 - Writing Publishing Safe Rehearsal Result

Date: 2026-06-27
Owner: A4 / ARIADNE
Verdict: PASS WITH CAVEAT

## Hosted Freshness

Hosted Railway web and API were both ready at deployment prefix `ce01d605`,
which satisfies the PR387 freshness gate because PR386 was map-only and no
newer product-code deploy was required for this rehearsal.

The rehearsal used replay-owner credentials from the local ignored environment
only. No credential, cookie, authorization-token value, raw owner identifier,
raw persona identifier, raw document identifier, raw source body, raw API body,
screenshot, hosted log, SQL, stack trace, or secret-shaped value was copied into
this result.

## Route Followed

The hosted UI route was:

1. Signed in through `/login?redirect=/writing`.
2. Opened `/writing`.
3. Checked public writing readback and the `Staff picks` disabled/preview-only
   state.
4. Used `Write` to open `/studio/publish`.
5. Created exactly one short private draft with a PR387 staged title.
6. Kept visibility `private`.
7. Clicked `Save draft`.
8. Opened `/studio/publishing`.
9. Verified the draft readback row.
10. Used `Edit` to return to `/studio/publish?documentId=...`.
11. Verified the saved title/body/visibility reloaded.
12. Checked an existing public document route when one was available from the
    writing feed.

I did not click `Send for review`, approval transitions, `Publish`, Space-local
direct publish, social sharing, scheduling, exports/imports, chat prompts,
billing/config/provider controls, or queue/worker infrastructure.

## Authoring Result

Exactly one private PR387 draft was created through `/studio/publish`.

The save path showed:

- `Draft saved.`;
- a document identifier assigned internally;
- `Version History`;
- private visibility retained;
- no public route opened for the new private draft.

The `/studio/publishing` dashboard showed the new staged draft with:

- draft/private readback;
- `Not queued`;
- `Station draft`;
- `Private source rows stay private`;
- `View unavailable`;
- a disabled queue guard such as `Space required`.

Using `Edit` returned to `/studio/publish?documentId=...` and reloaded the saved
title, body, and private visibility. The raw document id stayed out of this
result.

## Writing And Public Readback

`/writing` loaded, `Write` routed to `/studio/publish`, and `Staff picks` was
disabled/preview-only. The `Featured` tab loaded without error. The default
writing route was usable enough for the safe authoring rehearsal.

An existing public document route was available during the first pass. Its
document trust and version readback were safe, and the discussion state was
included in trust/readback copy. I did not start a new discussion or publish a
new public/unlisted artifact.

## Caveat

The sampled public document did not expose an active linked discussion action to
exercise. Trust/version/discussion-state readback was safe, but this pass did
not prove starting or opening a live discussion thread from the sampled
document.

There was also some automation noise around exact `/writing` tab text matching;
that did not block the user route and is not classified as a product defect.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| Hosted web/API deployment readback | PASS | Both ready at prefix `ce01d605`. |
| `/writing` route | PASS | Writing loaded; `Write` route worked; `Staff picks` disabled. |
| Private draft creation | PASS | Exactly one staged private draft created. |
| `/studio/publishing` draft readback | PASS | Draft row, trust line, private status, and no public view route were visible. |
| Edit reload | PASS | Saved title/body/private visibility reloaded from the draft. |
| Existing public document trust | PASS WITH CAVEAT | Trust/version/discussion-state readback safe; no active linked discussion action exercised. |
| Mutation guard | PASS | No review, approval, publish, social, scheduling, import/export, chat, billing, provider, worker, queue, schema, or migration action was used. |
| `git diff --check` | PASS | CRLF normalization warning on the local A4 state receipt only. |

## Handoff

MIMIR can close PR387 as accepted with the public-discussion affordance caveat.
The default safe writing/publishing rehearsal is usable end to end without
creating a public artifact.
