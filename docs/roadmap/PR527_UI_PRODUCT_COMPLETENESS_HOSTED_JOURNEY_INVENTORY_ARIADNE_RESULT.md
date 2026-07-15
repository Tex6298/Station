# PR527 - UI Product Completeness Hosted Journey Inventory Result

Owner: ARIADNE / A4 -> MIMIR / A1

Date completed: 2026-07-15

Status:

```text
PR527_INVENTORY_COMPLETE_CORRECTIONS_REQUIRED
```

## Verdict

Station is not yet complete at the product-journey level.

Two principal journeys currently satisfy both the hosted working gate and the
broader visual gate. Four principal journeys fail because a supported surface
is misleading, incomplete, or visibly broken. Six have an exact hosted
dependency or safe-fixture blocker. One is truthfully unavailable to the
replay owner's tier.

| Principal result | Count | Journey IDs |
| --- | ---: | --- |
| Hosted pass | 2 | `J08`, `J13` |
| `FAIL_PRODUCT` | 4 | `J02`, `J07`, `J09`, `J11` |
| `BLOCKED_HOSTED_DEPENDENCY` | 6 | `J01`, `J03`, `J04`, `J05`, `J10`, `J12` |
| `TRUTHFULLY_UNAVAILABLE` | 1 | `J06` |
| `OUTSIDE_SUPPORTED_PRODUCT` | 0 | None |

The first correction should be a truth repair on `/studio/notes`. The route
currently invites private writing into an in-memory editor, restores seeded
faux notes on refresh, silently loses the user's work, and presents nine inert
editor/workflow commands. That is the smallest route-specific slice with the
highest direct trust harm.

## Exact Hosted Truth

Both deployment endpoints returned HTTP `200`, `ok: true`, and `ready: true`
immediately before the final inventory was written.

| Service | Railway service | Branch | Exact deployed code SHA |
| --- | --- | --- | --- |
| Web | `@station/web` | `main` | `857a7e734662a9b586515d4575401a02dc843e20` |
| API | `@station/api` | `main` | `857a7e734662a9b586515d4575401a02dc843e20` |

The PR527 opening commit is documentation-only. Railway correctly skipped a
new deployment because no watched runtime file changed. The hosted deployment
is therefore the exact code under review, not a stale deployment.

## Method And Evidence Safety

- The hosted Railway application and API were exercised as signed-out readers
  and as the designated replay owner.
- Discovery mounted `59` route/viewport cases and recorded `1,120`
  route-specific command instances after de-duplication. Dynamic titles and
  private fixture labels were reduced to route-shaped command families.
- Safe disposable writes were used for Forum threads/comments, conversations,
  Memory, Canon, archive import, and exports. No Space, persona, document,
  Project, report, Integrity Session, Developer Space, key, or billing change
  was retained accidentally.
- Disposable Forum threads/comments were removed. New conversation, Memory,
  and Canon counts were restored to their starting values. No credential,
  cookie, token, raw identifier, provider payload, private prompt, archive
  body, Stripe URL, or ingestion key is present in this result.
- One owner-private synthetic paste-import source remains because the accepted
  archive retention design preserves import source metadata and the product
  has no source lifecycle/removal command. New export manifests also remain as
  owner-only append-only packages by their current contract.
- Screenshots and raw browser evidence remain temporary local material and are
  not part of this commit.

## Principal Journey Inventory

Every row has one current result from the required vocabulary. A blocker does
not count as a pass even when its unavailable/error treatment is truthful.

