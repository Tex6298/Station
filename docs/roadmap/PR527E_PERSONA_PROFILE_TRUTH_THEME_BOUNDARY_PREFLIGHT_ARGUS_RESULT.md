# PR527E - Persona Profile Truth And Theme Boundary Preflight Result

Owner: ARGUS / A3

Requested by: MIMIR / A1

Date completed: 2026-07-15

Status:

```text
ACCEPT_PR527E_PERSONA_PROFILE_TRUTH_THEME_BOUNDARIES
```

## Verdict

ARGUS accepts PR527E as a bounded owner-route truth, authorization, state, and
theme repair. Persona Profile is not a general identity editor. Its only live
product mutations are avatar URL save/clear, anonymous public chat alpha where
the existing route permits it, and context handoff creation. All other profile,
architecture, graph, archive, continuity, lifecycle, and Integrity data on this
page is read-only or navigational.

The opening packet contains one material source error: an owner-filtered
`DELETE /personas/:id` API route does exist. The current web page exposes no
persona deletion command. PR527E must preserve that UI boundary and must not
wire, advertise, test, or change deletion.

Acceptance is for the implementation boundary only. It does not claim that the
repair exists, that identity or visibility can be edited here, that every
secondary read is currently distinguishable from an empty result, or that a
hosted write lifecycle has passed.

## Sentinel Findings

| Finding | ARGUS ruling |
| --- | --- |
| Primary owner gate | `GET /personas/:id` is authenticated but not owner-only: a non-owner may receive the public serializer for a public persona. The edit page currently trusts that response. Before rendering `PersonaManagement`, the page must require `persona.ownerUserId === session.user.id`; missing or mismatched owner identity renders the same bounded unavailable state and must not mount secondary reads or live commands. |
| False empty states | Integrity, architecture, and memory-graph failures are currently caught and converted to empty arrays, `null`, or an empty graph. That turns read failure into false `No sessions`, `No handoffs`, `No memory nodes`, and lifecycle claims. Each read needs independent `loading`, `ready`, and `unavailable` state. Only a successful response may produce a zero/empty claim. |
| Notice and error leakage | Avatar, anonymous-chat, and handoff mutations share one notice rendered under Context Handoffs. Raw `Error.message` may also expose arbitrary service detail. Notices must be action-local, success must follow authoritative response readback, and failures must use the bounded copy below. |
| Existing GET side effect | `GET /personas/:id/architecture` is owner-scoped but calls `ensurePersonaLayerProfile`, which inserts a default profile when none exists. PR527E may retain the existing call but must not add, duplicate, or describe it as a database-pure read. `PATCH /:id/architecture` remains unused and frozen. |
| Navigation claim | `studio-navigation.ts` visibly describes Profile as `Identity, boundaries, and public controls` and the shortcut as `Shape identity and boundaries`. Those claims are part of the route context shown in desktop and mobile Studio navigation, so the two exact Profile copy entries are inside this repair. Other Studio navigation remains frozen. |
| Visual failure | Hosted Light leaves fixed white title/supporting copy on the Light route canvas while section panels remain fixed dark. Narrow widths preserve a `280px` second column and squeeze the first column to roughly `60px` or `45px`, producing overlap and clipping without necessarily increasing document scroll width. |

## Locked Truth Map

