# PR491A - Public Persona Second Fixture Proof Closeout

Owner: MIMIR / A1

Date closed: 2026-07-05

Status: Closed accepted

## Verdict

```text
CLOSED_ACCEPTED
```

PR491A closes the fixture gap that blocked stronger anonymous public persona
chat expansion proof.

## What Closed

PR491A added and proved one ordinary public persona fixture:

```text
station-replay-signed-in-alpha-persona
```

The fixture is public, `public_chat_enabled:true`, and remains
`signed_in_alpha`. Signed-out anonymous chat for that fixture returns
`public_persona_auth_required`.

The replay slug remains the only anonymous-alpha slug:

```text
station-replay-alpha-persona
```

## Evidence

Accepted implementation and review:

- `docs/roadmap/PR491A_PUBLIC_PERSONA_SECOND_FIXTURE_PROOF_RESULT.md`
- `docs/roadmap/PR491A_PUBLIC_PERSONA_SECOND_FIXTURE_PROOF_REVIEW_RESULT.md`

Hosted proof:

- `docs/roadmap/PR491A_PUBLIC_PERSONA_SECOND_FIXTURE_PROOF_REHEARSAL_RESULT.md`
- `docs/roadmap/PR491A_PUBLIC_PERSONA_SECOND_FIXTURE_PROOF_REHEARSAL_RERUN_RESULT.md`

The first hosted rehearsal returned `DEPLOYMENT_WAITING` because the required
freshness gate incorrectly treated script/docs commit `c7164078` as hosted
runtime code. MIMIR corrected the gate after verifying that `c7164078` changed
only local scripts/tests/docs/status, not web/API runtime behavior.

The rerun passed with:

- local checkout at `c7164078` or later;
- hosted web/API ready at app commit `890f9692`;
- dry-run proof safe;
- guarded hosted fixture write safe;
- fixture public route live;
- owner readback signed-in alpha only;
- signed-out anonymous POST denied with `public_persona_auth_required`;
- replay alpha still anonymous alpha;
- desktop, `375px`, and `390px` hosted fit;
- privacy/scope checks passed.

## Boundary Preserved

PR491A did not change runtime anonymous eligibility. It did not alter:

- `publicPersonaChatMode`;
- prompt/source selection;
- provider/model routing;
- rate-limit behavior;
- API contracts;
- schema;
- auth/session;
- public reporting/moderation;
- billing;
- workers, queues, Redis, Cloudflare, connectors, OAuth, social dispatch;
- public launch claims or broad UI.

No private/raw/secret/provider payload, token, cookie, auth header, IP address,
user-agent, storage path, public Salon chat-source overclaim, live connector
claim, worker/queue claim, billing claim, or broad runtime-expansion claim was
found in the hosted proof output or checked readbacks.

## Resulting Product Truth

Station now has hosted proof for both sides of the current anonymous boundary:

- replay alpha: anonymous alpha is available for
  `station-replay-alpha-persona`;
- ordinary public persona: signed-in alpha only for
  `station-replay-signed-in-alpha-persona`.

This is enough to open the next hostile preflight for an owner-controlled
anonymous public chat gate. It is not itself permission to expand anonymous
runtime behavior.

## Next

Open:

```text
PR492 - Owner-Controlled Anonymous Public Chat Gate Preflight
Owner: ARGUS / A3
```
