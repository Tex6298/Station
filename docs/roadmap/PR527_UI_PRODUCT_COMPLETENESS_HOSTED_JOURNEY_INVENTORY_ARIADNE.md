# PR527 - UI Product Completeness Definition And Hosted Journey Inventory

Owner: MIMIR / A1 -> ARIADNE / A4 -> MIMIR / A1

Date opened: 2026-07-15

Status:

```text
OPEN_PR527_UI_PRODUCT_COMPLETENESS_HOSTED_JOURNEY_INVENTORY
```

## Product-Owner Correction

The correction at commit `6ee89b5a` supersedes the claim that PR525 completed
Station's overall UI integration. PR525A-H remain accepted evidence for the
Discern-informed visual foundation, responsive composition, and shared
System/Light/Dark treatment. They do not prove that the supported product works
end to end.

PR527 reopens only the UI/product-completeness programme. PR524B and unrelated
Phase 3 product expansion remain paused.

## Completion Outcome

Station's UI integration is complete only when its currently supported product
can be used end to end on hosted Station across the principal real user
journeys below, in a coherent and polished System, Light, and Dark interface.

Completion is not established by exhausting a lane list, matching screenshots,
passing read-only route checks, or documenting a gap as parked.

### Working

- A user can enter through the real account path, create or import a persona,
  work with that companion, manage its Memory, Continuity, Integrity, and
  Archive material, publish supported work, operate a Space, participate in
  supported Forums/community paths, use supported Developer Space capabilities,
  and manage supported settings, providers, billing, and exports.
- Every visible command must complete against the authoritative backend, expose
  a truthful recoverable failure, or be clearly unavailable with the exact
  required setup.
- A creating, editing, publishing, importing, exporting, billing, key-management,
  moderation, or deletion workflow requires a safe disposable write, persisted
  readback after refresh, and cleanup where cleanup is supported. A screenshot
  or route mount alone cannot pass it.
- No dead controls, false success, silent mutation failure, decorative workflow,
  accidental duplicate route, hidden administration, or repository knowledge
  may be required to complete a supported journey.

### Pretty

- Principal public and private routes consistently use the accepted Station
  visual language in System, Light, and Dark modes.
- Hierarchy, spacing, typography, contrast, focus, loading, empty, success,
  unavailable, validation, and recoverable error states must remain coherent at
  desktop, `390px`, and `375px`.
- The interface must survive empty and populated accounts, many rows, long
  persona/thread/document/Space names, long body content, and provider/setup
  failures without overlap, clipped primary commands, or horizontal overflow.
- No principal route may retain an unrelated legacy or admin-console treatment
  merely because its happy-path screenshot was outside PR525.

### Recognisable Product Acceptance

After all required correction slices pass review and hosted rehearsal, the
principal hosted journeys must be presented to Marty or his product partner for
recognisable product acceptance. ARIADNE's verdict is required, but it does not
substitute for that final product-owner judgement.

## Evidence Vocabulary

ARIADNE must give every row exactly one current result. `Not tested` is not a
passing result.

| Result | Meaning |
| --- | --- |
| `PASS_HOSTED_WRITE_READBACK_CLEANUP` | The real hosted command completed, authoritative readback survived refresh/navigation, and disposable state was cleaned up where supported. |
| `PASS_HOSTED_READ_ONLY` | The route, data, navigation, and visual states passed, and the row has no mutation contract. |
| `FAIL_PRODUCT` | A supported journey or visible command is dead, misleading, incoherent, inaccessible, or visibly broken. |
| `BLOCKED_HOSTED_DEPENDENCY` | The exact hosted config, schema, provider, seed, or service dependency is named; the UI must still show a truthful recoverable/unavailable state. |
| `TRUTHFULLY_UNAVAILABLE` | The capability is intentionally unavailable and the product names the exact setup or entitlement required without presenting a false live action. |
| `OUTSIDE_SUPPORTED_PRODUCT` | The route or source idea is excluded with a concrete product reason and is not presented as a supported principal capability. |

## Principal Hosted Journey Inventory

ARIADNE owns the human/product inventory. Use the hosted Railway application
as a human would, with ignored local replay credentials and safe disposable
fixtures. Do not print or commit credentials, cookies, tokens, private prompt or
archive text, checkout/portal URLs, ingestion keys, provider payloads, raw IDs,
or secret-shaped values.

