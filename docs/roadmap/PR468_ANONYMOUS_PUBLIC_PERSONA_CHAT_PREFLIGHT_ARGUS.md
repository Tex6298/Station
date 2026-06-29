# PR468 - Anonymous Public Persona Chat Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - boundary preflight

## Why This Lane

Marty accepted PR467 as a feature lane and clarified that the next expansion
choice should be a numbered Phase 3 or customer-facing product capability unless
there is a concrete blocker.

The named signed-in external pilot remains blocked on non-repo details:

- three real tester account identities;
- the private feedback channel for tester reports.

That blocker should not stall repo-executable customer-facing work. PR321
explicitly listed anonymous visitor chat as one of the deliberate next public
persona moves after the internal signed-in pilot closed. PR468 opens that
product boundary.

## Preflight Question

Can Station safely open a bounded anonymous public persona chat alpha for one
existing public replay persona?

ARGUS should answer with one of:

```text
ACCEPT_FOR_DAEDALUS
BLOCKED
NEEDS_MIMIR_DECISION
```

If accepted, ARGUS should wake DAEDALUS with the smallest implementation shape.
If blocked or decision-dependent, wake MIMIR with the blocker and the smallest
unblock lane.

## Current Grounding

Station already has accepted internal proof for:

- anonymous public persona readback;
- signed-in public persona chat alpha;
- owner enable/disable control;
- public-source-only persona prompt boundary;
- `transcriptStored:false`;
- aggregate/status-only owner readback;
- public persona report and admin moderation readback;
- desktop and mobile routeability for the checked public persona and related
  public document/discussion routes.

Current code still treats public persona chat as signed-in alpha. Anonymous chat
is intentionally unclaimed.

## Candidate Scope

Keep the possible implementation to one replay-safe public persona first:

- Route: `/personas/station-replay-alpha-persona`.
- API shape: extend the existing public persona chat path only if ARGUS accepts
  the boundary.
- Public context: public persona profile and public routeable sources only.
- Private data: no private Memory, Archive, Canon, Continuity, Integrity,
  owner setup, provider config, raw event rows, credentials, or source bodies.
- Persistence: no durable visitor transcript and no durable visitor identity.
- Readback: owner/admin may see aggregate attempt/success/failure counts only
  unless ARGUS explicitly accepts a narrower safe diagnostic.
- Abuse controls: require a concrete anonymous rate-limit key and stop rule
  before implementation. Prefer short-lived or hashed/minimized state; do not
  introduce broad visitor analytics.
- UX: anonymous visitors must understand that public persona chat is public
  source only and cannot access private Station memory.

## Out Of Scope

Do not open or claim:

- general availability across all public personas;
- public launch readiness;
- commercial, customer, partner, or marketing claims;
- anonymous reporting unless ARGUS deliberately includes it;
- durable visitor transcripts;
- visitor identity analytics;
- private archive-aware anonymous chat;
- owner-visible raw anonymous prompts;
- Redis, Cloudflare, queue, worker, provider/model, billing, Stripe, migration,
  or infrastructure changes unless ARGUS finds one unavoidable and wakes MIMIR;
- public memory writeback from anonymous visitors;
- moderation target actions or report status mutation.

## ARGUS Review Checklist

- Decide whether anonymous chat can reuse the existing signed-in public persona
  public-source-only prompt boundary.
- Decide whether owner-paid usage is acceptable for anonymous alpha and what
  owner disable/rollback switch must be present.
- Decide the minimum anonymous rate-limit guard and whether the current
  operational quota tools can support it without new infrastructure.
- Confirm no private source class can enter the anonymous prompt.
- Confirm no raw visitor prompt, IP, cookie, auth header, provider payload,
  transcript, raw event, SQL, token, secret, or raw id is exposed in public,
  owner, admin, logs, docs, or test fixtures.
- Name the exact DAEDALUS files/routes/tests if accepted.

## Expected Validation If Accepted

ARGUS may revise this list, but the expected DAEDALUS validation should include:

```bash
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add focused tests for anonymous allow/deny, public-source-only context, no
transcript storage, no visitor identity readback, owner disable rollback, and
rate-limit failure behavior if ARGUS accepts implementation.

## Handoff

ARGUS should return a verdict and wake either DAEDALUS or MIMIR. Do not leave
the lane asleep without a wakeup.
