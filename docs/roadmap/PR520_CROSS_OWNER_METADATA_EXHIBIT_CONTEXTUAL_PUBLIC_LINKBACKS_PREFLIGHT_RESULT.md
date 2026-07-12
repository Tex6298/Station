# PR520 - Cross-Owner Metadata Exhibit Contextual Public Linkbacks Preflight Result

Owner: ARGUS / A3

Date: 2026-07-12

Status: Accepted

## Verdict

```text
ACCEPT_PR520A_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_CONTRACT
```

ARGUS accepts one narrow PR520A lane: metadata-only cross-owner public
exhibits may appear as participant public-persona linkbacks, and only on the
currently routeable public persona page for a participant in the approved
consent.

This is not approval for public Space placement, forum/community/Salon
placement, Station Press/public document/writing placement, Discover feed,
rising, featured, homepage, public persona chat/context-preview source
expansion, generated words, generated summaries, transcripts, excerpts, source
text, private saved cross-owner artifacts, PR516 disposable preview output
reuse, provider/retrieval/storage/billing/social/Redis/Cloudflare/queue/
deployment/package/migration work, or broad UI work.

DAEDALUS may implement PR520A only if MIMIR closes/routes this preflight.

## Evidence Reviewed

ARGUS reviewed:

- `docs/roadmap/PR520_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_PREFLIGHT_ARGUS.md`;
- `docs/roadmap/PR518_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_SURFACING_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR518B_CROSS_OWNER_METADATA_EXHIBIT_PUBLIC_INDEX_HOSTED_PROOF_RESULT.md`;
- `docs/roadmap/PR519_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR519A_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_REVIEW_RESULT.md`;
- `docs/roadmap/PR519B_CROSS_OWNER_METADATA_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_RESULT.md`;
- `apps/api/src/routes/persona-encounters.ts`;
- `apps/api/src/routes/discover.ts`;
- `apps/api/src/routes/personas.ts`;
- `apps/api/src/routes/spaces.ts`;
- `apps/web/app/personas/[publicSlug]/page.tsx`;
- `apps/web/lib/public-persona-route.ts`;
- current persona, encounter, Discover, Space, community, writing, and Studio
  tests.

Current accepted truth:

- PR519B hosted proof showed cross-owner metadata-only public exhibits are
  safely routeable through the dedicated cross-owner index/detail and a separate
  Discover search group.
- Public payloads currently route only to `/encounters/cross-owner#<slug>` and
  exclude generated words, transcripts, excerpts, generated summaries, private
  setup, PR516 disposable preview output, provider payloads, prompts, retrieval
  bodies, token facts, raw owner ids, raw persona ids, consent ids, report
  counts, admin internals, and secrets.
- Current public persona pages already resolve a safe public slug to an
  eligible public persona server-side and display bounded public readback,
  public document/discussion/Salon updates, optional public context preview,
  and optional public chat.
- Current public Space pages derive persona cards from the Space owner's public
  personas and public Space ownership, not from cross-owner consent.
- Current forum/community, writing, homepage, and Discover feed surfaces have
  explicit route/type contracts and do not carry cross-owner public exhibit item
  types.

## Boundary Answers

1. A contextual linkback is safe now only on a participant public persona page.
   It is not safe on public Spaces, forums, Salon/community surfaces, writing,
   Station Press/public documents, Discover feed/rising/featured, homepage, or
   chat/context-preview sources in PR520A.

2. The smallest safe implementation lane is a dedicated public persona readback
   endpoint and page section, for example:

   ```text
   GET /personas/public/:publicSlug/cross-owner-exhibits
   ```

   The web page may render one separate section on
   `apps/web/app/personas/[publicSlug]/page.tsx`. Do not merge these rows into
   `/personas/public/:publicSlug/events`, `/context-preview`, public chat
   sources, Discover feed, or existing Space/forum/writing helpers.

3. Both participant personas do not need to be currently public. The current
   page persona must be currently public, routeable, eligible, and the matching
   requester/counterparty display snapshot must still match that public persona
   name. The other participant may remain display-snapshot-only; PR520A must not
   add a profile route, public slug, owner id, or persona id for the other
   participant.

4. PR520A is participant-page-only. Public Space, community/forum/Salon,
   Station Press/public document, writing, Discover feed, homepage, and
   generated-word publication require separate future preflights.

5. A PR520A linkback item may contain only:

   - `slug`;
   - `routeHref`, exactly `/encounters/cross-owner#${slug}`;
   - `title`;
   - `summary`, as approved public metadata only;
   - `tags`;
   - `status`, always `published`;
   - `contractVersion`, exactly the current cross-owner public metadata
     contract version;
   - `publishedAt`;
   - `participantRoleOnThisPage`, `requester` or `counterparty`;
   - `participants.label`, exactly `Cross-owner consent display snapshots`;
   - `participants.requesterName`;
   - `participants.counterpartyName`;
   - `provenance.label`, exactly
     `Cross-owner metadata-only public encounter exhibit`;
   - `provenance.public`, `provenance.crossOwner`,
     `provenance.metadataOnly`, `provenance.bilateralApproval`,
     `provenance.routeListed`, and `provenance.discoverable`;
   - `provenance.indexed`, which remains `false`;
   - `provenance.source`;
   - bounded copy that says the card is approved public metadata only.

   It must not include API/table ids, raw owner ids, raw persona ids, consent
   ids, requested scopes, owner email/profile data, public slugs for the other
   participant, Space/forum/document routes, report paths, report counts,
   moderation state, admin actions, private setup, PR516 output, generated
   reply text, transcript text, excerpts, generated summaries, source bodies,
   prompts, provider payloads, retrieval bodies, token facts, SQL details,
   stack traces, env values, cookies, bearer values, or secret-shaped strings.

