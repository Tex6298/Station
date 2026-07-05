# PR492A - Owner-Controlled Anonymous Public Chat Gate Hosted Proof

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-05

Status: Open - hosted desktop/mobile proof

## Why This Exists

ARGUS accepted DAEDALUS' PR492A owner-controlled anonymous public chat gate
implementation without a review patch:

- `docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_RESULT.md`
- `docs/roadmap/PR492A_OWNER_CONTROLLED_ANONYMOUS_PUBLIC_CHAT_GATE_REVIEW_RESULT.md`

This lane must prove the runtime change on hosted staging before closeout.
Local tests are not enough because PR492A includes a Supabase migration and a
real public chat mode expansion.

## Hosted Target

- Web: `https://stationweb-production.up.railway.app`
- Required hosted app/API freshness: `a2d3f6be api: add owner anonymous public chat gate` or later/deploy-equivalent.

If hosted web/API are not fresh enough, return:

```text
DEPLOYMENT_WAITING
```

## Required Hosted Proof

ARIADNE should run the proof on desktop, `375px`, and `390px`.

Required checks:

- hosted web/API health and freshness at `a2d3f6be` or later;
- migration/default-off proof for
  `personas.public_anonymous_chat_enabled`;
- owner readback shows the default-off gate on an ordinary public persona;
- `station-replay-signed-in-alpha-persona` remains signed-in alpha and
  anonymous-denied as the negative control;
- owner can enable anonymous alpha for one approved non-replay public persona
  that is not the signed-in-alpha negative-control fixture;
- signed-out anonymous POST succeeds only for the owner-enabled non-replay
  persona and the replay alpha slug;
- signed-out anonymous POST still returns `public_persona_auth_required` for
  the signed-in-alpha negative-control fixture;
- disabling public chat closes anonymous chat and forces the gate off;
- owner/admin readback names gate state, rollback, fail-closed rate-limit
  posture, provider readiness/blockers, no transcript/identity/raw-event
  storage, aggregate counters, and owner-paid attribution;
- public cards/pages expose mode but not the raw owner gate field;
- public-source-only prompt scope and signed-in reporting no-drift pass;
- replay alpha no-drift passes;
- public pages fit desktop, `375px`, and `390px` without overlap or broken
  controls;
- no private/raw/secret/provider/token/cookie/header/IP/user-agent readback,
  public Salon chat-source overclaim, broad launch claim, placeholder control,
  live connector/OAuth claim, worker/queue claim, billing claim, or runtime
  expansion beyond owner-enabled personas appears.

If hosted migration, owner-control, or safe enabled-fixture access is
unavailable, return a concrete blocker without printing or requesting secret
values.

## Verdicts

Use exactly one:

```text
PASS_READY_TO_CLOSE
DEPLOYMENT_WAITING
BLOCKED_NEEDS_HOSTED_MIGRATION
BLOCKED_NEEDS_HOSTED_ENABLE_FIXTURE
BLOCKED_NEEDS_HOSTED_OWNER_CONTROL_ACCESS
PRODUCT_DEFECT_NEEDS_DAEDALUS
PRIVACY_OR_SCOPE_FAIL
```

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- ARGUS accepted PR492A owner-controlled anonymous public chat gate implementation without review patch.
- PR492A adds a separate default-off public_anonymous_chat_enabled owner gate and publicAnonymousChatEnabled PATCH field; public_chat_enabled remains the base public chat enable/disable and rollback switch.
- Non-replay anonymous alpha now requires owner opt-in; station-replay-alpha-persona remains legacy anonymous alpha; ordinary public personas remain signed-in alpha by default.
Task:
- Run hosted desktop/375px/390px proof at app/API commit a2d3f6be or later.
- Verify migration/default-off gate, owner enable for one approved non-replay persona that is not the signed-in-alpha negative-control fixture, signed-out success only for owner-enabled/replay personas, signed-in fixture denial, rollback, public card/page no-leak, public-source-only prompting, signed-in reporting no-drift, replay no-drift, mobile fit, privacy/scope, and no broad runtime expansion claims.
- Wake MIMIR with PASS_READY_TO_CLOSE, DEPLOYMENT_WAITING, BLOCKED_NEEDS_HOSTED_MIGRATION, BLOCKED_NEEDS_HOSTED_ENABLE_FIXTURE, BLOCKED_NEEDS_HOSTED_OWNER_CONTROL_ACCESS, PRODUCT_DEFECT_NEEDS_DAEDALUS, or PRIVACY_OR_SCOPE_FAIL.
Guardrails:
- Do not print or request secret values. Do not treat local tests as hosted proof. Do not apply broad migrations or seed broad public data. Do not enable anonymous chat for all public personas. Preserve public-source-only prompting, no anonymous transcript/identity/raw-event storage, owner rollback, fail-closed rate limits, signed-in-only negative control, private-context exclusion, and no broad public launch claims.
```