| ID | Role, route, viewport/theme, and fixture | Expected behavior | Actual mutation, readback, refresh, and cleanup | Evidence-safe finding | Result |
| --- | --- | --- | --- | --- | --- |
| `J01` | Signed out and replay owner; `/`, `/signup`, `/signup/confirm`, `/login`, `/reset-password`, `/update-password`, `/studio`; desktop System plus narrow Light/Dark auth coverage; replay owner and a non-deliverable reset address. | Complete account entry, confirmation, recovery, persistence, truthful failure, and sign-out. | Invalid login was truthful. Reset request and missing-recovery-token states were truthful. Real login, refresh persistence, ordinary navigation persistence, and sign-out passed. No account was created and no owner password was changed, so no cleanup was needed. | A disposable inbox/account is unavailable, and changing the only replay-owner credential is unsafe. Delivery, confirmation, and password-update readback remain unproved. | `BLOCKED_HOSTED_DEPENDENCY` |
| `J02` | Replay owner; Studio onboarding and `/studio/personas/:id/edit`; `390x844` Dark and `1440x900` Light; attempted private disposable persona plus an existing replay persona. | Create/import a persona, edit identity/setup, return to Studio, and clean it up where supported. | Private was the creation default. Final creation returned HTTP `403`: the Private-tier persona limit is already reached. No orphan was created. On the existing profile, name, description, provider, and visibility are read-only; only avatar/public-chat details and handoff creation are live; no persona-delete command exists. | The page says it manages identity and public visibility but does not let the owner edit either. In Light, the hard-coded dark surface leaves the white title on the light page frame. The quota blocker does not excuse the misleading maintenance surface. | `FAIL_PRODUCT` |
| `J03` | Replay owner and existing replay persona; `/studio/personas/:id`; desktop Dark; two bounded disposable prompts. | Select/start/continue a conversation, receive or truthfully fail a reply, recap/archive, refresh, and return to authoritative state. | Direct and UI sends both failed truthfully. The API returned HTTP `503`, code `provider_policy_blocked`, classification `provider_data_policy`. The UI exposed the accepted-provider setup link. Two disposable conversation shells were deleted with HTTP `204`, and the starting count was restored. | Hosted private chat needs an accepted owner provider. Recap, archive, and completed-reply refresh cannot be proved until that dependency exists. | `BLOCKED_HOSTED_DEPENDENCY` |
| `J04` | Replay owner and existing replay persona; Memory, Memory inbox, Continuity, Canon, and Integrity routes; desktop Dark. | Review candidates through supported decisions, verify Memory/Canon/Continuity readback, and run or truthfully gate Integrity. | Disposable Memory and Canon records reached the authoritative API; Canon refresh readback passed and the Memory row was present for cleanup. Both were deleted with HTTP `204`. Memory inbox, `Reject`, `Accept with edits`, Continuity, and `Start Integrity Session` were reachable. Existing candidates were not mutated, and no Integrity Session was started. | Existing candidates are not disposable. Persona quota prevents a fresh parent, and Integrity Sessions have no cleanup contract. These are exact safe-fixture blockers, not permission to mutate owner history. | `BLOCKED_HOSTED_DEPENDENCY` |
| `J05` | Replay owner and existing replay persona; persona Archive and `/studio/archive`; desktop Dark; one synthetic private paste source. | Preview/import, process, refresh, search, connect retrieval to companion continuity, and clean up where supported. | Preview/confirm completed, the source survived refresh, and Global Archive search returned it. Derived disposable Memory rows were cleaned. The source/import row remains owner-private because no source lifecycle/removal command exists. | Import and retrieval work. End-to-end companion retrieval is blocked by the same accepted-provider policy as `J03`, while deletion cannot be invented outside the accepted source/chunk retention design. The UI also does not explain that durable retention at import time. | `BLOCKED_HOSTED_DEPENDENCY` |
| `J06` | Replay owner on Private tier; `/studio/publish`; desktop Dark. | Create/edit/preview/publish only when entitlement and destination permit it, with truthful unavailable states otherwise. | The page names Creator tier or above before mutation. `Save draft` and `Send for review` remain disabled after valid title/body entry. Scheduling and external connectors are explicitly deferred. No document was created. | The capability is unavailable to this tier and does not present a false successful action. | `TRUTHFULLY_UNAVAILABLE` |
| `J07` | Replay owner on Private tier; `/space/new`; `1440x900` and `390x844` Dark; synthetic private Space attempt. | Preflight entitlement, require explicit safe visibility, create/edit/read/clean up when entitled, or truthfully gate before a live form. | The form initially selected Public, exposed a live `Create Space` command, and gave no entitlement explanation before completion. After the owner switched to Private and submitted, it returned the Creator-tier error and remained on the form. No Space was created. | Public visibility is not opt-in here, and the zero-Space entitlement is discovered only after a full form submission. That violates structural visibility and visible-command truth. | `FAIL_PRODUCT` |
| `J08` | Signed out; `/` -> `/discover` -> public Space -> public document -> linked Forum thread; `1440x900`, `390x844`, and `375x812` distributed across System, Light, and Dark; existing public fixtures. | Traverse the public front door, search/filter, read public material, and retain private/owner boundaries. | Home-to-Discover navigation, public Space, document trust readback, linked Forum thread, search, and filters all worked. No owner edit controls appeared. Search returned no owner-route links, and `/studio` redirected to login. No mutation contract applies. | The Space branch of `Space/persona` passes end to end with no overflow. No public-persona link was discoverable from Discover/search or the hosted Space set; that is recorded separately as a public identity gap, not hidden inside this passing Space chain. | `PASS_HOSTED_READ_ONLY` |
| `J09` | Replay owner; Forum index/category/new/thread/moderation; `1440x900` and `375x812` Dark; disposable thread and reply. | Create, reply, recognise/report where eligible, refresh, moderate truthfully, and clean up. | Thread and reply writes passed authoritative API and refresh readback. Reply UI cleanup passed; thread API cleanup returned HTTP `200` and subsequent `404`. Own-contribution truth was correct. Thread watch GET returned `500/thread_watch_load_failed`; PUT and DELETE returned `500/thread_watch_update_failed`. No thread-delete UI exists. | The visible watch command cannot load, update, or clean up. The Dark thread uses near-black body text on dark cards, making the post and reply nearly unreadable. Second-actor report/recognition remains unproved, but the row already has direct product failures. | `FAIL_PRODUCT` |
| `J10` | Replay owner and signed-out reader; `/developer-spaces`, existing manage/public observatory routes; desktop/narrow Light/Dark; existing observatory only. | Create a disposable observatory, rotate a key, ingest/read back safely, inspect public/owner views, and clean up. | Public observatory and owner/public boundary reads passed. On the Private tier, create fields and `Create observatory` are disabled with a Billing explanation. Rotating an active fixture key was not safe, and no Developer Space deletion contract exists. | An entitled disposable owner/observatory and key cleanup contract are absent. Existing production-like fixture keys cannot be rotated for rehearsal. | `BLOCKED_HOSTED_DEPENDENCY` |
| `J11` | Replay owner; `/settings`, `/settings/social`, `/notifications`, and persona profile; `1440x900` Light/Dark and `390x844` Dark. | Persist safe profile, privacy, notification, and provider changes with truthful paused states. | Provider fields and save command are live, and chat links to them. Profile editor and Privacy are explicitly coming soon. Notification preferences explicitly say they are not persisted. Social says `Connector paused`; account deletion is truthfully unavailable. No fake persistence mutation was attempted. | A settings destination that admits its checkboxes do not persist cannot pass a settings-persistence journey. Persona identity/public visibility are also read-only, and legacy Light/Dark treatment is incoherent. | `FAIL_PRODUCT` |
| `J12` | Replay owner; `/billing`; `1440x900` and `390x844` Dark; current test-mode subscription. | Open Stripe Checkout/portal safely, return from cancel, and preserve authoritative entitlement. | Portal handoff reached Stripe. Cancel return copy was truthful and the tier remained unchanged. Upgrade is visible, but Checkout did not reach Stripe and surfaced a recoverable Stripe configuration/session failure. No payment detail was entered. | Hosted Checkout price/session configuration is the exact blocker. Dark billing also contains very low-contrast limits, status text, and portal treatment. | `BLOCKED_HOSTED_DEPENDENCY` |
| `J13` | Replay owner and signed-out reader; `/studio/export` and persona Files; desktop Dark plus `390x844` Light; current authoritative workspace/persona. | Create manifests, refresh, open JSON/Markdown/portable readback, retain owner-only access, and show truthful durable status. | Workspace and persona manifests were created, survived refresh, and opened JSON/Markdown/portable readback. Signed-out access redirected to login. Narrow routes/readbacks had no overflow and no page errors. Packages remain owner-only and append-only by contract. | The current export/portability journey works and is visually usable at desktop and narrow width. It does not claim backup, restore, retention expiry, or disaster recovery. | `PASS_HOSTED_WRITE_READBACK_CLEANUP` |

