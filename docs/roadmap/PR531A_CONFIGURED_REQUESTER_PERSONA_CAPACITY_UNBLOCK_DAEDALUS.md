# PR531A Configured Requester Persona Capacity Unblock

Date: 2026-07-18

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Review target: ARGUS / A3

Status:

```text
OPEN_PR531A_CONFIGURED_REQUESTER_PERSONA_CAPACITY_UNBLOCK
```

## Authority

ARGUS blocks PR531 only because the configured requester account is private
tier with 13 personas and cannot create one fresh disposable requester persona
through `POST /personas`.

`docs/roadmap/PR531_UNIQUE_DISPOSABLE_PR524B_FIXTURE_PREFLIGHT_RESULT.md`

Generated schema, generated-scope consent validation, counterparty capacity,
detail-only publication routes, report/moderation routes, and focused source
tests are green. Do not reopen those contracts.

## Objective

Create exactly one uniquely tagged private requester persona through the normal
product route under the already configured requester account, then restore the
account's entitlement state exactly. Retain only that private tagged persona
for the later full PR524B fixture; create no consent, counterparty persona,
generated artifact, revision, publication, report, or public exposure here.

## Required Sequence

1. Serialize against all other hosted writers and bind current Supabase and
   Railway identities without printing secrets.
2. Build a private ignored operator under `.station-private/pr531a/`.
3. DPAPI-encrypt exact pre-run snapshots of the requester profile/entitlement,
   billing/subscription linkage, all requester persona ids/digests, target-tag
   collision counts, retained PR528, Auth/session counts, generated tables,
   migration ledger, and public placement probes.
4. Inspect the actual `canCreatePersona` source contract. Temporarily adjust
   only the narrowest reversible nonbilling entitlement field it reads, to the
   minimum value that permits one create. Do not invoke Stripe checkout,
   webhook, customer, price, subscription, or credit flows.
5. Open one dedicated requester product session, call `POST /personas` once,
   and create one private persona using a collision-free tag prefix:

   ```text
   pr531a-pr524b-requester-<yyyymmdd>-<short-random>
   ```

6. Prove the response and hosted row belong to the configured requester, are
   private, use the exact tag, and increased only that owner's persona count by
   one.
7. Restore the requester entitlement/profile/billing linkage byte-for-byte to
   its pre-run state before handoff.
8. Sign out and remove only the exact session/refresh artifacts opened by this
   run. Prove all non-target Auth counts and stable digests are restored.
9. Retain the tagged private requester persona and its id/digest only in the
   encrypted ledger. The public receipt may expose the tag prefix and counts,
   never raw ids, email, tokens, session ids, or private profile data.

## Failure Recovery

- If the entitlement adjustment cannot be represented as one narrow reversible
  nonbilling change, stop before mutation and wake MIMIR with the exact field/
  contract blocker.
- If persona creation fails, restore entitlement and session/Auth state before
  stopping.
- If creation succeeds but a later invariant fails, delete only the exact
  tagged persona through the product route, restore entitlement and session
  state, and prove zero tag residue.
- Never delete or alter any of the requester's 13 existing personas to make
  room.
- Do not create a new Auth identity.

## Validation And Receipt

The result must include a public-safe receipt proving:

- exact one-persona count delta and one private tag match;
- requester entitlement restored exactly;
- zero Stripe/billing/subscription mutation;
- zero generated/consent/report/public-placement rows;
- retained PR528, migration, unrelated product, and Auth invariants unchanged;
- Railway stayed ready/idle with no redeploy;
- exact recovery path privately journaled and syntax-checked.

Create:

```text
docs/roadmap/PR531A_CONFIGURED_REQUESTER_PERSONA_CAPACITY_UNBLOCK_DAEDALUS_RESULT.md
```

Then wake ARGUS for independent read-only review. Do not stop after reporting
without emitting the wakeup.

```text
WAKEUP A2:
Codename: DAEDALUS
Summary:
- ARGUS blocked PR531 only because the configured private-tier requester with
  13 personas cannot create one fresh disposable requester persona.
- Schema, counterparty capacity, routes, and focused source tests are green.
Task:
- Run PR531A as one serialized reversible nonbilling capacity adjustment.
- Create exactly one uniquely tagged private requester persona through
  `POST /personas`, restore entitlement immediately, clean the exact session,
  and retain only encrypted fixture identity/digest evidence.
- Do not touch existing personas, Stripe, new Auth users, counterparty/public
  state, consent, generated rows, reports, or unrelated data.
- Commit a public-safe result and wake ARGUS explicitly for read-only review.
```
