# PR527D - Forum Thread Semantic Theme Repair Closeout

Owner: MIMIR / A1

Date closed: 2026-07-15

State:

```text
CLOSE_PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_ACCEPTED
```

## Decision

PR527D is closed accepted. The populated Forum thread route now uses scoped
semantic presentation in System, Light, and Dark without changing Forum
commands, data, auth, tier, moderation, Watch, database, or global appearance
behavior.

ARGUS accepted the original route repair with a scoped contrast/state patch at
`f7bc2785b19f0ff3d040210c0b1842a2525ff00f`. The first hosted rehearsal then
isolated one remaining reply-composer contrast defect. PR527D1 corrected that
single textarea at implementation SHA
`ae349fc9f71c533333751a68515572a45bcff72b`, and ARGUS accepted it unchanged.

## Accepted Evidence

- Community tests pass `50/50`.
- Studio UI tests pass `263/263`.
- Web typecheck and lint pass; diff checks pass.
- ARGUS independently covered the full local signed-out/signed-in,
  System/Light/Dark, desktop/two-mobile route matrix and all relevant states.
- ARIADNE completed the full hosted `18/18` thread matrix. Every surface except
  the initial composer edge/placeholder passed.
- ARIADNE then completed the exact-SHA hosted `9/9` signed-in composer rerun.
  Boundary and placeholder minima are both `5.03:1`; input/caret minimum is
  `13.55:1`; focus minimum is `6.84:1`.
- Hosted overflow, clipping, overlap, page errors, unclassified console
  errors, and non-auth product writes are all zero. Recorded database row
  counts were preserved.
- Railway web/API remained `200`, `ok:true`, `ready:true`, branch `main`, exact
  service names, and exact implementation SHA before and after the rerun.

Sources:

- `docs/roadmap/PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_ARGUS_RESULT.md`
- `docs/roadmap/PR527D_FORUM_THREAD_SEMANTIC_THEME_REPAIR_HOSTED_REHEARSAL_RESULT.md`
- `docs/roadmap/PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_REPAIR_ARGUS_RESULT.md`
- `docs/roadmap/PR527D1_FORUM_REPLY_COMPOSER_CONTRAST_HOSTED_RERUN_RESULT.md`

## Retained Separate Defect

The hosted fixture summary reported `1 reply` while the route rendered two
real visible replies. That is a data/count-truth defect, not a remaining theme
repair failure. It is retained without inference or cosmetic suppression as:

```text
PR527D2 - Forum Reply Count Truth Boundary
```

PR527D2 begins with an ARGUS read-only preflight because the current product
mixes a denormalized thread counter with a separately filtered visible comment
list. The preflight must choose a durable cross-surface contract before any
write, migration, backfill, or UI patch is authorized.

After PR527D2 closes, the ranked PR527 programme resumes with PR527E Persona
Profile Truth And Theme Repair unless new evidence changes that order.
