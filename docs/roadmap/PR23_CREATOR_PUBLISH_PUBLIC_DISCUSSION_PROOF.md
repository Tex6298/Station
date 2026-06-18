# PR23 - Creator Publish Public Discussion Proof

Date: 2026-06-18
Status: closed
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

## DAEDALUS Proof Package

Run date: 2026-06-18

Result: pass package, no code patch. The proof used the live Railway staging
web/API and a public-safe synthetic document.

Sanitized capability/setup:

- Replay owner capability label: `creator`, Creator-or-above: yes.
- Caveat: the replay owner capability is a staging profile tier seed, not
  Stripe-paid activation proof.
- Public Space: reused `station-replay-alpha`.
- Synthetic document body: public-safe proof text only; no private archive body,
  credentials, cookies, owner IDs, Stripe IDs, Checkout URLs, JWTs, or private
  source material were recorded.
- A prior proof harness run completed live synthetic mutations but rejected its
  own output because the caveat wording included a forbidden secret-adjacent
  phrase. The later run below is the recorded sanitized evidence; both live rows
  are synthetic proof data.

Positive path evidence:

| Step | Result | Sanitized detail |
| --- | --- | --- |
| Sign in as replay owner | Pass | Capability label `creator`. |
| Draft save | `201` | Draft created as `public`, Space-backed. |
| Approval enqueue | `201` | Queue item entered `grounding_check`. |
| Transition to human review | `200` | Approval state `human_review`, document still draft. |
| Transition to approved | `200` | Approval state `approved`, document still draft. |
| Transition to published | `200` | Approval state `published`, document status `published`, visibility `public`. |
| Owner document readback | `200` | Published, public, Space-backed. |
| Start linked discussion | `201` | Thread active, public. |

Anonymous/public route evidence:

| Route | Result | Sanitized detail |
| --- | --- | --- |
| `GET /spaces/station-replay-alpha` | `200` | Public Space includes the proof document. |
| `GET /documents/public/<document-id>` | `200` | Published/public document; body matches synthetic proof text. |
| `GET /documents/<document-id>/discussion` | `200` | Eligible, discussion present, visibility `public`. |
| `GET /forums/categories/documents-and-codexes` | `200` | Category includes the proof discussion thread. |
| Web `/space/station-replay-alpha` | `200` | App shell loads. |
| Web `/space/station-replay-alpha/documents/<document-id>` | `200` | App shell loads. |
| Web `/forums/documents-and-codexes/<thread-id>` | `200` | App shell loads. |

Regression evidence:

- No-Space draft approval enqueue returned `400` and the message included
  `Space`.
- Synthetic below-Creator signup had capability label `visitor`; approval
  mutation returned `403`.
- Local regression tests also keep private/basic-tier Creator-required UI/API
  guards and no-Space queue guards covered.

Validation:

| Command | Result |
| --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:publishing-approvals` | Pass, 9 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass, 8 tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:document-discussions` | Pass, 1 test. |
| `npm exec --yes pnpm@10.32.1 -- run test:continuity-publication` | Pass, 1 test. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass, 17 tests. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass. |
| `git diff --check` | Pass, CRLF normalization warning only for agent state. |

## ARGUS Review Result - 2026-06-18

Verdict: accepted.

ARGUS accepted PR23 as a sanitized staging proof of the Creator publish ->
public Space -> linked forum discussion loop.

Accepted evidence:

- Creator-capable replay owner saved a public Space-backed draft.
- Approval enqueue and transitions reached `published`.
- Public document readback was published/public and Space-backed.
- Linked discussion route existed and was public.
- Anonymous/public Space, document, discussion, and forum routes loaded.
- No-Space approval enqueue remained blocked.
- Below-Creator approval mutation remained blocked.

Caveat:

- Creator capability came from a staging profile tier seed. This is not
  Stripe-paid activation proof; Stripe test-mode paid activation remains covered
  by the separate Stripe lane.

No product code changed, and ARGUS did not require an additional ARIADNE browser
rehearsal for this proof-only lane.

## MIMIR Closeout - 2026-06-18

PR23 is fully closed. The positive publishing/public discussion loop is now
evidenced for protected-alpha staging, with the staging-tier caveat preserved.
