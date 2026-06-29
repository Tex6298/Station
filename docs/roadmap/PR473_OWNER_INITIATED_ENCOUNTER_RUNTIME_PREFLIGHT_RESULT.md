# PR473 - Owner-Initiated Encounter Runtime Preflight Result

Owner: ARGUS / A3

Date: 2026-06-29

Verdict: `ACCEPT_FOR_DAEDALUS`

Accepted lane:

```text
PR473A - Owner-Initiated Encounter Runtime Preview
Owner: DAEDALUS / A2
```

## Decision

Station can safely open a smallest owner-initiated encounter runtime slice only
if it is a non-durable private Studio preview that follows the fail-closed
public persona chat guard pattern and avoids the persistent private chat route.

The accepted PR473A shape is one owner-authored setup, two same-owner selected
personas, and one model-generated responder reply. It is not a conversation
loop, transcript, draft, shareable object, public feature, or background job.

## Accepted Product Shape

DAEDALUS may implement a private Studio-only preview:

- The authenticated owner selects two personas they own.
- The owner writes or confirms the setup/opening prompt.
- The server verifies both personas belong to `req.user!.id` before any runtime
  action.
- The server makes at most one provider call and generates at most one responder
  reply.
- The response is returned as a disposable preview only.
- Leaving the page or starting over discards the preview because nothing is
  persisted.
- The UI and response must label:
  - owner-authored setup;
  - selected same-owner personas;
  - model-generated responder reply;
  - not a transcript;
  - not saved;
  - not shareable;
  - no Memory, Archive, Canon, Continuity, Integrity, or transcript sources
    were retrieved for this first slice.

Maximum output shape: one model response from the selected responder persona.
The initiator turn is owner-authored setup, not model-generated.

## Required Runtime Guards

PR473A must fail closed before any provider call unless all of these pass:

- both persona ids load from `personas` with `owner_user_id === req.user!.id`;
- the owner has a configured accepted provider route from
  `resolveChatProviderRuntimeRoute(...)`;
- NVIDIA platform private context remains blocked with `allowPlatformNvidia:
  false`;
- token budget passes `assertTokenBudgetForEstimate(...)`;
- per-minute and per-day encounter preview rate limits pass through
  `incrementOperationalRateLimit(...)`;
- the rate-limit provider is enabled; disabled or failing cache means HTTP 503
  and no provider call;
- input length, prompt length, and `maxOutputTokens` are bounded;
- the implementation calls the provider directly with `provider.sendMessage`
  and must not use `enqueueLlmCall`, because that helper performs automatic
  rate-limit retries.

After a successful provider call, PR473A may record token usage with
`recordLlmTokenUsage(...)` using `chatId: null`. It must not persist prompt
text, generated text, or transcript text in token, observability, cache, or
route metadata. If DAEDALUS adds observability, it must be metadata-only and
must not include owner setup or generated output.

## Allowed Implementation Shape

Prefer a narrow new route instead of modifying persistent conversations:

- `apps/api/src/routes/persona-encounters.ts`
- `apps/api/src/routes/persona-encounters.test.ts`
- `apps/api/src/app.ts` only to mount the private authenticated route
- `apps/web/lib/persona-encounter-runtime.ts`
- `apps/web/lib/persona-encounter-runtime.test.ts`
- `apps/web/components/studio/persona-workspace.tsx`
- `apps/web/app/studio/personas/[personaId]/page.tsx`
- `package.json` only for focused test script / `test:studio-ui` inclusion if
  a web helper is added
- roadmap/testing docs for DAEDALUS result

The route should be authenticated and private, for example
`POST /persona-encounters/preview`. It must not create public routes.

## Explicit Non-Goals

Do not add:

- cross-owner encounters;
- autonomous/background encounters;
- scheduled encounters;
- multi-turn loops;
- automatic provider retries;
- conversation creation;
- `conversation_messages` writes;
- durable encounter transcripts;
- encounter drafts;
- archive entries;
- generated documents, posts, comments, or threads;
- public or shareable output;
- anonymous encounters or visitor controls;
- Memory, Archive, Canon, Continuity, Integrity, transcript, or source-text
  retrieval;
- vector retrieval or embedding calls;
- schema, migration, storage bucket, queue, worker, Redis, Cloudflare, billing
  expansion, Stripe change, token top-up change, public route, or broad UI
  redesign.

## Required Tests

DAEDALUS should prove:

- same-owner personas can produce one disposable preview;
- cross-owner initiator/responder ids fail before provider call;
- missing or disabled operational cache fails closed before provider call;
- exhausted token quota fails before provider call;
- provider config failure returns a bounded error before provider call;
- provider 429 or provider failure does not automatically retry;
- the route does not insert `conversations`, `conversation_messages`,
  archived transcripts, continuity candidates, memory, canon, archive chunks, or
  public/shareable rows;
- token usage, if recorded, uses `chatId: null` and stores no prompt or output
  text;
- response and UI provenance labels say owner-authored setup, selected
  same-owner personas, model-generated responder reply, not saved, not
  transcript, not shareable;
- response/UI do not expose owner ids, raw persona ids, provider keys, provider
  settings, storage paths, Memory/Archive/Canon/Continuity/Integrity source
  bodies, visitor identity, or secret-shaped material;
- `test:studio-ui` includes any new web helper copy.

Minimum validation:

```bash
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/api/src/routes/persona-encounters.test.ts
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/persona-encounter-runtime.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

ARGUS should also run diff-only scope and secret-shaped-pattern scans during
review.

## Hosted Rehearsal Requirement

If DAEDALUS implements PR473A and ARGUS accepts it, MIMIR should route ARIADNE
for a narrow hosted owner-route rehearsal:

- signed-in owner can select two same-owner personas and generate one preview on
  desktop and 390px mobile;
- cancelling/leaving does not leave a transcript, draft, conversation, public
  page, or shareable output;
- sampled signed-out public routes show no encounter controls, generated
  encounter output, shareable pages, cross-owner controls, anonymous encounter
  controls, or availability claims;
- sampled UI exposes no private Memory, Archive, Canon, Continuity, Integrity,
  transcript/source text, provider settings, credentials, raw ids, storage
  paths, visitor identity, or secret-shaped material.

## Preflight Answers

1. Existing owner checks are sufficient if PR473A loads both personas by id and
   requires `owner_user_id === req.user!.id` for both before any provider call.
2. Existing provider and token-budget guards are suitable only with a new
   encounter-specific fail-closed rate-limit wrapper modeled on public persona
   chat. The generic cache primitive is fail-open when disabled, so DAEDALUS
   must wrap it and return 503 on disabled/failing rate-limit state.
3. Non-durable runtime is safe only if the preview avoids `conversations`,
   `conversation_messages`, archive/candidate/memory/canon writes, source
   retrieval, and generated-output observability payloads.
4. Maximum output is one model response. Do not generate both sides of an
   exchange in PR473A.
5. Provenance must label owner-authored setup, selected same-owner personas,
   model-generated responder reply, not saved, not transcript, not shareable,
   and no private source retrieval.
6. Tests must prove same-owner pass, cross-owner fail, fail-closed quota/rate
   limit/provider behavior, no persistence, no retry, bounded provenance, and
   no public/shareable surfaces.
7. Hosted rehearsal should prove the owner route works on desktop/mobile and
   public routes remain free of encounter controls or claims.
