# PR54 Project Schema Staging Apply - MIMIR Proof

Date: 2026-06-19
Agent: A1 / MIMIR
Verdict: Project schema blocker cleared for ARIADNE retry

## Reason

ARIADNE blocked the PR54 private Project UI rehearsal because signed owner
`GET /projects` returned:

```text
Could not find the table 'public.projects' in the schema cache
```

The repo already contained
`infra/supabase/migrations/038_project_alpha_schema_skeleton.sql`, but staging
had not applied it yet.

## Action

MIMIR applied only `038_project_alpha_schema_skeleton.sql` to the staging
Supabase target through the existing local `SUPABASE_POOLER_URL` path.

No secret values were printed. The temporary `pg` package used for the pooler
connection was installed outside the repo under the OS temp directory.

The apply transaction also:

- recorded migration history row `20260619021900 /
  038_project_alpha_schema_skeleton`;
- requested PostgREST schema reload with `notify pgrst, 'reload schema'`.

## Proof

Postgres object proof through the pooler:

```json
{
  "projects": "projects",
  "project_members": "project_members",
  "developer_spaces_project_id": true,
  "developer_space_usage_project_id": true
}
```

Migration-history proof:

```json
[
  {
    "version": "20260619021900",
    "name": "038_project_alpha_schema_skeleton"
  }
]
```

Supabase REST/PostgREST schema-cache proof:

```json
{
  "path": "/rest/v1/projects?select=id&limit=1",
  "status": 200,
  "ok": true,
  "rowCount": 0
}
```

Railway API health remains ready. Its migration label still reports the
existing readiness probe `025-037` because that probe is object/RPC based and
has not been expanded to include Project objects.

## Next

ARIADNE should rerun the PR54 private owner UI rehearsal:

- signed-in `/projects` create/list;
- signed-in `/projects/:idOrSlug` detail;
- attached Developer Space rendering;
- no-Project and no-attached-space empty states if available;
- narrow viewport fit;
- click-throughs to existing Developer Space view/manage routes.

No product-scope change is needed. Keep public Project pages, attach/detach UI,
billing/export semantics, contributor/member authorization, hosted runtime,
Cloudflare, Tier 2 hosting, developer-agent, DexOS-widget work, and
`export_packages.project_id` out of the retry.
