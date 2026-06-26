# PR340 - UX-05 Thread Detail Status Labels

Owner: DAEDALUS

Date: 2026-06-26

Status: Accepted by ARGUS

## Why This Opens

PR339 passed hosted forum browsing rehearsal with one caveat: the thread detail
route is readable and mobile-safe, but it does not repeat the category/status
labels visible on the category thread row.

MIMIR is opening the narrow follow-up now so the forum detail page carries the
same explicit public/community status context as the list route before UX-05
moves on.

## Inputs

Use:

- `docs/roadmap/PR339_UX05_FORUM_HOSTED_REHEARSAL_RESULT.md`
- `docs/roadmap/PR338_UX05_FORUM_BROWSING_CLARITY_RESULT.md`
- current `docs/roadmap/ACTIVE_STATUS.md`

Primary route:

```text
/forums/[categorySlug]/[threadId]
```

Known replay route family:

```text
/forums/station-replay-salon-alpha/[threadId]
```

## Task

Implement the smallest safe no-new-config patch that brings category/status
readback onto the forum thread detail page.

Preferred implementation shape:

- reuse existing forum copy/status helpers from PR338;
- show reader-facing category/status labels on the thread detail page near the
  thread heading or metadata row;
- keep score, reply, witness, signed-out participation, and reply-heading copy
  intact;
- preserve desktop and `375px` mobile readability;
- keep the patch presentation-only.

If no code patch is needed, return the exact reason and a recommendation to
MIMIR.

## Hard Limits

Do not:

- change forum API queries unless the existing route already has the needed
  safe fields available;
- change visibility, membership, moderation, reporting, watches, witnesses,
  votes, posting, auth, schema, migrations, provider/model, Redis, Cloudflare,
  queue, worker, deploy, key, or database-admin behavior;
- expose private Studio memory, archive, canon, continuity, owner data, source
  bodies, provider payloads, credentials, cookies, or raw private identifiers;
- implement new actions, moderation policy, anonymous chat, public launch,
  commercial readiness, partner claims, recommendation algorithms, or broad
  redesign.

## Validation

Run the narrowest meaningful validation for touched code. Expected candidates:

```text
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
```

If one command is not relevant to the final touched files, record why it was
not run.

## Result Required

Create:

```text
docs/roadmap/PR340_UX05_THREAD_DETAIL_STATUS_LABELS_RESULT.md
```

If code changes land, wake ARGUS with:

- summary of thread-detail status/category label changes;
- exact files/routes touched;
- validation results;
- visibility/privacy/moderation risks to review;
- whether ARIADNE should rerun the hosted thread-detail rehearsal after review.

If no code changes land, wake MIMIR with:

- verdict;
- exact reason;
- next recommendation.
