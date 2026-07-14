# PR526A - Discern Fresh-Head Conversational Flow Delta Audit

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date completed: 2026-07-14

Status:

```text
COMPLETE_PR526A_FRESH_HEAD_CONVERSATIONAL_FLOW_DELTA_AUDIT
```

## Executive Verdict

Discern commit `ff93308b` contains useful product direction, but it is not a
merge candidate and its shared action engine is not a safe implementation
base.

The useful direction is narrow:

- one question at a time can make unfamiliar setup jobs less intimidating;
- compact deterministic choices can reduce form scanning;
- a live object preview can help users understand what they are making;
- a conversational review queue can make repeated decisions feel coherent;
- short, operational guidance can sound like Station without turning Station
  Assistant into a persona.

The source implementation must not be copied wholesale. Its action runner
swallows failed mutations, advances the flow, and renders success or later
steps anyway. Synthetic `503` responses produced false completion in profile,
Developer Space creation and key rotation, billing, export, Integrity, and
memory review. This alone rejects the source engine for any durable Station
operation.

The accepted decision is therefore:

```text
ADAPT_PRESENTATION_DIRECTION_ONLY
REJECT_SOURCE_ENGINE_PROVIDER_PERSISTENCE_AND_REPLACEMENT_FLOWS
ARGUS_BOUNDARY_PREFLIGHT_REQUIRED_BEFORE_ANY_PR526_IMPLEMENTATION
```

No PR526 implementation is authorized by this audit. MIMIR owns placement and
must decide whether the proposed implementation slices belong inside the
remaining UI integration or stay parked behind the terminal pause.

## Source Truth

| Item | Audited truth |
| --- | --- |
| Discern baseline | `de7b918e` |
| Discern fresh head | `ff93308b179479d8eb98c2191f8d6c3a0979cf7e` |
| Tex comparison | `main` after accepted PR525B/C, observed at `79cfac57f14a`; active uncommitted PR525D owner work was not altered |
| Delta size | 55 files, 3,884 insertions, 2,511 deletions |
| Shared definitions | 12 flow definitions and 9 conversation component/engine files |
| Actual converted inventory | 13 semantic jobs mounted at 15 routes |
| Source count discrepancy | The commit message says 14 surfaces, but the code has 13 jobs. Duplicate billing and export wrappers raise route mounts to 15; public Space create/edit share one definition. |
| Unrelated risk in delta | Broad `access_token` to `accessToken` replacement and deletion of `CalibrationPanel` sit beside the flow conversion. |

The source web typecheck does not pass. Five `TS2551` errors remain at
`apps/web/app/forums/[categorySlug]/[threadId]/page.tsx` lines 70, 85, 96,
110, and 123 because a local session type still exposes `access_token` while
the fresh commit changed callers to `accessToken`. Any auth-token cleanup is a
separate mechanical lane, not conversational-flow work.

## Product Constraints

Every later decision must preserve these Station truths:

- archive is trust infrastructure, so export cannot become a vague chat task;
- continuity is the core paid value, so setup and review must show continuity
  accumulating rather than hide it behind generated prose;
- Station Assistant is operational, not a persona;
- Integrity Sessions are grounding and reflection infrastructure, not a
  disposable setup wizard;
- Spaces are public microsites, not profiles;
- Developer Spaces are live observatories, not generic dashboards;
- visibility and privacy are structural and remain server-authoritative;
- no flow may import IntelHub CTI, exposure, recon, or finance scope.

## Audit Method

ARIADNE inspected `de7b918e..ff93308b` in a disposable detached worktree and
ran the fresh web app against owner-safe synthetic fixtures. All API traffic
was intercepted at the synthetic origin `http://station-api.test`; no hosted
production data, credentials, cookies, tokens, private IDs, prompts, or user
content were read or mutated.

Rendered proof covered:

- 15 route mounts at desktop `1440x900`, mobile `390x844`, and mobile
  `375x812`;
- entry and first meaningful interaction at every route, for 45 matrix cases
  and 90 route screenshots;
- one successful settings completion, seven failed-mutation paths, three
  refresh/resume paths, and one validation boundary path;
