# PR54 Private Project UI Shell Rehearsal - ARIADNE Result

Date: 2026-06-19
Agent: A4 / ARIADNE
Verdict: Blocked on staging schema; PR54 cannot close from browser rehearsal yet

## Wakeup Note

ARIADNE missed the first visible handoff because stale detached A4 watch
processes were still running. MIMIR/ARGUS did send the wakeup on
`3ca7aa625bce41bd49bf07e0fd15dd6960a58f96`; the local A4 state advanced
without the wakeup surfacing in the active turn. The stale A4 watchers were
stopped before this rehearsal.

## Runtime Checked

- Web route: `https://stationweb-production.up.railway.app/projects`
- Web/API deployment identity:
  `3ca7aa625bce41bd49bf07e0fd15dd6960a58f96`
- Account mode: signed replay owner via local env
- Browser: Chrome/CDP
- Desktop viewport: `1365x900`
- Mobile viewport: `390x844`

No credentials, tokens, cookies, private prompts, private archive excerpts, raw
provider payloads, or owner IDs were printed.

## Blocking Result

Signed owner `GET /projects` returns:

- status: `500`
- error: `Could not find the table 'public.projects' in the schema cache`

The signed `/developer-spaces` owner API still returns the two expected staging
Developer Spaces:

- `animus-field-lab`
- `station-replay-dev-alpha`

This points to missing deployed Project schema, not a general auth/session
failure and not a Developer Spaces regression.

The repo contains the expected Project schema migration at
`infra/supabase/migrations/038_project_alpha_schema_skeleton.sql`, but the
deployed health readback still reports the current migration proof as
`025-037`. The practical blocker is that staging does not appear to have the
Project tables/schema-cache state needed by the deployed PR54 API.

## Browser Rehearsal

Signed desktop `/projects`:

- route loads as a signed owner, not as a sign-in loop;
- `Projects` and `Create Project` are visible;
- no document-level horizontal overflow (`1350` scroll width / `1350` client
  width);
- no visible controls render offscreen;
- page shows the schema-cache error above.

Signed mobile `/projects` at `390x844`:

- route loads as a signed owner, not as a sign-in loop;
- `Projects` and `Create Project` are visible;
- no document-level horizontal overflow (`390` scroll width / `390` client
  width);
- no visible controls render offscreen;
- page shows the schema-cache error above.

Because `GET /projects` fails, ARIADNE could not truthfully complete:

- Project create/list rehearsal;
- Project detail route rehearsal;
- attached Developer Space rendering proof;
- no-Project empty-state proof;
- no-attached-space empty-state proof;
- click-throughs from Project detail to Developer Space view/manage routes.

## UX Read

The visible shell itself is not the immediate problem. The page proves that
signed session restoration and the protected private Project route load on both
desktop and narrow mobile. The blocker is underneath the UI: the private Project
API cannot read staging because `public.projects` is absent from the schema
cache.

This is a hard staging-readiness blocker for PR54 closeout.

## Recommendation

MIMIR should not mark PR54 complete from ARIADNE rehearsal yet.

Recommended next action:

- apply/verify the Project alpha schema migration in staging, including
  `public.projects`, `public.project_members`, and the nullable
  `developer_spaces.project_id` / `developer_space_usage.project_id` columns;
- wait for Supabase/PostgREST schema cache to see the new table;
- rerun signed `GET /projects`;
- then reissue ARIADNE's PR54 UI rehearsal.

No product-scope change is needed. Keep public Project pages, attach/detach UI,
billing/export semantics, contributor/member authorization, hosted runtime,
Cloudflare, Tier 2 hosting, developer-agent, DexOS-widget work, and
`export_packages.project_id` out of the fix.

## Validation

- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- Signed owner API read:
  - `GET https://stationapi-production.up.railway.app/projects`
  - `GET https://stationapi-production.up.railway.app/developer-spaces`
- `node --check scripts/tmp-pr54-projects-ui-rehearsal.mjs`
- Signed Chrome/CDP `/projects` route checks at `1365x900` and `390x844`
- Temporary local probe script was removed before commit.
