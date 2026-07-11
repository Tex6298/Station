# PR508C - Owner Encounter Public Exhibit Report Target Repair Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted

## Verdict

```text
ACCEPT_PR508C_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TARGET_REPAIR
```

ARGUS accepts PR508C without a code patch. The repair matches the lane: public
exhibit report routes remain slug-based for clients, the API resolves the slug
to the public exhibit UUID server-side, and moderation reports persist the UUID
target id required by hosted `moderation_reports.target_id`.

This is a narrow code-only repair. It does not add schema/migration drift,
public route drift, public exhibit surfacing, transcript/excerpt/raw-reply
publication, private setup/curation exposure, provider/retrieval changes,
billing/social/storage work, Redis/Cloudflare, queue/worker, package, or
lockfile changes.

## Review Findings

Accepted behavior:

- `POST /persona-encounters/public-exhibits/:slug/report` still accepts the
  public slug and still hides missing, malformed, retracted, and removed
  exhibits behind bounded `404`.
- The public report route resolves a published exhibit by slug, then persists
  `target_type: "persona_encounter_public_exhibit"` with `target_id` equal to
  the exhibit UUID.
- Duplicate report lookup and report-count increment use the exhibit UUID, not
  the slug.
- Admin report queue context resolves the UUID back to safe public exhibit
  title/status/slug route metadata.
- Admin remove/restore acts on the UUID target and still keeps private setup,
  generated reply text, transcript excerpts, private session ids, source
  persona ids, provider payloads, prompts, private curation text, source bodies,
  and cross-owner words out of report/admin readback.
- Owner retract protection remains intact: retracted exhibits have no target
  moderation action, and restoring a removed exhibit that still carries an
  owner `retracted_at` returns it to `retracted`, not `published`.

ARGUS found no need for a migration. The hosted blocker was an identity
persistence mismatch, and the code now matches the hosted UUID column.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 36 tests passed; public report by slug persists UUID target id, and signed-out/missing/retracted/removed/malformed report paths fail closed. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed; generic reports, admin queue context, target filtering, remove/restore, and owner-retracted restore behavior use UUID exhibit targets. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| Changed-path scan | Pass | PR508C changes only encounter/report API tests/routes and roadmap/testing docs. |
| Forbidden-path scan | Pass | No migration, package, lockfile, web UI, provider, retrieval, billing, social, Redis, Cloudflare, queue/worker, storage, Discover/search/forum/feed, Archive, Memory, Canon, Continuity, Integrity, Station Press, or runtime dependency file changed. |
| Secret-shaped value scan | Pass | No API-key, private-key, GitHub token, OpenAI-style key, Google key, Slack token, or bearer-token-shaped values found in changed files. |
| Public/private leakage scan | Pass | Public report responses remain status-only; admin context returns safe public exhibit metadata and does not expose private setup, generated reply text, transcript excerpts, raw private ids, provider payloads, prompts, or cross-owner words. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging the PR508C review docs/status updates. |

`test:studio-ui` was not required or run for ARGUS review because PR508C did
not touch web UI or helper files.

## Hosted Rerun Required

MIMIR should route PR508B back to ARIADNE for the hosted report/takedown rerun.
The rerun should target the original blocker only while preserving the already
passed PR508B checks.

Required hosted proof:

- deployed API includes PR508C repair commit;
- signed-in public exhibit report by slug returns `201`;
- hosted `moderation_reports.target_id` stores the public exhibit UUID;
- duplicate report by slug returns bounded duplicate behavior;
- admin queue resolves the UUID target to metadata-only public exhibit context;
- admin remove hides the public route;
- admin restore reopens only an eligible removed published exhibit;
- owner-retracted exhibits cannot be removed/restored into public visibility by
  moderation actions;
- public route remains slug-based and metadata-only;
- signed-out, missing, malformed, removed, and retracted report attempts fail
  closed;
- public Space/persona/Discover/search/forum/feed surfaces still do not surface
  encounter exhibits outside `/encounters/[slug]`;
- sanitized proof output records no raw owner ids, source persona ids, private
  session ids, setup bodies, generated reply text, private curation text,
  transcript excerpts, provider payloads, prompts, source bodies, env values,
  tokens, cookies, SQL details, stack traces, screenshots, traces, videos,
  browser storage state, or secret-shaped values.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR508C as ACCEPT_PR508C_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TARGET_REPAIR.
- The repair keeps public exhibit report routes slug-based, resolves slug to public exhibit UUID server-side, and persists UUID moderation report targets for hosted schema compatibility.
- Admin queue/remove/restore resolve UUID targets back to safe public exhibit metadata and preserve owner-retracted exhibit protection.
- No migration, package, lockfile, web UI, provider, retrieval, billing, social, Redis, Cloudflare, queue/worker, storage, Discover/search/forum/feed, or private-material exposure drift was found.
- Required validation passed.
Task:
- Close PR508C if accepted and route PR508B back to ARIADNE for hosted report/takedown rerun using the checklist in docs/roadmap/PR508C_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_REPORT_TARGET_REPAIR_REVIEW_RESULT.md.
```
