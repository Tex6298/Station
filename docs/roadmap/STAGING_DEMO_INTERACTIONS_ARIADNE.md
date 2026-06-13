# Staging demo interaction audit - ARIADNE

Date: 2026-06-13

Owner: ARIADNE, A4 UX Navigator

## Verdict

`STAGING-DEMO-INTERACTIONS-01` is an audit pass, not an implementation pass.

Navigation is not the blocker. The staging interaction problem is that some
controls look live when they are preview-only, and a few intended-live community
controls expose backend guardrails as user-facing dead ends.

ARIADNE recommends a narrow DAEDALUS patch lane before the human rehearsal:

- make Global Archive preview actions visibly disabled or preview-only;
- hide or disable own-post voting controls on forum thread/detail and list
  surfaces;
- replace unsafe `.rpc(...).catch(...)` vote score recalculation calls with a
  `try`/`catch` shape so non-owner votes cannot surface `catch is not a
  function`.

## Method

Surfaces checked:

- `https://stationweb-production.up.railway.app/studio/archive`
- `https://stationweb-production.up.railway.app/forums/general`
- `https://stationweb-production.up.railway.app/forums/general/<threadId>`
- `https://stationweb-production.up.railway.app/discover`
- API routes for forum category/thread, votes, reports, and comments.

Browser:

- Local Chrome headless through Chrome DevTools Protocol.
- Mobile viewport: 390px wide.

Sanitization:

- Replay credentials and tokens were kept in process memory only.
- Raw thread IDs, owner IDs, persona IDs, tokens, cookies, credentials, and raw
  response bodies were not committed.
- No screenshots were saved.
- One sanitized reply probe and one sanitized thread-report probe were created
  in staging to verify the live discussion path.

## Findings

### Global Archive

Route: `/studio/archive`

Controls audited:

- `Upload`
- `Attach`
- `Pin`
- `Draft`
- `Export`
- filter buttons
- archive search

Result:

- Filter buttons work.
- Search works and shows the empty state.
- Mobile width is clean at 390px.
- `Upload`, `Attach`, `Pin`, `Draft`, and `Export` are enabled buttons with no
  visible result, navigation, disabled state, loading state, toast, modal, or
  explanation.

Classification:

- The archive cards are static preview/sample data, not live archive records.
- The action buttons should not look like live controls in the staging demo.

Recommendation:

- For this staging slice, disable or remove `Upload`, `Attach`, `Pin`, `Draft`,
  and `Export` on `/studio/archive`.
- Prefer a small preview label such as `Preview` or helper copy saying live
  import/export happens from persona Archive and Export Trust surfaces.

### Persona Archive And Export Trust

Routes:

- `/studio/personas/<personaId>/files`
- `/studio/personas/<personaId>`

Result:

- Existing persona archive import/export surfaces remain the live path for the
  current demo.
- Export Trust is backed by existing API calls and should remain the demo-safe
  export claim.

Classification:

- Live enough for the current staging route.

Recommendation:

- Keep the human rehearsal focused on persona Archive and Export Trust, not the
  static Global Archive card actions.

### Forum Category

Route: `/forums/general`

Controls audited:

- category sort
- category search
- thread-list `Up`
- thread-list `Down`

Result:

- API category sort/search works: active and newest returned the seeded thread;
  a no-match search returned zero threads.
- Mobile width is clean at 390px.
- The seeded replay thread is authored by the replay owner, but thread-list
  `Up`/`Down` controls are still visible.

Classification:

- Sort/search are live.
- Own-post vote controls are intended-live controls shown in an invalid state.

Recommendation:

- Hide or disable thread-list `Up`/`Down` when `thread.author_user_id` matches
  the current user.
- If disabled instead of hidden, use explicit copy/tooling such as `Own post`,
  not an error after click.

### Forum Thread Detail

Route: `/forums/general/<threadId>`

Controls audited:

- thread `Up`
- thread `Down`
- thread `Report`
- reply form
- own comment controls

Result:

- Mobile width is clean at 390px.
- Thread `Report` is live: report-first browser pass showed
  `Report sent for moderation review.`
- Reply is live: API reply probe returned 201 and the sanitized reply appeared
  on thread readback.
- The reported `sb.rpc(...).catch is not a function` reply error did not
  reproduce on the replay thread.
