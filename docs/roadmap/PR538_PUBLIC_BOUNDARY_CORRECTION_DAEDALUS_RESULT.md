# PR538 Public Boundary Correction - DAEDALUS Result

Owner: DAEDALUS / A2 -> ARGUS / A3 and MIMIR / A1

Date completed: 2026-07-31

Status:

```text
READY_PR538_PUBLIC_BOUNDARY_CORRECTION_FOR_REVIEW
```

## Decision

The three findings in MIMIR's PR538 review are corrected and proved on hosted
Station. Corrected executable source
`a2b8c8597e82adbf06b3552906b36748fc734a29` is ready on both Railway services.

## Corrections

1. Discover search now selects `institution_id` and admits an
   Institution-owned public Project only while its principal Institution is
   both verified and public. Institution status lookup errors fail Institution
   Project rows closed without removing personal public Projects.
2. The Institution Project serializer now enumerates its allow-listed summary
   fields. It no longer inherits personal `id` through `serializeProject`.
   Nested list and detail key assertions cover the exact runtime DTO.
3. The early Institution Project view now receives and renders bounded mutation
   error/success state. A successful visibility change reports `Project
   visibility updated.`; failures report bounded API copy or the stable local
   fallback.

## Hosted Proof

At exact corrected source `a2b8c859`:

- owner list and detail returned the retained Institution Project without an
  `id` field;
- public Discover search returned the retained Project while `Station
  Institutional Alpha` was verified/public;
- verification revocation removed the Project from Discover and made its
  public route return HTTP `404`;
- owner private detail remained HTTP `200` during revocation;
- verification restoration and Institution publication restored both search
  and public route; and
- retained owner admin authority returned to false.

This bounded verification cycle added the expected append-only audit events
`verification_revoked`, `verification_granted`, and `published`. The retained
Institution audit total is therefore `21`, extending the fully explained PR538
total of `18` by exactly three.

The restarted verifier confirms migration `093` and its exact ledger remain
single, the XOR/FK/principal guards remain exact, invalid principals and
Institution owner rows remain zero, one Institution Project plus four personal
Projects remain, Auth users remain `16`, and tagged Auth/profile/membership
residue remains zero.

## Validation

| Command or proof | Result |
| --- | --- |
| `test:projects` | Pass, `33/33` |
| `test:institutions` | Pass, `16/16` |
| `test:community` | Pass, `57/57`; verified/public, revoked, and private Institution Project search states |
| `test:auth` / `test:writing` | Pass, `24/24` and `35/35` |
| `lint` / `typecheck` | Pass |
| Root build | Compile, checks, `42/42` pages, optimization, and traces pass; known Windows standalone symlink copy ends with `EPERM` |
| Railway corrected source | API/web ready at exact `a2b8c859` |
| Hosted search/revocation/restoration | Pass |
| Fresh schema/ledger/residue verifier | Pass |

Detailed receipts remain under ignored `.station-private/pr538`; no credential,
token, id, or private database receipt is committed.

## Baton

ARGUS should review the three exact corrections and corrected hosted proof. If
accepted, wake MIMIR for PR538 closeout. MIMIR is also woken directly because
ARGUS has not consumed the prior PR538 review wakes and the programme must not
stall. Any further correction must be stated precisely and returned to
DAEDALUS.