| ID | Journey and minimum proof | Required surfaces/actions |
| --- | --- | --- |
| `J01` | Account entry, recovery, and persistence | `/`, signup/confirmation, login, reset/update-password, first authenticated route, refresh and ordinary navigation persistence, sign-out, and truthful auth failures. |
| `J02` | Persona start and maintenance | Studio onboarding, create or import persona, persona profile/setup, update/edit, return to Studio, and safe disposable persona cleanup if the product supports deletion. |
| `J03` | Companion home and conversation | Enter the companion from Studio, select/continue a thread, start fresh, send one bounded prompt, receive or truthfully fail a response, summarize, archive a conversation, refresh, and return to the same authoritative thread state. |
| `J04` | Memory, Continuity, and Integrity | Reach Memory and Memory inbox, review a candidate through each supported decision, verify resulting readback, reach Continuity as its own stop, inspect/create supported continuity state, run or truthfully gate Integrity, and verify failure recovery. |
| `J05` | Archive and retrieval | Reach Global and persona Archive, paste/import or upload a safe source where supported, observe processing/review/error state, search/read it back, link supported material into companion continuity, and clean up disposable source state where supported. |
| `J06` | Writing and publication | Create/edit a draft, preview/validate, publish with truthful authorship/provenance/visibility, refresh public readback, revise/version or unpublish where supported, and retain a recoverable failure path. |
| `J07` | Space creation and editing | Create a disposable Space, set visibility, edit its identity/pages, attach or publish supported work, verify owner and public views, then clean up or clearly record the product's missing cleanup contract. |
| `J08` | Public discovery chain | Signed out: `/` -> `/discover` -> public Space/persona -> public document -> linked Forum discussion, plus search/filter controls and public/private boundary checks. |
| `J09` | Forums and community | Browse index/category/subcommunity, create a disposable thread, reply, use supported recognition/report actions, verify readback after refresh, exercise truthful moderation/permission states, and clean up where supported. |
| `J10` | Developer Space | Create a disposable Developer Space if entitled, manage presentation/widgets, generate and rotate an ingestion key without exposing it, perform one safe supported ingestion/readback where feasible, inspect public observatory, and verify owner/public boundaries. |
| `J11` | Profile, settings, providers, privacy, and notifications | Open each supported settings destination, persist a safe profile/privacy/notification change, verify refresh readback, inspect provider setup and failure guidance, and confirm visible social/provider controls are live or truthfully paused. |
| `J12` | Billing and entitlement | In Stripe test mode, open the real checkout/portal path for a safe test choice, verify cancellation/return behavior and authoritative entitlement readback without recording Stripe secrets, or name the exact hosted blocker. |
| `J13` | Export and portability | Create a persona export and workspace export where supported, open canonical JSON/Markdown/portable readback, verify status/error/retry truth and owner-only access, and ensure the package reflects current authoritative state. |

## Route-Family Coverage

The inventory must also classify visible supported routes not reached naturally
by `J01`-`J13`, including Projects, Encounters/cross-owner material, Events,
Discover roulette, moderation/report queues, archive connectors, and social
publishing readiness. Classification may be `OUTSIDE_SUPPORTED_PRODUCT`, but it
must name the concrete product reason and confirm the current UI does not imply
an unsupported live capability.

PR526C-F are not automatically required implementations. Their underlying
persona setup, Space creation/editing, and Memory review journeys are already
covered above and cannot pass merely because the guided-task proposals remain
parked.

## ARIADNE Inventory Method

1. Record the exact hosted web/API SHA and service readiness before testing.
2. Build the route-and-command inventory from what a user can discover in the
   product, not only from roadmap claims or existing tests.
3. Run each journey in System, Light, and Dark at least once overall. Exercise
   every principal route at desktop and one narrow viewport; use all three
   `1440x900`, `390x844`, and `375x812` viewports on the highest-risk shell,
   form, table/list, chat, public chain, and Developer Space surfaces.
4. For each mutation, record action, authoritative readback, refresh result,
   cleanup result, and whether retries are safe. Do not retain private evidence.
5. Exercise empty, populated/long-content, loading, validation, setup failure,
   and recoverable server failure wherever the product can safely produce them.
6. Enumerate every visible command encountered. Mark it live, truthfully
   unavailable, permission-gated, or defective. Do not infer that an unclicked
   control works.
7. Rank concrete gaps by blocked journey and user harm. Separate defects from
   optional product expansion.

## Required Result

Create:

```text
docs/roadmap/PR527_UI_PRODUCT_COMPLETENESS_HOSTED_JOURNEY_INVENTORY_ARIADNE_RESULT.md
```

The result must contain:

- exact hosted SHA/service truth;
- one row for every `J01`-`J13` journey;
- a route-family appendix for visible supported routes outside those journeys;
- a command inventory for every visible command encountered;
- role, route, viewport/theme, fixture, expected behavior, actual behavior,
  mutation/readback/refresh/cleanup result, evidence-safe description, and one
  result from the required vocabulary;
- a ranked correction backlog with the smallest reviewable slice for each gap;
- an explicit list of journeys that already satisfy the working-and-pretty
  gate, not merely the PR525 visual sequence;
- one recommended first correction slice or, only if all rows pass, the final
  product-owner review packet.

Do not modify production code during the inventory. Do not turn missing
evidence into a broad redesign. Do not declare overall completion while any
required row is failed, blocked without truthful UI treatment, or merely
documented/parked.

## Sequencing After Inventory

MIMIR must keep the programme moving after ARIADNE returns:

1. Send auth, ownership, privacy, visibility, billing, key, retry, ambiguous
   mutation, or public/private truth gaps through ARGUS boundary review before
   implementation.
2. Send the smallest accepted implementation slice to DAEDALUS.
3. Send code through ARGUS hostile review and then ARIADNE hosted human
   rehearsal with disposable-write/readback/cleanup proof where applicable.
4. Close one numbered `PR527A`, `PR527B`, and subsequent correction slice at a
   time until every required journey passes.
5. Present the complete principal hosted journey set for product-owner review,
   commit the truthful final closeout, and restore the mainline pause.

No unrelated PR524B, provider, retrieval, Redis, Cloudflare, backend, or Phase 3
expansion work opens from this lane unless a named required journey proves that
specific dependency is its smallest concrete blocker.

## Required Handoff

ARIADNE must commit the result and wake MIMIR. Do not stop after writing the
inventory and do not wake DAEDALUS directly with an unreviewed broad backlog.

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR527 hosted journey and visible-command inventory.
- <number> journeys pass, <number> fail, and <number> have exact hosted blockers.
First correction:
- <smallest route-specific slice and why it comes first>
Task:
- Sequence ARGUS boundary review when required, then wake DAEDALUS for the
  smallest accepted implementation slice. Do not pause the UI completeness
  programme while required gaps remain.
```