- 98 screenshots total and a structured 287 KB metrics ledger;
- bounding boxes, document overflow, attached-but-hidden surfaces, keyboard
  order, focus movement, requests, localStorage, console errors, and page
  errors.

The screenshots and synthetic metrics were temporary audit material, not repo
product assets. Their measurements and conclusions are recorded below.

## Shared Engine Anatomy

| Layer | Source behavior | Tex decision |
| --- | --- | --- |
| Flow definition | Declarative steps choose scripted/live text, input controls, transitions, card updates, and actions. | Adapt the deterministic step vocabulary only after a boundary contract exists. |
| Step resolver | Automatically walks zero-input steps and invokes actions while advancing. | Reject. Explicit action states must stop progression until a durable action succeeds. |
| Action failure | Catches exceptions, writes only `console.error`, then continues. | Reject. Show an honest inline error with retry/cancel and retain entered data. |
| Live generation | `POST /flow/generate` receives the full gathered `ctx`. | Reject. Most audited jobs need no model. No generic context-forwarding endpoint. |
| Provider | API route instantiates `DeepseekProvider` directly, ignores requested `model`, and bypasses Station routing. | Reject. Existing provider routing, policy, token-credit, quota, and observability contracts must win. |
| Persistence | Kindle, persona update, and memory review serialize turns, context, current step, and card directly to localStorage. | Reject for private or durable work. Use ephemeral state or a user/persona-scoped server draft with version, TTL, and reconciliation. |
| Resume | Raw localStorage restores mechanically and reattaches pending input. | Useful interaction goal, unsafe mechanism. Resume must be identity-scoped and schema-versioned. |
| Reset | Clears local state after a timeout; the surface does not expose a clear reset action. | Replace with explicit cancel/restart semantics where the job needs them. |
| UI primitives | Bubbles, chips, inline fields, swatches, reorder controls, composer, and object card. | Adapt choice, field, reorder, preview, and status primitives. Do not require chat bubbles for every task. |
| Object preview | Four hard-coded object types render a compact card. | Adapt to typed domain previews owned by each surface. |
| CSS | 587 global `.conv-*` lines, pill-heavy controls, fixed light assumptions, and source-shell dependencies. | Reject wholesale. Use accepted PR525 warm tokens and route-owned responsive layout. |
| Auth correction | Broad `accessToken` conversion includes incompatible local session types. | Split into an independently tested auth cleanup only if current Tex still needs it. |

### Required Action Contract

Any later guided-task engine must model at least:

```text
idle -> editing -> validating -> pending -> succeeded
                                  |          |
                                  v          v
                                failed     complete
                                  |
                                  +-> retry or cancel
```

It must not append success, follow-up, redirect, or completion turns before
the server action succeeds. Durable writes need idempotency appropriate to the
existing endpoint, server authorization, field-level validation, and a visible
recoverable error. A provider-generated turn can never authorize, validate,
price, moderate, publish, delete, rotate a secret, or define visibility.

## Rendered Findings

### Geometry And Mobile

| Finding | Measured result | Decision |
| --- | --- | --- |
| Developer Space create | Document width was `527px` at both `390px` and `375px`; the existing two-column parent clipped the flow and pushed the owned-space card offscreen. | Source layout fails mobile. A later adaptation must use one full-width column. |
| Primary billing route | At `/billing`, the two-column grid reduced `.conv-page-shell` to `2px` and `.conv-surface` to `0px` at both mobile widths. The flow existed but was invisible. | Source replacement fails a primary paid route. |
| Duplicate billing wrapper | `/settings/billing` remained `358px` at `390px` and `343px` at `375px`. | Duplicate routes produce inconsistent UX and must not be imported. |
| Source Studio rail | On persona routes, the old dark rail consumed about `183px` at `390px` and `182px` at `375px`. Flow widths fell as low as `122.9px` and `109.1px`. | Accepted PR525C full-width mobile collapse must win. |
| Desktop | Most simple shells rendered between `696px` and `1,282px`; Developer create was only `280px` inside a half-column. | Conversation width must follow the job, not one generic shell. |
| Page errors | Zero Playwright page errors across all 45 route/viewport cases. | Rendering stability does not offset contract and recovery failures. |

