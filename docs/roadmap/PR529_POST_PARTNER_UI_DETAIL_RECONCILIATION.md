# PR529 - Post-Partner UI And Detail Reconciliation

Owner: MIMIR / A1

Opened: 2026-07-16

Status: Paused - resume only after partner review

```text
PAUSE_PR529_UNTIL_MARTY_PARTNER_REVIEW_FEEDBACK
```

## Purpose

Preserve real UI, interaction, evidence, and route-detail findings that do not
block the PR528 partner review. This lane exists so the Important Routes Partner
Pass can stay focused without silently losing work.

PR529 is not a dumping ground for invented work. A finding enters only when it
was observed in hosted behavior, accepted roadmap evidence, or a named commit
and was deliberately deferred from PR528 for a recorded reason.

## Resume Trigger

Resume after Marty and his partner review the PR528 hosted checklist. MIMIR then
reconciles their feedback with this ledger, removes duplicates, re-ranks by
user impact and product direction, and opens bounded implementation lanes.

Do not resume merely because PR528 implementation is waiting on deployment or
because an agent has spare capacity. Unrelated feature work remains separately
owned by its roadmap lane.

## Deferred Finding Ledger

| Route | User impact | Evidence or originating commit | Reason deferred from PR528 | Likely owner | Explicit resume trigger |
| --- | --- | --- | --- | --- | --- |
| `/studio/personas/:personaId` empty Companion state | An owner without an accepted private provider sees the normal empty composer; contextual provider-setup guidance appears only after a blocked send, although Settings remains reachable through Studio navigation. | PR528D live human-eye matrix on exact hosted SHA `67da511f`; `PersonaChat` renders setup guidance from post-send error metadata only. | PR528D explicitly prohibited a provider call and created no failed conversation shell. The bounded partner route remains useful, while proactive readiness deserves its own provider-state UX and API-readback review. | DAEDALUS; ARGUS provider/readback gate; ARIADNE copy and flow review | Resume after partner review, or earlier if private-provider configuration becomes part of the judged Companion path. |
| `/login` field labels | Email and Password are visibly labelled, but the label elements are not programmatically associated with their inputs, reducing reliable screen-reader and label-click behavior. | PR528D ordinary product sign-in on exact hosted SHA `67da511f`; source inspection of `apps/web/app/login/page.tsx`. | Ordinary sign-in, keyboard entry, validation, and redirect all passed. This is a bounded accessibility repair outside the 11-route content and privacy verdict. | DAEDALUS; ARGUS accessibility and auth-regression gate; ARIADNE review | Resume after partner review or when login/accessibility polish is opened. |
| `/studio/personas/:personaId/memory-inbox` candidate editors | The pending candidate title input and body textarea are visually contextual but have no accessible names, making edit review less clear to assistive technology. | PR528D four-case Memory Inbox control inspection on exact hosted SHA `67da511f`; `apps/web/components/studio/import-review-inbox.tsx`. | Candidate mutation was deliberately read-only in PR528D, and visible hierarchy, privacy copy, navigation, and theme checks passed. Adding labels is narrow but should ship with candidate-control regression coverage. | DAEDALUS; ARGUS candidate-control gate; ARIADNE review | Resume after partner review or when the disposable candidate lifecycle is opened. |
| `/studio/archive` sort control | The archive sort select exposes descriptive option text but lacks a programmatic control label, weakening assistive navigation of owner-only search results. | PR528D Global Archive control inspection on exact hosted SHA `67da511f`; `apps/web/components/studio/archive-library.tsx`. | No-match search, reset, sorting state, privacy copy, and geometry passed. The missing accessible name does not alter Archive trust or retrieval semantics. | DAEDALUS; ARGUS Archive regression gate; ARIADNE review | Resume after partner review or with the next bounded Archive interaction pass. |
| `/studio/personas/:personaId` failed-provider send | A policy-blocked send truthfully restores the composer and shows provider setup, but the backend leaves a user-only conversation shell that appears after refresh until explicitly removed. | PR528A live provider probe at runtime `e542423bc07a`; accepted PR527 `J03` conversation-shell cleanup evidence. | Accepted-provider configuration is fix-now for the isolated partner account. Failure-transaction semantics do not block that configured pass and require a separate API ownership/rollback review. | DAEDALUS with ARGUS transaction and cleanup gate | Resume after partner review, or earlier only if the configured provider still exposes a failed-send shell. |
| `/studio/personas/:personaId/memory-inbox` and Integrity mutation lifecycle | Owners cannot yet rehearse accept/reject/edit and Integrity creation without touching retained candidate/session history. | Accepted PR527 `J04`; PR528A read-only Memory Inbox and Continuity pass. | The selected partner pass can judge orientation, privacy, and continuity accumulation read-only. A disposable parent/candidate/session cleanup contract remains separate. | MIMIR -> DAEDALUS; ARGUS lifecycle gate; ARIADNE flow review | Resume if partner feedback asks to perform candidate or Integrity writes, or when an isolated disposable lifecycle is approved. |
| Persona Archive and `/studio/archive` retention decision copy | An owner can import/search private source material without being told at the intake decision that source/chunk removal is outside the current accepted retention contract. | Accepted PR527 `J05`; PR528A Global Archive human-eye review. | Current import/search/private-boundary truth works and does not block partner judgment. Ad hoc deletion must not be introduced during the partner pass. | ARIADNE copy; DAEDALUS implementation; ARGUS retention gate | Resume after partner archive feedback or when the formal source-removal policy is opened. |
| `/billing` Checkout and Dark detail | A reviewer cannot complete hosted Checkout and some Dark plan/status/portal details remain difficult to read. | Accepted PR527 `J12` at hosted inventory runtime. | Billing is not one of the selected principal routes and does not block the private/public/community product-shape review. Prices, tiers, and Stripe state stay untouched. | DAEDALUS; ARGUS billing gate; ARIADNE visual review | Resume after partner review if commercial flow is requested, or before a separately authorized paid-path rehearsal. |
| `/developer-spaces` owner lifecycle | Existing public observatory reads work, but create/key rotate/ingest/cleanup cannot be rehearsed safely against the active fixture. | Accepted PR527 `J10`. | Developer Space is not required for the smallest partner route set; the missing entitled disposable observatory and key cleanup contract are broader than PR528. | DAEDALUS; ARGUS key/entitlement gate; ARIADNE observatory review | Resume if partner feedback prioritizes Developer Spaces or an isolated entitled fixture and cleanup contract become available. |
| `/projects` and `/projects/:slug` lifecycle truth | Historical synthetic Projects accumulate while creation has no visible owner removal/lifecycle command. | PR527 route-family appendix and ranked correction backlog. | Projects are not in the selected principal route set. Creating another fixture would worsen the current evidence without an accepted lifecycle. | MIMIR product decision; DAEDALUS; ARGUS ownership gate | Resume after partner review if Projects enter the judged product shape, or when lifecycle truth is explicitly authorized. |
| `/personas/:publicSlug` discoverability | Public identity architecture exists, but Discover currently reports no public persona card and a visitor cannot naturally reach one from the selected public chain. | Accepted PR527 `J08`/public-persona appendix; PR528A Discover human-eye review. | Public Space already demonstrates the public presentation layer needed for the bounded pass. Adding public-persona fixtures now would broaden the fix-now corpus beyond the selected chain. | MIMIR content decision; DAEDALUS corpus; ARGUS privacy gate; ARIADNE review | Resume after partner feedback identifies public persona as a missing principal surface. |
| Signup, confirmation, and password recovery with a disposable inbox | Delivery, confirmation, password update, and full account cleanup remain unproved without risking the retained owner credential. | Accepted PR527 `J01`. | Ordinary retained-owner sign-in is sufficient for PR528. Provisioning an inbox/account lifecycle is not required to judge the principal product surfaces. | DAEDALUS fixture; ARGUS Auth/cleanup gate; ARIADNE account-flow review | Resume if partner feedback targets onboarding/account recovery or an isolated inbox lifecycle becomes available. |
| Forum recognition/report/moderation with a second actor | Own-content boundaries are truthful, but cross-actor recognition, reporting, delegated moderation, and cleanup cannot be judged end to end. | Accepted PR527 Forum appendix and second-actor blocker. | Signed-out public reading and source-document return are sufficient for the selected community view. Manufacturing another actor/report would broaden PR528. | MIMIR role brief; DAEDALUS fixture; ARGUS moderation/privacy gate; ARIADNE review | Resume after partner community feedback or when two disposable consenting roles and exact cleanup are approved. |

## PR528A Source Candidate Disposition

The remaining ranked items in
`PR527_UI_PRODUCT_COMPLETENESS_HOSTED_JOURNEY_INVENTORY_ARIADNE_RESULT.md`
were inputs to PR528A, not automatic deferrals. ARIADNE has now classified
them. Accepted-provider rehearsal is `FIX_NOW_PR528`; Billing, disposable
candidate/Integrity and Developer Space lifecycles, Archive retention truth,
Project lifecycle, public-persona discoverability, disposable auth/inbox, and
the second-actor community fixture are the complete ledger rows above. The
failed-provider conversation shell is a PR528A deferment. PR528D adds the four
exact hosted details above without broadening the paused lane.
