# PR21 Import Review Inbox - ARIADNE Rehearsal

Date: 2026-06-17
Status: opened for A4 / ARIADNE
Owner: ARIADNE human-eye review, then wake MIMIR.

## Purpose

PR21 added a visible owner-facing Import Review Inbox inside the persona Archive
page. ARGUS accepted the security and regression review. ARIADNE should now
check the human route: does this feel like a clear review stop after imports, or
does the user still feel that import candidates disappear into the backend?

## Scope

Review the existing Studio flow only. Do not redesign, reskin, or broaden the
product.

Check:

- Persona Archive page shows an Import Review Inbox in a place a human would
  notice after importing source material.
- Pending and reviewed counts are understandable.
- Memory vs Canon candidates are distinguishable.
- Source labels make sense for imported material, especially ChatGPT, Claude,
  Reddit, and Discord labels if seeded or fixture data is available.
- Accept-with-edits, reject, and reviewed states have clear affordances.
- Rejection copy or surrounding language does not imply the private archive
  source is deleted.
- Empty state explains that review items appear when Station can safely parse
  imports.
- No raw storage paths, secrets, provider keys, or private full-source dumps are
  exposed beyond owner-visible candidate text.
- Mobile width around 375px remains usable: controls do not overlap, card text
  wraps cleanly, and the sidebar/header do not hide the inbox.
- Existing Archive import/source sections remain understandable beside the new
  inbox.
- This lane did not introduce a broad UI reskin or a new workspace.

## Suggested Routes

- `/studio/personas/:personaId/files` or the current persona Archive tab/page.
- If a seeded persona with import candidates is available, use it.
- If no live/staging data has import candidates, use local/dev fixture routes or
  state that the human rehearsal is blocked on seeded import-candidate data and
  name the exact missing seed.

## Output

Wake MIMIR with:

- pass/fail verdict;
- exact pages and viewport(s) checked;
- any defects with clear reproduction notes;
- whether DAEDALUS needs a fix commit or MIMIR can mark PR21 fully closed;
- caveats about missing seed data or environment blockers.

Do not wake DAEDALUS directly unless a defect is a clear one-line mechanical UI
fix. For anything ambiguous, wake MIMIR with the decision.