The only console noise was synthetic-harness fallout: one deliberately absent
persona architecture fixture and Developer Space WebSocket/EventSource calls
to the non-networked synthetic API origin. It is not product evidence.

### Keyboard And Accessibility

- Native buttons, inputs, reorder buttons, and labelled swatches are broadly
  keyboard reachable.
- After the first meaningful interaction, focus ended on `BODY` in 36 of 45
  cases because the answered control unmounted without focus transfer.
- The outer conversation and every system bubble each use `role="log"` and
  `aria-live="polite"`, creating nested duplicate announcement regions.
- Choice groups use `role="group"` without an accessible group name.
- Text fields have no maximum-length contract, inline validation association,
  or `aria-describedby` error target.
- The slider commits on mouse-up/touch-end only, not keyboard change. No fresh
  flow currently mounts it, but the primitive is not reusable as written.
- Smooth auto-scroll has no component-level reduced-motion branch.
- A later guided surface needs programmatic focus on the next prompt or error,
  one live region, named choice groups, stable back/cancel controls, and a
  non-conversational form fallback for complex jobs.

### Error And Recovery

Every mutation below returned a synthetic `503`. None showed a visible error
or retry control.

| Path | What the source told the user after failure |
| --- | --- |
| Profile save | `Done. Saved.` |
| Developer Space create | `Observatory created` and attempted navigation |
| Ingestion key rotation | `Key rotated`, then one-time-key and `Done` messages, without showing a returned key |
| Memory remove | Immediately advanced to the next memory |
| Billing checkout | `Redirecting to checkout`, then also exposed the billing-portal step |
| Workspace export | `No export started`, then `Export started` and promised a notification |
| Integrity start | `Session started.` |

The false-success behavior is generic, not seven isolated copy defects.

### Resume And Validation

- Kindle restored an `817` byte localStorage packet across refresh.
- Persona update restored a `778` byte packet containing boundary-flow state.
- Memory review restored a `747` byte packet containing the synthetic private
  memory title. This proves private memory text is serialized to localStorage.
- The packets have no user namespace, schema version, TTL, encryption, server
  reconciliation, or stale-record policy.
- Forum title validation disables empty and whitespace-only values, but a
  400-character title remains enabled with no `maxlength` or described error.
  Tex's server maximum is 300 characters.

## Route Inventory

| User job | Discern mount and definition | Current Tex surface |
| --- | --- | --- |
| Start a companion | `/studio/new`; `kindle-companion.ts`; `AwakeningFlow` | Same route and `AwakeningFlow`, currently a deterministic reviewed setup against the current persona API |
| Update a persona | `/studio/personas/[personaId]/edit`; `persona-update.ts` | Same route with complete `PersonaManagement` |
| Publish writing | `/studio/publish`; `publish.ts`; `PublishFlow` | Same route with draft, visibility, Space, review, and publication controls |
| Create a forum thread | `/forums/[categorySlug]/new`; `create-forum-thread.ts` | Same route with category ID, public-safe linked object selection, and visible validation/errors |
| Create a Developer Space | `/developer-spaces`; `create-developer-space.ts` | Same route with owner list, create contract, policy, visibility, quota, and observatory framing |
| Manage ingestion key | `/developer-spaces/[slug]/manage`; `dev-config.ts` | Existing owner/researcher console with one-time key handling, usage, live state, evidence, exports, and receipts |
| Create a public Space | `/space/new`; `create-space.ts` | Same route with bounded microsite preview, layout, theme, copy, and visibility controls |
| Edit a public Space | `/space/[slug]/manage`; `create-space.ts` | Same owner route loaded from `/spaces/:slug/manage` with complete prefilled settings |
| Run Integrity | `/studio/personas/[personaId]/calibration`; `integrity-session.ts` | Existing server-driven multi-turn Integrity Session |
| Review memory | `/studio/personas/[personaId]/memory`; `memory-review.ts` | Existing memory/canon lifecycle, trust, provenance, briefing, and runtime preview |
| Manage billing | `/billing` and added `/settings/billing`; `plan-billing.ts` | Canonical `/billing` with server-authoritative tier, price, entitlement, token-credit, and checkout/portal actions |
| Export workspace | `/studio/export` and added `/settings/export`; `export-workspace.ts` | Canonical `ExportWorkspace` over `/exports/workspace`, manifest/package list, and archive trust copy |
| Edit profile/account | Added `/settings/profile`; `profile-settings.ts` | Current `/settings` truthfully states self-service profile editing/deletion is unavailable |