6. Linkbacks route only to:

   ```text
   /encounters/cross-owner#<slug>
   ```

   PR520A must not add persona-to-persona links, Space links, forum links,
   document links, discussion links, report links, or external/raw hrefs.

7. Revoked consent, inactive consent, wrong scope, wrong scope version,
   one-sided approval, missing consent, malformed row, wrong schema, wrong
   contract version, participant retract, moderation remove, and row/consent
   snapshot drift must be absent. Moderation restore may make the linkback
   reappear only when the row still passes the full public-readability floor.
   If the current page persona becomes hidden, private, ineligible, deleted, or
   has an unsafe or old public slug, the endpoint must 404 or return no
   linkbacks through the normal public persona route guard. If the current page
   persona name no longer matches the relevant consent/exhibit display snapshot,
   the participant-page linkback must stay absent; the card must not claim a
   stale snapshot is the current public profile name. If the other participant
   is hidden, private, deleted, or renamed, PR520A must not create a route to
   that persona and must keep only the already-approved display snapshot.

8. No database migration, denormalized link table, search index, queue, or
   worker is required for PR520A. The first lane may use existing consent and
   cross-owner public exhibit rows with bounded server-side queries:

   - resolve the current public persona by safe `publicSlug`;
   - find approved active consents where that persona id is requester or
     counterparty;
   - load published, non-removed, non-retracted cross-owner public exhibits for
     those consent ids;
   - apply the same PR518A/PR519A public-readability floor plus the current
     page persona public/snapshot-match floor;
   - cap the result to at most six latest rows.

   If hosted latency is poor, MIMIR should route a separate public-persona
   linkback index repair instead of widening PR520A.

9. No-drift tests must prove Discover feed/rising/featured, same-owner
   `/encounters`, Discover search group separation, public Space, forum/Salon,
   community, writing, public document, homepage, public persona chat,
   public persona context-preview, and owner-private buckets do not gain
   cross-owner rows outside the accepted participant page linkback section.

10. Generated-word publication remains blocked. The next preflight before any
    generated-word sharing must explicitly cover generated text provenance,
    exact participant approval, source/output selection, moderation/reporting,
    revocation/retract behavior, deletion behavior, privacy copy, hosted proof,
    and no reuse of PR516 disposable output without a new approval contract.

## PR520A Implementation Contract

Allowed files:

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
shared public-readability helper is truly narrower than route-local duplication.
No behavior, payload, or route drift is allowed there.

Expected API behavior:

- unsafe, missing, private, hidden, ineligible, or stale public slugs return the
  existing bounded public persona not-found behavior;
- empty eligible personas return `exhibits: []`;
- storage failures return bounded public errors without internals;
- rows are latest-first, capped at six, deterministic by `publishedAt` and
  slug, and filtered before serialization;
- payload keys are exact and metadata-only;
- route hrefs are derived from safe public exhibit slugs, not trusted from DB
  or client input;
- no public chat/context-preview source list may include these rows.

Expected web behavior:

- render a clearly separate public persona section for cross-owner public
  exhibit linkbacks;
- label rows as approved metadata-only cross-owner encounter exhibits;
- link only to `/encounters/cross-owner#<slug>`;
- keep optional read failures bounded and non-blocking for the public persona
  profile;
- do not add report controls, discussion controls, comments, profile links,
  Space links, feed cards, homepage cards, hero work, or broad layout work.

## Required Tests

PR520A must prove:

- requester public persona page returns only matching published readable
  cross-owner exhibit linkbacks;
- counterparty public persona page returns only matching published readable
  cross-owner exhibit linkbacks;
- the other participant does not need a current public profile and is serialized
  only as a display snapshot;
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

Required local validation:

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

Also run changed-path, forbidden-path, and secret-shaped value scans.

## ARGUS Validation

ARGUS ran the preflight validation on 2026-07-12:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:personas` | Pass | 16 tests passed, including public persona eligibility, public-only readback, routeable public sources, public chat/report boundaries, and fail-closed public reads. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 74 tests passed, including cross-owner public metadata readability, list/detail/readback, consent revocation, moderation, and same-owner exhibit regressions. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 8 tests passed, including same-owner and cross-owner public exhibit moderation actions. |
| `npm exec --yes pnpm@10.32.1 -- run test:community` | Pass | 47 tests passed, including separate cross-owner Discover search, public/private bucket separation, and feed/writing helper no-drift. |
| `npm exec --yes pnpm@10.32.1 -- run test:writing` | Pass | 29 tests passed, including public persona route helper, public Space helper, Discover feed controls, and writing feed boundaries. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 215 tests passed, including cross-owner public metadata helper/readback copy and owner-visible redaction coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed from cache. |

## Hosted Proof Required

Hosted proof is required after PR520A because it adds a new customer-visible
public persona surface. ARIADNE should prove:

- hosted API and web are fresh enough to include PR520A;
- requester and counterparty public persona pages show only eligible linkbacks;
- hidden/private/current-page display-name drift and old-slug controls stay
  absent;
- public Space, forum/Salon/community, writing, homepage, Discover feed, public
  persona chat/context-preview, same-owner exhibits, and owner-private buckets
  show no drift;
- desktop and `390px` mobile rendering fit without overlap or clipped text;
- cleanup leaves no readable temporary proof rows.

## Next Wakeup

Wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR

ACCEPT_PR520A_CROSS_OWNER_METADATA_EXHIBIT_CONTEXTUAL_PUBLIC_LINKBACKS_CONTRACT
```