## Working-And-Pretty Journeys

Only these principal journeys currently clear both gates:

1. `J08 Public discovery chain`: signed-out public navigation, search/filter,
   Space, document trust, linked discussion, privacy boundaries, all three
   appearance modes across the required viewport set, and no overflow.
2. `J13 Export and portability`: real owner writes, authoritative refresh
   readback, owner-only access, desktop/narrow presentation, and durable package
   truth.

`J06` is truthful, but it is unavailable rather than a completed working
journey. The other ten rows require a correction or exact dependency before
they can join this list.

## Appearance And Responsive Findings

| Coverage | Hosted result |
| --- | --- |
| System | Public home, Discover, Space, document, and linked Forum chain exercised with system preference resolving from dark media. |
| Light | Discover, public readback, persona profile, and narrow export readback exercised with explicit Light. |
| Dark | Studio, companion failure, Memory/Continuity/Integrity, Archive, publishing, Space builder, Forums, Developer Space, Billing, Settings, Notes, Assistant, and Projects exercised with explicit/resolved Dark. |
| Desktop | Principal and route-family surfaces exercised at `1440x900`. |
| Narrow | High-risk public chain, forms, Forum thread, Settings/Billing, persona creation, Space creation, and exports exercised at `390x844` and/or `375x812`. |
| Geometry | Discovery and focused runs found zero document-level horizontal overflow and zero browser `pageerror` events. |