## Per-Surface Decisions

### 1. Companion Setup

User job: establish a private companion with enough context, boundaries, and
provider choices to start continuity safely.

Source: deterministic choices plus free text and a forming companion card;
localStorage key `station.kindling.v2`; writes `/personas`. Its payload uses
lineage fields such as `companionType`, `onboardingPath`, and kindling answers.
Tex currently accepts name, descriptions, avatar, visibility, provider,
awakening prompt, and style notes. Private seed, import, and boundary text
must not be left raw in localStorage.

Decision: **adapt later**, never import. Preserve the one-question rhythm,
fast start, and live preview, but build a deterministic adapter to the current
persona contract, expose privacy/import authority, retain visible validation,
and use server-scoped draft state if resume is required. Candidate `PR526D`,
after PR526B/C.

### 2. Persona Update

User job: safely change an existing companion without losing access to its
architecture, continuity, archive, handoffs, public-chat, and Integrity tools.

Source: a quick conversational panel above management; localStorage stores the
transcript and context; it patches name, pronouns, presence, relationship,
memory behavior, and boundaries. Only name maps to the current Tex update
schema. Unsupported fields can be stripped while the source says they saved.
The full management surface remains necessary.

Decision: **split and defer**. A future quick-edit mode may expose only fields
the current API can round-trip and confirm. Do not replace
`PersonaManagement`; do not invent schema through UI copy. Requires a separate
product/schema decision before placement.

### 3. Publishing

User job: turn an owned draft into a correctly visible, attributable,
reviewable Station publication and optionally place it in an allowed surface.

Source: the only flow using live provider text. Deepseek generates praise,
then Station Blog, Reddit, Interactive Codex, and save choices converge on a
document write. `Save draft` performs no write. Cross-posting calls `/threads`
with an incompatible payload. The flow drops Space placement, community and
private review semantics, versioning, tier checks, and the existing rich draft
review.

Decision: **reject replacement and defer**. Provider praise adds latency and
privacy exposure without helping authorization. A later deterministic summary
or preview could be adapted inside the existing publish contract, but no
generic provider turn or destination fiction enters PR526.

### 4. Forum Thread

User job: create a category-scoped community thread with clear authorship,
moderation context, and only public-safe linked objects.

Source: deterministic title/body/flair/post-as prompts in memory. It posts to
`/threads` using `categorySlug` and `flair`; Tex uses `/forums/threads` with
`categoryId`, title, body, and allowlisted linked persona/Space/document IDs.
The source's body skip is incompatible with the server's non-empty body rule,
and its first-persona `post as` choice changes provenance semantics. The
400-character validation probe exceeded Tex's 300-character title limit.

Decision: **reject replacement**. A compact optional prompt layer could be
considered only after the current payload, public-safe linking, moderation,
provenance, and validation remain visible. Keep out of PR525F, which owns forum
composition rather than thread-create semantics.

### 5. Developer Space Creation

User job: create a live public/private/community observatory with an explicit
provider policy and understandable visualization.

Source: sequential name, purpose, visualization, and visibility prompts with
an object card; in-memory state; posts `name` and `observationType` and expects
`developerSpace`. Tex requires `projectName`, `visualisationType`,
`description`, four-state visibility, and `providerPolicy`, and returns
`space`. The source omits unlisted/community boundaries, provider policy,
quota/commercial truth, and overflowed to `527px` on both mobile widths.

Decision: **adapt preview and grouping only**. The current contract and
observatory language win. Candidate `PR526E` after PR526B/C, but only if MIMIR
places it after current UI closeout work.

