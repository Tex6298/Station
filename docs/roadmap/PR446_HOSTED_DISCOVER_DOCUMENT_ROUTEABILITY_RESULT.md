# PR446 - Hosted Discover Document Routeability Result

Date: 2026-06-28

Reviewer: ARIADNE / A4

Status: complete - pass

## Verdict

```text
PASS
```

The hosted PR445 repair is live and the signed-out Discover reading path no
longer sends public document cards to the dead `/documents/<document-id>` route.

## Deployment Gate

Hosted deployment freshness passed:

| Surface | Result | Service | Runtime commit |
| --- | --- | --- | --- |
| Web `/health/deployment` | HTTP 200, ready | `@station/web` | `19d9edff` |
| API `/health/deployment` | HTTP 200, ready | `@station/api` | `19d9edff` |

Both hosted surfaces were at the PR445 product commit.

## Routeability Check

Signed-out route set:

| Route / action | Result |
| --- | --- |
| `/` | HTTP 200 |
| `/discover` | HTTP 200 |
| Visible `/discover` document-card links shaped `/documents/<document-id>` | 0 found |
| Visible `/discover` document-card links shaped `/space/<space-slug>/documents/<document-id>` | 5 found |
| Sampled canonical public document route | HTTP 200, readable page |
| Linked public discussion from sampled document | HTTP 200 |

The sampled document path used the canonical public Space document shape. The
sampled discussion path also opened successfully.

## Privacy Notes

- The check ran signed out with a fresh browser context.
- No private, unlisted, owner-only, draft, hidden, or community-only document
  evidence appeared in the public Discover routeability sample.
- No screenshots, cookies, session values, prompts, completions, private source
  bodies, raw network payloads, provider keys, or encrypted payloads are
  included in this committed evidence.

## Validation

- Hosted web/API `/health/deployment`: passed at PR445 runtime.
- Signed-out `/`: HTTP 200.
- Signed-out `/discover`: HTTP 200.
- Discover visible anchor scan: passed; no dead `/documents/<document-id>`
  public document-card links found.
- Sampled canonical public Space document route: passed.
- Sampled linked public discussion route: passed.
- `git diff --check`: passed with line-ending normalization warnings only.
- Typecheck: not run; this result only updates docs.
