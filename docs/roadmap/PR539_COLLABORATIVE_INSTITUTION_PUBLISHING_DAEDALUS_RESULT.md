# PR539 Collaborative Institution Publishing - DAEDALUS Result

Owner: DAEDALUS / A2 -> ARGUS / A3 -> ARIADNE / A4

Date completed: 2026-07-31

Status:

```text
READY_PR539_COLLABORATIVE_INSTITUTION_PUBLISHING_FOR_ARGUS
```

## Decision

PR539 is ready for independent review. Migration `094` is applied and ledgered
exactly once, executable source `2d35c1661ca8a2c780a5710dad62a45c4570e541`
is live on both Railway services, and one published collaborative work is
retained under `Station Institutional Alpha` and its retained Institution
Project.

The active member created and edited the draft. The owner edited it and alone
could publish or retract it. Optimistic version conflicts lost without an
overwrite. Invited, stale, removed, unrelated, and anonymous principals did
not enter the private path. Signed-out reads succeeded only while the work,
Institution, and Project were public-safe.

## Schema Checkpoint

| Field | Result |
| --- | --- |
| Migration | `094_institution_publications` |
| Version | `20260731170001` |
| SHA-256 | `BC2402C5474707ADCC4270DF7830A571270C0D225D3233D8D3DB3AFDBD408C6D` |
| Ledger rows | `1` |
| Accepted source | `2d35c1661ca8a2c780a5710dad62a45c4570e541` |
| Publication relation / service RPCs | `1 / 3` |
| Browser table privileges / RPC privileges | `0 / 0` |
| Audit resource columns / action constraint | `2 / 1` |
| Principal and immutable-identity triggers | `2` |
| Anonymous/service PostgREST table status | `401 / 200` |

The publication has an immutable Institution/Project principal and original
creator label. Creator/editor/transition actor ids are nullable with
`ON DELETE SET NULL`; durable bounded labels preserve attribution. A database
trigger rejects a Project from another Institution. The creator id may only
move from its original value to null for account deletion. All successful
transitions append the paired publication resource reference transactionally.

## Retained Hosted State

The retained work is `Station Institution Publication Alpha`, slug
`station-institution-publication-alpha`. It is published at version `7`, keeps
the active member's original creator label, names the active member as its last
editor, and belongs to `station-institution-project-alpha`.

Exactly seven publication audit events identify that retained resource:
create, owner edit, member edit, first publish, retract, post-retraction member
edit, and republish. The stale edit and member publish/retract attempts added
no events. The serialized run paused after a proof scanner incorrectly matched
the harmless body phrase `version three`; inspection proved the strict DTO was
clean, and the same retained lifecycle resumed without replaying successful
transitions.

Final verification found one retained publication, version `7`, seven paired
events, document count `29`, tagged Auth users `0`, and tagged Institution
memberships `0`. The retained Institution owner has no temporary admin
authority.

## Product And Boundary Proof

- Institution Team now contains a collaborative publication workspace attached
  to the retained Project.
- Owner and active member can create/open/edit drafts and see creator, last
  editor, version, save state, and bounded conflict feedback.
- Only the owner receives publish/retract controls.
- Retraction returned public read to `404` while preserving member team access;
  a member then edited the same draft and the owner republished it.
- Verification revocation hid public work without deleting private team state;
  restoration returned the same public work.
- Public DTOs contain title, slug, summary, body, document type, publication
  time, bounded human labels, and routeable Institution/Project attribution.
  They contain no ids, emails, versions, team, audit, token, billing, or
  provider data.
- A disposable creator account completed personal document create, edit,
  publish, public read, and delete. Personal document count returned exactly to
  baseline.

Desktop owner/light, mobile member/dark, and signed-out mobile/dark browser
checks reported zero horizontal overflow and no placeholder leakage. The
member had one save control and no publish/retract control; the owner had the
expected retract control for the retained published work.

## Validation

| Command or proof | Result |
| --- | --- |
| `install --frozen-lockfile` | Pass; lockfile current |
| `lint` / `typecheck` | Pass; zero warnings/errors |
| `test:institution-publications` | Pass, `4/4` |
| `test:institutions` / `test:projects` | Pass, `16/16` and `33/33` |
| `test:auth` / `test:profile-boundary` | Pass, `24/24` and `5/5` |
| `test:writing` / `test:community` | Pass, `35/35` and `57/57` |
| `test:spaces` / `test:document-discussions` | Pass, `11/11` and `9/9` |
| `test:exports` / `test:developer-spaces` | Pass, `15/15` and `61/61` |
| Hosted exact migration/ledger/catalog | Pass |
| Hosted retained lifecycle and cleanup | Pass |
| Fresh restarted hosted verifier | Pass |
| Owner/member/public browser proof | Pass at `1440x1000` and `390x844` |
| Root build | Compile, checks, `42/42` pages, optimization, and traces pass; known local Windows standalone symlink copy ends with `EPERM` |

Detailed database receipts, screenshots, credentials, tokens, raw ids, and
proof tooling remain under ignored `.station-private/pr539`.

## Boundary And Baton

PR539 does not change personal document authority, global Writing/Discover,
Institution branding/aggregation, comments, delegated editors, analytics,
billing, Developer Spaces, or later PR536 lanes.

ARGUS should independently review migration `094`, API/DTO boundaries,
optimistic transitions, exact hosted ledger/source, retained publication and
audit truth, cleanup, personal compatibility, and role-truthful UI. If source
and hosted truth are accepted, wake ARIADNE for the bounded owner/member/public
human rehearsal. If correction is required, wake DAEDALUS with exact findings.
