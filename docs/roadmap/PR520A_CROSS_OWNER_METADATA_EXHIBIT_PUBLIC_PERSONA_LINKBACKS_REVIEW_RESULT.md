# PR520A - Cross-Owner Metadata Exhibit Public Persona Linkbacks Review Result

Owner: ARGUS / A3

Date: 2026-07-12

Status: Accepted

## Verdict

```text
ACCEPT_PR520A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS
```

ARGUS accepts PR520A locally without a code patch.

The implementation matches the PR520A contract: it adds a separate
metadata-only public persona linkback endpoint and a separate optional public
persona section, while keeping public Space, forum/Salon/community, writing,
public document, Discover feed/rising/featured, homepage, same-owner
`/encounters`, public persona chat/context-preview sources, generated words,
provider/retrieval/storage/billing/social/infra/package/deployment/migration,
and broad UI work out of scope.

## Evidence Reviewed

ARGUS reviewed:

- `docs/roadmap/PR520A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_DAEDALUS.md`;
- `docs/roadmap/PR520A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS_RESULT.md`;
- `docs/roadmap/PR520_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR520_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_PREFLIGHT_CLOSEOUT.md`;
- implementation diff `0f8860a1..604b2d4b`;
- `apps/api/src/routes/personas.ts`;
- `apps/api/src/routes/personas.test.ts`;
- `apps/web/app/personas/[publicSlug]/page.tsx`;
- `apps/web/lib/public-persona-route.ts`;
- `apps/web/lib/public-persona-route.test.ts`;
- `apps/web/app/globals.css`;
- current validation docs and lane status updates.

Changed files stayed inside the accepted PR520A scope:

- `.station-agents/state/DAEDALUS.json`;
- `apps/api/src/routes/personas.ts`;
- `apps/api/src/routes/personas.test.ts`;
- `apps/web/app/globals.css`;
- `apps/web/app/personas/[publicSlug]/page.tsx`;
- `apps/web/lib/public-persona-route.ts`;
- `apps/web/lib/public-persona-route.test.ts`;
- roadmap/testing docs.

## Review Notes

Accepted behavior:

- `GET /personas/public/:publicSlug/cross-owner-exhibits` is before the
  authenticated persona guard and uses the existing public persona safe-slug,
  public visibility, and owner-tier eligibility path.
- The endpoint returns `404` through the normal public persona not-found path
  for unsafe, old, hidden, private, missing, or ineligible public slugs.
- Results are filtered by current page participant role and current public
  persona display-name match before serialization.
- The other participant remains a consent display snapshot only; no
  counterparty profile route, public slug, raw owner id, raw persona id, or
  consent id is serialized.
- The route-local readability floor requires published, non-removed,
  non-retracted, expected schema, contract version `1`, bilateral metadata
  approvals, safe public exhibit slug, active approved consent, required scope,
  scope version `1`, exact row/consent persona ids, and exact row/consent
  display snapshots.
- Payload keys are metadata-only: slug, derived route, title, public summary,
  tags, status, contract version, published time, page role, participant
  display snapshots, and bounded provenance.
- Web rendering derives `/encounters/cross-owner#<slug>` from the safe slug and
  ignores any returned href trust problem.
- Public persona chat and context-preview source builders were not expanded.
- Public persona events were not expanded.
- No public Space, forum/Salon/community, writing/public document, homepage,
  Discover feed/rising/featured, same-owner encounter, provider/retrieval,
  storage, billing, social, Redis, Cloudflare, queue, package, lockfile,
  deployment, or migration path changed.

No code patch was required.

## Residual Risk

PR520A intentionally avoids migration/index work. The new endpoint queries
cross-owner public exhibit participant columns with bounded windows. That is
acceptable for the first no-migration lane, but hosted proof must measure real
route latency and route a separate index/repair if it is poor.

Local review did not run a browser screenshot proof. Hosted proof is required
before customer-facing closeout and must verify the new public persona section
on desktop and `390px` mobile without text overlap or clipping.

## Validation

ARGUS reran the requested validation on 2026-07-12:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 18 tests passed, including requester/counterparty public persona linkbacks, unsafe row filtering, missing other profile display-only serialization, remove/restore/revoke behavior, no raw id/consent/report/admin/private/generated/provider/token leakage, context-preview no-drift, and bounded failures. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 74 tests passed, including cross-owner public metadata readability/list/detail/readback, consent revocation, moderation, and same-owner public exhibit regressions. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 8 tests passed, including same-owner and cross-owner public exhibit moderation actions. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 47 tests passed, including separate cross-owner Discover search, public/private bucket separation, and feed/writing helper no-drift. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 32 tests passed, including public persona cross-owner safe-anchor helpers and chat/context source guards. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 215 tests passed, including cross-owner public metadata helper/readback copy and owner-visible redaction coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed with no cached tasks. |
| `git diff --check` | Pass | Working tree whitespace check passed. |
| `git diff --check 0f8860a1..604b2d4b` | Pass | Implementation diff whitespace check passed. |
| Changed-path scan | Pass | Diff stayed inside the PR520A allowed API persona route/test, public persona page/helper/test/style, state receipt, and roadmap/testing docs scope. |
| Forbidden-path scan | Pass | No public Space, forum/Salon/community, writing/public document, Discover feed/rising/featured, homepage, public persona chat/context source, generated-word, provider/retrieval, storage, billing, social, Redis, Cloudflare, queue, package, lockfile, deployment, or migration paths changed. |
| Secret-shaped added-line scan | Pass | No secret-shaped added lines were found in the implementation diff. |

## Hosted Proof Required

MIMIR should route ARIADNE for hosted PR520B proof before customer-facing
closeout. The proof should include:

- hosted API/web freshness for PR520A;
- requester and counterparty public persona linkback reads;
- missing other profile display-snapshot-only behavior;
- hidden/private/ineligible/old slug/current-name-drift absence;
- revoked consent, removed, retracted, wrong-scope/version/schema/contract, and
  row/consent snapshot-drift absence;
- public persona chat/context-preview/events no-drift;
- public Space, forum/Salon/community, writing/public document, Discover feed,
  homepage, same-owner `/encounters`, and owner-private bucket no-drift;
- desktop and `390px` mobile rendering without overlap or clipped text;
- latency measurements for the new endpoint;
- cleanup leaving no readable temporary proof rows.

## Next Wakeup

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR

ACCEPT_PR520A_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_PERSONA_LINKBACKS
```
