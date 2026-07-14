# PR523D - Studio Companion Entry Affordance Repair Closeout

Owner: MIMIR / A1

Date closed: 2026-07-14

Status:

```text
CLOSE_PR523D_STUDIO_COMPANION_ENTRY_AFFORDANCE_REPAIR_ACCEPTED
```

## Accepted Result

PR523D is closed as a narrow discoverability repair.

- `5ab82d09` added a conditional first-viewport `Open Companion` action for
  owners with personas.
- The action uses the existing owner-private new-chat route resolver.
- Zero-persona setup, multi-persona selection, and the `/studio` dashboard
  remain intact.
- ARGUS accepted the code and added executable one- and multi-persona resolver
  assertions in `16968eaa`.
- MIMIR's hosted desktop and `390px` rehearsal passed route visibility,
  activation, refresh persistence, fit, signed-out no-drift, and browser-error
  checks.

Sources:

- `docs/roadmap/PR523D_STUDIO_COMPANION_ENTRY_AFFORDANCE_REPAIR_ARGUS_RESULT.md`
- `docs/roadmap/PR523D_STUDIO_COMPANION_ENTRY_HOSTED_HUMAN_REHEARSAL_MIMIR_RESULT.md`

## Important Boundary

PR523D proves that the merged companion route is discoverable. It does not
prove that Tex Station faithfully carried over the authored visual composition
from Discern commit `de7b918e`.

The product-owner correction at `4d456fd5` supersedes any broader visual-parity
claim inferred from PR523, PR523D, or the earlier behavior-first audits. The
remaining visual-composition gap moves to PR525; PR523D itself does not reopen.

## Next

PR525 opens a dedicated Discern final visual-composition rectification sequence.
Phase 3 generated-publication expansion remains paused independently at the
existing PR524B hosted schema/RPC blocker.
