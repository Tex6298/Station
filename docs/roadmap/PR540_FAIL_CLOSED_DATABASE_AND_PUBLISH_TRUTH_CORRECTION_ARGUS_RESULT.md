# PR540 Fail-Closed Database And Publish Truth Correction - ARGUS Result

Owner: ARGUS / A3 -> ARIADNE / A4

Date completed: 2026-07-31

Corrected source: `8673b7eeb7ee2d7b1cdd7434b929be9047bbce88`

Status:

```text
ACCEPT_PR540_FAIL_CLOSED_DATABASE_AND_PUBLISH_TRUTH_CORRECTION
READY_PR540_CORRECTED_BRANDED_PUBLIC_INSTITUTIONAL_SPACE_FOR_ARIADNE
```

## Verdict

ARGUS accepts the bounded PR540 correction and restores authorization for the
controlled ARIADNE rehearsal. Applied migration `095` is byte-identical;
append-only migration `096` replaces only the three Institution Space
functions with explicit null rejection and null-safe owner/version comparison.
The private DTO now advertises publish only for an owner draft whose Institution
is verified and public.

This acceptance does not close PR540 or authorize PR541. ARGUS made no hosted
mutation. The retained Space remains published at version/audit `5/5`, so the
only next mutation is ARIADNE's already specified visible-control cycle ending
at `8/8`.

## Resolved Findings

The corrected exact migration pair executes in disposable PostgreSQL and now
proves:

- null-actor create returns no Space;
- null-actor edit and publish return `unavailable`;
- null expected version returns `unavailable` before edit or transition;
- null and unknown actions return `unavailable` before branch selection;
- all eight isolated/combined hostile calls leave Space version, status, and
  audit count unchanged;
- valid edit, stale conflict, publish, and unpublish remain exact; and
- valid lifecycle ends at version/audit `4/4` in the disposable proof.

Read-only hosted catalog inspection independently confirms that all three
compiled RPC bodies contain the null actor and null-safe owner guards, both
versioned RPCs contain null and null-safe version guards, and the transition
RPC contains the null/unknown action guard. All three remain PostgreSQL-owned,
security-definer, and fixed to `pg_catalog,public` search path.

The source serializer now derives one `publicPrincipal` truth and uses it for
Institution/public hrefs plus `canPublish`. Focused tests cover both unverified
and private draft states, while the verified/public owner lifecycle still
exposes the action.

## Hosted Boundary

| Proof | ARGUS result |
| --- | --- |
| API/web source | Exact `8673b7eeb7ee2d7b1cdd7434b929be9047bbce88` on both services |
| Migration `095` identity | Byte-identical; SHA-256 `CDFE536350C8CE9D6A3A8721348C765A6A1FD1A9962E7DFC62BAA5F5DC9A5789` |
| Migration `096` identity | Exact ledger row `1`; SHA-256 `5F11DA79F9028F3009CE74C55E21917A23EFF48AC0C39950AB67711F4D5EEB62` |
| Effective browser/trusted table privileges | `0 / 7` |
| Effective browser/trusted RPC execution | `0 / 3` |
| RLS / browser policies | `1 / 0` |
| Compiled null-safe actor/version/action RPCs | `3 / 2 / 1` |
| Retained Space/version/audit | `1 / 5 / 5` |
| Fixture Auth/member residue | `0 / 0` |
| Personal Space/document counts | `3 / 29` |
| Anonymous private API/table; trusted table | `401 / 401 / 200` |
| Public aggregate | Strict keys, Project/publication `1/1`, forbidden keys `0` |

## Validation

| Command or proof | ARGUS result |
| --- | --- |
| Disposable exact `095 + 096` authority audit | Pass; eight hostile calls rejected with zero drift; valid lifecycle passes |
| Read-only hosted ledger/catalog/function-body audit | Pass |
| `npm exec --yes pnpm@10.32.1 -- run test:institution-spaces` | Pass, `6/6` |
| `test:institutions` / `test:institution-publications` | Pass, `16/16` and `4/4` |
| `test:projects` / `test:spaces` | Pass, `33/33` and `11/11` |
| `test:writing` / `test:community` | Pass, `35/35` and `57/57` |
| `test:auth` / `test:profile-boundary` | Pass, `24/24` and `5/5` |
| `test:developer-spaces` / `test:exports` | Pass, `61/61` and `15/15` |
| API/web typecheck; web lint | Pass; zero lint warnings/errors |
| Corrected diff scope/check | Pass; three promised paths, clean diff |

DAEDALUS's frozen-install and root-build receipts remain valid submitted
evidence. ARGUS did not rerun those unchanged packaging gates; the submitted
root build again compiled and generated `42/42` pages before the documented
Windows standalone symlink `EPERM`.

## Baton

ARIADNE resumes the existing hosted human rehearsal at exact source `8673b7ee`
and retained version/audit `5/5`. Execute only the serialized unpublish, member
read-only, owner edit, and republish cycle ending at `8/8`, then wake MIMIR with
a public-safe pass or exact blocker. Do not open PR541 from this acceptance.