- Thread `Up` is visible on a thread authored by the replay owner. Clicking it
  shows `You cannot vote on your own post.`
- Own comment vote is also blocked by the API guard.

Classification:

- Report and reply are intended-live and pass.
- Own-post `Up`/`Down` controls are intended-live controls shown in an invalid
  state.

Recommendation:

- Hide or disable thread-detail `Up`/`Down` when the current user authored the
  thread.
- Hide or disable comment `Up`/`Down` when the current user authored the
  comment.
- Keep `Report` live, but clear any previous vote error before showing report
  success so the feedback does not stack confusingly.

### Vote RPC Error Risk

Code:

- `apps/api/src/services/community.service.ts`

Risk:

- Vote score recalculation currently calls Supabase RPC results with
  `.catch(...)` directly.
- If the Supabase RPC return is a thenable without `.catch`, a non-owner vote
  can surface `catch is not a function`.
- The replay owner could not reproduce this exact failure because the seeded
  target is self-authored and the API correctly returns the own-post guard
  before score recalculation.

Recommendation:

- Replace the `.rpc(...).catch(...)` calls in `castCommunityVote` with explicit
  `try`/`catch` plus `await`.
- Add a focused vote test that uses a non-owner voter and a Supabase RPC mock
  without `.catch`.

### Discover Tabs

Route: `/discover`

Controls audited:

- `New`
- `Rising`
- `Featured`

Result:

- Tabs are live.
- Active underline, color, and font weight moved correctly from `New` to
  `Rising` to `Featured`.
- `Featured` showed its empty-state copy.
- Mobile width is clean at 390px.

Classification:

- Pass.

### Export Workspace Preview

Route: `/studio/export`

Controls audited by code review:

- scope checkboxes
- JSON/Markdown/private-material toggles
- status labels

Result:

- This surface is already framed as preview/planning.
- The current live path copy points users back to per-persona bundles.
- Controls update summary state rather than pretending to start a global job.

Classification:

- Acceptable preview treatment.

## DAEDALUS Patch Targets

Recommended lane: `STAGING-DEMO-INTERACTIONS-PATCH-01`.

Patch target 1:

- File: `apps/web/components/studio/archive-library.tsx`
- Route: `/studio/archive`
- Change: disable, hide, or mark preview-only for `Upload`, `Attach`, `Pin`,
  `Draft`, and `Export`.
- Expected UX: no live-looking no-op buttons on static archive cards.

Patch target 2:

- Files:
  - `apps/web/app/forums/[categorySlug]/page.tsx`
  - `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- Routes:
  - `/forums/general`
  - `/forums/general/<threadId>`
- Change: hide or disable own-post `Up`/`Down` controls for threads and
  comments.
- Expected UX: users do not click a visible voting control only to see
  `You cannot vote on your own post.`

Patch target 3:

- File: `apps/api/src/services/community.service.ts`
- Change: replace direct `.rpc(...).catch(...)` calls in vote score
  recalculation with explicit `try`/`catch` around awaited RPC calls.
- Expected behavior: non-owner voting never surfaces
  `sb.rpc(...).catch is not a function`.

Patch target 4:

- File: `apps/web/app/forums/[categorySlug]/[threadId]/page.tsx`
- Change: clear prior `commentError` before report and vote attempts, or split
  success/error message state so report success does not compete with an older
  vote error.
- Expected UX: moderation feedback is clear and not mixed with old vote errors.

## Human Rehearsal Guidance

Until DAEDALUS patches the above:

- Do not demo `/studio/archive` card action buttons.
- Use persona Archive and Export Trust for live archive/export proof.
- Do not click forum `Up`/`Down` on the replay-owned seeded thread.
- It is safe to show `Report` and reply flow as live, but avoid repeated report
  clicks.
- Discover tabs and Archive filters can be shown as live state-changing
  controls.

## Validation

- Code review of Global Archive, Forum category/thread, community vote service,
  Discover tabs, and Export Workspace preview.
- Live staging API sign-in succeeded.
- Live deployment health returned `ready:true`.
- Live mobile Chrome/CDP audit at 390px.
- API category search/sort probe.
- API thread vote, report, reply, and comment vote probes.
- Browser thread report-first probe.
- Browser Discover tab active-state probe.
