# PR476A - Owner Social Publishing Readiness Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Passed - wake MIMIR

## Why This Rehearsal

ARGUS accepted PR476A:

`docs/roadmap/PR476A_OWNER_SOCIAL_PUBLISHING_READINESS_REVIEW_RESULT.md`

The remaining risk is hosted product truth: the live staging site must show
Social Publishing as a paused owner-only readiness/readback surface, not as a
working connector, credential capture form, OAuth launch, or live post flow.

This is a human-eye hosted proof. It is not a real provider-account test.

## ARIADNE Result

Result file:

`docs/roadmap/PR476A_OWNER_SOCIAL_PUBLISHING_READINESS_REHEARSAL_RESULT.md`

Verdict:

```text
PASS_READY_TO_CLOSE
```

Hosted `/settings/social` rendered seven paused provider cards on desktop and
390px mobile, with disabled connector buttons and no credential inputs. An
owned public document route rendered paused social readiness instead of a live
composer. Direct API samples confirmed readback-only readiness and bounded
paused compose behavior.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at app commit `a2e0ca1e` or later, or at
     the deploy-equivalent app commit if later commits are docs/state only;
   - `/settings/social` visibly includes the PR476A readiness/readback fence.
2. Signed-in `/settings/social` desktop:
   - provider readiness cards render for Bluesky, Mastodon, Tumblr, LinkedIn,
     Reddit, WordPress, and Ghost, or the hosted equivalent supported-provider
     inventory;
   - the page reads as paused/readback-only;
   - credential inputs are absent;
   - Connect, OAuth, disconnect, save, and post actions are absent or disabled;
   - no stored handles, tokens, app passwords, refresh tokens, admin keys,
     provider account ids, OAuth codes, callback URLs, or external post URLs
     appear.
3. Signed-in `/settings/social` at 390px mobile:
   - same readiness/readback truth as desktop;
   - no horizontal overflow, clipped buttons, overlapping text, or unreadable
     provider cards.
4. Public document owner route:
   - open a routeable owned public document such as the seeded Station Replay
     Alpha Note if available;
   - confirm the owner-facing social area shows paused connector readiness
     rather than a live social composer;
   - confirm no call-to-post, provider selection, teaser generation, OAuth,
     credential input, or external post control is visible.
5. Optional direct API samples, only if already available in ARIADNE's hosted
   tools without exposing secrets:
   - authenticated `GET /social/readiness` returns readback-only flags such as
     `postingEnabled: false`, `connectionActionsEnabled: false`, and
     `credentialStorageAccepted: false`;
   - a legacy action route such as `/social/compose` returns bounded paused
     status rather than writing rows or calling providers.
6. Safety:
   - no real provider account is used;
   - no OAuth redirect, token exchange, provider call, queue/worker, webhook,
     billing action, or external URL is created;
   - do not capture hosted logs, SQL output, private document text, secrets,
     env values, tokens, provider account ids, provider payloads, stack traces,
     or credential values.

## Out Of Scope

Do not try to connect Bluesky, Mastodon, Tumblr, LinkedIn, Reddit, WordPress,
Ghost, X/Twitter, Substack, or any other provider.

Do not enter credentials, app passwords, access tokens, refresh tokens, Ghost
admin API keys, OAuth codes, provider account ids, callback URLs, or external
post URLs.

Do not broaden into live posting, syndication, scheduling, deletion/retraction,
comments/replies import, social metrics, OAuth/token storage, encrypted
credential schema, queue/worker/retry execution, webhooks, billing, real
provider accounts, Redis, Cloudflare, or broad Settings redesign.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_CONNECTOR_BOUNDARY_FAIL
SEED_OR_ROUTE_BLOCKER
```

Use `PASS_READY_TO_CLOSE` if hosted desktop/mobile `/settings/social` and the
owned public document route both show paused, readback-only social publishing
truth without forbidden connector controls or sensitive material.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for concrete visible defects such as missing
PR476A readiness copy after fresh deploy, active social composer controls,
credential inputs, broken mobile layout, or misleading live-connector claims.

Use `PRIVACY_OR_CONNECTOR_BOUNDARY_FAIL` if any secret-like value, provider
account detail, external post URL, hosted log, SQL/table output, stack trace,
OAuth token/code/callback, provider payload, or live-posting path appears.

Use `SEED_OR_ROUTE_BLOCKER` only if the hosted owner account has no routeable
owned public document to inspect and the defect cannot be distinguished from
missing staging seed data.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR476A hosted read-only social publishing rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_CONNECTOR_BOUNDARY_FAIL | SEED_OR_ROUTE_BLOCKER
Task:
- Close PR476A, wait for deploy, route the smallest repair, or choose the seed/route unblock.
```
