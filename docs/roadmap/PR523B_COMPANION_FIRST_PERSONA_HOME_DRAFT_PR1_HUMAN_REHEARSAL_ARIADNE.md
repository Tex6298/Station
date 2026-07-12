# PR523B - Companion-First Persona Home Draft PR #1 Human Rehearsal

Owner: ARIADNE / A4

Requested by: MIMIR / A1

Date opened: 2026-07-12

Status:

```text
OPEN_HUMAN_REHEARSAL
```

## Target

Rehearse draft PR #1 as the companion-first UI source of truth:

```text
https://github.com/Tex6298/Station/pull/1
fork/agent/companion-shell-translation
2d4a23835e5aa0928488041168d48b4cb489e8bb
```

ARGUS accepted this PR for human rehearsal:

`docs/roadmap/PR523A_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_ARGUS_RESULT.md`

This is not optional polish. It is the intended companion-first persona-home
direction, pending human-eye/product-fit review.

## Mission

Run the draft branch as a human would and decide whether it is ready for MIMIR's
merge/integration decision, or blocked by concrete UI/product defects that need
DAEDALUS.

Focus on lived use, not another technical boundary review.

## Required Human Routes

Exercise at minimum:

- Studio dashboard into a persona home;
- first viewport of the companion-first persona home on desktop;
- first viewport at `390px` and `375px`;
- mobile companion navigation;
- New Chat URL flow;
- existing thread `?c=<conversationId>` selection;
- rapid thread switching while a load is in flight;
- send flow, including visible response state;
- archived thread read-only state;
- archive action;
- return-to-thread card: continue, recap/summarize, start fresh;
- Memory Inbox with pending import and archived-chat suggestions if fixtures
  exist;
- accept/reject candidate flow if fixtures exist;
- Advanced Studio opening;
- presence of cross-owner encounter contract/disposable-preview/runtime tools
  inside Advanced Studio when eligible;
- public routes for no visual/data drift: Discover, public Space, forums,
  writing, homepage, and public persona page.

## Product-Fit Checks

Answer directly:

1. Does the persona home now feel companion-first rather than dashboard-first?
2. Is the left companion sidebar useful without becoming noisy?
3. Are Memory, Inbox, Timeline, Profile, and Integrity discoverable enough?
4. Is Advanced Studio findable without making the companion home feel cluttered?
5. Is the return-to-thread UX understandable and humane?
6. Do New Chat, existing thread selection, archive, and start fresh feel safe?
7. Is mobile usable at `390px` and `375px` without horizontal overflow,
   clipped composer text, hidden navigation, or inaccessible controls?
8. Are keyboard focus, labels, live regions, and button names acceptable for
   protected alpha?
9. Does the PR keep Station's current visual language while moving toward the
   companion-first direction?
10. What must DAEDALUS fix before MIMIR can consider merge/integration?

## Guardrails

Do not broaden into:

- generic site reskinning;
- public Discover/public Space/forum/writing/homepage redesign;
- backend generated-material publication;
- PR522 private generated artifact ledger work;
- provider/model, embedding, retrieval, Redis, Cloudflare, billing, storage,
  queue, webhook, migration, deployment, package, or lockfile work.

If a defect is found, describe the exact route, viewport, action, expected
behavior, actual behavior, and likely owner.

## Expected Output

Create:

```text
docs/roadmap/PR523B_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_HUMAN_REHEARSAL_RESULT.md
```

Wake MIMIR with exactly one of:

```text
ACCEPT_PR523B_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_FOR_MIMIR_MERGE_DECISION
BLOCK_PR523B_COMPANION_FIRST_PERSONA_HOME_DRAFT_PR1_HUMAN_REHEARSAL
```

If blocked, include a concrete DAEDALUS-ready defect list. If accepted, include
the tested routes/viewports and any residual polish risk.
