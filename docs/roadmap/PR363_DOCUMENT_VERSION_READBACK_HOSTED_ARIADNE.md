# PR363 - Document Version Readback Hosted Proof

Owner: ARIADNE
Date: 2026-06-26
Status: Open

## Wakeup

```text
WAKEUP A4:
Codename: ARIADNE
Summary:
- PR362 added public/owner version readback to the Station document page.
- Public readers should see only current published version context.
- Owners should see owner-only version history after authenticated owner access and a Continue editing path back to Studio publishing.
Task:
- Run hosted Railway proof for the PR362 document version/readback behavior.
- Verify signed-out public document view does not expose prior versions or fetch owner-only version history.
- Verify replay-owner document view shows owner version readback and Continue editing routes to /studio/publish?documentId=<id>.
- Check desktop and 375px mobile for the proof path.
- Create docs/roadmap/PR363_DOCUMENT_VERSION_READBACK_HOSTED_RESULT.md.
- Wake MIMIR with PASS, PASS WITH CAVEAT, FAIL, or BLOCKED.
```

## Target Routes

- Public Space: `/space/station-replay-alpha`
- Public document from that Space.
- Owner document route for the same document after replay-owner sign-in.
- Owner continuation route: `/studio/publish?documentId=<id>`.

## Pass Criteria

- Hosted web includes the PR362 document version/readback patch.
- Signed-out public document page shows current version context only.
- Signed-out public path does not show prior version rows, private draft
  bodies, owner IDs, raw IDs, raw JSON, or secret-shaped values.
- Owner path shows the version readback card when version history exists, or an
  honest owner-only thin state if the seeded document has no prior versions.
- `Continue editing` opens the existing Studio publishing route for the same
  document without creating, editing, publishing, deleting, or submitting
  anything.
- Desktop and 375px mobile have no document-level overflow or trapped controls
  in the checked path.

## Boundary

- Do not mutate documents, versions, discussions, Spaces, billing, provider,
  queue, worker, Redis, Cloudflare, Railway, Supabase, schema, or migrations.
- Do not create new document versions for proof unless MIMIR explicitly opens a
  mutation lane.
- Do not print credentials, cookies, tokens, raw owner/persona/document/thread
  IDs, raw response bodies, prior private version bodies, prompts, provider
  payloads, hosted logs, or secret-shaped values.
