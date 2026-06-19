# PR54 Private Project UI Shell Rehearsal - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: Pass after schema proof and tier-tightening rerun

## Wakeup Note

ARIADNE initially missed the visible handoff because stale detached A4 watch
processes were still running. MIMIR/ARGUS did send the wakeup on
`3ca7aa625bce41bd49bf07e0fd15dd6960a58f96`; the local A4 state advanced
without the wakeup surfacing in the active turn. The stale A4 watchers were
stopped before the PR54 rehearsal work resumed.

## First Attempt Blocker

The first signed rehearsal attempt found a real staging blocker:

- signed owner `GET /projects` returned `500`;
- error: `Could not find the table 'public.projects' in the schema cache`;
- signed `/developer-spaces` still returned the two expected staging Developer
  Spaces, so auth/session and Developer Spaces were not the problem.

MIMIR then applied/proved the Project schema on staging and re-woke ARIADNE.

## Runtime Checked - Schema Rerun

- Web route: `https://stationweb-production.up.railway.app/projects`
- Project detail route:
  `https://stationweb-production.up.railway.app/projects/ariadne-pr54-ui-smoke-2026-06-19t01-44-47-657z`
- Web/API deployment identity:
  `3ca7aa625bce41bd49bf07e0fd15dd6960a58f96`
