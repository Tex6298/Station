# PR485E - Companion Chat Surface Polish Review Result

Owner: ARGUS / A3

Implemented by: DAEDALUS / A2

Date reviewed: 2026-07-05

Status: Accepted - ready for MIMIR to route ARIADNE

## Verdict

```text
ACCEPT_PR485E_PERSONA_CHAT_SURFACE_POLISH_IMPLEMENTATION
```

ARGUS accepts DAEDALUS' PR485E implementation without a review patch.

## Review Summary

The implementation matches the accepted PR485E lane:

- touched only `PersonaChat`, its focused static test, scoped
  `.studio-persona-chat-*` CSS, and roadmap/validation docs;
- replaced inline private chat surface styling with scoped CSS classes;
- polished the existing header, conversation state/count readback, return card,
  message rows, live assistant actions, sending/error/provider setup/empty
  states, existing archive/candidate panel, and composer fit;
- preserved the existing streaming send path, bearer token usage, status/error
  handling, latest conversation loading, archive route, save-memory/save-canon
  actions, candidate review route, local return-card actions, and archived
  read-only behavior;
- added focused static checks for scoped CSS and no placeholder controls.

No ARGUS patch was required.

## Boundary Checks

Privacy, auth, and owner-scope boundaries remain intact:

- no API route, migration, schema, package, prompt, retrieval, provider/runtime,
  token-accounting, trace, or stream contract change was introduced;
- no route-query, route-selected conversation loading, `useRouter`,
  `useSearchParams`, `URLSearchParams`, or `window.history` behavior was added;
- no automatic LLM call, automatic summary, durable summary storage, or durable
  companion-presence storage was added;
- Memory inbox, Archive connector, source inventory, import behavior, and
  public persona chat stayed out of scope;
- no billing, queues/workers, Redis, Cloudflare, social connector, public
  write, partner adapter, or hosted runtime work entered scope;
- CSS selectors added for the chat surface are scoped to
  `.studio-persona-chat-*` and do not reskin the Studio shell, sidebar, topbar,
  public chat, shortcut strip, broad `.card`, broad `.button`, or broad
  `.textarea` styling;
- visible controls remain honest: no Attach, mic, tools, copy, regenerate,
  notes, menu, or similar placeholder controls were added.

No token, cookie, raw id, storage path, SQL detail, stack trace, compiled
prompt, provider payload, source body, or secret-shaped value is newly rendered.

## Validation

ARGUS reran the requested validation on 2026-07-05:

| Command / check | Result | Notes |
| --- | --- | --- |
| Code review | Pass | Reviewed diff from the accepted preflight commit through DAEDALUS implementation, including component behavior, tests, CSS selectors, docs, and wakeup commit. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/studio/persona-chat.test.ts apps/web/lib/chat-stream.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts` | Pass | 29 focused web tests passed. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck executed and passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint executed and passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warning only for ARGUS state receipt. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys; those warnings
are already documented as non-failures in the validation baseline.

## Required ARIADNE Rehearsal

Because PR485E is visible UI, ARGUS still requires hosted browser rehearsal
before MIMIR closes the lane.

MIMIR should route ARIADNE to verify hosted web/API health and rehearse
`/studio/personas/[personaId]` on desktop plus `375px` and `390px` mobile
viewports.

Required visible states:

- active existing owner thread with the return card;
- empty/new chat state;
- archived read-only state with `New chat` recovery;
- sending/status state if safely triggerable without fake provider behavior;
- provider setup/error state if safely triggerable without exposing secrets;
- existing continuity-candidate archive panel if present in replay data;
- PR485A companion shortcuts still present and routeable;
- Memory and Memory inbox still separate;
- public persona chat unaffected.

ARIADNE should explicitly check for no horizontal overflow, clipped controls,
overlapping text, unstable button layout, fake placeholder controls, private or
secret-shaped visible readback, route-query drift, public chat drift, Memory
inbox drift, Archive connector drift, or broad shell/sidebar/topbar reskin.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepted DAEDALUS' PR485E web-only PersonaChat polish implementation without a review patch.
- Scoped .studio-persona-chat-* CSS, behavior preservation, no-placeholder-control checks, and requested validation all passed.
Task:
- Route ARIADNE hosted rehearsal for PR485E before lane closeout.
- Require hosted web/API health plus /studio/personas/[personaId] desktop, 375px, and 390px rehearsal.
- Cover active thread with return card, empty/new chat, archived read-only with New chat recovery, safe sending/status and provider setup/error states if triggerable, existing archive/candidate panel if present, shortcut route continuity, Memory/Memory inbox separation, public chat no-drift, visual fit, honesty, and no secret-shaped visible readback.
Guardrails:
- Do not treat ARGUS acceptance as hosted visual proof; ARIADNE still needs real browser rehearsal.
- Do not route new DAEDALUS feature work unless ARIADNE finds a concrete product defect.
- Keep APIs, prompt/runtime, route-query behavior, Memory inbox, Archive connector, public chat, broad shell, Discern CSS, infra, and placeholder controls out of scope.
Validation:
- npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/components/studio/persona-chat.test.ts apps/web/lib/chat-stream.test.ts apps/web/lib/studio-navigation.test.ts apps/web/lib/import-review.test.ts
- npm exec --yes pnpm@10.32.1 -- run typecheck
- npm exec --yes pnpm@10.32.1 -- run lint
- git diff --check
```
