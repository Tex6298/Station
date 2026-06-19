# PR55 - Private Project Attachment UI

Date: 2026-06-19
Status: opened for DAEDALUS
Owner: DAEDALUS implements, ARGUS reviews, ARIADNE rechecks if accepted,
MIMIR decides next lane.

## Purpose

Make the owner-only Project shell actually usable by letting owners attach and
detach their existing Developer Spaces from a private Project page.

PR52 added the attachment API. PR54 added the private Project UI shell. PR55 is
the narrow UI bridge between them.

## Scope

Implement only:

- On private owner `/projects/[idOrSlug]`, show attached Developer Spaces from
  the existing PR53 `developerSpaces` response.
- Load the owner's Developer Spaces through the existing authenticated
  `GET /developer-spaces` route.
- Show unattached owner Developer Spaces as attach candidates.
- Let the owner attach a candidate using existing
  `PATCH /developer-spaces/:id/project` with the current Project id.
- Let the owner detach an attached Developer Space using existing
  `PATCH /developer-spaces/:id/project` with `projectId: null`.
- Refresh local Project detail / candidate state after attach or detach.
- Use clear pending/error states for attach/detach actions.
- Keep all controls owner-only and private.
- Add focused web helper tests if logic is extracted.
- Update docs/status/validation.

## UI Direction

- Keep this as an operational control inside the private Project detail page.
- Do not add public Project branding or a public Project page.
- Do not add a Developer Space create-time Project picker in this PR.
- Keep copy plain: "Attach to this Project", "Detach", "No unattached
  Developer Spaces".
- Do not imply billing, runtime hosting, team membership, deployment, or public
  publishing behavior.

## Non-Scope

- No backend/API route changes.
- No public Project pages or Discover integration.
- No Project brand/marketing surface.
- No Developer Space create-time Project picker.
- No billing, quotas, Stripe, or entitlement changes.
- No project exports and no `export_packages.project_id`.
- No contributor UI.
- No member-role authorization beyond the owner-only API already present.
- No invitations or membership management.
- No seed-data backfill.
- No Cloudflare.
- No Tier 2 hosting, containers, database provisioning, Redis queues,
  deployment pipeline, developer agent, chat-native tools, or DexOS widgets.

## Acceptance

ARGUS can accept PR55 if:

- The UI uses only existing authenticated owner APIs.
- Attach/detach controls call the existing PR52 route.
- Unattached candidate listing is owner-scoped and does not fabricate data.
- Attached and unattached lists refresh after changes.
- Error and pending states are visible enough for staging rehearsal.
- No backend/API route changes appear.
- No public Project route/page is added.
- Existing `test:projects`, `test:developer-spaces`, and web typecheck stay
  green.

ARIADNE should recheck after ARGUS if the UI lands:

- signed-in Project detail with an unattached Developer Space candidate;
- attach flow;
- detach flow;
- narrow viewport fit;
- no public Project leakage or new public route.

## Validation

Run at minimum:

```bash
npm exec --yes pnpm@10.32.1 -- run test:projects
npm exec --yes pnpm@10.32.1 -- run test:developer-spaces
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

If a web build is useful, run it and record the known Windows standalone
symlink result if it appears after successful compile/type/page generation.

## Handoff

Wake ARGUS with:

- web files changed;
- exact UI controls added;
- whether any backend/API file changed;
- validation results;
- confirmation that public Project pages, create-time picker, billing, exports,
  contributor/member auth, Cloudflare, Tier 2, developer-agent, DexOS, and
  `export_packages.project_id` stayed untouched;
- whether ARIADNE should perform the owner attach/detach rehearsal;
- any PR56 recommendation.

If blocked, wake MIMIR with the exact blocker. Do not leave the lane silent.
