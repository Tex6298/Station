# PR312 - Phase 3 Proper Re-Entry Preflight

Owner: ARGUS

Opened by: MIMIR

Date: 2026-06-25

Status: Complete - see `PR312_PHASE3_PROPER_REENTRY_PREFLIGHT_RESULT.md`

## Trigger

PR311 passed as current hosted protected-alpha product evidence. The mainline
should not remain indefinitely paused, but MIMIR must not let the advance team
unpause the product boundary by advisory momentum.

MIMIR opens this as a mainline re-entry preflight, not as implementation.

## MIMIR Posture

The next mainline step is a bounded Phase 3 proper re-entry gate.

This preserves both truths:

- A5-A8 stay off-boundary and do not select mainline sequence.
- Mainline has an explicit re-entry gate after PR311 instead of an open-ended
  pause.

## Repo Truth To Inspect

ARGUS should inspect current repo truth, especially:

- `docs/roadmap/STATION_FUTURE_LANES.md`, especially the Phase 3 bridge
  sequence and post-PR311 staging posture.
- `docs/roadmap/PR201_PHASE3_BRIDGE_PREFLIGHT_ARGUS.md`.
- `docs/roadmap/PR266_POST_ARCHIVE_UX_LANE_SELECTION_AUDIT.md`.
- `docs/roadmap/PR311_PROTECTED_ALPHA_DEMO_REFRESH_AFTER_MEMORY_PROOF_RESULT.md`.
- `docs/roadmap/ACTIVE_STATUS.md`.

The previous Phase 3 bridge sequence has many accepted bridge slices. This
preflight should decide whether those accepted slices now justify Phase 3
proper re-entry, or whether MIMIR needs a concrete product/commercial/partner
answer from Marty before opening implementation.

## Questions ARGUS Must Answer

1. What does "Phase 3 proper" mean from current repo truth, not from inertia?
2. Which accepted bridge evidence is still relevant after PR311?
3. Is there a safe first Phase 3 proper lane now?
4. If yes, what is the exact first lane, owner, files/surfaces, acceptance bar,
   validation, privacy/security risk, and hosted proof requirement?
5. If no, what exact condition or Marty question blocks re-entry?
6. Which future terrain must stay advisory-only until separately promoted?

## Candidate Axes To Classify

ARGUS should classify, not implement:

- public persona / public interaction expansion;
- public Project or institutional/research surface expansion;
- partner / Developer Space pilot readiness;
- billing, entitlement, or commercial packaging;
- hosted data/account/config requirements;
- Cloudflare, Redis, provider/model, embedding, worker, queue, or export
  infrastructure gates.

Classification options:

- ready for a named DAEDALUS implementation lane;
- needs ARGUS preflight first;
- needs ARIADNE hosted/human evidence first;
- needs Marty product/commercial/partner decision first;
- keep paused / future-only.

## Boundaries

Do not:

- edit product code;
- open a DAEDALUS implementation lane from inside PR312;
- wake DAEDALUS or ARIADNE;
- treat KVASIR/ADV-002 as the source of mainline authority;
- reopen broad UI, Redis, Cloudflare, provider/model, embedding, billing,
  worker, queue, export, or Developer Space work without a concrete gate;
- add credentials, env values, raw ids, prompts, completions, provider
  payloads, SQL, private source bodies, or secret-shaped values.

## Required Result

Create:

```text
docs/roadmap/PR312_PHASE3_PROPER_REENTRY_PREFLIGHT_RESULT.md
```

Wake MIMIR with:

- verdict: `READY`, `READY WITH GATES`, or `BLOCKED`;
- the exact safe first mainline lane if ready;
- the exact blocking question/condition if blocked;
- whether Marty input is needed now;
- what must remain paused.
