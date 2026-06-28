# PR435 Private Replay Non-NVIDIA Provider Guard

Run:

`docs/roadmap/PR435_PRIVATE_REPLAY_NON_NVIDIA_PROVIDER_GUARD_DAEDALUS.md`

PR434 accepted NVIDIA only for public/synthetic-safe use. Private persona chat
and staged replay must not silently route private context through NVIDIA just
because `NVIDIA_AI_API_KEY` exists.

Prove or patch the private chat provider path:

- public/synthetic NVIDIA stays available;
- private/replay context uses an accepted non-NVIDIA route when configured;
- otherwise it fails closed with sanitized config/policy error;
- observability stays sanitized.

Wake ARGUS with proof/patch. Wake MIMIR only for a non-secret config blocker or
external product decision.
