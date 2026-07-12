# PR520A - Cross-Owner Metadata Exhibit Public Persona Linkbacks

Owner: DAEDALUS / A2

Date: 2026-07-12

Status: Ready for implementation

Source:

`docs/roadmap/PR520_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_PREFLIGHT_RESULT.md`

## Mission

Implement participant public-persona linkbacks for hosted-proven,
metadata-only cross-owner public exhibits.

This is a public persona readback lane only. Do not place these rows in public
Spaces, forums, Salons, writing, public documents, Discover feed, homepage,
public persona chat, public persona context-preview, same-owner encounters, or
owner-private buckets.

## API Contract

Add a bounded public persona readback endpoint, for example:

```text
GET /personas/public/:publicSlug/cross-owner-exhibits
```

Required behavior:

- unsafe, missing, private, hidden, ineligible, stale, or old public slugs use
  the existing bounded public persona not-found behavior;
- eligible personas with no rows return `exhibits: []`;
- rows are latest-first, capped at six, deterministic by `publishedAt` and
  slug, and filtered before serialization;
- route hrefs are derived from safe public exhibit slugs, not trusted from DB
  or client input;
- storage failures return bounded public errors without internals;
- public chat and context-preview source lists do not include these rows.

Each item may contain only:

- `slug`;
- `routeHref`, exactly `/encounters/cross-owner#${slug}`;
- `title`;
- `summary`, as approved public metadata only;
- `tags`;
- `status`, always `published`;
- `contractVersion`, exactly the current cross-owner public metadata contract
  version;
- `publishedAt`;
- `participantRoleOnThisPage`, `requester` or `counterparty`;
- `participants.label`, exactly `Cross-owner consent display snapshots`;
- `participants.requesterName`;
- `participants.counterpartyName`;
- `provenance.label`, exactly
  `Cross-owner metadata-only public encounter exhibit`;
- `provenance.public`;
- `provenance.crossOwner`;
- `provenance.metadataOnly`;
- `provenance.bilateralApproval`;
- `provenance.routeListed`;
- `provenance.discoverable`;
- `provenance.indexed`, which remains `false`;
- `provenance.source`;
- bounded copy that says the card is approved public metadata only.

Do not serialize API/table ids, raw owner ids, raw persona ids, consent ids,
requested scopes, owner email/profile data, public slugs for the other
participant, Space/forum/document routes, report paths, report counts,
moderation state, admin actions, private setup, PR516 output, generated reply
text, transcript text, excerpts, generated summaries, source bodies, prompts,
provider payloads, retrieval bodies, token facts, SQL details, stack traces,
env values, cookies, bearer values, or secret-shaped strings.

## Web Contract

On `apps/web/app/personas/[publicSlug]/page.tsx`:

- render a clearly separate public persona section for cross-owner public
  exhibit linkbacks;
- label rows as approved metadata-only cross-owner encounter exhibits;
- link only to `/encounters/cross-owner#<slug>`;
- keep optional read failures bounded and non-blocking for the public persona
  profile;
- do not add report controls, discussion controls, comments, profile links,
  Space links, feed cards, homepage cards, hero work, or broad layout work.

## Allowed Files

- `apps/api/src/routes/personas.ts`;
- `apps/api/src/routes/personas.test.ts`;
- `packages/types/src/persona.ts` only if a shared response type is needed;
- `apps/web/app/personas/[publicSlug]/page.tsx`;
- `apps/web/lib/public-persona-route.ts`;
- `apps/web/lib/public-persona-route.test.ts`;
- `apps/web/lib/persona-encounter-runtime.ts` and test only if a shared safe
  cross-owner anchor helper is reused without changing owner/private behavior;
- `apps/web/app/globals.css` only for scoped public persona section styling;
- roadmap/testing docs.

Touch `apps/api/src/routes/persona-encounters.ts` only if extracting a pure
shared public-readability helper is truly narrower than route-local
duplication. No behavior, payload, or route drift is allowed there.

## Required Tests

PR520A must prove:

- requester public persona page returns only matching published readable
  cross-owner exhibit linkbacks;
- counterparty public persona page returns only matching published readable
  cross-owner exhibit linkbacks;
- the other participant does not need a current public profile and is
  serialized only as a display snapshot;
- hidden/private/ineligible/current-page personas, unsafe slugs, old public
  slugs, and current-page display-name drift hide participant-page linkbacks;
- pending, one-sided, wrong-scope, wrong-version, inactive/missing/revoked
  consent, removed, retracted, malformed, wrong-schema, wrong-contract, and
  row/consent snapshot-drift rows stay absent;
- moderation restore reappears only if the row still passes the full public
  readability floor;
- exact payload keys exclude raw ids, consent ids, report data, admin fields,
  generated words, private setup, provider/retrieval/token data, and secrets;
- public persona chat and context-preview source lists do not include these
  rows;
- public Space, forum/Salon/community, writing/public document, homepage,
  Discover feed/rising/featured, same-owner exhibits, and owner-private search
  buckets do not surface the rows outside the accepted public persona section;
- the web section renders without text overflow on desktop and `390px` mobile.

## Required Validation

```text
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

Also run changed-path, forbidden-path, and secret-shaped value scans before
waking ARGUS.

## Review Handoff

Wake ARGUS with:

- changed files;
- API/web behavior summary;
- exact tests and validation;
- any skipped validation with reason;
- any blocker or scope concern.

ARGUS should reject scope drift into public Space, forum/community/Salon,
writing/public document, Discover feed/rising/featured, homepage, public
persona chat/context-preview, generated words, provider/retrieval, storage,
billing, Redis, Cloudflare, queue, package, lockfile, deployment, migration,
or broad UI work unless MIMIR explicitly opens a widened lane.
