# PR517 - Cross-Owner Public Exhibit / Publication Preflight

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date: 2026-07-11

State:

```text
OPEN_ARGUS_PREFLIGHT
```

## Goal

Decide the smallest safe Phase 3 lane for cross-owner encounter publication now
that the consent-to-private-preview path is hosted-proven.

This is a hostile preflight only. Do not implement code in PR517.

## Why Now

PR510B proved same-owner metadata-only public encounter exhibits in Discover
search and dedicated public detail scope.

PR511 deliberately chose a ledger-only cross-owner consent lane and kept
cross-owner runtime, private saved artifacts, public exhibits, generated-word
publication, excerpts, transcripts, summaries, Discover/search/feed surfacing,
and provider calls blocked.

PR511A through PR516 have now proven the foundation that did not exist then:

- bilateral consent ledger and hosted proof;
- cross-owner runtime context contract and hosted proof;
- runtime attempt audit ledger and hosted proof;
- one consent-scoped private disposable preview route;
- owner-only Studio preview panel;
- public-slug invitation and participant inbox/actions UI;
- hosted integrated flow from invitation to approval to exactly one private
  disposable preview.

The next product boundary is not more consent UI. It is whether Station may
create a public cross-owner exhibit, and if so whether the first safe slice is
metadata-only, generated-word excerpt publication, a private saved artifact
unblock, or another smaller named prerequisite.

## Sources To Inspect

- `docs/roadmap/PR508_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR510B_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_CLOSEOUT.md`
- `docs/roadmap/PR511_CROSS_OWNER_ENCOUNTER_CONSENT_PUBLICATION_PREFLIGHT_RESULT.md`
- `docs/roadmap/PR511A_CROSS_OWNER_ENCOUNTER_CONSENT_LEDGER_CLOSEOUT.md`
- `docs/roadmap/PR512B_CROSS_OWNER_RUNTIME_CONTEXT_CONTRACT_HOSTED_PROOF_CLOSEOUT.md`
- `docs/roadmap/PR513D_CROSS_OWNER_RUNTIME_ATTEMPT_AUDIT_HOSTED_RERUN_CLOSEOUT.md`
- `docs/roadmap/PR514F_CROSS_OWNER_DISPOSABLE_PREVIEW_STUDIO_PANEL_HOSTED_REHEARSAL_CLOSEOUT.md`
- `docs/roadmap/PR515C_CROSS_OWNER_CONSENT_INVITATION_AND_INBOX_UI_HOSTED_REHEARSAL_CLOSEOUT.md`
- `docs/roadmap/PR516_CROSS_OWNER_CONSENT_TO_DISPOSABLE_PREVIEW_INTEGRATED_HOSTED_PROOF_CLOSEOUT.md`

Also inspect the current API/web implementation for encounter public exhibits,
consent rows, disposable previews, reports, deletion/export readback, and
Discover/search public surfacing before naming the next lane.

## Required Decision

Choose one of these shapes, or reject all with a concrete blocker:

```text
ACCEPT_PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT
```

Use this only if a public cross-owner exhibit can be safely metadata-only, with
bilateral approval for public metadata, no generated words, no transcript, no
summary, no private setup, no source retrieval, and clear report/retract/remove
semantics.

```text
ACCEPT_PR517A_CROSS_OWNER_GENERATED_WORD_PUBLICATION_CONTRACT
```

Use this only if the next safe lane should define explicit publication consent
for selected generated words, excerpt, transcript, or generated summary. This
must include separate versioned bilateral approval, revocation, takedown,
deletion/export, owner readback, public labeling, and no automatic publication
from disposable preview output.

```text
ACCEPT_PR517A_CROSS_OWNER_PRIVATE_SAVED_ARTIFACT_BEFORE_PUBLICATION
```

Use this if public publication remains unsafe until Station first has a
bilaterally consented private saved cross-owner artifact with deletion/export,
revocation, and non-public readback semantics.

```text
BLOCK_PR517_CROSS_OWNER_PUBLIC_EXHIBIT_PUBLICATION_PREFLIGHT
```

Use this if a concrete missing contract blocks all publication decisions. Name
the exact blocker and the smallest numbered unblock lane.

## Safety Requirements

Any accepted next lane must preserve these boundaries:

- PR516 private disposable preview remains private, disposable, not saved, not
  public, not canonical, no retrieval, and counterparty-hidden unless a later
  lane explicitly changes one boundary with bilateral consent;
- public use requires explicit bilateral consent for the exact public scope and
  scope version;
- one owner cannot publish the other owner's persona words, metadata, or
  generated contribution without the other owner's active approval;
- revocation before publication blocks future public use;
- revocation after publication must hide/retract public cross-owner output,
  preserve safe audit/tombstone state, and prevent restore without fresh
  approval plus moderation requirements;
- public report/takedown/moderation restore behavior must be part of any
  public lane;
- owner deletion, persona deletion, private artifact deletion, public exhibit
  deletion, and owner export must have safe handling before public surfacing;
- public pages/search/feed must never leak private setup, prompt material,
  provider payloads, generated private preview text, source retrieval bodies,
  Memory, Archive, Canon, Continuity, Integrity, private notes, raw internal
  ids, SQL details, stack traces, env values, tokens, cookies, or
  secret-shaped strings.

## Non-Scope

PR517 does not authorize implementation, migrations, provider calls, retrieval,
saved cross-owner sessions, public exhibits, generated-word excerpts,
transcripts, summaries, share links, search/feed surfacing, storage changes,
billing changes, Redis/Cloudflare/worker work, social posting, broad UI
redesign, or deployment changes.

If ARGUS finds one of those is a concrete blocker, name it and route the
smallest numbered unblock lane instead of silently widening PR517.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- ARIADNE passed PR516: hosted public-slug invitation, counterparty approval, and one consent-scoped private disposable preview.
- MIMIR accepted PR516 and treats cross-owner consent-to-disposable-preview as hosted-proven.
- The next Phase 3 encounter boundary is publication, not more consent UI.
Task:
- Run PR517 hostile preflight for cross-owner public exhibit/publication.
- Inspect PR508/PR510B same-owner exhibit proof, PR511 publication preflight, PR511A-PR516 cross-owner consent/runtime/preview proofs, and current API/web surfaces.
- Decide the smallest safe next numbered lane: metadata-only public exhibit contract, generated-word publication contract, private saved artifact first, or a named blocker/unblock.
- Preserve PR516 private disposable preview boundaries and do not implement code in PR517.
- Wake MIMIR with ACCEPT_PR517A... or BLOCK_PR517... and the exact next owner.
```

