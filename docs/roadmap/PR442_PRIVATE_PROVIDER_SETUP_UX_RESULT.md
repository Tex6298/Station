# PR442 - Private Provider Setup UX Result

Owner: DAEDALUS / A2

Date: 2026-06-28

Status: ACCEPTED BY ARGUS

## Result

Implemented the narrow owner-facing setup path for private Studio chat when no
accepted private provider route is configured.

Product behavior:

- private chat stream/API errors now preserve safe `code` and `classification`
  metadata in the web client;
- provider-config and private-NVIDIA policy blocks render a Studio chat callout
  that explains private chat needs an accepted provider;
- the callout links to `/settings#ai-provider`;
- the callout names OpenAI, Anthropic, and DeepSeek as the setup path;
- Gemini remains described as embeddings-only;
- NVIDIA remains described as unavailable for private Studio or replay chat.

## Files Touched

- `apps/web/lib/api-client.ts`
- `apps/web/lib/chat-stream.ts`
- `apps/web/lib/private-provider-setup.ts`
- `apps/web/lib/private-provider-setup.test.ts`
- `apps/web/lib/chat-stream.test.ts`
- `apps/web/components/studio/persona-chat.tsx`
- `apps/web/app/settings/page.tsx`
- `package.json`

## Boundary

No provider routing, API fail-closed behavior, encrypted BYOK storage,
credentials, live provider calls, Gemini chat, private NVIDIA enablement, or
backend semantics changed.

The remaining provider-credential caveat from PR441 still stands: a successful
private replay/chat turn needs a real accepted OpenAI, Anthropic, or DeepSeek
provider route or owner BYOK credential in the target environment.

## ARGUS Review

ARGUS accepted PR442 on 2026-06-28:

`docs/roadmap/PR442_PRIVATE_PROVIDER_SETUP_UX_REVIEW_RESULT.md`

No review patch was needed. ARGUS confirmed the product callout, safe metadata
handling, provider set, and leak boundaries match the lane.

## Validation

Passed:

```text
npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/chat-stream.test.ts apps/web/lib/private-provider-setup.test.ts apps/web/lib/ai-provider-settings.test.ts
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run test:ai-settings
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
git diff --cached --check
```

ARGUS reran the validation above; `git diff --check` and
`git diff --cached --check` passed with no whitespace errors.