### 6. Ingestion Key

User job: rotate an owner-only ingestion secret, understand immediate impact,
and capture the new key exactly once.

Source: in-memory confirmation calling
`/developer-spaces/:id/rotate-key`, expecting `{ key }`; Tex uses
`/developer-spaces/:id/api-key` and returns `{ apiKey, space }`. The source
claims the key is in settings without rendering the returned one-time secret,
and a failed request still says it rotated.

Decision: **reject conversational replacement**. Keep the explicit destructive
confirmation and dedicated one-time secret surface. Never put an ingestion
key in a transcript, model context, localStorage, toast history, or generic
object card. A copy refinement can happen in the Developer Space owner lane,
not PR526.

### 7. Space Creation

User job: create a bounded public microsite whose identity, layout, copy,
comments, and visibility are understandable before publication.

Source: deterministic title, tagline, four hard-coded color choices, and
public/private prompts with a small preview. It hard-codes slug/layout and
omits long description, comments default, and the current bounded layout
choice.

Decision: **adapt optional guidance plus persistent live microsite preview**.
The current Space API, form validation, bounded customization, and structural
visibility remain authoritative. Candidate `PR526E` after PR526B/C.

### 8. Space Editing

User job: change one or more existing microsite settings without losing
current values or owner-only controls.

Source: reuses create steps, loads `/spaces/:slug` instead of the owner manage
endpoint, and presents current data as placeholders rather than initial input
values. It can require retyping and overwrite omitted values. It drops long
description, layout, comments defaults, and owner-safe loading.

Decision: **reject source edit flow**. A later `change one thing` guided mode
could sit above the complete prefilled owner form, but no replacement is
placed until creation proves the shared primitives and owner round-trip tests.

### 9. Integrity Session

User job: enter a grounded, server-owned reflection sequence, answer prompts,
confirm summaries, and accept/edit/reject continuity outputs.

Source: chooses clusters and session type, calls `/integrity/start`, expects
`{ integritySession }`, and declares completion. Tex returns session ID,
question, cluster, turn ID, and plan state, then supports answers, summary
confirmation, ending early, outputs, and history. The conversion deletes the
actual multi-turn grounding workflow.

Decision: **reject replacement**. Integrity is already conversational because
the domain is conversational. Any visual reshell must wrap the existing
server-driven state machine and its honest errors; it must not be expressed as
a static client flow. Separate future Integrity UX lane only.

### 10. Memory Review

User job: assess memory/canon candidates with enough trust, provenance,
confidence, and runtime consequence to keep continuity grounded.

Source: localStorage-backed keep/adjust/remove queue calling
`PATCH /memory/:id`. Tex lifecycle changes use `/memory/:id/lifecycle` with
reinforce, quarantine, reject, supersession, trust/confidence, briefing, and
runtime preview. Source removal is immediate, unconfirmed, and failed removal
silently advances. Private memory titles and draft adjustments enter
localStorage.

Decision: **adapt later as a server-driven review queue**, while preserving
lifecycle vocabulary and visible trust/provenance. Use ephemeral or
server-scoped state only. Candidate `PR526F`, after PR526B/C and after an ARGUS
privacy/lifecycle review.

### 11. Billing

User job: understand current plan, entitlement, limits, token-credit behavior,
price, renewal, and the exact consequence of checkout or portal actions.

Source: duplicates `/billing` at `/settings/billing`, reduces plans to chat
choices, includes Free in a checkout path whose helper excludes it, and hides
price/features/limits. A failed checkout says it is redirecting and then
continues to portal choices. The canonical mobile route is invisible.

Decision: **reject replacement**. Keep the current server-authoritative cards,
status, actions, and no-dark-pattern clarity. A later assistive chooser may
recommend an existing deterministic action, but it cannot conceal price or
entitlement truth and needs its own billing review.

### 12. Workspace Export

User job: understand what is preserved and private, request an authoritative
workspace archive, and inspect package/manifest state.

