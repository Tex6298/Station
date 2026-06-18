# PR32 Chat Streaming Rehearsal - ARIADNE Result

Date: 2026-06-18
Agent: A4 / ARIADNE
Verdict: Streaming behavior passed; visual contrast patch needs ARGUS validation

## Runtime Checked

- Web: `https://stationweb-production.up.railway.app`
- API: `https://stationapi-production.up.railway.app`
- Web/API deployment identity: `eab216a187818478e42c1ad91560e3e21de4f40b`
- Persona: `Station Replay Persona`
- Persona id: `7944d8be-6b1d-49d9-b3b9-7e438810b414`

Provider/config failure simulation was not attempted against shared Railway
configuration. No existing provider/config error state appeared during the
happy-path rehearsal.

## Streaming Behavior

ARIADNE sent one normal Studio chat message through the live browser UI.

- Browser requested
  `/conversations/persona/7944d8be-6b1d-49d9-b3b9-7e438810b414/chat/stream`.
- The POST request included the bearer token in the `Authorization` header.
- The stream response returned `200` with `text/event-stream; charset=utf-8`.
- No fallback JSON chat POST was observed.
- The visible status sequence was:
  - `Starting chat stream...`
  - `Chat request accepted.`
  - `Assembling chat context.`
  - `Checking token budget.`
  - `Waiting for model response.`
  - `Saving assistant reply.`

API readback after completion:

- Conversation id stayed `3c76118f-fa46-4db3-8dae-08476fcc87cd`.
- Message count changed from `4` to `6`.
- The unique user prompt appeared once.
- The next message was one assistant reply.
- Assistant replies after the prompt: `1`.

This satisfies the no-duplicate persistence requirement for the rehearsed turn.

## Layout

Desktop `1440x1100`:

- Chat header loaded.
- Send control returned to normal after completion.
- No visible error state.
- No document-level horizontal overflow.

Mobile `375x812`:

- Completed chat loaded with the new prompt visible.
- Send control was usable after completion.
- No visible error state.
- `document.scrollWidth` and `document.clientWidth` both measured `375`.

Non-blocking existing chrome caveat: at 375px, the global top nav still has
offscreen `My Space` and `Developer` link bounds, but it does not create
document-level horizontal scrolling and is outside the PR32 chat card.

## Visual Defect Found

The live deployed chat behavior worked, but the completed mobile screenshot made
the assistant reply difficult to read: assistant-message and streaming-status
bubbles used dark backgrounds without explicit light foreground color. The
message was present and persisted correctly, but readability was below A4
standard.

ARIADNE patched `apps/web/components/studio/persona-chat.tsx` to set explicit
light text on:

- user chat bubbles;
- assistant chat bubbles;
- the streaming status bubble.

This is a small UI contrast repair only. It does not change backend semantics,
auth, quota, persistence, provider routing, streaming events, or fallback logic.

## Validation

- `curl.exe -fsS --max-time 30 https://stationapi-production.up.railway.app/health/deployment`
- `curl.exe -fsS --max-time 30 https://stationweb-production.up.railway.app/health/deployment`
- Chrome/CDP live Studio chat rehearsal at `1440x1100`
- Chrome/CDP completed-chat layout check at `375x812`
- Direct signed API readback for conversation messages
- `npm exec --yes pnpm@10.32.1 -- run test:studio-ui`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`
