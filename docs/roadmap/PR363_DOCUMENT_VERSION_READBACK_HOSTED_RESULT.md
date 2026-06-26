# PR363 - Document Version Readback Hosted Result

Owner: ARIADNE

Date: 2026-06-26

Verdict: PASS WITH CAVEAT

## Scope

ARIADNE ran the hosted Railway proof for PR362 document version/readback
behavior.

Target:

```text
https://stationweb-production.up.railway.app
```

Routes:

```text
/space/station-replay-alpha
/space/station-replay-alpha/documents/[public-document]
/studio/publish?documentId=[same-document]
```

Credential values, cookies, auth values, authorization header values, raw
owner/persona/document/thread IDs, raw response bodies, private prior-version
bodies, prompts, provider payloads, hosted logs, and secret-shaped values were
not committed or summarized.

## Deploy Readiness

Hosted web reported ready on `main` at commit prefix `3de4f3a5`, the PR362 web
patch commit.

This proof was not blocked by stale deploy evidence.

## Public Reader Proof

ARIADNE opened the public Space and followed the first public document link as a
signed-out visitor.

Desktop public document route:

- loaded successfully;
- did not fetch `/documents/:id/versions`;
- public API read returned status `200`;
- public API read had no `versions` payload;
- public API read reported current version `v1`, status `published`, visibility
  `public`;
- did not show prior version rows;
- did not show `Continue editing`;
- did not show raw JSON, raw UUID-like values, owner IDs, document IDs,
  thread IDs, private prior-version bodies, or secret-shaped values;
- had no document-level horizontal overflow.

Mobile public document route at 375px:

- loaded successfully;
- did not show prior version rows;
- did not show `Continue editing`;
- did not show raw JSON, raw UUID-like values, owner IDs, document IDs,
  thread IDs, private prior-version bodies, or secret-shaped values;
- had no document-level horizontal overflow, clipped primary content,
  overlapping text, or trapped controls.

## Owner Proof

ARIADNE signed in as the replay owner using local ignored credentials and
checked the same document route.

Desktop owner document route:

- showed the owner-only `Version readback` card;
- showed current-version copy;
- showed the private-history boundary copy;
- made one owner-only `/documents/:id/versions` request;
- showed an honest thin state with no prior version rows in the hosted seed;
- showed `Continue editing`;
- did not create, edit, publish, delete, submit, or mutate anything;
- did not show raw JSON, raw UUID-like values, private prior-version bodies, or
  secret-shaped values;
- had no document-level horizontal overflow.

Owner route at 375px:

- showed `Version readback`;
- showed current-version copy;
- showed private-history boundary copy;
- showed `Continue editing`;
- did not show raw JSON, raw UUID-like values, private prior-version bodies, or
  secret-shaped values;
- had no document-level horizontal overflow, clipped primary content,
  overlapping text, or trapped controls.

`Continue editing` routeability:

- the link shape was `/studio/publish?documentId=[same-document]`;
- opening it reached `/studio/publish`;
- the document ID parameter was present;
- no create, edit, publish, delete, submit, or other mutating request was
  observed in the proof path.

## Caveat

The hosted replay public document selected from `/space/station-replay-alpha`
is current version `v1`.

That means the signed-out public route had no visible public `Version readback`
card to inspect. The proof still confirms the public boundary for the hosted
seed: public readers receive only the current public document row, do not
receive a `versions` payload, do not fetch owner-only version history, and do
not see prior rows or owner controls.

MIMIR may choose a future seed/data lane if he wants Railway to include a
public document at `v2+` so ARIADNE can inspect the public current-version card
itself.

## Result

PR363 passes with the hosted-data caveat above.

No DAEDALUS repair packet is needed for the current code path. The only
remaining question is whether MIMIR wants a versioned hosted fixture for a
stronger public-reader proof.

## Validation

- `npx --yes --package @playwright/test@1.41.2 playwright test tmp-pr363-document-version-hosted.spec.cjs --reporter=line --workers=1` - passed, 1 test.
- `git diff --check` - pending in commit validation.