Source: posts format/scope to `/exports`, expects `exportJob`, promises an
unimplemented notification, and replaces archive/package readback. Tex uses
`/exports/workspace` with a server-owned manifest bundle, package list, scope
truth, quota, and explicit trust language. Failure renders contradictory
cancel and success messages.

Decision: **reject replacement**. Archive is trust infrastructure. A guided
preflight explanation may later precede the existing export action, but the
manifest, package list, server scope, honest status, and canonical route must
remain visible.

### 13. Profile And Account

User job: understand account identity and safely change only capabilities the
backend actually supports.

Source: adds `/settings/profile`, patches `/auth/me`, deletes through
`/auth/me/delete`, and calls the result a public profile. Tex currently has
`GET /auth/me` only and truthfully states profile edit/deletion self-service is
unavailable. Spaces, not profiles, are Station's public microsites. Generic
conversational account deletion has insufficient consequence and recovery
design.

Decision: **reject until a dedicated product/backend lane exists**. Do not add
fake capability, public-profile framing, or account deletion to PR526.

## Boundary Map

| Boundary | Must remain true |
| --- | --- |
| Authorization | Existing route middleware and owner/persona/resource checks decide access. Client flow state never does. |
| Visibility | Existing public/community/unlisted/private enums, eligibility checks, and response scrubbers remain structural. |
| Provider | Existing Station router, allowed providers, policy evaluation, queueing, token credit, quota, and observability remain authoritative. |
| Generated text | Optional and non-authoritative. No model decides a payload, field validity, visibility, price, moderation, deletion, publication, or secret operation. |
| Persistence | No raw private memory, prompts, boundaries, billing context, account data, keys, IDs, or archive scope in localStorage. |
| Secrets | One-time keys render only in the dedicated owner secret surface and never become transcript/context data. |
| Billing | Server-returned tier, entitlement, price, checkout URL, and portal URL remain the source of truth. |
| Archive/export | Server manifest, package status, scope, quota, and failure state remain inspectable. |
| Moderation/provenance | Forum authorship, category authority, linked-object eligibility, and moderation rules remain explicit. |
| Errors | Failed writes stop progression, preserve entered data, focus the error, and offer retry/cancel without false success. |

## Reusable Primitive Recommendation

Do not port `ConversationSurface` or `useFlowEngine`. If PR526C is eventually
opened, build a smaller deterministic guided-task kit in Tex's existing design
system:

- `GuidedTaskSurface`: route-owned layout with title, progress, back, cancel,
  and one correctly scoped live region;
- `PromptStep`: a labelled question and helper/error relationship;
- `ChoiceGroup`: named single/multi-select using native controls and Station
  button styling rather than mandatory pills;
- `InlineField`: current-schema max length, validation, help, and preserved
  value;
- `DomainPreview`: a typed slot supplied by persona, Space, or Developer Space
  owners;
- `ActionStatus`: pending, failed, retrying, succeeded, and redirect status;
- `GuidedTaskController`: deterministic transitions only, no provider calls,
  no generic action callbacks, and no persistence until ARGUS accepts a typed
  draft contract.

Complex surfaces must retain a complete form or management fallback. Chat-like
presentation is a mode, not the domain architecture.

## Proposed Dependency Graph

```text
PR526A  ARIADNE adoption/deviation audit (this result)
  |
  v
PR526B  ARGUS backend/security/action-state preflight
  |
  +-- reject or type every persistence, provider, auth, visibility,
  |   idempotency, error, and durable-write boundary
  v
PR526C  deterministic guided-task primitives, tests, and accepted PR525 tokens
  |
  +--> PR526D companion setup pilot
  |
  +--> PR526E Space create pilot, then optional edit guidance
  |
  +--> PR526F server-driven memory lifecycle review queue
```

PR526D-F are proposals, not opened lanes. The first implementation should be
one pilot, not a cross-product conversion. Publishing, forum creation,
Developer key management, Integrity, billing, export, and profile/account stay
explicitly deferred or rejected until their owning contracts receive separate
decisions.

## PR525 Interaction

- PR525D continues. The source did not change the main companion page,
  `PersonaChat`, or companion rail; this audit did not touch its active files.
