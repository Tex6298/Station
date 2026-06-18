# PR23 - Creator Publish Public Discussion Proof

Date: 2026-06-18
Status: opened for A2 / DAEDALUS
Owner: DAEDALUS proof/setup and narrow repairs if needed, ARGUS review,
ARIADNE human rehearsal if the visible flow changes or after ARGUS acceptance.

## Why This Lane Is Next

PR10 and PR11 made publishing and approval state real, but their live rehearsal
closed only the private/basic-tier guard path. The positive save/edit/review/
publish route stayed unclaimed because the replay owner did not have
Creator-or-above capability.

The launch-core definition says a test user should be able to:

- publish a private draft as a labelled public document;
- display that document on a public Space;
- discuss it in the forum under correct visibility rules.

That is now the next concrete gap. Do not drift into billing redesign or broad
publishing expansion.

## Goal

Prove one Creator-or-above staging account can move a public-safe document
through the existing Studio publishing path and see the public chain work:

```text
/studio/publish
-> /studio/publishing approval/review state
-> public Space document
-> linked forum discussion
```

The proof may use a synthetic replay account, seeded replay Space, and
public-safe synthetic document text. It must not require Marty to manually click
through setup unless DAEDALUS genuinely cannot create the safe staging state
from the existing repo/environment access.

## Scope

Staging/data setup:

- Prefer a dedicated synthetic Creator-or-above replay account or a clearly
  documented staging tier adjustment for the existing replay account.
- Use only non-production public-safe seed text.
- Ensure the account has or creates one public Space suitable for the proof.
- Record sanitized evidence only: no credentials, cookies, owner IDs, Stripe
  object IDs, Checkout URLs, raw JWTs, or private source bodies.

Positive path:

- Sign in as the Creator-capable replay user.
- Create or edit a private draft in `/studio/publish`.
- Attach it to an owned public Space/persona where required by the current UI.
- Send it to the approval queue.
- Move it through the existing approval states needed to publish.
- Publish with public visibility.
- Open the resulting public Space document route.
- Open or create the linked discussion thread and verify the forum route.

Regression path:

- Keep the private/basic-tier guard from PR10/PR11 intact:
  - private/basic users still see Creator-required disabled copy;
  - they cannot mutate approval state through the UI;
  - API mutation routes still require Creator-or-above.
- Keep no-Space draft guards intact.

## Do Not

- Do not run live-money billing.
- Do not require a fresh Stripe Checkout unless it is the smallest safe route;
  PR3 already covers bounded Stripe test-mode activation.
- Do not fabricate production claims from a manual DB tier seed. If this proof
  uses a staging tier seed, say so plainly.
- Do not broaden pricing, billing UX, social dispatch, scheduling execution,
  workers, export jobs, Redis/Cloudflare/provider work, or site-wide reskin.
- Do not expose private archive source text through the public document or
  discussion route.

## Required Evidence

DAEDALUS should produce either a pass package or a precise blocker:

- replay user capability: sanitized tier/capability label only;
- Space setup: public route exists and belongs to the replay user;
- draft save works;
- approval queue item is created;
- approval state transitions work;
- published document is public and Space-backed;
- public document route loads for an anonymous browser when visibility is
  public;
- linked discussion route exists and respects document/forum visibility;
- private/basic-tier and no-Space guards still pass;
- no private source body, credential, token, or raw internal ID is committed.

## Validation

Minimum local gate:

```bash
npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:continuity-publication
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add `test:billing` only if the proof touches Stripe/billing code or webhook
state. Add `test:health` if readiness wording changes.

## Handoff To ARGUS

Wake A3 / ARGUS with:

- whether this was proof-only, setup-only, or included a code patch;
- sanitized staging evidence;
- exact public route chain checked;
- private/basic guard proof;
- no-Space guard proof;
- validation commands and results;
- caveats around staging tier seed versus Stripe-paid activation.

ARGUS should review overclaim risk, entitlement bypass risk, public/private
visibility, discussion-route visibility, and whether any code changes need
ARIADNE browser review.
