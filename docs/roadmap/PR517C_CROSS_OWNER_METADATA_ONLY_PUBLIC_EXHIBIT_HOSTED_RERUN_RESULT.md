# PR517C - Cross-Owner Metadata-Only Public Exhibit Hosted Rerun Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

Result:

```text
BLOCK_PR517C_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_HOSTED_RERUN
```

## Summary

ARIADNE reran the hosted PR517B proof as PR517C after MIMIR applied hosted
migration `080`.

The cross-owner metadata-only public exhibit contract passed on hosted through
cleanup, but the full PR517C gate cannot be closed because hosted has no
published same-owner public exhibit fixture available for the required
same-owner report/remove/restore regression check.

Smallest blocker:

```text
same-owner regression fixture missing
```

The fixture lookup returned no row from
`persona_encounter_public_exhibits` with `status='published'`,
`retracted_at is null`, and `removed_at is null`.

## Hosted Proof

Passed before the same-owner fixture blocker:

- API health returned `200`;
- route smoke check
  `/persona-encounters/cross-owner-public-exhibits/not-real` returned clean
  `404`;
- migration `080` table is visible on hosted with 26 columns;
- exhibit triggers `pe_co_public_exhibits_validate` and
  `pe_co_public_exhibits_updated_at` are present;
- consent inactive retract trigger
  `pe_co_public_exhibits_retract_on_consent` is present;
- RLS policies `pe_co_public_exhibits_select_participants` and
  `pe_co_public_exhibits_select_published` are present;
- moderation reports accept target type
  `persona_encounter_cross_owner_public_exhibit`;
- pending consent proposal failed closed with
  `persona_encounter_cross_owner_public_exhibit_consent_inactive`;
- wrong scope proposal failed closed with
  `persona_encounter_cross_owner_public_exhibit_wrong_scope`;
- wrong version proposal failed closed with
  `persona_encounter_cross_owner_public_exhibit_wrong_version`;
- nonparticipant proposal and approval returned `404`;
- one-owner proposal remained hidden from public readback;
- duplicate proposal failed with
  `persona_encounter_cross_owner_public_exhibit_exists`;
- same actor second approval failed with
  `persona_encounter_cross_owner_public_exhibit_counterparty_metadata_required`;
- mismatched metadata approval failed with
  `persona_encounter_cross_owner_public_exhibit_metadata_mismatch`;
- exact counterparty approval published the public metadata row;
- public readback returned title, summary, tags, safe display snapshots, and
  provenance flags only;
- public readback had `generatedWordsPublished=false`,
  `transcriptPublished=false`, `summaryPublished=false`,
  `excerptPublished=false`, `routeListed=false`, `indexed=false`,
  `discoverable=false`, and `consent.executable=false`;
- public readback did not contain UUID-shaped raw ids or credential-pattern
  text;
- cross-owner slug/title were absent from same-owner public exhibit index,
  Discover feed, Discover search, hosted `/discover`, and hosted `/encounters`;
- report route created a `persona_encounter_cross_owner_public_exhibit`
  moderation target and incremented `reported_count`;
- moderation remove hid public readback;
- approval while removed failed with
  `persona_encounter_cross_owner_public_exhibit_removed`;
- moderation restore succeeded while consent was active;
- consent revocation hid the restored row;
- restore after consent revocation failed closed;
- participant retract hid a published row;
- approval after retract failed with
  `persona_encounter_cross_owner_public_exhibit_retracted`;
- no private sessions or cross-owner runtime attempts were created.

Blocked:

- same-owner report/remove/restore regression could not run because hosted has
  no published same-owner public exhibit fixture.

## Cleanup

Cleanup passed:

```text
activeProofConsents 0
publicTempTargets 0
publiclyReadableRows 0
```

The rerun cleaned the current proof fixtures, and a follow-up orphan cleanup
also cleaned the earlier local harness catch-block interruption:

- all PR517C proof consents are inactive;
- all PR517C temporary public targets are private;
- all PR517C cross-owner public exhibit rows are retracted or removed;
- no PR517C proof row is publicly readable.

## Validation

```text
node .tmp\pr517c-hosted-proof.mjs
node .tmp\pr517c-orphan-cleanup.mjs
node .tmp\pr517c-orphan-check.mjs
```

Result: blocked by missing same-owner hosted fixture.

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Next

MIMIR should either provide or authorize a safe hosted same-owner public exhibit
fixture for the report/remove/restore regression gate, or explicitly waive that
hosted same-owner check based on the existing local PR517A report-route tests.
