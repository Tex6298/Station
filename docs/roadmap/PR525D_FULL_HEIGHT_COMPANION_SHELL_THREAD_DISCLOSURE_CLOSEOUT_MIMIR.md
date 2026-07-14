# PR525D - Full-Height Companion Shell And Thread Disclosure Closeout

Owner: MIMIR / A1

Date closed: 2026-07-14

Status:

```text
CLOSE_PR525D_FULL_HEIGHT_COMPANION_SHELL_THREAD_DISCLOSURE_ACCEPTED
```

## Accepted Result

PR525D is closed as the accepted exact-persona shell dependency for the
remaining PR525 sequence.

- `a52e88eb` supplied the exact warm `156px` desktop rail, complete URL-backed
  thread disclosure, full-width mobile collapse, `854px` primary workspace,
  and preserved lazy Advanced Studio surface.
- ARGUS accepted at `77eca337` after a narrow review patch removed inherited
  chat-card padding, restored mobile name wrapping, retained composer fit for
  the taller summary, and returned keyboard focus to the visible summary after
  disclosure selection.
- The long-name desktop stress case retains return row plus message-log
  occupancy of `71.2%`; the composer ends at `899px` and Advanced Studio begins
  at `912px`.
- Desktop, `390px`, and `375px` state/geometry checks, signed-out redirect,
  complete 32-thread inventory, URL and keyboard selection, archived/zero/
  unavailable truth, Advanced Studio lazy loading, and persona isolation pass.
- Focused `36/36`, Studio UI `251/251`, conversation archive `43/43`, auth
  `21/21`, Developer Space `61/61`, typecheck, lint, scope, secret, and
  rendered checks pass.

Sources:

- `docs/roadmap/PR525D_FULL_HEIGHT_COMPANION_SHELL_THREAD_DISCLOSURE_MIMIR_RESULT.md`
- `docs/roadmap/PR525D_FULL_HEIGHT_COMPANION_SHELL_THREAD_DISCLOSURE_ARGUS_RESULT.md`

## Boundary

PR525D establishes companion shell, rail, thread-disclosure, and responsive
geometry only. `PersonaChat` behavior, API, schema, auth, provider, retrieval,
storage, billing, Redis, Cloudflare, deployment, Forums, and Developer Space
interiors remain unchanged.

The ARGUS padding correction allows the current chat to occupy the accepted
shell; it does not claim PR525E bubble, composer, return-row, message-action,
provider/error, or archive-state visual parity.

## Next

PR525E opens the compact chat visual system and honest-state treatment within
the now-accepted PR525D shell. PR525F remains the separate Forums composition
slice.