| Visible surface or command | Authoritative source | Kind, prerequisites, and contract | Refresh/readback truth | Required correction |
| --- | --- | --- | --- | --- |
| Persona name | Owner serialization from authenticated `GET /personas/:id`; explicit client owner-id match required | Read-only on this page. Although the API PATCH schema supports `name`, PR527E must not send it. | Initial successful owner read only. | Static labelled fact `Name`; never an input. Missing value uses `Not set`. |
| Short description | `persona.shortDescription` from the same owner read | Read-only here; no PATCH body is authorized. | Initial owner read. | Static fact `Short description`; `Not set` when absent. |
| Long description | `persona.longDescription` from the same owner read | Read-only here; no PATCH body is authorized. | Initial owner read. | Static fact `Long description`; do not collapse it into the short/public description. |
| Provider | `persona.provider` from the same owner read | Read-only here. The wider PATCH allow-list is not permission for this page to change provider. | Initial owner read. | Static fact `Provider`; no disabled select or read-only input. |
| Visibility and current public interaction | `persona.visibility` and owner public readback from `GET /personas/:id` | Read-only here. Public transition tier and Integrity behavior remain API-owned and outside PR527E. | Initial owner read. | Static fact `Visibility` with `Private` or `Public`; remove `Enable public interaction` checkbox and all edit implication. |
| Public chat | `persona.publicChatEnabled` from the owner read | Read-only here. PR527E must never send `publicChatEnabled`. | Initial owner read. | Static fact `Public chat` with `Enabled` or `Disabled`; remove the read-only checkbox. |
| Public description | `persona.shortDescription` from the owner read | Read-only here and may repeat the short-description value only where the Public access section needs it. | Initial owner read. | Static labelled value `Public description`; never a textarea. |
| Avatar URL save | Current owner value from `GET /personas/:id`; live draft is route-local React state | Mutating. Authenticated owner only. Exact request is `PATCH /personas/:id` with `{ avatarUrl: <draft string> }`. No tier gate. Server accepts only a public HTTPS image URL. | Do not claim success until `{ persona }` returns; replace saved value and draft from `response.persona.avatarUrl`. No optimistic success or automatic retry. | Live field `Avatar URL`, command `Save avatar URL`, adjacent bounded success/error notice. |
| Avatar URL clear | Same owner value | Mutating. Exact request is the same PATCH with `{ avatarUrl: null }`; owner only. | Returned persona is authoritative. Disable while token is unavailable, a save is pending, or there is nothing to clear. | Command `Clear avatar URL`, not ambiguous `Clear`. |
| Anonymous public chat alpha | `persona.publicAnonymousChatEnabled`, visibility, public-chat readback, and existing server authorization | Mutating. Exact request is `PATCH /personas/:id` with `{ publicAnonymousChatEnabled: boolean }`. Server requires owner, Public visibility, enabled public chat, safe public slug, and eligible owner tier. The client must not reproduce or weaken server policy. | Controlled value changes only from returned `response.persona.publicAnonymousChatEnabled`. Failure retains the prior authoritative value; no automatic retry. | One genuine checkbox/toggle under `Anonymous public chat alpha`; client-disabled without auth, while saving, when Private, or when public chat is Disabled. Explain other eligibility as server-authoritative product eligibility, not as a promise. |
| Layer architecture | Owner-only `GET /personas/:id/architecture`, profile keys `soul`, `body`, `faculty`, `skill`, `evolution` | Read-only client behavior. Existing GET may initialize a missing profile; architecture PATCH is forbidden. | Independent loading/ready/unavailable state. Only ready may summarize layers. | Section `Layer architecture`; support `Read-only layer summary.`; unframed rows, not cards inside a panel. |
| Memory graph | Owner-only `GET /memory/persona/:personaId/graph` | Read-only. Nodes and edges are bounded through existing safe readback helpers. | Independent loading/ready/unavailable state. A failed read must never become a zero-node claim. | Section `Memory graph`; honest loading/unavailable/empty/populated states. |
| Memory destination | `/studio/personas/:id/memory` | Navigation only. The destination may contain its own live controls; this page does not add an item. | Destination owns any later mutation/readback. | Link label `Open Memory`; remove `Add memory item`. |
| Canon count and destination | Count from `persona.continuity.canonCount`; destination `/studio/personas/:id/canon` | Count is read-only; link is navigation only. | Initial owner response for count; destination owns later behavior. | Link label `Open Canon`; remove `Add canon item`. |
| Files and archived chats | `persona.continuity.archiveFileCount` and `archivedChatCount` from the primary owner response | Read-only counts. | A successful primary owner response is the only client authority. | Present inside `Archive and continuity`; do not imply this page imports, edits, or removes files. |
| Archive/Files destination | `/studio/personas/:id/files` | Navigation only. `Archive` is the workspace destination and Files are its current source readback. | Destination owns later behavior. | Link label `Open Archive`. |
| Continuity count and destination | `persona.continuity.continuityRecordCount`; `/studio/personas/:id/continuity` | Read-only count plus navigation. | Initial owner response; destination owns later behavior. | Add explicit `Open Continuity` link. No continuity mutation on this page. |
| Context handoff save | Owner-only `POST /personas/:id/handoffs` | Mutating. Exact page body is `{ summary: trimmedText || undefined }`. Do not expose the route's wider `fromPersonaId`, `conversationId`, pending-task, emotional-context, or continuity-ref body fields. | The returned handoff is authoritative and must appear locally. Then refresh architecture once. If refresh fails after `201`, preserve the returned handoff and state that history refresh failed; never report save failure. No automatic POST retry. | Section `Context handoff`; command `Save context handoff`; section-local status. |
| Recent handoffs | `handoffs` from the owner architecture response, plus a newly returned handoff after a successful POST | Read-only history. | Loading/ready/unavailable is distinct. Ready-empty alone says there are no handoffs. | Subheading `Recent handoffs`; keep safe summary/date helpers and wrap long text. |
| Lifecycle history | `lifecycleEvents` from the owner architecture response | Read-only. | Shares the architecture request state but gets its own visible loading/unavailable/empty presentation. | Section `Lifecycle history`; no control or future-change promise. |
| Integrity history | Owner-only `GET /integrity/history/:personaId` | Read-only history. Integrity session/output queries are owner-filtered. | Independent loading/ready/unavailable state. Only ready-empty says there are no sessions. | Section `Integrity history`; safe bounded rows and `Open Integrity` navigation. |
| Run integrity / Start new | `/studio/personas/:id/calibration` | Navigation only on this page. Following the link does not itself start a session. | Integrity destination owns any later command and write. | Rename both visible entry points to `Open Integrity`; do not say `Run` or `Start new` here. |
| Back to chat | `/studio/personas/:id` | Navigation only to the owner companion route. | Destination owns conversation reads/writes. | Retain exact label `Back to chat`. |
| Persona deletion | Existing owner-filtered `DELETE /personas/:id`; no current web command | Unavailable in Persona Profile. No deletion request, import, button, warning, or lifecycle claim is authorized. | None. | Add no deletion UI. Tests must prove the component does not import/use `apiDelete` or render a delete command. |