PR525H remains valid for the shared navigation, Discover, Forum shell, Studio,
companion, and public observatory matrix. PR527 exposed principal routes outside
that matrix which still retain legacy or fixed-theme styling:

- Persona Profile resolves Light while rendering a hard-coded dark workbench;
  its white title sits on the surrounding light page frame.
- Forum thread cards in Dark render core post/reply text in fixed dark colours
  against dark cards.
- Billing Dark renders plan limits, subscription detail, and the portal action
  at visibly inadequate contrast.
- Notes is a fixed dark surface and does not participate in shared appearance
  treatment.
- Settings mixes a dark frame with large fixed-light sections, and publishing
  retains a paper-light workspace inside a dark Studio shell.

## Route-Family Appendix

These routes are visible beyond the natural `J01`-`J13` chain. Results describe
the current hosted user truth, not an inferred future feature.

| Route family | Current hosted classification | Result |
| --- | --- | --- |
| Station Assistant, `/studio/assistant` | Operational copy explicitly says it is not a persona. Summary and a bounded `Ask Assistant` request returned computed route actions without durable mutation. | `PASS_HOSTED_READ_ONLY` |
| Notes, `/studio/notes` | Owner gate works, but seeded faux notes, local-only editing, non-filtering search, and nine inert commands create silent private-work loss on refresh. | `FAIL_PRODUCT` |
| Projects, `/projects` and `/projects/:slug` | Existing owner projects read back, create defaults Private, manifests/attachments are visible, but creation has no visible or API cleanup lifecycle and old synthetic rows remain. Do not create more fixtures until lifecycle truth exists. | `FAIL_PRODUCT` |
| Public persona, `/personas/:publicSlug` | The route architecture exists, but no public persona link was discoverable from current Discover/search results or the hosted public Space set. Repository knowledge would be required to guess a slug. | `FAIL_PRODUCT` |
| Encounters and cross-owner material | Index/public exhibits mount and preserve private/public language. A full private/cross-owner mutation requires a second consenting owner, accepted provider, and disposable cleanup path. | `BLOCKED_HOSTED_DEPENDENCY` |
| Events and seminars | Public and owner lists mount with source/Space/discussion links. A reversible interest toggle survived refresh and was restored to its starting state. | `PASS_HOSTED_WRITE_READBACK_CLEANUP` |
| Discover roulette | Signed-out draw/navigation route mounts, remains public, and has no mutation contract. | `PASS_HOSTED_READ_ONLY` |
| Global moderation queue | Non-admin replay owner receives the exact admin/moderator gate; no moderation action is falsely enabled. | `TRUTHFULLY_UNAVAILABLE` |
| Reporter queue, `/forums/reports` | Refresh and status/target filters mount. No disposable report was created because reports have no owner cleanup and require a second-party target for honest proof. | `BLOCKED_HOSTED_DEPENDENCY` |
| Subcommunities | Directory/category navigation mounts. Creation/moderation needs a disposable community plus second-role fixture and cleanup contract. | `BLOCKED_HOSTED_DEPENDENCY` |
| Archive connectors | Persona Archive exposes `Refresh connector state`; no hosted connector configuration is available and no false connected state appears. | `TRUTHFULLY_UNAVAILABLE` |
| Social publishing readiness | `/settings/social` exposes a disabled `Connector paused` state and no dispatch action. | `TRUTHFULLY_UNAVAILABLE` |
| Notifications | Unread/All and empty readback work; `Mark all read` is disabled when empty. Preference persistence failure remains counted in `J11`. | `PASS_HOSTED_READ_ONLY` |
| Pricing and About | Public plan/detail/contact navigation mounts without owner data. Checkout truth is owned by `J12`. | `PASS_HOSTED_READ_ONLY` |

