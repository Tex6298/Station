# PR495B - Durable Seminar Record Contract Hosted Proof Result

Date: 2026-07-05

Owner: MIMIR / A1

Verdict:

```text
HOSTED_MIGRATION_API_PROOF_PASSED
```

## Summary

MIMIR completed the hosted migration/API proof required by ARGUS before PR495B
closeout.

Target:

`https://stationapi-production.up.railway.app`

Runtime commit:

```text
3afa40d7
```

Migration:

`infra/supabase/migrations/069_public_seminar_records.sql`

## Migration Apply

The first Supabase CLI attempt with the full migration file failed because the
CLI prepared the multi-command file as one statement:

```text
cannot insert multiple commands into a prepared statement
```

MIMIR then applied the same migration file statement-by-statement through the
hosted Supabase pooler target. No secret values were printed.

Result:

```text
applied: true
statements: 17
```

## Hosted Schema Proof

Hosted Supabase now has:

- `public.public_seminar_records`;
- row-level security enabled;
- owner-only policies:
  - `public_seminar_records_select_owner`;
  - `public_seminar_records_insert_owner`;
  - `public_seminar_records_update_owner`;
  - `public_seminar_records_delete_owner`;
- indexes:
  - `idx_public_seminar_records_owner_status_updated`;
  - `idx_public_seminar_records_source`;
  - `public_seminar_records_owner_user_id_source_type_source_id_key`;
  - `public_seminar_records_pkey`;
- trigger:
  - `trg_public_seminar_records_updated_at`;
- constraints:
  - primary key;
  - owner/source unique key;
  - owner, source, and discussion foreign keys;
  - `source_type`, `status`, and `visibility` checks.

MIMIR also sent the PostgREST schema reload notification.

Anonymous Supabase REST table read proof:

```text
GET /rest/v1/public_seminar_records?select=id&limit=1
status: 200
rowCount: 0
```

Combined with the policy list above, this confirms no direct public/anonymous
select policy exists for the table.

## Hosted API Proof

Using replay staging credentials from local `.env` without printing tokens:

- replay owner authenticated;
- non-owner replay account authenticated;
- hosted API health returned runtime `3afa40d7`;
- owner had five public published document candidates in routeable public
  Spaces;
- signed-out `GET /events/seminars/records` returned `401`;
- owner `GET /events/seminars/records` returned `0` records before create;
- owner `POST /events/seminars/records` created one private `draft` record from
  a document source;
- duplicate owner `POST /events/seminars/records` returned the same stable
  record id;
- owner `GET /events/seminars/records` returned `1` record after create;
- non-owner `GET /events/seminars/records` returned `0` records;
- non-owner `POST /events/seminars/records` for the owner source returned
  `403`;
- public signed-out `GET /events/seminars` returned `3` cards;
- public signed-in `GET /events/seminars` returned `3` cards;
- signed-in interest mark and withdraw both succeeded on the same public card;
- owner record response did not contain leak-key hits for raw source id, owner
  id, discussion id, source body, provider payload, storage path, SQL, stack, or
  secret-shaped fields.

Safe summary of the API proof:

```text
deploymentCommit: 3afa40d7
tableCandidateCount: 5
signedOutRecordsStatus: 401
ownerListBefore: 0
ownerListAfter: 1
createdStatus: draft
createdVisibility: private
duplicateStable: true
nonOwnerListCount: 0
nonOwnerCreateStatus: 403
publicSeminarCards: 3
signedInPublicSeminarCards: 3
interestProof: mark and withdraw succeeded
responseLeakKeyHits: []
```

## Scope Check

The hosted proof did not add or observe:

- public seminar UI changes;
- public `/events/seminars` sourcing changes;
- interest migration;
- schedule/proposal/host claims;
- RSVP, tickets, payment, reminders, attendee lists, live rooms, media,
  recording, transcripts, provider runtime, queue/worker, Redis, Cloudflare,
  billing, or launch claims.