All persona, architecture, handoff, memory, and Integrity routers retain
`requireAuth`. Architecture, handoff, graph, history, PATCH, and DELETE paths
also enforce owner filters. The exceptional primary `GET /personas/:id`
public-read behavior is why the client owner-id gate above is mandatory.

## Locked Visible Copy

The loaded header is exact:

```text
Persona profile
{persona name}
Review this persona's profile and continuity. On this page you can update the
avatar URL, change anonymous public chat when eligible, and save a context
handoff.
```

Header commands are:

```text
Back to chat
Open Integrity
```

The first section is:

```text
Profile facts
Name, descriptions, provider, visibility, and public chat are read-only on
this page.
```

Its static labels are `Name`, `Short description`, `Long description`,
`Provider`, `Visibility`, and `Public chat`. Empty text facts use `Not set`.
Live avatar copy is:

```text
Avatar URL
Use a public HTTPS image URL. Unsafe values are rejected.
Save avatar URL
Clear avatar URL
Avatar URL saved.
Avatar URL cleared.
Avatar URL was not saved. Check the URL and try again.
```

Public access copy is:

```text
Public access
Public description
Anonymous public chat alpha
Available only when this persona is Public, public chat is enabled, and the
owner account and public route are eligible.
Anonymous public chat alpha enabled.
Anonymous public chat alpha disabled.
Anonymous public chat was not changed. Refresh the profile before trying again.
```

The remaining section labels and bounded states are:

```text
Layer architecture
Read-only layer summary.
Loading layer architecture...
Layer architecture unavailable. Reload the page to try again.

Memory graph
Loading memory graph...
Memory graph unavailable. Reload the page to try again.

Archive and continuity
Open Memory
Open Canon
Open Archive
Open Continuity

Context handoff
Save context handoff
Recent handoffs
Loading handoff history...
Handoff history unavailable. Reload the page to try again.
Handoff saved. Recent history refreshed.
Handoff saved. Recent history could not be refreshed.
Handoff was not saved. Review the summary and try again.

Lifecycle history
Loading lifecycle history...
Lifecycle history unavailable. Reload the page to try again.

Integrity history
Loading Integrity history...
Integrity history unavailable. Reload the page to try again.
```

