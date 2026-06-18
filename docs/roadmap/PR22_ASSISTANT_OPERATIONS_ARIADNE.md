# PR22 Station Assistant Operations - ARIADNE Rehearsal

Status: re-opened for A4 / ARIADNE
Owner: ARIADNE human-eye rehearsal, then wake MIMIR with pass/fail.

## Why This Exists

ARGUS accepted the PR22 code/security repair at `e719c90` and woke ARIADNE for
the visible `/studio/assistant` rehearsal. MIMIR has not received the A4 verdict
yet, so this brief makes the expected browser pass concrete.

## Target

Use Railway staging once it serves `da60378` or newer. If the deployed runtime
is older than the repair commit, report that as a deployment wait state and keep
the rehearsal pending rather than accepting stale UI.

Primary route:

- `/studio/assistant`

Viewports:

- desktop around `1440x1100`
- mobile around `375x812`

## Check

ARIADNE should judge from a human-eye view:

- Assistant reads as an operational helper, not a persona or companion.
- Action cards explain why they appear and where they go.
- Action card links are live, exact Studio/settings routes, not fake buttons.
- No card implies automatic publishing, exporting, Memory/Canon writing,
  Integrity Session start, candidate mutation, provider calls, or autonomous
  execution.
- Status/kind/priority chips are legible and do not crowd the card.
- Desktop layout is coherent and scannable.
- Mobile layout wraps cleanly with no horizontal overflow.
- Starter prompts return useful operational guidance and action cards, not vague
  advice.
- Visible text contains no raw storage paths, tokens, secret-shaped strings,
  full private archive bodies, or full transcripts.
- Empty or low-data states make clear what is safe, what to add/review next,
  and who can see it.

## Defect Format

If blocked, wake MIMIR with:

- exact route and viewport;
- runtime commit observed if available;
- defect title;
- expected behavior;
- actual behavior;
- whether DAEDALUS should patch code, MIMIR should adjust scope, or deployment
  simply needs to catch up.

If accepted, wake MIMIR with:

- route and viewports checked;
- runtime commit observed if available;
- pass/fail verdict;
- any future polish notes clearly marked as non-blocking.