## Visible Command Inventory

The `1,120` route-specific instances include repeated global controls and
content links. The table groups identical commands by user-facing function so
private titles and raw identifiers do not become evidence. Every visible
command family encountered is represented below.

| Surface | Visible commands encountered | Exercised status |
| --- | --- | --- |
| Global shell | Station, Discover, Writing, Forums, Studio/My Space/Developer/Projects/Billing/Settings destinations; System/Light/Dark appearance; mobile navigation; account menu; sign in, sign up, sign out. | Navigation, appearance, responsive menu, session persistence, and sign-out are live. Dynamic content links are classified with their destination below. |
| Account | Sign in, Create account, Forgot password, Send reset link, Request a new link, Back to sign in, confirmation return. | Login/reset failure/return controls are live. Confirmation delivery and password update are blocked by the missing disposable inbox/account. |
| Pricing | Sign up free, Start Basic, Become a Creator, Join Canon/Developer, Contact us. | Public links are live. Paid handoff is classified under Billing. |
| Public home and Discover | Explore Discover, Create account, Read public feed, Watch live projects, Read forums, Latest, Rising, Staff picks, public-feed filters, type chips, search, Space/document/Forum/Developer Space content links. | Public chain, filters, search, links, and no-private-route boundary passed. Public persona has no discoverable link. |
| Writing | Write, Latest, Featured, Staff picks, type filters, writing search, document links. | Read/search controls mount. Authoring entitlement is classified under Publishing. |
| Forum index/category | Forums home, Subcommunities, My recognition, My reports, category links, category search, Active/Most active/Newest, New thread. | Browse/search/sort and thread creation are live. Second-role recognition/report proof is blocked. |
| Forum thread | Post thread, Post reply, delete own reply, Watch/Unwatch, Helpful/Grounded/Careful recognition, participation votes, Report, moderation actions, linked source document. | Thread/reply/readback/cleanup passed. Watch is defective with exact `500` codes. Own-content report/vote controls are correctly absent. Other-user actions were not mutated without a disposable second actor/report cleanup. |
| Studio shell | New Chat, New Persona, persona/thread links, Dashboard, Publish, Onboarding Paths, Station Assistant, Global Archive, Notes, Export Workspace, Blog Posts, Public Space, Settings, filter/add/mobile rail controls. | Navigation mounts. Destination truth is classified in the relevant journey or route-family row. |
| Onboarding | Create private persona, guided setup, Document Migrator, API Bridge, Awakening/Fresh Start paths, Ask Assistant setup/import/bridge/Space prompts. | Navigation and private default pass; actual creation is quota-blocked. |
| Companion | Thread select/continue, Start fresh, Send, Ask for recap, Archive, save message to Memory/Canon, local return links. | Send reaches a truthful accepted-provider failure and setup link. Completion-dependent recap/archive cannot pass until provider setup. |
| Memory | Refresh Preview, Save Memory, Save Shared Memory, Reinforce, Quarantine, Reject, mark superseded, Restore, review Continuity/Canon/Integrity/Archive. | Disposable Memory write/API readback/cleanup passed. Existing lifecycle commands were not applied to non-disposable owner records. |
| Memory inbox | Reject, Accept with edits, review Memory/Continuity/Integrity. | Commands are visible; candidate mutation is blocked by the lack of a disposable parent/candidate fixture. |
| Continuity | Preview query/runtime context, timeline/navigation, Assistant/Memory/Canon/Archive/Integrity links. | Route and provenance surfaces mount; provider-dependent preview and disposable record coverage remain incomplete. |
| Canon | Save Canon, Publish copy, Memory/Continuity/Archive/Integrity links. | Disposable Canon write, refresh readback, and cleanup passed. Publish copy was not activated. |
| Integrity | Start Integrity Session, Memory/Continuity/Canon/Archive links. | Command is live-looking but was not activated because sessions have no cleanup and the fresh-parent fixture is quota-blocked. |
| Persona profile | Back to chat, Run integrity, Save/Clear avatar URL, Save handoff, public interaction/chat toggles, Memory/Canon/Files links. | Avatar/handoff/public-chat controls are live. Name, description, provider, and visibility are read-only despite the management promise; delete is absent. |
| Archive and imports | Global/persona search, type/sort filters, preview pasted/upload source, confirm import, candidate Reject/Accept with edits, connector refresh, Memory/Integrity/publishing/storage links. | Paste import, refresh, and search passed. Source lifecycle/removal is absent and connector setup is unavailable. |
| Export | Create workspace manifest, Create JSON/Markdown manifest/export, View bundle files, View manifest, View portable bundle, Project/Developer Space/persona links. | Workspace/persona creation and desktop/narrow readback passed. Packages are durable owner-only records, not disposable previews. |
| Station Assistant | Four starter prompts, Ask Assistant, Archive/Memory inbox/import/publishing/export/quota action links. | Operational response and route actions passed without persona/provider semantics. |
| Notes | New note, search notes, B, I, H, List, Link, Pin, Archive, Draft post, Attach. | New/edit/search are local-only; refresh loses work; search does not filter; all nine toolbar/workflow commands are inert. `DEFECTIVE`. |
| Publishing | Dashboard, Preview, Save draft, Send for review, document-kind chips, visibility/destination/persona controls, editor toolbar, external connectors, scheduling. | Private-tier save/review commands are disabled with exact Creator entitlement. Connector/scheduling controls say Deferred. No mutation occurred. |
| Space | New Space, View, Edit/Manage, New document, Public/Private, theme/layout controls, Cancel, Create Space, Save Changes, public document/persona/page links. | Existing reads mount. New form defaults Public and discovers zero entitlement only after submit. Creation/edit lifecycle remains failed for this account. |
| Developer Space | Review plan in Billing, Create observatory, public observatory links, Manage, Generate/Rotate key, ingestion/readback, agent preview/confirm/approve/cancel/execute actions, visual mode/widgets, export, linked document creation/review. | Public/owner reads pass. Create is truthfully tier-gated. Key/ingestion/agent mutations were not applied to the active fixture without an entitled disposable observatory and cleanup contract. |
| Projects | Create Project, visibility, Open, Create manifest, Attach/Detach Developer Space, observatory/manage links. | Existing reads mount and Private is default. Create was not activated because no Project deletion/lifecycle command exists. |
| Billing | Manage/cancel subscription, monthly/yearly Upgrade, Current plan, Contact us. | Portal/cancel/tier readback pass. Checkout fails before Stripe on hosted price/session configuration. |
| Settings/providers | Back to Studio, provider mode/key inputs, Save AI provider settings, token Buy/View details, profile/privacy destinations, delete-account unavailable. | Provider setup is live and correctly linked from chat. Profile/privacy are coming soon and notification preferences do not persist. |
| Social and notifications | Connector paused; Unread, All, Mark all read. | Social is truthfully paused. Notification filtering/empty state mounts; mark-all is disabled when empty. |
| Encounters/events/roulette | Same-owner/cross-owner exhibit links, seminar source/Space/discussion links, I'm interested/Withdraw interest, Back to Discover, Explore Discover, Create account. | Seminar interest write, refresh readback, and restoration passed. Other current reads mount. Cross-owner/private mutations require exact second-role/provider fixtures. |
| Moderation/reports/subcommunities | Moderation queue filters/actions, report Refresh/status/target filters/review request, Subcommunity/category/open/moderation links. | Admin controls are permission-gated. Reporter/subcommunity mutation proof is blocked by disposable second-role and cleanup requirements. |