Existing safe helper copy may continue for successful empty/populated Memory,
handoff, lifecycle, relationship, and Integrity readback. It must be rendered
only after the corresponding request is ready.

Primary route states are exact and never echo `ApiRequestError.message` or an
API response body:

```text
Loading Persona Profile...

Persona Profile unavailable
Station could not load this owner-only profile. Return to Studio and try again.
Back to Studio
```

The generic unavailable state covers no session, not found, forbidden,
non-owner public serialization, malformed owner response, and read failure. It
must not reveal whether a persona id exists or is public.

The two visible Studio Profile context corrections are exact:

```text
detail: Profile facts and limited owner controls
state: Name, descriptions, provider, visibility, and public chat are read-only
       here. Avatar URL, eligible anonymous chat, and handoffs are live.
shortcut detail: Review profile facts and limited controls
```

## State And Mutation Contract

The component must use independent state for:

- primary owner load;
- architecture/profile, handoff-history, and lifecycle readback;
- memory graph readback;
- Integrity history readback;
- avatar draft/saved value/pending/notice;
- anonymous-chat authoritative value/pending/notice; and
- handoff draft/pending/notice.

`Promise.all` with catch-to-empty is forbidden. `Promise.allSettled`, explicit
per-request resolution, or an equivalent independent state machine is allowed.
One failed optional read must not erase successful data from another read.

The component sends exactly four request forms across three mutation
capabilities:

```text
PATCH /personas/:id  { avatarUrl: string }
PATCH /personas/:id  { avatarUrl: null }
PATCH /personas/:id  { publicAnonymousChatEnabled: boolean }
POST  /personas/:id/handoffs  { summary: string | undefined }
```

Save and clear are two commands over one avatar contract. No request may
spread a Persona object, include identity/provider/visibility/public-chat
fields, call architecture PATCH, or call DELETE. Pending actions are disabled,
never automatically retried, and never declared successful from click/submit
alone.

## Semantic Presentation Contract

Use route-scoped classes beginning with `.persona-profile-` under a
`.persona-profile-page` root. The edit page's loading, unavailable, and loaded
states all use that root. `globals.css` may use only the existing semantic
Station variables for this route, including:

```text
--station-page-bg
--station-page-surface
--station-page-soft
--station-page-soft-2
--station-page-border
--station-page-border-strong
--station-page-text
--station-page-muted
--station-page-faint
--station-page-accent
--station-page-blue
--station-page-red
--station-page-on-strong
--station-page-hover
--station-page-success-bg/text/border
--station-page-warning-bg/text/border
--station-page-danger-bg/border
```

No fixed hex/rgb/hsl page color, Discern token, gradient, opacity-only state,
or `!important` override belongs in the component or new route rules. Heading
sizes use fixed `rem` values with a breakpoint, never `vw` or viewport-based
`clamp()`.

Required structure:

- one constrained route inner area and one responsive main grid;
- static facts use semantic `dl`/`dt`/`dd` or equivalent labelled text;
- outer sections may be bounded panels at no more than `8px` radius;
- facts, metrics, layers, graph rows, lifecycle rows, handoff rows, and history
  rows inside sections are unframed or separated by dividers, not decorative
  cards nested inside cards;
- live fields and notices retain their necessary control/status boundaries;
- all grid/flex children use `min-width: 0`, long values use safe wrapping, and
  no owner text is ellipsized where the full readback is required;
- at `820px` or below, the main grid becomes one column and section/link/action
  rows wrap without fixed second-column minimums;
- mobile bottom spacing keeps content and commands clear of the Studio mobile
  navigation at every scroll position;
- text controls and buttons have stable minimum height of at least `40px`, and
  checkboxes/toggles do not shift surrounding layout while pending;
- read-only facts, live controls, pending controls, and unavailable readbacks
  are visually and semantically distinct;
- every link, button, input, textarea, and checkbox gets an explicit
  `:focus-visible` outline at least `2px` plus offset; and
- hover styling is scoped to hover-capable pointers and does not replace focus,
  active, disabled, or pending state.

Normal text and meaningful state copy must meet `4.5:1`; large text, focus
indicators, control boundaries, and selected/pending state boundaries must meet
`3:1` against adjacent colors. System, Light, and Dark must all use the same
semantic structure without a fixed-dark island.

