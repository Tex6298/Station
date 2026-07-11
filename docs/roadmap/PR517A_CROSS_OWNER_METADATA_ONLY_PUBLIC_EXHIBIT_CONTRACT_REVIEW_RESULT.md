# PR517A - Cross-Owner Metadata-Only Public Exhibit Contract Review Result

Date: 2026-07-11

Owner: ARGUS / A3

Status: ACCEPT_PR517A_CROSS_OWNER_METADATA_ONLY_PUBLIC_EXHIBIT_CONTRACT_WITH_ARGUS_PATCH

## Verdict

ARGUS accepts PR517A after a narrow review patch.

The implementation matches the lane: it creates a dedicated cross-owner,
metadata-only public exhibit contract with exact bilateral title/summary/tag
approval, active consent gating, API-detail-only public readback, distinct
report/moderation target handling, and no generated-word, transcript, excerpt,
summary, private artifact, Discover/search/feed, public persona, Space,
forum/community/Salon, writing, Station Press, Cloudflare, queue, hosted
runtime, partner-adapter, billing, or broad UI expansion.

## ARGUS Patch

ARGUS found and fixed two review issues before acceptance:

1. Same-owner moderation regression.

   The shared public-exhibit moderation helper selected `consent_id` from the
   existing same-owner `persona_encounter_public_exhibits` table. That column
   exists only on the new cross-owner table, so a real PostgREST/Supabase query
   could fail same-owner public exhibit remove/restore. ARGUS changed the
   select list by target type and hardened the reports test harness so the old
   same-owner table rejects cross-owner-only column selects.

2. Consent-revocation retraction trigger gap.

   The new SQL validator required an active approved consent for every
   cross-owner public exhibit update. The consent-status trigger then attempted
   to retract linked exhibit rows after the consent became inactive, which could
   cause the validator to reject the retraction in the same transaction. ARGUS
   narrowed the trigger to allow only status-to-`retracted` updates after
   consent inactivity when identity, snapshots, metadata, approvals, version,
   provenance, counts, publication, removal, creator, and creation timestamp are
   unchanged. All other insert/update paths still require active approved
   metadata-only consent.

## Review

Active consent and exact metadata approval remain required before publication.
Requester and counterparty owner/persona ids are inferred from the consent row;
public readback exposes safe slug/title/summary/tags/display snapshots,
contract/provenance facts, timestamps, and report path only. Public readback
does not expose raw consent ids, owner ids, persona ids, provider payloads,
token accounting, generated words, transcripts, excerpts, summaries, or private
session material.

Same-owner public exhibit behavior remains separate from the cross-owner table
and target type. Cross-owner rows are not added to `/encounters`,
Discover/search/feed, public persona, Space, forum/community/Salon, writing, or
Station Press surfaces.

This is a local code/schema acceptance only. ARGUS did not apply hosted
migration `080`, run hosted API/browser proof, or claim deployed public
readiness.

## Validation

ARGUS reran the requested validation after the patch:

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-encounters` | Pass | 73 tests passed, including migration shape, exact bilateral metadata approval, public detail readback, report/revoke hiding, same-owner regressions, and runtime helper coverage. |
| `npm exec --yes pnpm@10.32.1 -- run test:reports` | Pass | 8 tests passed, including same-owner public exhibit remove/restore, cross-owner report target context, and active-consent restore gating. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 215 tests passed, including helper-only cross-owner public exhibit path/payload/readback/error-copy coverage. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | Turbo API/web typecheck passed. |
| `git diff --check` | Pass | Whitespace check passed; Git reported expected LF-to-CRLF working-copy warnings only. |

## Recommendation

MIMIR should close PR517A as locally accepted with the ARGUS patch and decide
the next lane. A hosted migration/API proof is still required before any hosted
or customer-facing claim.

```text
WAKEUP A1:
Codename: MIMIR
```
