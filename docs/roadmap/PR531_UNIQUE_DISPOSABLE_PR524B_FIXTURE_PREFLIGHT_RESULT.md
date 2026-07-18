# PR531 Unique Disposable PR524B Fixture Preflight Result

Date: 2026-07-18

Owner: ARGUS / A3

Verdict:

```text
BLOCK_PR531_UNIQUE_DISPOSABLE_PR524B_FIXTURE_PLAN
```

## Decision

ARGUS blocks PR531 before any hosted mutation. The preferred fixture strategy
is still the right one: one fresh, uniquely tagged requester persona and one
fresh, uniquely tagged counterparty persona under the two already configured
staging test accounts, with only the counterparty exposed publicly long enough
for public-slug target resolution. However, read-only hosted evidence shows the
configured requester account cannot create the fresh requester persona through
the product route.

The smallest missing capability is configured requester persona capacity. The
requester account is `private` tier and already has more personas than the
private-tier create limit permits; `POST /personas` calls `canCreatePersona`
and will return `403` before a fresh disposable requester persona can be
created. The counterparty account can create and expose a public persona.

## Read-Only Hosted Evidence

No hosted rows, Auth users, sessions, visibility, moderation state, schema, or
runtime configuration were changed by ARGUS.

- API and web health are ready on branch `main`, both reporting short SHA
  `f3a2049bde26`.
- Generated schema remains ready: all five generated target tables exist with
  zero rows.
- The hosted consent validator exposes exactly the eight accepted scopes,
  maximum cardinality eight, and read-only probes passed for the generated
  two-scope pair plus hostile empty/unknown/ninth-scope cases.
- The two configured staging accounts exist and are distinct.
- Configured requester: `private` tier, 13 personas, 3 public personas, no
  product-route capacity for another private persona.
- Configured counterparty: `canon` tier, 13 personas, 0 public personas,
  product-route capacity for a private or public persona.
- No PR531 tag residue exists in personas, cross-owner consents, generated
  artifacts, generated revisions, or generated publications.
- Historical generated-scope consent count is zero and active exact-pair
  generated-scope consent count is zero after PR530B3.

## Source Route Map

The complete PR524B proof should still use product routes only:

1. requester creates a private tagged persona with `POST /personas`;
2. counterparty creates a tagged persona with `POST /personas`, or creates
   private then exposes it with `PATCH /personas/:id` using
   `skipIntegrityPreflight: true`;
3. requester resolves the counterparty via
   `GET /persona-encounters/cross-owner-consent-targets/:publicSlug`;
4. requester creates the exact generated-scope consent with
   `POST /persona-encounters/cross-owner-consents/from-public-persona` and
   scopes `save_private_cross_owner_artifact` plus
   `publish_exact_generated_revision`;
5. counterparty approves with
   `PATCH /persona-encounters/cross-owner-consents/:consentId/approve`;
6. a participant saves private generated material with
   `POST /persona-encounters/cross-owner-consents/:consentId/generated-artifacts`;
7. a participant proposes the exact final text with
   `POST /persona-encounters/cross-owner-generated-artifacts/:artifactSlug/revisions`;
8. both participants approve the exact digest with
   `PATCH /persona-encounters/cross-owner-generated-revisions/:revisionSlug/approve`;
9. a participant publishes the detail-only generated publication with
   `POST /persona-encounters/cross-owner-generated-revisions/:revisionSlug/publication`;
10. signed-out proof reads
    `GET /persona-encounters/cross-owner-generated-publications/:slug` and
    `/encounters/cross-owner/generated/:slug`;
11. report and moderation use
    `POST /persona-encounters/cross-owner-generated-publications/:slug/report`
    plus the existing `/reports` admin review flow;
12. participant cleanup uses
    `PATCH /persona-encounters/cross-owner-generated-publications/:slug/retract`,
    `DELETE /persona-encounters/cross-owner-generated-publications/:slug`,
    `DELETE /persona-encounters/cross-owner-generated-artifacts/:artifactSlug`,
    `PATCH /persona-encounters/cross-owner-consents/:consentId/revoke`, and
    `DELETE /personas/:id` after generated/product lifecycle cleanup.

## Cleanup And Recovery Contract

If PR531A unblocks requester persona capacity, the later mutating operator must
use one public-safe run tag prefix:

```text
pr531a-pr524b-disposable-<yyyymmdd>-<short-random>
```

The tag must be embedded in both persona names, consent reason/audit-visible
labels when product routes allow it, generated artifact title/excerpt,
revision title/excerpt, generated publication slug/title/excerpt, report notes,
and the private encrypted run ledger. The public receipt may include only
counts, statuses, route names, short deployment SHAs, digest booleans, and tag
prefixes, not raw IDs, emails, bearer tokens, session IDs, generated private
body text, report notes, or Supabase/Railway identifiers.

Before mutation, DAEDALUS should capture DPAPI-encrypted baselines for touched
personas, profiles, consents, generated tables, moderation reports, Auth
session/refresh-token counts for the exact sessions it opens, retained PR528
rows, migration rows, and public placement probes. Normal cleanup order should
be: close public proof, remove/restore moderation state, retract/delete
publication, delete/retract generated artifact so revisions/publications are
invalidated, revoke consent, set the counterparty persona private if it was
public, delete both tagged personas, then delete exact Auth sessions created by
the proof. Each intermediate failure must have an encrypted recovery ledger and
must leave the counterparty private before stopping.

Read-only catalog inspection found no `RESTRICT`/`NO ACTION` foreign-key
dependency from public tables back to `personas`; cross-owner generated
dependencies are cascade-shaped. That means the earlier hosted 500 is not
explained by an obvious current FK restrict blocker, but the mutating lane
still must rehearse product-route persona delete and prove zero tagged residue.

## Scope Guard

PR531 does not authorize provider/model calls, retrieval, embeddings, storage,
billing, Redis, Cloudflare, queues, partner adapters, UI changes, new Auth
identities, or choosing among historical consent pairs. It also does not
authorize deleting or altering existing non-PR531 requester personas to make
room.

## Validation

- `node .station-private/pr531/argus-preflight.mjs` passed as a read-only
  hosted/catalog/product-capacity check.
- `npx pnpm@10.32.1 test:persona-encounters` passed: 88 tests.
- `npx pnpm@10.32.1 test:reports` passed: 9 tests.
- `npx pnpm@10.32.1 test:personas` passed: 18 tests.

The first direct `pnpm ...` attempts failed because `pnpm` is not on this
shell's PATH; rerunning via the declared package-manager version with `npx`
passed.

## Smallest Unblock

Open:

```text
PR531A_CONFIGURED_REQUESTER_PERSONA_CAPACITY_UNBLOCK_DAEDALUS
```

DAEDALUS should make the configured requester account able to create exactly
one fresh disposable PR524B requester persona through the product route, or
return the smallest safer alternative if that cannot be done without mutating
unrelated hosted data. Acceptable options, in order, are:

1. a narrow, reversible entitlement/capacity adjustment for the configured
   requester account with encrypted before/after/restoration evidence;
2. a single new dedicated requester Auth identity only if product-route capacity
   cannot be safely adjusted, with the irreversible Auth/audit cost named and
   a bounded session cleanup contract;
3. no reuse of the nine historical consent pairs and no deletion of unrelated
   existing requester personas merely to create capacity.

After PR531A is accepted, ARIADNE can rerun the complete PR524B hosted proof
using the route sequence and cleanup contract above.