## Ranked Correction Backlog

Each item is a narrow reviewable slice. Product, privacy, auth, billing, schema,
key, or retention changes must receive the required ARGUS boundary review
before DAEDALUS implementation.

| Rank | Smallest slice | Why it is required | Acceptance boundary |
| ---: | --- | --- | --- |
| 1 | `PR527A Notes truth repair` on `/studio/notes` | Private text can be entered and silently lost; seeded faux notes and inert commands simulate a durable product. | Remove the faux/local editor and dead commands, or replace them with an exact unavailable state and links to supported private drafts/archive until durable Notes exists. System/Light/Dark and narrow layout must pass. No backend expansion is required. |
| 2 | `Space entitlement and visibility preflight` on `/space/new` | The form defaults Public and withholds the zero-Space entitlement until submit. | ARGUS reviews visibility/entitlement boundaries. Default Private or require explicit visibility; fetch entitlement before the form presents Create as live; retain the recoverable server check. |
| 3 | `Forum watch hosted readiness` on thread detail | A visible paid-tier command returns `500` for load, write, and cleanup. | ARGUS confirms schema/ownership. Apply/verify the `community_thread_watches` hosted contract, then prove watch, refresh, unwatch, cleanup, and retry. |
| 4 | `Forum thread theme repair` | Post/reply text is nearly unreadable in Dark. | Replace fixed colours with shared semantic tokens and pass contrast at `1440`, `390`, and `375` in System/Light/Dark without changing community semantics. |
| 5 | `Persona profile truth and theme repair` | The page promises identity/visibility management but renders them read-only, has no delete path, and breaks Light appearance. | First make the heading/copy and read-only status truthful and tokenise the surface. Any identity, visibility, or deletion mutation is a separate ARGUS-reviewed slice. |
| 6 | `Settings persistence truth` | Notification controls visibly do not persist; Profile/Privacy are destinations without settings behavior. | Remove false controls or persist one bounded preference with refresh readback. Keep provider setup, paused social, and unavailable account deletion exact. |
| 7 | `Billing Checkout readiness and Dark contrast` | Portal works, but visible Upgrade cannot create Checkout; critical plan text is too faint. | ARGUS reviews billing. Repair hosted price/session configuration, prove cancel without entitlement drift, and tokenise contrast without changing prices or tiers. |
| 8 | `Accepted private-provider hosted fixture` | Companion completion, recap/archive, archive-to-continuity retrieval, and provider failure recovery cannot complete. | Provide an accepted owner provider for the disposable rehearsal account, preserve the current policy block and setup guidance, and rerun `J03`/`J05` with conversation cleanup. |
| 9 | `Disposable persona/candidate/Integrity fixture` | Persona quota and irreversible owner history block `J02`/`J04` mutation proof. | ARGUS defines a disposable parent/candidate/session cleanup path or isolated rehearsal account. Do not weaken quota or mutate existing candidates. |
| 10 | `Disposable Developer Space lifecycle` | Key rotation/ingestion cannot be run against the active observatory, and the replay tier cannot create another. | ARGUS defines entitlement, key, and cleanup boundaries; then prove create, one-shot key, rotate/revoke, ingest/readback, owner/public split, and cleanup. |
| 11 | `Archive retention truth at import` | Import is durable, but the UI does not tell the owner that source/chunk removal is outside the current accepted policy. | Add exact retention/lifecycle copy before confirmation. Any source removal requires the already mandated ARGUS retention design, not an ad hoc delete button. |
| 12 | `Project lifecycle truth` | Create is live but there is no removal/lifecycle command; historical synthetic rows accumulate. | Either add truthful permanence/lifecycle copy and safe fixture policy, or open an ARGUS-reviewed owner Project cleanup slice. Do not add another rehearsal Project first. |
| 13 | `Public persona discoverability` | Public identity routes cannot be reached from the current hosted Discover/search/Space set. | Seed or expose one valid public persona link without leaking private persona state; verify signed-out route, public-only context, Space/Discover return path, and narrow appearance. |
| 14 | `Disposable account/inbox rehearsal fixture` | Confirmation and password recovery cannot be proved safely with the only owner account. | Provide an isolated inbox/account lifecycle, then prove signup, confirmation, reset/update, refresh, sign-out, and cleanup without changing replay-owner credentials. |
| 15 | `Second-actor community fixture` | Report, recognition, delegated moderation, and subcommunity participation cannot be honestly proved against the author's own content. | ARGUS defines two disposable roles and report/community cleanup; rerun only those reversible commands. |

## First Correction Recommendation

Open `PR527A Notes truth repair` first.

It is smaller than a durable Notes feature and does not require inventing a
backend. The accepted correction can remove the seeded examples, prevent entry
into a non-persistent editor, name Notes as unavailable until durable storage
exists, and direct users to supported private document or Archive paths. It
comes first because silent loss of private writing directly contradicts
continuity as the core paid value and archive as trust infrastructure.

After ARGUS confirms that the slice does not weaken the existing owner gate,
MIMIR should send that exact route-only patch to DAEDALUS. The rest of the
numbered programme should continue without reopening unrelated Phase 3 scope.
