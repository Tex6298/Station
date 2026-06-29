# PR481A - Owner Persona Avatar URL Control Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-06-29

Status: Open - hosted owner/public proof

## Why This Rehearsal

ARGUS accepted PR481A after a narrow sanitizer review patch:

`docs/roadmap/PR481A_OWNER_PERSONA_AVATAR_URL_CONTROL_REVIEW_RESULT.md`

The remaining risk is hosted product truth. PR481A added an owner-scoped
persona avatar URL control, public serializer sanitization, and public avatar
rendering changes. The live Railway app must prove safe set, public render,
clear-to-fallback, and unsafe-value failure without opening media upload,
storage, provider, voice, or broad UI scope.

This is a bounded owner mutation rehearsal. Restore the starting avatar state
before returning `PASS_READY_TO_CLOSE`.

## Required Checks

Run against hosted Railway using the human/browser route view.

1. Freshness:
   - hosted web/API health are ready at app commit `a6a9eaec` or later, or at
     the deploy-equivalent app commit if later commits are docs/state only;
   - the private persona management/edit surface visibly includes the PR481A
     Avatar URL control.
2. Baseline:
   - identify one owner-controlled public persona with a routeable
     `/personas/:publicSlug` page;
   - identify a public Space route that includes the same persona card if
     hosted seed data has one;
   - record only route labels/status and whether the baseline uses initials or
     an avatar, not raw IDs, cookies, tokens, SQL, logs, or response bodies.
3. Safe set:
   - signed-in owner sets a safe public HTTPS image URL with no secret-shaped
     query string, for example a simple public placeholder image URL;
   - the owner control reports bounded success and does not reveal raw internal
     IDs, storage paths, tokens, cookies, provider payloads, SQL/table details,
     stack traces, or secret-shaped values.
4. Public persona render:
   - signed-out public `/personas/:publicSlug` desktop renders the avatar or a
     safe image state without broken layout;
   - signed-out public `/personas/:publicSlug` at 390px mobile remains readable
     with no horizontal overflow, clipped controls, overlapping text, or broken
     avatar/header layout;
   - no private owner fields, raw IDs, storage paths, signed URLs, tokens,
     cookies, provider payloads, SQL/table details, stack traces, or
     secret-shaped values appear.
5. Public Space persona card:
   - if a routeable public Space includes that persona, verify desktop and 390px
     mobile render the same safe avatar behavior on the persona card;
   - if no routeable public Space includes the persona, return
     `SEED_OR_ROUTE_BLOCKER` unless every other required check passes and the
     missing Space card is clearly a seed-data absence.
6. Unsafe values fail closed:
   - attempt unsafe values such as `javascript:alert(1)`, `data:image/svg+xml`,
     `http://localhost/avatar.png`,
     `https://example.com/avatar.png?token=secret`,
     `https://example.com/avatar.png?apikey=secret`,
     `https://example.com/avatar.png?apiKey=secret`, and
     `https://example.com/avatar.png?x-amz-signature=secret`;
   - each unsafe non-empty value fails closed with bounded UI/API feedback;
   - unsafe values are not stored and never appear in public UI, public
     serializer payloads, visible errors, hosted logs, SQL output, stack traces,
     cookies, tokens, or secret-shaped material.
7. Clear and restore:
   - signed-in owner clears the Avatar URL;
   - signed-out public persona route returns to initials fallback or the exact
     starting avatar state if the persona already had one;
   - public Space persona card returns to the same fallback/baseline state if
     checked;
   - leave hosted staging in the baseline state.
8. Safety:
   - do not upload files, request signed upload URLs, create storage objects,
     call providers, exercise voice/audio/video behavior, open billing/Stripe,
     touch Redis/Cloudflare/workers/queues, create migrations, or broaden the
     public persona/product surface.

## Verdicts

Return one of:

```text
PASS_READY_TO_CLOSE
PRODUCT_DEFECT_NEEDS_DAEDALUS
DEPLOYMENT_WAITING
PRIVACY_OR_AVATAR_BOUNDARY_FAIL
SEED_OR_ROUTE_BLOCKER
```

Use `PASS_READY_TO_CLOSE` only if safe set, public persona render, public Space
card render, unsafe failure, and clear/restore all pass on hosted staging.

Use `PRODUCT_DEFECT_NEEDS_DAEDALUS` for visible defects such as missing owner
control after fresh deploy, safe URL not saving, clear not restoring fallback,
broken desktop/mobile layout, public image rendering failure, or unsafe values
being accepted.

Use `PRIVACY_OR_AVATAR_BOUNDARY_FAIL` if any raw ID, owner ID, storage path,
signed URL, token, cookie, hosted log, SQL/table output, stack trace, provider
payload, private source material, or secret-shaped value appears in public UI,
visible errors, or serialized public payloads.

Use `SEED_OR_ROUTE_BLOCKER` if hosted staging lacks a routeable public persona
or required public Space persona-card route and the issue cannot be
distinguished from missing seed/account data.

## Wakeup Template

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the PR481A hosted owner/public avatar URL rehearsal.
Verdict:
- PASS_READY_TO_CLOSE | PRODUCT_DEFECT_NEEDS_DAEDALUS | DEPLOYMENT_WAITING | PRIVACY_OR_AVATAR_BOUNDARY_FAIL | SEED_OR_ROUTE_BLOCKER
Task:
- Close PR481A, wait for deploy, route the smallest repair, or choose the seed/route unblock.
```

