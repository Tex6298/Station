# PR442 - Private Provider Setup UX Review Result

Date reviewed: 2026-06-28

Reviewer: ARGUS / A3

Status: accepted - wake MIMIR

## Verdict

```text
ACCEPTED
```

PR442 implements the narrow owner-facing private provider setup UX requested by
MIMIR without changing provider routing, encrypted BYOK storage, credentials,
Gemini chat scope, private NVIDIA policy, live provider calls, hosted runtime,
queues, billing, Cloudflare, partner adapters, or backend semantics.

No ARGUS product patch was needed.

## Evidence Read

- `docs/roadmap/PR442_PRIVATE_PROVIDER_SETUP_UX_DAEDALUS.md`
- `docs/roadmap/PR442_PRIVATE_PROVIDER_SETUP_UX_RESULT.md`
- `docs/roadmap/PR441_HOSTED_ENCRYPTED_BYOK_READINESS_CLOSEOUT.md`
- `apps/web/lib/api-client.ts`
- `apps/web/lib/chat-stream.ts`
- `apps/web/lib/private-provider-setup.ts`
- `apps/web/lib/private-provider-setup.test.ts`
- `apps/web/lib/chat-stream.test.ts`
- `apps/web/components/studio/persona-chat.tsx`
- `apps/web/app/settings/page.tsx`
- `apps/web/lib/ai-provider-settings.test.ts`
- `package.json`

## Review Findings

Implementation match:

- Web API and chat-stream errors now preserve safe string `code` and
  `classification` metadata.
- Studio private chat maps missing-provider and private-NVIDIA policy block
  states to a visible owner setup callout.
- The setup action points to `/settings#ai-provider`, and the Settings page now
  exposes that anchor on the AI Provider panel.
- Owner setup copy names OpenAI, Anthropic, and DeepSeek only.
- Gemini remains described as embeddings-only, and NVIDIA remains unavailable
  for private Studio or replay chat.

Privacy and safety boundary:

- The callout uses fixed owner-facing copy and safe metadata only.
- Tests cover raw provider keys, bearer headers, encrypted payloads, prompts,
  and private source bodies staying out of visible setup copy.
- Non-provider chat errors continue to render as plain error messages.
- No backend fail-closed behavior, provider credential handling, encrypted BYOK
  storage, or live provider execution path changed.

Scope boundary:

- No Gemini chat enablement.
- No private NVIDIA enablement.
- No provider marketplace, custom endpoint UI, Cloudflare, hosted runtime,
  queue, billing, or partner-adapter scope.
- The residual PR441 caveat remains: a successful private replay/chat turn still
  needs a real accepted OpenAI, Anthropic, or DeepSeek provider route or owner
  BYOK credential in the target environment.

## ARGUS Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/chat-stream.test.ts apps/web/lib/private-provider-setup.test.ts apps/web/lib/ai-provider-settings.test.ts` | Pass | 10 focused tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:studio-ui` | Pass | 139 tests passed, including private provider setup helper tests. |
| `npm exec --yes pnpm@10.32.1 -- run test:ai-settings` | Pass | 12 tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run test:persona-context` | Pass | 12 tests passed; private NVIDIA remains fail-closed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck` | Pass | Web TypeScript check passed. |
| `npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck` | Pass | API TypeScript check passed. |
| `git diff --check` | Pass | No whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Wakeup

Wake MIMIR to close PR442 and decide the next move.
