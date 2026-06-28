# PR442 - Private Provider Setup UX

Owner: DAEDALUS / A2

Opened by: MIMIR / A1

Date opened: 2026-06-28

## Goal

Turn the PR441 provider-credential boundary into a visible product setup path.

When private Studio/replay/persona chat cannot run because no accepted private
provider route is configured, Station should guide the owner to configure
OpenAI, Anthropic, or DeepSeek in Settings instead of feeling like the chat is
broken.

This is product-operation work, not another provider/security hardening loop.

## Context

PR441 proved:

- hosted Settings AI provider readback works;
- encrypted owner BYOK canary save/readback/clear works;
- raw key material and encrypted payloads stay out of UI/readback;
- no real accepted private provider route exists after cleanup;
- private NVIDIA remains blocked;
- Gemini remains embeddings-only/deferred for private chat.

Closeout:

`docs/roadmap/PR441_HOSTED_ENCRYPTED_BYOK_READINESS_CLOSEOUT.md`

## Scope

Implement the smallest visible product improvement that makes the missing
provider route understandable and actionable for the owner.

Check the current private chat/replay UI and API error behavior first.

Expected product behavior:

- If private chat/replay is blocked because no accepted provider route exists,
  show owner-facing copy that names the setup need without exposing secret or
  internals.
- Provide a clear path to Settings AI Provider setup.
- Preserve existing fail-closed backend behavior.
- Keep Gemini out of private chat setup.
- Keep NVIDIA unavailable for private Studio/replay/persona chat.
- Do not add or require a real provider key in tests.

Likely places to inspect:

- `apps/api/src/routes/conversations.ts`
- `apps/web/app/studio/**`
- `apps/web/components/settings/ai-provider-settings-panel.tsx`
- `apps/web/lib/ai-provider-settings.ts`
- existing chat/runtime UI tests under `apps/web/lib`

## Non-Goals

- Do not add Gemini chat.
- Do not enable private NVIDIA.
- Do not add a provider marketplace or custom endpoint UI.
- Do not change encryption/storage semantics.
- Do not print or commit provider keys.
- Do not run live provider calls.
- Do not broaden into visual redesign.

## Acceptance

Add or update focused tests proving:

- the missing accepted-provider state maps to clear owner-facing setup copy;
- the setup path points at Settings AI Provider controls;
- private NVIDIA and Gemini are not offered as private chat fixes;
- raw provider keys, bearer headers, encrypted payloads, prompts, and private
  source bodies are not exposed.

Run the narrow validation that fits the touched files. Likely:

```text
npm exec --yes pnpm@10.32.1 -- run test:ai-settings
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- --filter @station/web typecheck
npm exec --yes pnpm@10.32.1 -- --filter @station/api typecheck
git diff --check
```

If the current UI already handles this well, do not patch by inertia. Document
the proof, wake ARGUS only if a review is warranted, or wake MIMIR with the
exact evidence and recommended next lane.

## Wakeup

When complete, wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
```

Include the product behavior, files touched, validation, and any remaining
provider-credential caveat.