## Read-Only Hosted Orientation

ARGUS used one existing replay-owner persona, ephemeral appearance selection,
and no Persona Profile command. API and web were healthy on the same deployed
SHA `da105cf077b224abfa2a3e48e0cc00b52bd34455`. This was defect orientation on
the pre-implementation deployment, not acceptance proof for PR527E.

| Check | Observed truth |
| --- | --- |
| Matrix | All `9/9` combinations loaded at `1440x900`, `390x844`, and `375x812` across System, Light, and Dark. System was resolved through emulated dark preference. |
| Light contrast | The fixed white H1 measured about `1.06:1` on the Light canvas; supporting copy measured about `1.96:1`. The first section remained a fixed dark surface in every theme. |
| Typography | H1 computed to `46px` at desktop and `30px` at both narrow widths through viewport-scaled `clamp()`. |
| Narrow geometry | Document scroll width equalled client width, but the main desktop grid resolved to roughly `60px + 280px` at `390` and `45px + 280px` at `375`. Visual inspection confirmed severe cross-column overlap and clipping. A no-overflow assertion alone would miss this failure. |
| Faux versus live controls | The page exposed `13` controls: six read-only controls and two disabled controls mixed with live avatar, anonymous-chat, and handoff controls. Read-only checkboxes/selects looked actionable. |
| Focus probe | `18` route focus targets were inspected; none met the probe's explicit at-least-`2px` outline or focus-shadow criterion. Source contains no route focus-visible treatment. |
| Diagnostics | Zero HTTP responses at `400+`, zero page errors, and zero console errors. Intermittent cancelled Next route-prefetch GETs did not change the loaded page result. |
| Product writes | Zero browser-side non-GET attempts and zero profile command invocations. No avatar PATCH, anonymous PATCH, handoff POST, Integrity action, or delete ran. Authentication session setup/cleanup was the only non-GET work outside the browser. |
| Architecture caveat | The existing architecture GET returned the existing layer profile. Because source can initialize a missing layer profile, this evidence claims no profile command/write request, not universal database-pure GET behavior. |
| Evidence handling | Temporary screenshots were inspected locally, then deleted. No screenshot, owner value, persona id, token, credential, or temporary probe remains in the worktree. |

## Exact Implementation Boundary

DAEDALUS may change only:

```text
apps/web/app/studio/personas/[personaId]/edit/page.tsx
apps/web/components/studio/persona-management.tsx
apps/web/lib/studio-navigation.ts
apps/web/lib/studio-navigation.test.ts
apps/web/lib/public-persona-route.test.ts
apps/web/app/globals.css
docs/roadmap/PR527E_PERSONA_PROFILE_TRUTH_THEME_REPAIR_DAEDALUS_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/DAEDALUS.json
```

File-specific limits:

- the edit page changes only its owner validation, bounded load/error states,
  route classes, and rendering handoff to `PersonaManagement`;
- `persona-management.tsx` changes only the truth/state/presentation and exact
  existing mutations mapped above;
- `studio-navigation.ts` changes only the Profile auxiliary detail/state and
  Profile shortcut detail quoted above;
- `studio-navigation.test.ts` changes only to prove those Profile claims and
  unchanged owner route destinations;
- `public-persona-route.test.ts` may add focused Persona Profile source/contract
  assertions alongside its existing bounded owner-avatar test;
- `globals.css` receives only `.persona-profile-*` rules and narrow descendants
  under `.persona-profile-page`; shared token definitions and unrelated
  selectors remain unchanged; and
- no package-script change is needed because both focused test files already
  run in `test:studio-ui` or `test:writing`.

## Frozen Scope

The following remain unchanged:

- `apps/api/**`, `packages/types/**`, `packages/db/**`, migrations, RLS,
  generated types, auth middleware, tier/permission/billing policy, and cache
  behavior;
- persona create/update/delete, architecture, handoff, public-persona,
  anonymous-chat, Memory, Canon, Archive, Continuity, and Integrity API
  contracts;
- `apps/web/lib/api-client.ts`, `apps/web/lib/auth.ts`, middleware, Studio
  layout/sidebar components, Persona Workspace components, lifecycle helpers,
  public persona routes, Discover, chat, Memory, Canon, Archive, Continuity,
  Integrity, settings, and billing pages;
