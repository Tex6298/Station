# PR500D - Social Credential Owner API Hosted Proof Result

Date: 2026-07-07

Owner: ARIADNE / A4

State: `BLOCK_PR500D_WITH_CONCRETE_REASON`

Return value:

```text
BLOCK_PR500D_WITH_CONCRETE_REASON
```

## Scope

ARIADNE ran the hosted API proof requested in:

`docs/roadmap/PR500D_SOCIAL_CREDENTIAL_OWNER_API_HOSTED_PROOF_ARIADNE.md`

Target routes:

```text
GET /social/connectors/credentials
POST /social/connectors/credentials
DELETE /social/connectors/credentials/:provider
```

The proof used only a non-real synthetic Bluesky fixture credential. The
submitted identifier and app-password values were not recorded.

## Hosted Freshness

Hosted web and API health were reachable and ready at runtime commit:

```text
bc1456825bbaf0d0bb5507da50b8d4c404c1165a
```

That commit is the PR500C route implementation commit:

```text
bc145682 - api: add social credential owner routes
```

There are no post-runtime diffs in the social credential route/storage/readiness
surfaces between that runtime and current HEAD; later commits are docs/state
routing and review work.

## Verdict

PR500D is blocked by hosted configuration, not by a route implementation
verdict.

The hosted route accepted auth, metadata reads, invalid-payload validation, and
paused/readback-only social boundaries, but valid synthetic credential storage
could not run because hosted POST returned the bounded configuration error:

```text
social_connector_credential_encryption_required
```

No hosted credential write started, replacement POST could not be tested, and
DELETE/idempotent cleanup could not be fully proven against an active synthetic
credential.

## Passed Checks

- Web/API `/health/deployment` were reachable and ready at the PR500C runtime
  commit.
- Replay owner sign-in returned `200` with `canon` tier.
- Signed-out GET, POST, and DELETE credential requests returned `401`.
- Owner `GET /social/connectors/credentials` returned `200` and safe metadata
  only; Bluesky status was `missing` before the proof.
- Invalid owner POST returned `400 social_connector_credential_invalid` before
  storage; Bluesky status remained `missing`.
- `/social/readiness` remained `readback_only` with posting and connection
  actions disabled.
- Paused publishing mutation remained blocked with
  `423 social_connectors_paused`.
- Final cleanup/readback showed Bluesky status still `missing`.
- Response/output privacy scan found no submitted credential value, encrypted
  payload, credential fingerprint, owner id, bearer/JWT token, SQL detail, stack
  trace, env value, or provider payload in recorded proof output.

## Blocked Checks

- Valid synthetic POST could not store because hosted returned
  `503 social_connector_credential_encryption_required`.
- Replacement POST could not prove rotation of the previous active credential.
- DELETE and repeated DELETE could not prove revocation/idempotence against an
  active synthetic credential because no active credential was created.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Temporary hosted API proof runner | Blocked | 10 checks passed; the only failed check was hosted social credential encryption config availability. |
| Hosted freshness | Pass | Web/API were ready at `bc1456825bbaf0d0bb5507da50b8d4c404c1165a`, which includes the PR500C route implementation. |
| Auth and invalid-payload behavior | Pass | Replay owner sign-in passed; signed-out credential requests returned `401`; invalid owner POST returned bounded `400 social_connector_credential_invalid` before storage. |
| Paused social boundary | Pass | `/social/readiness` stayed `readback_only`; paused publishing mutation returned `423 social_connectors_paused`. |
| Cleanup state | Pass | No mutation started; final credential readback showed no active hosted Bluesky credential. |
| Privacy/secret scan | Pass | Recorded output contained no submitted synthetic credential values or secret-shaped route data. |
| `git diff --check` | Pass | No whitespace errors. |

`pnpm typecheck` was not run because this result updated docs only and did not
touch imports or scripts.

## Blocker

Hosted API configuration needs the social credential encryption config required
by PR500C before PR500D can prove the accepted storage/replacement/revoke
behavior.

Do not open a Settings UI or visible credential management lane until PR500D is
rerun and passes valid synthetic POST, replacement, DELETE, repeated DELETE, and
final cleanup.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR

Summary:
- ARIADNE ran PR500D against hosted web/API at PR500C runtime commit bc145682.
- Auth, owner safe metadata GET, signed-out blocking, invalid POST validation,
  paused readiness, paused publishing, final no-active readback, and privacy
  scan passed.
- Valid synthetic POST is blocked on hosted by bounded
  social_connector_credential_encryption_required, so replacement/DELETE/
  idempotent cleanup against an active credential could not be proven.

Verdict:
- BLOCK_PR500D_WITH_CONCRETE_REASON.

Validation:
- Temporary hosted API proof runner: 10 passed checks, 1 blocked config check.
- git diff --check.

Next:
- Add/fix hosted social credential encryption config without printing env
  details, then rerun PR500D before any Settings UI or credential management
  preflight.
```
