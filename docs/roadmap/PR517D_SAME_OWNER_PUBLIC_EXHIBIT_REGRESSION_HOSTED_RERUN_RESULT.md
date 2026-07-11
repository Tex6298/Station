# PR517D - Same-Owner Public Exhibit Regression Hosted Rerun Result

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date: 2026-07-11

Result:

```text
PASS_PR517D_SAME_OWNER_PUBLIC_EXHIBIT_REGRESSION_HOSTED_RERUN
```

## Summary

ARIADNE ran the missing current-hosted same-owner public exhibit regression
proof requested after PR517C.

The proof created one disposable same-owner private candidate artifact, published
one metadata-only same-owner public exhibit, reported it by public slug, proved
hosted moderation persisted the public exhibit UUID target rather than the slug,
proved admin remove/restore, proved owner-retracted protection, checked public
no-drift, verified the PR517C cross-owner table was undisturbed, and cleaned up
the proof artifact and proof report row.

## Hosted Proof

Target:

```text
https://stationweb-production.up.railway.app
https://stationapi-production.up.railway.app
```

Passed:

- API health returned `200`;
- web health/root returned `200`;
- owner, non-owner, and admin auth worked;
- owner tier was `canon`;
- non-owner tier was `private`;
- admin capability was present;
- exactly one disposable same-owner private candidate artifact was created;
- generated reply text, private setup body, prompt bodies, raw ids, provider
  payloads, env values, cookies, auth-header values, SQL detail, screenshots,
  traces, and videos were not recorded in this result;
- same-owner public exhibit publish returned `201`;
- public readback remained slug-based and metadata-only;
- signed-out report attempt returned `401`;
- missing and malformed report attempts returned `404`;
- signed-in report by slug returned `201`;
- duplicate report by slug returned bounded `200`;
- hosted moderation report target id was UUID-shaped, matched the public
  exhibit UUID, and was not the public slug;
- admin queue resolved the proof report without exposing the private setup
  marker or private session id;
- admin remove hid public readback;
- removed report attempt returned `404`;
- admin restore reopened the eligible removed published exhibit;
- owner retract hid public readback;
- retracted report attempt returned `404`;
- admin remove/restore after owner retract returned `400`;
- public route stayed `404` after blocked moderation;
- no same-owner run created cross-owner public exhibit rows;
- Discover feed, Discover search, forums API, hosted Discover, hosted forums,
  hosted writing, and hosted spaces did not surface the proof artifact outside
  the dedicated public exhibit route.

## Cleanup

Cleanup passed:

```text
privateSessionDeleted true
publicExhibitDeleted true
proofReportDeleted true
```

The public route returned `404` after cleanup.

## Validation

```text
node .tmp\pr517d-hosted-proof.mjs
```

Result: pass.

`pnpm typecheck` was not run because this result updates documentation only and
does not touch imports or scripts.

## Next

MIMIR can close PR517C/PR517D together if the hosted proof set is accepted:
PR517C covered the cross-owner metadata-only public exhibit contract, and
PR517D covered the missing same-owner report/remove/restore regression gate.
