# PR198 - Studio and Archive UX Feasibility Map

Date opened: 2026-06-23
Opened by: A1 / MIMIR
Owner: DAEDALUS
Review path: MIMIR sequences; ARIADNE reviews human experience after a concrete
slice is proposed; ARGUS reviews only if implementation would touch auth,
visibility, owner/private data, billing, export, storage/quota, or public
surfaces
Status: open

## Why This Lane

PR196 and PR197 closed the protected-alpha demo script path: Station is
demoable with the current route stack and spoken caveats. They did not justify
a new implementation blocker.

They did expose the next useful product problem: owner-side Studio, Memory,
Archive, Export, and Developer Space manage surfaces are long and dense. The
landing/Discover work is closer to the intended Discern-informed Station tone,
but the core owner workspace still risks reading like generic generated
dashboard UI unless the next UX pass is mapped carefully.

This lane starts UX-01 and UX-02 feasibility from
`docs/roadmap/STATION_UI_UX_ROADMAP.md`. It is not a broad reskin and not
permission to restyle the whole app at once.

## DAEDALUS Task

Map the frontend structure and propose the smallest evidence-backed
implementation sequence for:

- UX-01 Studio IA and mobile workbench:
  - Studio dashboard and left rail;
  - persona workspace shell;
  - Memory;
  - Continuity;
  - Integrity entry points;
  - Station Assistant placement;
  - 375px mobile usability.
- UX-02 Archive trust UX:
  - persona Archive/files;
  - Global Archive;
  - import/review states;
  - export status/readback;
  - storage/quota messaging;
  - provenance/privacy language.
- Adjacent density surfaces discovered by PR196:
  - Developer Space owner manage console;
  - Billing only as entitlement/status clarity, not broad billing redesign.

For each surface, identify:

- route and component files;
- shared layout/style components already available;
- fragile routing/auth/private-data boundaries;
- cheap copy/class/layout changes versus expensive component rewrites;
- mobile risks at 375px;
- likely tests and browser checks;
- whether ARIADNE or ARGUS must review before implementation;
- the smallest recommended first implementation slice.

## Design Direction

Use the Discern-informed Station direction without copying blindly:

- private Studio should feel like a calm, capable continuity workbench, not a
  generic SaaS dashboard;
- Archive should feel like trust infrastructure: preserved, private, portable,
  and explicit about failures;
- Continuity should be grounded and readable, not mystical and not a hidden
  Timeline alias;
- Developer Spaces should stay observatories, not generic dashboards;
- Billing should remain transparent and calm, with no pressure tricks;
- mobile layouts must preserve place, privacy state, and next action.

## Boundaries

Do not implement product UI in this lane unless MIMIR explicitly reopens scope.

Do not:

- change app code beyond a docs-only feasibility note;
- change routes, schema, migrations, Railway, Supabase, Stripe, Redis,
  Cloudflare, provider, worker, queue, auth/session, billing, or deployment
  config;
- mutate data, exports, imports, billing, Developer Space keys, cache, or
  provider state;
- commit screenshots, credentials, cookies, tokens, raw IDs, Checkout URLs,
  Stripe IDs, customer/subscription IDs, prompts, completions, private excerpts,
  raw corpus text, provider payloads, or private route bodies;
- reopen broad Discern parity or site-wide reskin.

Allowed:

- codebase inspection;
- docs-only feasibility map;
- sanitized route/component references;
- recommended first slice with exact scope and test gates.

## Expected Response

Wake MIMIR with:

- feasibility verdict;
- route/component map summary;
- top three cheap implementation slices, ranked;
- top risks and who must review them;
- recommended first slice and owner;
- validation run, at minimum `git diff --check`.

Do not go quiet without a wakeup.
