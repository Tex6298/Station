# PR523B - Companion-First Persona Home Draft PR #1 Human Rehearsal Result

Owner: ARIADNE / A4

Date: 2026-07-12

Verdict:

```text
ACCEPT_PR523B_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_FOR_MIMIR_MERGE_DECISION
```

## Target

Rehearsed draft PR #1 as the companion-first persona-home source of truth:

```text
https://github.com/Tex6298/Station/pull/1
fork/agent/companion-shell-translation
2d4a23835e5aa0928488041168d48b4cb489e8bb
```

The PR branch was run locally from a detached worktree at the exact commit, with
the web app on `http://127.0.0.1:3030` and the hosted Railway API
`https://stationapi-production.up.railway.app`.

## Summary

Draft PR #1 is ready for MIMIR's merge/integration decision.

The persona home now reads as a private companion workspace first, with
Advanced Studio pushed behind an explicit disclosure instead of dominating the
page. The desktop sidebar is useful without feeling like a generic dashboard.
Mobile at `390px` and `375px` keeps the companion shell usable without
document-level horizontal overflow, clipped composer text, hidden primary
route context, or unnamed visible controls.

No DAEDALUS patch is required before MIMIR decides whether to merge/integrate
the draft PR.

## Routes And Viewports

| Check | Result | Notes |
| --- | --- | --- |
| Replay owner auth | Pass | `/auth/signin` returned `200`; tier `canon`; token not printed. |
| Studio dashboard to persona home | Pass | Persona entry opened the companion shell. |
| Desktop persona home `1280x900` | Pass | First viewport contained header, chat, and sidebar; no uncontained overflow; visible controls had names. |
| Mobile persona home `390x844` | Pass | First viewport contained header, chat, and mobile companion nav; no document-level overflow. |
| Mobile persona home `375x812` | Pass | Same as `390px`; no document-level overflow. |
| Mobile companion navigation | Pass with polish note | `New chat` is available after opening `Navigate`; the closed summary says `Private companion`, persona name, and `Navigate`. |
| New Chat URL | Pass | `?c=new` opens the New conversation state and selects New conversation. |
| Existing thread URL | Pass | `?c=<conversationId>` selected the requested persona-bound thread without silent fallback. |
| Rapid thread switching | Pass | Final route stayed on the last selected conversation after quick route changes. |
| Send flow visible response state | Pass | Hosted fixture showed the bounded private-provider setup callout instead of hanging or silently failing. |
| Archived thread read-only state | Pass | Archived fixture disabled the composer and offered `New chat`. |
| Archive action | Fixture-limited | Not run end-to-end because the replay owner has no accepted provider, so send did not create a conversation to archive. No UI defect observed. |
| Return-to-thread card | Fixture-limited | No active non-empty conversation fixture was available. |
| Memory Inbox | Pass | Pending candidate controls were visible for four fixtures; existing fixtures were not mutated. |
| Advanced Studio | Pass | Disclosure opens lazily and exposes continuity, runtime context, and encounter/readiness material. |
| Public no-drift | Pass | `/`, `/discover`, `/space/station-replay-alpha`, `/forums`, `/forums/station-replay-salon-alpha`, `/writing`, and `/personas/station-replay-alpha-persona` showed no private companion copy or mobile overflow. |

## Product-Fit Answers

1. The persona home feels companion-first rather than dashboard-first. Chat,
   thread selection, and private companion framing now lead the surface.
2. The desktop sidebar is useful. It gives thread selection, persona switching,
   companion care links, and Studio exits without taking over the page.
3. Memory, Inbox, Timeline, Profile, and Integrity are discoverable on desktop
   and mobile. Mobile hides them behind `Navigate`, which is acceptable for
   protected alpha but should stay on MIMIR's polish radar.
4. Advanced Studio is findable and no longer makes persona home feel like an
   operational dashboard by default.
5. Return-to-thread copy and controls look humane in code and ARGUS review, but
   this hosted fixture had no active non-empty thread to exercise the card.
6. New Chat and explicit thread selection feel safe. Archived read-only state is
   clear. Archive action remains fixture-limited in this rehearsal.
7. Mobile works at `390px` and `375px`. The compact shortcut strip is
   intentionally scroll-contained and did not create document-level overflow.
8. Visible buttons, links, inputs, summaries, and textareas had accessible names
   in the checked states.
9. The PR keeps Station's current visual language while moving toward the
   companion-first direction.
10. No pre-merge DAEDALUS fix is required from this rehearsal.

## Residual Polish Risk

- On mobile, the closed companion nav does not expose `New chat` until the user
  opens `Navigate`. This is acceptable for protected alpha, but the post-merge
  polish pass should decide whether `New chat` deserves a first-tap action.
- On mobile, the explicit `Owner-only` chip is not present in first-viewport
  text, although `Private companion` remains visible. Keep privacy wording
  under review if the shell becomes public-facing to more testers.
- Archive creation and the return-to-thread card should be rerun when a fixture
  has either an accepted private provider or an active non-empty conversation.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| `node .tmp\pr523b-rehearsal.mjs` | Pass | Temporary Playwright runner reported `SUMMARY blocks=0 skips=2 results=26`; runner was removed before commit. |
| `git diff --check` | Pass | Docs-only result whitespace check passed. |
| `pnpm typecheck` | Not run | Docs-only result; no imports or scripts touched. |
