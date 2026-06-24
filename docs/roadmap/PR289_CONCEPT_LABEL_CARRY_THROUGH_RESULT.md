# PR289 - Concept Label Carry-Through Result

Owner: A2 / DAEDALUS
Status: complete; ready for ARGUS review
Completed: 2026-06-24

## Result

DAEDALUS patched the remaining label carry-through boundary after PR288 proved
hosted selected-context placement was being used enough to recall the matching
invented phrases. The strongest root-cause hypothesis is provider-facing focus
wording: `memory (title): content` made selected labels/titles look optional
while the content looked like the answer.

The patch changes provider selected-context focus lines to carry explicit
paired fields:

```text
memory: selected label/name: <title>; supporting fact: <content>
```

The final provider-facing instruction now says to include selected labels,
names, or titles with their relevant supporting facts unless the owner
explicitly asks otherwise.

## Patch Summary

- Changed provider selected-context focus formatting in
  `apps/api/src/routes/conversations.ts`.
- Label/title budget remains unchanged at 80 compact characters; no evidence
  showed useful labels were being truncated.
- Supporting fact budget remains unchanged at 220 compact characters.
- No retry behavior was added.
- No retrieval, context assembly, provider routing, embedding, schema, seed,
  import, Redis, Cloudflare, queue, worker, billing, Stripe, public UI, or
  Studio UI behavior changed.

## Test Coverage

The focused conversation archive route test now proves:

- the final provider-facing `user` message contains an explicit
  `selected label/name` plus `supporting fact` pair on the same Memory line;
- the old parenthetical `memory (title): content` shape is gone from the
  provider-facing focus;
- the generic final instruction tells the model to include selected labels,
  names, or titles with relevant supporting facts;
- the persisted owner `conversation_messages` row remains unchanged;
- trace sessions and trace events do not store the selected synthetic private
  strings.

## Validation

All required PR289 local checks passed:

| Command | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata` | Pass | 12 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 8 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:conversation-archive` | Pass | 35 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:replay-readiness` | Pass | 2 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | 2 turbo tasks passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass with existing warnings | Existing raw `<img>` warnings remain in `apps/web/app/space/[slug]/page.tsx` and `apps/web/components/discover/discover-front-door.tsx`. |

## Safety

- Stored owner messages remain raw owner messages; provider-only selected
  context augmentation is not persisted.
- Trace/debug/readiness metadata remains sanitized and content-free for selected
  private strings.
- Rejected-control filtering and source-copy boundaries are unchanged.
- No raw hosted prompts, completions, provider payloads, hosted logs, SQL,
  private source bodies, raw ids, cookies, tokens, or credentials were added.
- No replay persona name, hosted id, seeded label, or staging prompt wording is
  hardcoded in product code.

## Recommendation

ARGUS should review label/fact pairing, provider payload wording, stored-message
boundary, no-hardcoding, scope control, and raw-data leakage safety. If
accepted, MIMIR should open an ARIADNE PR290 hosted rerun to measure whether
explicit selected label/name plus supporting fact pairs clear the hosted label
recall failure.
