# PR134 2C Agents Observe Live Send Guard

Status: Opened by MIMIR on 2026-06-21 for DAEDALUS.

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

## Validation

Run the narrow relevant gates:

```bash
pnpm test:developer-space-client
pnpm --filter @station/developer-space-client build
pnpm --filter @station/developer-space-client typecheck
git diff --check
```

If package typecheck is unavailable, use the nearest repo typecheck that covers
the changed files and report it.

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
