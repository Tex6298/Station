# PR83 - Community Forum UX Rehearsal

Date opened: 2026-06-19
Opened by: A1 / MIMIR
Owner: ARIADNE first. DAEDALUS implements only if ARIADNE finds concrete
defects. ARGUS reviews any code changes.
Status: ARIADNE follow-up accepted; ready for MIMIR closeout

## Why This Lane

The protected Community Beta API slices are now consolidated. The next open gap
is visible: polished category and thread creation UX. This should not start as
a broad redesign. ARIADNE should run the human route first, name concrete
defects, and wake DAEDALUS only for specific fixes.

## Goal

Run a human-eye rehearsal of the forum/community browsing and creation flow.

The review should answer:

- Does `/forums` feel like a managed Station community, not a generic forum
  placeholder?
- Do category pages make thread status, provenance, discussion context, and
  participation affordances clear?
- Does `/forums/[categorySlug]/new` make thread creation understandable,
  tier-aware, and safe around linked Space/persona/document fields?
- Do thread detail pages keep discussion, voting, report, provenance, and
  moderation states understandable without crowding the post body?
- Do anonymous, visitor-tier, eligible member, and admin views communicate what
  is possible without showing dead controls?

## Routes And Roles

Use the deployed/staging route if available; otherwise use the local preview
route ARIADNE normally uses for human rehearsals.

Check at least:

- `/forums`
- `/forums/[categorySlug]`
- `/forums/[categorySlug]/new`
- `/forums/[categorySlug]/[threadId]`
- a document discussion entry point if a public document links to a thread

Roles/viewports:

- anonymous desktop and mobile;
- signed-in visitor or below-participation-tier user if available;
- signed-in eligible member;
- admin only if already easy and safe.

## What To Look For

- Buttons that look live but do nothing.
- Controls shown to roles that cannot use them.
- Missing or confusing disabled/error states.
- Thread creation fields whose purpose is unclear.
- Linked Space/persona/document affordances that invite unsafe or impossible
  actions.
- Provenance labels that are absent, too vague, too legalistic, or too noisy.
- Report/vote/reply controls that are visually crowded or hard to reach.
- Mobile overflow, overlap, clipped text, or cramped action rows.
- Visual mismatch with the intended Station/Discern direction: serious,
  polished, dark product surfaces, not generic card-heavy placeholder UI.

## Output Format

ARIADNE should write a concise rehearsal note with:

- route;
- role;
- viewport;
- pass/fail;
- exact defect;
- expected behavior;
- implementation hint if obvious;
- priority: blocker, important, polish, or no-action.

If there are concrete implementation defects, ARIADNE must wake DAEDALUS with
the exact fix list. If there are no code defects, ARIADNE must wake MIMIR with
the closeout verdict. Do not sleep without waking the next agent.

## Guardrails

- No broad forum redesign.
- No new subcommunity, appeal, notification, reputation, or recognition system.
- No billing/provider/Redis/Cloudflare/Developer Space work.
- No auth/session refactor.
- No public/private/community visibility widening.
- Do not ask the human to manually test buttons that ARIADNE can test.

## Validation

This is a human-route rehearsal. If DAEDALUS is woken for code changes, expected
validation is:

```bash
npm exec --yes pnpm@10.32.1 -- run test:community
npm exec --yes pnpm@10.32.1 -- run test:document-discussions
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
```

Add relevant web checks if UI code changes.

## ARIADNE Result - 2026-06-19

ARIADNE completed the browser/code-readback rehearsal and found concrete
implementation defects. See
`docs/roadmap/PR83_COMMUNITY_FORUM_UX_REHEARSAL_RESULT_ARIADNE.md`.

DAEDALUS should patch the narrow fix list:

- public document discussion CTA missing for an anonymous public document with
  an existing attached thread;
- below-tier signed users can see a live `+ New thread` affordance before API
  tier rejection;
- new-thread linked persona/Space selects lack boundary/helper copy;
- owners can still see `Report` on their own thread.

No broad forum redesign, subcommunity, appeal, notification, reputation,
recognition, billing/provider/cache, Developer Space, auth/session refactor, or
visibility widening is opened.

## ARIADNE Follow-Up Result - 2026-06-19

After DAEDALUS patched the four defects and ARGUS technically accepted the
patch, ARIADNE reran the focused route rehearsal on the deployed Railway
runtime.

The follow-up pass accepted:

- public document `Open discussion` CTA on desktop and 390px mobile;
- below-tier category affordance, checked with a controlled visitor-tier
  `/auth/me` response in an isolated browser profile;
- eligible-member linked persona/Space helper copy on the new-thread route;
- owner thread detail with `Own post` and no thread-level `Report` action.

No additional PR83 UI defect remains from ARIADNE's follow-up pass.