- Account mode: signed replay owner via local env
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`

No credentials, tokens, cookies, private prompts, private archive excerpts, raw
provider payloads, or owner IDs were printed.

## Schema Rerun

After MIMIR's schema proof, signed owner `GET /projects` returned `200`.

ARIADNE created one private Project through the actual `/projects` UI:

- name: `ARIADNE PR54 UI smoke 2026-06-19T01-44-47-657Z`
- slug: `ariadne-pr54-ui-smoke-2026-06-19t01-44-47-657z`
- visibility: `private`
- connection tier selected: `tier_1_showcase`

To prove the PR53 attached Developer Space rendering path, ARIADNE used the
existing owner API to attach `station-replay-dev-alpha` to that smoke Project.
The Project detail API then returned one attached Developer Space:

- `Station Replay Dev Alpha`
- slug: `station-replay-dev-alpha`
- visibility: `public`
- visualisation type: `node_field`

## Browser Rehearsal

Signed desktop `/projects` passed:

- private Projects shell loads without sign-in loop or route error;
- Project create/list surface is visible;
- created Project appears in the list with private visibility, slug, Tier 1
  showcase label, and `Open` link;
- no document-level horizontal overflow (`1365` scroll width / `1365` client
  width);
- no visible controls render offscreen.

Signed mobile `/projects` at `390x844` passed:

- shell and created Project list item remain visible;
- `Open` link remains reachable;
- no document-level horizontal overflow (`390` scroll width / `390` client
  width);
- no visible controls render offscreen.

Signed desktop Project detail passed:

- private Project detail loads through `GET /projects/:idOrSlug`;
- Project summary shows private visibility, Tier 1 showcase, slug, created, and
  updated metadata;
- `Attached Developer Spaces` section is visible;
- copy says `Attach and detach stay in the API lane for now`;
- attached `Station Replay Dev Alpha` card renders from the PR53 summary;
- `View observatory` and `Manage` links are present;
- no document-level horizontal overflow and no offscreen controls.

Signed mobile Project detail at `390x844` passed:

- Project summary, attached Developer Space card, and both links remain visible;
- no document-level horizontal overflow and no offscreen controls.

Click-throughs passed:

- `View observatory` opens
  `/developer-spaces/station-replay-dev-alpha` and shows the existing
  observatory / evidence path;
- `Manage` opens
  `/developer-spaces/station-replay-dev-alpha/manage` and shows the existing
  researcher interface / evidence path.

Anonymous `/projects` check passed:

- fresh anonymous browser redirects to
  `/login?redirect=%2Fprojects`;
- no private Project shell, Project list, smoke Project, or attached Developer
  Space card is visible anonymously;
- no mobile overflow at `390px`.

## Empty States

At the start of the rerun, signed `GET /projects` returned zero Projects, so
the no-Project state was available before ARIADNE created the UI smoke Project.

The smoke Project detail was also reached before attaching a Developer Space.
After attachment, the retained readback focuses on the attached state because
the rehearsal needed to prove PR53 rendering. No separate public Project or
attach/detach UI was created.

## UX Scope Caveat - Cleared

The first schema rerun found that the Project create form exposed selectable
connection-tier options:

- `Tier 1 showcase`
- `Tier 2 hosted`
- `Tier 3 lab`

ARIADNE selected only `Tier 1 showcase`. The PR54 route mechanics pass, but the
positive `Tier 2 hosted` and `Tier 3 lab` labels are a UX scope caveat because
Tier 2 hosting, Tier 3 lab behavior, hosted runtime, Cloudflare, developer
agents, and DexOS widgets are explicitly out of scope.

MIMIR requested a tiny DAEDALUS UI/copy tightening patch instead of closing PR54
with that caveat. ARGUS accepted the patch, then ARIADNE reran the browser
rehearsal against Railway runtime `cb3fce9477d5ce30111c3a6f851d74a96964c753`.

Final tier-tightening rerun passed:

- web/API health both reported Railway commit
  `cb3fce9477d5ce30111c3a6f851d74a96964c753` and `ready: true`;
- signed owner `/projects` create/list loaded on desktop and `390px` mobile;
- UI-created Project
  `ARIADNE PR54 tier-tight smoke 2026-06-19T02-05-15-653Z` was created as
  `private` with `connectionTier: "tier_1_showcase"`;
- the create form had one select only, for visibility:
  `Private`, `Unlisted`, `Community`, `Public`;
- the create form no longer offered `Tier 2 hosted` or `Tier 3 lab` as
  selectable creation choices;
- create copy says `This creates a private Showcase Project record only.`;
- create copy says hosted runtime and lab runtime are not available in this UI;
- existing Project list/readback displays Showcase only for the staging smoke
  Projects checked here;
- signed Project detail still renders `Station Replay Dev Alpha` from the PR53
  attached Developer Space summary;
- `View observatory` opens
  `/developer-spaces/station-replay-dev-alpha`;
- `Manage` opens
  `/developer-spaces/station-replay-dev-alpha/manage`;
- desktop and `390px` mobile list/detail checks had no document-level
  horizontal overflow and no offscreen controls;
- anonymous `/projects` redirected to `/login?redirect=%2Fprojects` with no
  private Project shell, Project list, smoke Project, or attached Developer
  Space card visible.

The UX scope caveat is cleared for PR54.

## Recommendation

MIMIR can treat PR54 as browser-rehearsed after the schema fix and
tier-tightening patch. PR54 can close from ARIADNE UI rehearsal.

No broader product-scope change is needed. Keep public Project pages,
attach/detach UI, billing/export semantics, contributor/member authorization,
hosted runtime, Cloudflare, Tier 2 hosting, developer-agent, DexOS-widget work,
and `export_packages.project_id` out of the next move unless MIMIR explicitly
reopens them.

## Validation

- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- Signed owner API reads:
  - `GET https://stationapi-production.up.railway.app/projects`
  - `GET https://stationapi-production.up.railway.app/developer-spaces`
  - `GET https://stationapi-production.up.railway.app/projects/:slug`
- UI smoke Project created through signed `/projects`
- Existing owner API used to attach `station-replay-dev-alpha` for PR53 detail
  rendering proof
- `node --check scripts/tmp-pr54-projects-ui-rerun.mjs`
- Signed Chrome/CDP `/projects` desktop and `390px` mobile checks
- Signed Chrome/CDP Project detail desktop and `390px` mobile checks
- Signed Chrome/CDP Developer Space view/manage click-through checks
- Fresh anonymous Chrome/CDP `/projects` privacy check at `390px`
- `node --check scripts/tmp-pr54-tier-tight-rehearsal.mjs`
- Signed Chrome/CDP final tier-tightening rerun against Railway runtime
  `cb3fce9477d5ce30111c3a6f851d74a96964c753`
- Temporary local probe script was removed before commit.
