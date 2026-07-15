# PR527C - Forum Watch Hosted Readiness Repair Result

Owner: DAEDALUS / A2

Requested by: MIMIR / A1

Date completed: 2026-07-15

Status:

```text
IMPLEMENT_PR527C_FORUM_WATCH_HOSTED_READINESS_REPAIR_COMPLETE_AWAITING_ARGUS_REVIEW
```

## Summary

DAEDALUS completed the bounded PR527C repair for ARGUS review.

- Applied the exact checked-in migration `040_community_notifications.sql` to hosted Supabase.
- Preserved the migration file byte-for-byte at SHA-256 `88F6CF617878D1C3DE52B9CDB011F81ECA168D92DBF20C475996BC0B04DC8B9D`.
- Made the Forum thread watch panel fail closed for unreadable or ambiguous watch state.
- Added focused tests for owner-scoped/idempotent watch rows and fail-closed web state.
- Left API routes, notification service behavior, shared web helper, migrations, CSS/theme, auth, tier, billing, and PR527D presentation scope untouched.

## Hosted Migration Evidence

The audited migration operation used the existing migration bytes only. It used temporary untracked `pg@8.13.1` tooling outside package manifests and lockfiles, then removed that tooling before commit.

Sanitized evidence:

| Check | Result |
| --- | --- |
| Migration hash | `matches: true`, SHA-256 `88F6CF617878D1C3DE52B9CDB011F81ECA168D92DBF20C475996BC0B04DC8B9D` |
| Target URL classes | Hosted HTTPS Railway web/API; non-local |
| API health | `200`, ready `true`, branch `main`, commit prefix `a36f55d0`, service `@station/api` |
| Web health | `200`, ready `true`, branch `main`, commit prefix `a36f55d0`, service `@station/web` |
| Precheck | Watch table absent; notification table absent; ledger count `0`; prerequisites present |
| Ledger insert | Version `20260715095133`, name `040_community_notifications` |
| Postcheck | Watch table present; notification table present; ledger count `1`; prerequisites present |
| Shape | Watch columns `6`, notification columns `13`, watch policies `4`, notification policies `2`, watch RLS `true`, notification RLS `true`, watch unique `true`, notification unique `true`, watch trigger `true` |
| Hosted safe watch GET | Sign-in `200`; thread selected `true`; watch GET `200`; boolean readback `true`; watch present `true` |

No hosted PUT or DELETE was performed. The migration created schema objects and the ledger row only; it did not create or change product watch, notification, thread, comment, or other product rows.

## Web Repair

`apps/web/app/forums/[categorySlug]/[threadId]/page.tsx` now uses an explicit watch view-state union:

- `idle` and `loading` render only `Loading watch state...`.
- `ready` is the only state that renders `Watch thread`, `Unwatch thread`, `Watching replies`, or `Not watching`.
- `updating` renders only `Saving watch state...`.
- `error/load` renders `Watch state unavailable`, bounded copy, and `Retry watch state`.
- `error/update` renders `Watch change unconfirmed`, bounded copy, and `Retry watch state`.

`Retry watch state` performs a GET-only reload. Mutation success is accepted only when the parsed response has a boolean `isWatching` matching the expected command result. Failed or ambiguous reads/writes do not optimistically change state, expose server error detail, derive a mutation from nullable state, or automatically replay a PUT/DELETE.

## Tests Added

API route coverage now proves:

- GET, PUT, and DELETE all return `404` for an unreadable thread.
- Another owner's watch row does not make the current user's GET return true.
- PUT creates at most one current-owner/thread row while preserving another owner.
- Duplicate PUT remains `200/true` and preserves one logical row per owner.
- DELETE removes only the current owner's row.
- Repeated DELETE remains `200/false` and still leaves the other owner row.

The focused web source test now locks:

- explicit non-nullable ready/error state handling;
- runtime boolean validation;
- expected mutation boolean validation;
- no nullable-state watch/unwatch choice;
- no arbitrary API error echo;
- error states exposing only GET retry, without Watch/Unwatch commands or Watching/Not-watching claims.

## Validation

| Command / check | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 exec tsx --test apps/web/lib/community-notifications.test.ts` | Pass, `4/4` |
| `npx --yes pnpm@10.32.1 test:community` | Pass, `49/49` |
| `npx --yes pnpm@10.32.1 test:studio-ui` | Pass, `263/263` |
| `npx --yes pnpm@10.32.1 --filter @station/api typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web typecheck` | Pass |
| `npx --yes pnpm@10.32.1 --filter @station/web lint` | Pass, no warnings/errors |
| Independent intercepted Playwright proof | Pass |

The intercepted browser proof used a local Next server with synthetic API responses and no real watch writes. It covered signed-out and below-tier non-mutation states; ambiguous GET fail-closed state; GET-only retry to ready false; ready true/false controls; PUT success; DELETE success; malformed PUT becoming unconfirmed with no auto-replayed write; refresh persistence from intercepted state; and `1440`, `390`, and `375` width fit with no page errors, unclassified console errors, or horizontal overflow.

## Review Boundary

ARGUS should hostile-review:

- the migration hash, ledger/version evidence, schema shape, RLS/policy presence, and hosted GET readback;
- the no-hosted-PUT/DELETE and no-product-row-change claims;
- the fail-closed web state and exact copy;
- owner-scoped/idempotent API tests;
- local validation and browser proof;
- scope compliance against the PR527C allow-list.

If accepted, ARGUS should wake MIMIR with `WAKEUP A1:`. If fixes are required, ARGUS should wake DAEDALUS with `WAKEUP A2:`.