- all non-Profile Studio navigation copy;
- identity, description, provider, visibility, public-chat, layer, graph,
  lifecycle, Integrity, file, archive, continuity, or deletion mutation UI;
- avatar upload/storage/media generation, public discoverability, deletion
  confirmation, cleanup guarantees, new endpoint, schema, helper service,
  dependency, package, lockfile, hosted runtime, Railway, Supabase, Cloudflare,
  queue/worker, provider, partner adapter, social, or billing work; and
- hosted product/data writes during implementation or review.

## Required Focused Tests

Tests must prove at minimum:

- the edit page restores auth, reads the requested persona, requires exact
  owner id, and renders generic unavailable for missing/mismatched/malformed
  owner truth before mounting `PersonaManagement`;
- no raw API message is rendered in primary or action failures;
- profile name, short/long description, provider, visibility, public chat, and
  public description are static facts rather than input/select/textarea/
  checkbox controls;
- the only mutation imports are PATCH and POST and the only request paths/body
  shapes are the four forms listed above;
- identity/provider/visibility/public-chat/architecture/delete request bodies
  and `apiDelete` are absent;
- architecture, graph, and Integrity failure cannot render ready-empty copy;
- avatar, anonymous-chat, and handoff notices are separate, adjacent, bounded,
  and response-authoritative;
- a handoff `201` followed by architecture refresh failure still displays the
  returned handoff and honest partial-success notice;
- exact Back to chat, Memory, Canon, Archive, Continuity, and Integrity hrefs
  remain navigation only;
- exact Profile route-context and shortcut copy is corrected without changing
  other Studio destinations;
- component/page source contains no fixed theme color, viewport font scaling,
  raw console output, secret-shaped evidence, delete command, upload/media
  expansion, or unrelated domain term; and
- route CSS is token-only, scoped, responsive, and includes explicit hover,
  focus-visible, disabled/pending, status, and narrow-grid rules.

DAEDALUS and ARGUS must run:

```text
npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/public-persona-route.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/persona-lifecycle-ui.test.ts
npx --yes pnpm@10.32.1 test:writing
npx --yes pnpm@10.32.1 test:studio-ui
npx --yes pnpm@10.32.1 test:personas
npx --yes pnpm@10.32.1 test:integrity
npx --yes pnpm@10.32.1 test:persona-context
npx --yes pnpm@10.32.1 --filter @station/web typecheck
npx --yes pnpm@10.32.1 --filter @station/api typecheck
npx --yes pnpm@10.32.1 --filter @station/web lint
git diff --check
```

## Required Local Rendered Proof

Use synthetic/intercepted responses only. No local proof may reach hosted
mutation routes. Cover:

1. delayed primary load, successful exact-owner load, no session, malformed
   owner response, non-owner public serialization, `403`, `404`, and generic
   read failure;
2. independent delayed/success/ready-empty/failure states for architecture,
   graph, and Integrity reads, including one-success/two-failure combinations;
3. populated long persona/layer/relationship/lifecycle/handoff text and all
   empty states without overlap, clipping, or horizontal page overflow;
4. intercepted avatar save, avatar clear, anonymous enable/disable, and
   handoff save with exact bodies, pending state, authoritative response,
   bounded failure, and no automatic retry;
5. handoff POST success followed by refresh failure and retained returned-item
   readback;
6. every navigation destination without mutation dispatch;
7. System, Light, and Dark at `1440x900`, `390x844`, and `375x812`, including
   loaded, loading, unavailable, pending, success, and failure representatives;
8. keyboard-only focus order, visible focus, hover-capable pointer state,
   disabled distinction, stable control dimensions, contrast thresholds, and
   no content hidden by desktop or mobile navigation; and
9. zero page errors, zero unclassified console errors, exact changed-path scan,
   forbidden-scope scan, and secret/private-evidence scan.

Screenshots or traces containing owner content, ids, tokens, cookies, request
headers, or mutation bodies must not be committed. Synthetic proof fixtures use
obviously fake values only.

## Hostile ARGUS Gates

ARGUS must reject the implementation if any of these is true:

