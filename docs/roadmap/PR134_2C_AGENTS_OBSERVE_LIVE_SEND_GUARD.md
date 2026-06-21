# PR134 2C Agents Observe Live Send Guard

Status: Implemented by DAEDALUS on 2026-06-21 for ARGUS review.

## Why This Lane

PR132 proved the transform and signed request construction. PR133 made it
usable as a config-free offline dry run with a safe `not_sent` summary and no
network dependency.

The next useful step is to define the guarded path from offline dry run to live
send without requiring live credentials during implementation. This should make
the adapter ready for PR130/staging smoke when deliberate config exists, while
keeping default local behavior safe, dry, and reviewable.

## Scope

- Add an explicit opt-in live-send path for the Agents Observe dry-run entry
  point or helper.
- Default behavior must remain offline/dry-run and must not send network
  requests.
- Live send must require an explicit flag or function option such as `send:
  true`; environment presence alone must not send.
- Live send must require real config names:
  - `STATION_API_URL`;
  - `STATION_DEVELOPER_KEY`;
  - `STATION_OBSERVED_RUNTIME_WEBHOOK_ID`;
  - signing material if the chosen helper path requires caller-side signing.
- Reject obvious demo/fake placeholder values for live-send mode.
- Reuse PR132/PR133 transform, privacy assertions, and summary shape before
  sending.
- Add a transport seam so tests can prove live-send behavior with a mocked
  transport/fetch and no real network access.
- Add tests for:
  - default dry-run remains `not_sent`;
  - env values alone do not send without the explicit live flag;
  - live flag with missing config fails before network;
  - live flag with demo/fake values fails before network;
  - live flag with mocked valid config sends exactly one request through the
    mocked transport;
  - privacy assertions still run before send;
  - error output does not echo raw fixture values or secrets.
- Document the local dry-run command, the explicit live-send command, and the
  config needed for a future PR130 smoke run.

## Acceptance

- DAEDALUS can demonstrate the adapter has a live-send path without requiring
  real Railway/Supabase/Cloudflare/network access.
- A later operator can provide config and run the live-send path deliberately.
- Accidental sends are prevented by default and by explicit-flag gating.
- Demo/fake values are not accepted as live config.
- The no-raw-id/no-secret dry-run contract from PR132/PR133 still applies before
  send.

## Implementation Notes

- `createAgentsObserveOfflineDryRunSummary` keeps the default dry-run path
  offline, `not_sent`, and network-free.
- Live send is available only through `liveSend: { enabled: true, ... }` in the
  helper or `--live-send` in the example command. Environment variables by
  themselves do not trigger send.
- Live mode requires `STATION_API_URL`, `STATION_DEVELOPER_KEY`, and
  `STATION_OBSERVED_RUNTIME_WEBHOOK_ID`. It uses
  `STATION_OBSERVED_RUNTIME_SIGNING_SECRET` when supplied; otherwise it signs
  with the Developer Space key fallback used by the observed-runtime client.
- Missing config and obvious demo/fake/placeholder values are rejected before
  transport/fetch is called.
- The transport seam accepts a mocked POST request shape for tests. The default
  transport uses `fetch` only after explicit live opt-in and config validation.
- The request reuses the PR132 transform, PR128 observed-runtime webhook
  envelope/signature helper, and PR133 privacy assertions before transport.
- The live summary reports only bounded facts: target API class, redacted
  signature header, body byte length, response status/class, and a synthetic
  configured-webhook marker. It does not echo the live API URL, Developer Space
  key, signing secret, or non-demo webhook id.
- The envelope body uses a synthetic delivery id for this guarded path while the
  real configured webhook id is sent only in the outbound header.

## Validation

Run the narrow relevant gates:

```bash
pnpm test:developer-space-client
pnpm --filter @station/developer-space-client build
pnpm typecheck
git diff --check
```

DAEDALUS implementation validation:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:developer-space-client` | Pass | 15 tests passed, including default dry-run, env-only no-send, missing/demo config refusal before transport, mocked valid live send exactly once, and privacy-before-send. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/developer-space-client build` | Pass | Client package build completed. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx packages/developer-space-client/examples/agents-observe-offline-dry-run.ts --signed-demo` | Pass | Printed safe `not_sent` dry-run summary with redacted demo signature metadata. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx packages/developer-space-client/examples/agents-observe-offline-dry-run.ts --live-send` | Pass | With no live config, printed blocked `missing_config` summary before any network send. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API and web typecheck passed from cache. |
| `git diff --check` | Pass | CRLF normalization warnings only. |

## Non-Scope

- No real live webhook send in tests.
- No request for new config unless implementation proves the next PR must be
  live smoke.
- No Developer Space key generation or rotation.
- No committed secrets or secret values in docs.
- No Cloudflare Worker, Vectorize, D1, Queue, or Durable Object work.
- No external repo code vendoring.
- No hosted runtime, task scheduler, agent control plane, or execution surface.
- No UI changes.
- No billing/Stripe, Redis memory truth, provider routing, or retrieval model
  changes.

## Handoff

Wake ARGUS with:

- live-send guard/API/command shape;
- proof default behavior is dry-run only;
- mocked-send test evidence;
- missing-config/demo-config refusal evidence;
- privacy-before-send evidence;
- validation results;
- exact future config names needed for PR130 live smoke;
- explicit non-claims.

Wake MIMIR instead if the current helper shape cannot support a guarded send
without broad refactor.
