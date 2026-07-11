# PR508A - Owner Encounter Public Exhibit Metadata Review Result

Owner: ARGUS / A3

Date: 2026-07-11

Status: Accepted after narrow ARGUS patch

## Verdict

```text
ACCEPT_PR508A_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_ONLY
```

ARGUS accepts PR508A after two narrow safety patches. The implementation matches
the accepted lane: same-owner, metadata-only public encounter exhibits derived
from already saved same-owner private encounter artifacts, with explicit owner
publish/retract, a dedicated public route/table, and report/takedown support.

This is not approval for transcripts, owner-selected excerpts, raw generated
responder replies, private setup, private curation auto-copy, raw ids, provider
payloads, prompts, private context, source bodies, cross-owner persona words,
Discover/search/forum/feed surfacing, Archive, Memory, Canon, Continuity,
Integrity, Station Press, billing, storage, queue/worker, Redis, Cloudflare,
social, package, or lockfile drift.

## Review Findings

Accepted implementation boundaries:

- Migration `076_persona_encounter_public_exhibits.sql` adds a dedicated
  `persona_encounter_public_exhibits` table instead of loosening the private
  session table's `shareable = false` and `public_visibility = 'private'`
  constraints.
- Public exhibit rows carry owner-authored public title, summary, tags, safe
  same-owner persona display-name snapshots, public slug, publish/retract/remove
  status, report count, and
  `station.persona_encounter.public_exhibit.v1` provenance only.
- Owner publish requires auth, owner-scoped private session lookup, explicit
  `confirmPublicExhibit: true`, the private candidate marker, same-owner source
  personas, and strict public metadata fields.
- Publish rejects extra keys and forbidden setup/reply/excerpt/private
  curation/provider/raw-id/share-link fields before writes.
- Owner retract hides the public route and preserves the private artifact as
  private, non-shareable, and not public.
- Public GET returns only metadata for published exhibits and bounded `404` for
  malformed, missing, retracted, or removed exhibits.
- The dedicated `/encounters/[slug]` page renders title, summary, tags,
  same-owner display snapshots, provenance, and report/sign-in-to-report
  controls only.
- Reporting adds `persona_encounter_public_exhibit`, safe admin target context,
  and moderation remove/restore without exposing raw private row ids, setup,
  generated reply text, private curation, provider details, prompts, source
  bodies, SQL details, stack traces, or secret-shaped values.
- Studio publish controls are inside the private encounter artifact area and use
  newly authored public fields. PR507A private curation fields are not
  auto-copied into public output.

Narrow ARGUS patch:

- Hardened `persona_encounter_public_exhibit_tags_valid(tags text[])` so raw SQL
  arrays containing `NULL` tag elements fail the database constraint.
- Strengthened the public exhibit source trigger so the source private session
  must still have both persona ids owned by the exhibit owner, not only an
  owner-matched private session id.
- Restricted public exhibit moderation target actions so admins can remove only
  currently published exhibits and restore only removed exhibits. Retracted
  exhibits now expose no moderation target action, preserving owner retract
  control.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 36 tests passed after the ARGUS patch, including migration checks for null tag rejection and same-owner source trigger coverage, publish/retract/report, strict rejection, safe public GET, runtime helpers, and UI boundary source scan. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 7 tests passed after the ARGUS patch, including exhibit report persistence, safe admin target context, target filtering, remove/restore, and blocked moderation action for owner-retracted exhibits. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 201 Studio/helper tests passed after the ARGUS patch, including encounter runtime and moderation-console helpers. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed after the ARGUS patch. |
| Changed-path scan | Pass | Changed implementation paths are limited to the accepted migration, DB/types, encounter API/tests, reports API/tests, dedicated public exhibit page, Studio encounter UI, moderation-console helpers/tests, scoped CSS, and roadmap/testing docs. No package or lockfile changed. |
| Forbidden-path scan | Pass | No provider adapter, retrieval/vector/embedding, billing/Stripe, social, Redis, Cloudflare, queue/worker, webhook, storage, Archive, Memory, Canon, Continuity, Integrity, Station Press, package, lockfile, or deployment files changed. |
| Secret-shaped value scan | Pass | No API-key, private-key, GitHub token, OpenAI-style key, Google key, Slack token, or bearer-token-shaped values found in changed files. |
| Public/private leakage scan | Pass | Sensitive-field matches are private owner/admin paths or tests; public exhibit serialization/page and report target context expose metadata only. |
| `git diff --check` | Pass | No whitespace errors; Git reported expected LF-to-CRLF working-copy warnings only. |
| `git diff --cached --check` | Pass | No staged whitespace errors after staging the ARGUS review patch and docs/status updates. |

DAEDALUS also ran `npm exec --yes pnpm@10.32.1 -- run lint` successfully before
ARGUS review, and `npm exec --yes pnpm@10.32.1 -- run build` reached the known
local Windows standalone trace-copy `EPERM` after successful web compile,
lint/typecheck, page data, static page generation, and optimization. ARGUS did
not rerun build because the requested review gate is the focused test/typecheck
set above and the ARGUS patch is migration/API/report safety only.

## Hosted Proof Required

MIMIR should route ARIADNE for hosted proof before closing PR508A as a
customer-facing public exhibit lane because this patch changes schema, public
API behavior, visible owner Studio controls, a public web route, and moderation
behavior.

Hosted proof should verify:

- hosted migration `076` is applied, including the public exhibit table,
  moderation target type, null-tag rejection, and same-owner source trigger;
- owner can create or use one same-owner private candidate artifact and publish
  one metadata-only public exhibit on desktop and `390px`;
- signed-out public `/encounters/[slug]` shows only metadata, safe same-owner
  display snapshots, provenance, and sign-in-to-report copy;
- signed-in reporting creates a `persona_encounter_public_exhibit` report
  without raw ids or private material in readback;
- admin remove hides the public route and admin restore reopens only a removed
  published exhibit;
- owner retract hides the public route and cannot be overridden by a moderation
  remove/restore cycle for retracted content;
- signed-out, cross-owner, non-candidate, malformed, forbidden-field, and
  cross-owner persona publish attempts fail closed;
- public Space/persona/Discover/search/forum samples show no private encounter
  artifact or exhibit surfacing outside the dedicated exhibit route;
- cleanup retracts/removes the exhibit and deletes any proof artifact if one was
  created;
- sanitized proof output records no raw owner ids, persona ids, private session
  ids, setup bodies, generated reply text, private curation text, provider
  details, env values, token values, cookies, SQL detail, stack traces,
  screenshots, traces, videos, browser storage state, or secret-shaped values.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR508A metadata-only same-owner public encounter exhibits after two narrow safety patches.
- The public exhibit lane preserves the PR508 boundary: explicit owner publish/retract, dedicated public route/table, safe report/takedown, metadata-only public readback, and no transcripts/excerpts/raw replies/private setup/private curation/raw ids/provider payloads/prompts/private context/source bodies/cross-owner persona words.
- ARGUS hardened public exhibit SQL tag validation, strengthened the source trigger's same-owner persona check, and prevented moderation restore/remove actions from overriding owner-retracted exhibits.
- Full requested validation passed after the ARGUS patch.
- Hosted proof is required before customer-facing closeout.
Task:
- Close PR508A local review if accepted and route ARIADNE for hosted desktop/mobile/API proof using the checklist in docs/roadmap/PR508A_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_METADATA_REVIEW_RESULT.md.
```
