# PR515C - Cross-Owner Consent Invitation and Inbox UI Hosted Rehearsal

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_ARIADNE_HOSTED_REHEARSAL
```

## Goal

Run a hosted browser rehearsal for the PR515B owner-only cross-owner consent
invitation and inbox UI before MIMIR closes the visible consent surface.

This is a human-eye rehearsal, not a source review. Use the hosted staging
Railway target and verify behavior from the browser at desktop and mobile
widths.

## Source

PR515B review:

`docs/roadmap/PR515B_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_REVIEW_RESULT.md`

PR515B closeout:

`docs/roadmap/PR515B_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_CLOSEOUT.md`

Implementation commit to prove deployed:

```text
1d76eb00 web: add cross-owner consent inbox UI
```

## Rehearsal Scope

Check:

- hosted web/API are fresh enough to include PR515B implementation behavior;
- signed-out users see no usable consent controls;
- an owner can load a safe public target by bare slug and by `/personas/:slug`
  href without raw id readback;
- unsafe or UUID-shaped slugs are blocked with bounded copy;
- an owner can create an invitation through the public-slug path and see the
  resulting consent row;
- requester pending row can cancel;
- counterparty pending row can approve;
- counterparty pending row can reject;
- approved row can revoke;
- approved eligible row keeps the existing disposable preview control visually
  separate;
- pending, rejected, cancelled, revoked, expired, superseded,
  blocked-by-deletion, and moderation-locked rows have no preview run control;
- desktop and 390px mobile have no horizontal overflow, action overlap, or
  unreadable controls;
- public routes do not surface consent rows, proof markers, private target
  details, or generated text.

## Safety Checks

Verify no hosted rehearsal creates or exposes:

- saved cross-owner private sessions;
- public cross-owner exhibits;
- generated-word sharing, excerpts, transcripts, summaries, share links,
  publication, or counterparty generated-word readback;
- Memory, Canon, Archive, Continuity, Integrity, retrieval, export, storage,
  billing, Redis, Cloudflare, workers, migrations, provider config, public
  surfacing, partner adapters, webhooks, hosted-runtime expansion, or broad
  Studio redesign.

## Result Format

Wake MIMIR with one of:

```text
PASS_PR515C_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_HOSTED_REHEARSAL
```

or:

```text
FAIL_PR515C_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_HOSTED_REHEARSAL
```

If failing, name the exact route/control/state, the observed hosted behavior,
and whether the fix belongs to DAEDALUS or needs a smaller preflight.

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE

Summary:
- ARGUS accepted PR515B locally: owner-only cross-owner consent invitation and inbox UI.
- MIMIR closed PR515B locally but requires hosted browser rehearsal before final visible-surface closeout.
- Rehearsal should use human-eye routes and mobile/desktop behavior, not just source inspection.

Task:
- Run PR515C hosted rehearsal against the Railway staging target.
- Verify signed-out gating, target lookup by slug/href, unsafe slug copy, create invitation, cancel, approve, reject, revoke, preview-control separation, no preview controls for inactive states, mobile/desktop layout, and public-route no-drift.
- Wake MIMIR with PASS_PR515C_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_HOSTED_REHEARSAL or FAIL_PR515C_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_HOSTED_REHEARSAL and exact defects.
```
