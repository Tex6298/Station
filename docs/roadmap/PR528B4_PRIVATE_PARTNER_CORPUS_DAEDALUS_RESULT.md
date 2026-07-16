# PR528B4 - Private Partner Corpus DAEDALUS Result

Owner: DAEDALUS / A2

Date completed: 2026-07-16

Status: Ready for MIMIR routing to ARGUS

```text
READY_PR528B4_PRIVATE_PARTNER_CORPUS_FOR_ARGUS
```

## Hosted Result

The isolated private partner corpus is retained in the hosted environment for
the authorized PR528 review window. The run created one dedicated private,
nonbilling owner and the approved private Aster corpus only. It did not create
the separately planned public owner or public corpus.

The owner has `private` tier, `inactive` subscription status, platform AI mode,
no Stripe links, and no admin state. Private Auth purpose/role/cleanup metadata
is present. Credentials and cleanup identifiers are held separately in two
local DPAPI-encrypted files under an ignored operator directory; neither file
nor any secret value is committed.

## Exact Write Receipt

| Surface | Retained count / state |
| --- | --- |
| Dedicated Auth/profile owner | `1` |
| Trigger-maintained token usage row | `1`, zero tokens used and zero top-up tokens |
| Trigger-maintained storage usage row | `1`, `1,145` bytes used |
| Private persona | `1` |
| Persona layer profile | `1` |
| Persona created lifecycle event | `1` |
| Curated Memory items | `2` |
| Imported Archive Memory chunks | `1` |
| Memory lifecycle rows | `3`: two active/user-stated, one quarantined/imported |
| Private storage objects | `1`, exact `341`-byte source with no trailing newline |
| Processed persona files | `1` |
| Completed file import jobs | `1` |
| Pending file-backed Inbox candidates | `1` |
| Private Continuity records | `1` |

All three Memory rows have a non-null Gemini embedding with provider
`gemini`, model `gemini-embedding-2`, dimension `1536`, the active pgvector
index metadata, and backfill version `2`.

The approved Memory requests were sent unchanged with relevance weight
`1.25`. The current database/API contract stores that field as an integer and
therefore reads back `1`; no source or schema change was made in this hosted
preparation lane.

## Privacy And Boundary Proof

- Owner Studio/API readback returned the one persona, all three Memory rows,
  one processed file/import, one pending file-backed candidate, and one private
  Continuity record.
- Seven private route shapes returned `401` without a token.
- The same seven shapes plus the unrelated owner's persona list disclosed zero
  corpus content to a fresh cross-owner session.
- Five distinctive corpus searches, each repeated anonymously and with the
  cross-owner token, returned zero private matches.
- `discover_feed` contains zero rows for the private persona.
- Forty-six deployed owner-scoped forbidden surfaces were measured at zero
  before corpus creation and again at zero afterward.
- Two packet-listed connector surfaces,
  `archive_connector_import_intents` and
  `archive_connector_source_staging_runs`, are absent from the hosted REST
  schema. They could not receive writes and are recorded as unavailable rather
  than falsely claimed as queried tables.
- Conversations, messages, AI trace sessions/events, token transactions,
  billing/top-up rows, public content, engagement, moderation, notifications,
  Developer Spaces, exports, projects, publishing approvals, BYOK, social
  publishing, and connector credential rows remain zero for this owner.
- No chat route or chat/provider-generation call was made. Gemini was used only
  by the existing Memory and Archive embedding path.

## Hosted Readiness Note

The lane-required hosted checks pass: API health, database access, private
`persona-files` storage, Gemini embedding configuration, Memory columns/RPC,
and Archive RPC. The aggregate deployment readiness endpoint remains false for
work outside PR528B4, including the not-yet-deployed document-summary proof.
This did not weaken or bypass any private-corpus check.

## Retention

The encrypted cleanup ledger records every retained Auth/profile, persona,
lifecycle, Memory, file/storage, import, candidate, and Continuity identifier,
plus the zero baselines and the explicit cleanup trigger. The credential
envelope is separate from that ledger. Retention lasts only through Marty and
his partner's PR528 review; MIMIR must later order promotion/replacement or
exact cleanup.

## Validation

| Command / proof | Result |
| --- | --- |
| Ignored operator syntax check | Pass |
| Hosted owner contract and exact row readback | Pass |
| Hosted storage object/body and byte readback | Pass |
| Anonymous and cross-owner private-route probes | Pass, zero disclosure |
| Anonymous and cross-owner Discover probes | Pass, zero matches |
| Forbidden owner-scope before/after comparison | Pass, zero rows across `46` deployed scopes |
| Chat/trace/token-transaction proof | Pass, zero rows and zero tokens used |

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS prepared and verified the isolated hosted private partner corpus.
- The public corpus and every chat/provider configuration change remain blocked.
Verdict:
- READY_PR528B4_PRIVATE_PARTNER_CORPUS_FOR_ARGUS
Task:
- Route ARGUS review against the encrypted-ledger receipt and public-safe evidence.
```
