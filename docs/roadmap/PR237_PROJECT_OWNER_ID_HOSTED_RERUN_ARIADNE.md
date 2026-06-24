# PR237 - Project Owner Id Hosted Rerun

Owner: ARIADNE
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR235 failed hosted rehearsal because owner Project detail API returned
`project.ownerUserId`. PR236 removed that field from browser-facing Project
create/list/detail payloads and ARGUS accepted the repair.

This lane is a focused hosted rerun for that exact failure. It is not a new
Project or institutional feature lane.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- Required deployed code commit: `c4bb414` or later.

If web or API `/health/deployment` reports an older commit, return `BLOCKED`
with the observed commit and do not judge the fix.

## Required Checks

Use the existing staging replay owner account without printing credentials or
secrets.

1. Confirm web and API `/health/deployment` are healthy and report commit
   `c4bb414` or later.
2. Sign in as the replay owner.
3. Open `/projects` and use an existing private Project if available.
4. Fetch owner `GET /projects` and confirm serialized Project objects do not
   include `ownerUserId` or `owner_user_id`.
5. Open one Project detail route, preferably the Project used in PR235:
   `/projects/ariadne-pr54-ui-smoke-2026-06-19t01-44-47-657z`.
6. Fetch owner `GET /projects/:idOrSlug` and confirm `project.ownerUserId`,
   `project.owner_user_id`, and any equivalent owner id field are absent.
7. Confirm the `Project evidence` panel still renders and remains bounded:
   evidence count, Developer Space source, document metadata, safe route
   action, and no document bodies or raw ids.
8. Recheck desktop and around 375px mobile for no obvious regression in the
   Project evidence area.
9. Confirm signed-out Project detail API/route still does not expose private
   Project evidence.

Optional:

- Only if an existing Project cannot exercise the route, create one bounded
  private rehearsal Project. Do not open public Projects, attach new public
  features, invite members, or change billing/export/runtime settings.

## Must Not Appear

Visible UI or API payloads must not expose:

- `ownerUserId`;
- `owner_user_id`;
- any equivalent owner id field;
- document bodies;
- raw `developer_space_documents` link ids;
- raw Project member rows;
- raw Developer Space event payloads;
- prompts, completions, provider fields, traces, reports, export bundle
  contents, ingestion keys, webhook secrets, env values, service keys, SQL,
  stack traces, or raw JSON blobs.

## Result Rules

Return `PASS` only if hosted deployment is fresh and the Project owner id leak
is gone from the exercised owner Project API payloads.

Return `FAIL` if hosted deployment is fresh but any owner id field remains or
the visible Project evidence path regressed.

Return `BLOCKED` if Railway is stale, auth is unavailable, or no Project route
can be exercised without broadening scope.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR237 Project owner id hosted rerun.
Verdict:
- PASS / FAIL / BLOCKED.
Task:
- If PASS, close the PR235/PR236 loop and choose the next lane.
- If FAIL/BLOCKED, route exact hosted defects to DAEDALUS or ARGUS.
```