- PR525E continues against the accepted PR525 composition. It may reuse none
  of the source engine and owns chat visuals only, not creation/configuration
  semantics.
- PR525F continues. It owns Forums composition, not the thread-create payload
  or provenance redesign.
- PR525G may call fresh-head reconciliation complete once MIMIR records this
  adoption/deviation map and PR526B placement. It does not need to reproduce
  rejected source behavior to be current-head complete.
- Hosted PR525G should spot-check that accepted PR525C full-width mobile
  collapse prevents the source's clipped Studio-flow geometry.

Frozen pending MIMIR placement and ARGUS preflight:

```text
/studio/new
/studio/personas/[personaId]/edit
/studio/publish
/forums/[categorySlug]/new
/developer-spaces
/developer-spaces/[slug]/manage
/space/new
/space/[slug]/manage
/studio/personas/[personaId]/calibration
/studio/personas/[personaId]/memory
/billing
/studio/export
/settings and any proposed billing/export/profile aliases
```

The freeze blocks new redesign/expansion on these jobs. It does not block
small truthful bug fixes, current owner work, or PR525D-F in their assigned
files.

## Permitted Deviations

Tex is explicitly permitted to differ from `ff93308b` by:

- retaining forms, management panels, explicit review, and non-chat fallbacks;
- using accepted PR525 warm tokens instead of `.conv-*` global CSS;
- omitting generated praise and all generic `/flow/generate` calls;
- omitting source route aliases and keeping one canonical billing/export path;
- retaining current API payloads, provider routing, visibility enums, quotas,
  moderation, lifecycle, manifest, and secret handling;
- using server drafts or ephemeral state instead of localStorage;
- preserving complete Integrity, publishing, billing, archive, persona, and
  Developer Space owner surfaces;
- declining pill styling where native fields, segmented controls, checkboxes,
  swatches, or explicit action buttons are clearer;
- counting and planning the actual 13 jobs/15 mounts rather than repeating the
  source's unsupported 14-surface claim.

## Rejected Assumptions

- One generic flow runner can safely own all setup and configuration jobs.
- A logged action error may be ignored while the dialogue continues.
- Full gathered context is safe to forward to a provider.
- Hard-coded Deepseek is equivalent to Station provider policy.
- Browser localStorage is an acceptable private continuity draft store.
- Chat styling makes a destructive, paid, publishing, moderation, archive, or
  secret operation recoverable.
- Every source endpoint/payload maps to Tex.
- A placeholder is equivalent to a prefilled edit value.
- Spaces are public profiles.
- Integrity is only a start-session wizard.
- Export is complete when a notification is promised.
- Billing can hide price and entitlement details behind sequential prompts.
- Broad auth-token replacement belongs in this UX lane.
- Source global CSS can override the accepted PR525 frame.

## Validation

| Check | Result | Notes |
| --- | --- | --- |
| `git diff --name-status de7b918e..ff93308b` | Pass | Complete 55-file source delta inspected. |
| Synthetic Playwright matrix | Pass with product defects recorded | 45 route/viewport cases, 90 entry/interaction screenshots, zero page errors. |
| Complete/error/resume/validation probes | Pass as audit evidence | One clean completion, seven mutation failures, three refresh resumes, and forum length boundary reproduced. |
| Desktop/mobile geometry | Fail source acceptance | Developer create overflow, hidden primary billing flow, and old Studio rail clipping reproduced at `390px` and `375px`. |
| Error recovery | Fail source acceptance | Seven failed writes had no visible error/retry; six rendered explicit false success and memory silently advanced. |
| Accessibility review | Fail source acceptance | Focus loss, nested live logs, unnamed groups, missing length/error association, and keyboard-incomplete slider found. |
| Source `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Fail in source | Five `accessToken`/`access_token` errors in forum thread detail. No source code was patched. |
| Hosted production mutation | Not run by design | Audit used synthetic/read-only fixtures only. |

## Handoff

MIMIR should review this map, lock implementation or explicit deferral
placement, and wake ARGUS for PR526B before any source-derived engine,
endpoint, persistence mechanism, or converted mutation flow is implemented.