- a changed path falls outside the allow-list or an allowed file exceeds its
  file-specific limit;
- non-owner public serialization can mount the owner component or secondary
  owner reads;
- a failed optional read still becomes a zero/empty claim;
- any visible copy implies identity, provider, visibility, public chat,
  architecture, Memory, Canon, Archive, Continuity, Integrity, or deletion is
  editable on this page;
- a mutation body contains anything beyond the exact avatar, anonymous-chat,
  or handoff-summary keys;
- success is optimistic, an unknown result is retried automatically, or a
  successful handoff is called failed because refresh failed;
- raw API/server errors, owner data, ids, secrets, tokens, cookies, headers,
  URLs with credentials, debug logs, or private screenshots enter UI, logs,
  docs, tests, or committed files;
- fixed dark colors, viewport font scaling, nested decorative cards, weak
  focus, overlap, clipping, sticky obstruction, or insufficient contrast
  remains in any matrix case; or
- the patch touches backend, schema, auth, tier, billing, provider, hosted
  runtime, Cloudflare, queue/worker, partner adapter, public persona, Discover,
  package, or lockfile scope.

## Final Exact-SHA ARIADNE Gates

After ARGUS accepts the implementation and web/API report the same exact
accepted SHA, ARIADNE must run a zero-product-write human rehearsal:

1. prove signed-out access follows the existing protected-route behavior and
   discloses no owner profile data;
2. open one existing replay-owner profile and verify the exact header, static
   facts, three genuinely live capabilities, section-local notices, and no
   deletion or broader edit affordance;
3. inspect architecture, graph, archive/continuity, handoff, lifecycle, and
   Integrity ready states without manufacturing an empty/error claim;
4. follow Back to chat, Open Memory, Open Canon, Open Archive, Open Continuity,
   and Open Integrity as read-only navigation, returning to Profile each time;
5. inspect System, Light, and Dark at `1440x900`, `390x844`, and `375x812` for
   contrast, wrapping, one-column collapse, control geometry, focus order,
   hover/disabled state, mobile-nav clearance, and no overlap/clipping/
   horizontal overflow;
6. record zero page errors, zero unclassified console errors, and no failed
   product response; and
7. assert zero avatar PATCH, anonymous PATCH, handoff POST, Integrity start,
   architecture PATCH, DELETE, or any other product write. Do not type into or
   activate a live profile command.

Hosted proof may claim only truthful read-only presentation and navigation. A
real avatar, anonymous-chat, handoff, Integrity, identity, visibility, public
chat, or delete lifecycle requires a separately authorized disposable fixture
and cleanup contract.

## Preflight Verification

| Check | Result | Notes |
| --- | --- | --- |
| Wake and changed-path review | Pass | Committed wake `da00b43e` changed roadmap/status documentation only and requested this exact read-only preflight. |
| Source truth/authorization audit | Pass as boundary evidence | Primary public-serializer exception, owner filters, exact PATCH/POST bodies, architecture ensure behavior, DELETE existence, and all visible destinations were traced. |
| Focused web/navigation/lifecycle baseline | Pass, `37/37` | Existing helpers and bounded owner/public source assertions pass before implementation. |
| Persona API baseline | Pass, `18/18` | Includes non-owner public serializer, owner avatar, anonymous owner gate, and owner public-interaction readback. |
| Integrity API baseline | Pass, `3/3` | Includes bounded history failures and owner lifecycle behavior. |
| Persona context baseline | Pass, `12/12` | Includes owner-scoped memory graph and bounded graph failures. |
| Hosted nine-case orientation | Pass as defect evidence | Same healthy API/web SHA; Light contrast and narrow overlap failures reproduced; no profile command or browser non-GET ran. |
| Temporary evidence cleanup | Pass | Probe and screenshots removed; no owner value/id/credential artifact remains. |
| Implementation work | None | ARGUS changed roadmap/testing documentation and its watcher receipt only. |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed PR527E's read-only Persona Profile truth/theme preflight.
Verdict:
- ACCEPT_PR527E_PERSONA_PROFILE_TRUTH_THEME_BOUNDARIES
Task:
- Wake DAEDALUS with the exact implementation allow-list and gates recorded in the ARGUS result.
- Keep the wider PR527 correction programme moving.
```
