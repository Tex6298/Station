# PR497A - Companion Home Usability Translation Review Result

Date: 2026-07-06

Owner: ARGUS / A3

Result:

```text
ACCEPT_PR497A_COMPANION_HOME_USABILITY_TRANSLATION_IMPLEMENTATION
```

## ARGUS Verdict

ARGUS accepts PR497A with a narrow review patch.

The implementation matches the accepted lane: it is web-only, keeps the current
private persona home route and chat behavior, and changes hierarchy/copy so the
first experience is identity, private chat, companion shortcuts, and compact
continuity context before the older admin/readback stack.

The route/privacy/runtime boundaries held:

- no API, schema, RLS, auth, quota, storage, billing, Stripe, provider/model,
  prompt/runtime, Redis, Cloudflare, worker, queue, deployment, package
  metadata, or public route files changed;
- private chat still uses the existing owner-authenticated conversation routes
  and `sendPersonaChatWithStream`;
- return-to-thread actions remain local and owner-triggered: focus composer,
  prefill recap request, or clear local thread state;
- shortcut and context links still target only accepted owner Studio routes;
- the rail still exposes aggregate counts and owner-only copy, not raw rows,
  source ids, private snippets, provider payloads, or secret material;
- CSS changes are scoped to existing Studio/persona-home/chat selectors, not a
  Discern global import or broad shell rewrite.

Hosted ARIADNE proof is required before closeout because visible persona-home
hierarchy and mobile layout changed.

## ARGUS Patch

ARGUS changed one rail detail from:

```text
Suggested Memory and Canon waiting for you.
```

to:

```text
Suggested Memory and Canon review stop.
```

Reason: the underlying `continuityCandidateCount` is an aggregate count, not a
pending-only count, so the original wording could overclaim pending review
truth. The focused test now asserts the neutral wording.

## Review Notes

Accepted:

- `apps/web/app/studio/personas/[personaId]/page.tsx` moves the home grid ahead
  of continuity cards, public interaction readback, voice/avatar readiness,
  encounter panels, Runtime Context Preview, archive export, and published
  continuity history without deleting those safety/readback surfaces.
- `apps/web/components/studio/persona-chat.tsx` warms loading, empty, heading,
  return-card, and composer copy without adding placeholder attach/mic/tool
  controls, browse/edit/automation claims, or durable presence claims.
- `apps/web/lib/studio-navigation.ts` keeps Memory, Inbox, Timeline, Profile,
  and Integrity shortcuts on accepted owner routes.
- `apps/web/lib/companion-home-context.ts` keeps the context rail aggregate and
  owner-only, with Runtime Context Preview explicitly remaining below for
  selected-source/prompt review.
- Mobile risk is bounded by existing `920px` stacking rules plus the updated
  wrapped button text. ARIADNE still needs browser proof at desktop, `375px`,
  and `390px`.

No hidden backend/runtime drift, public/private boundary weakening, or stale
Discern endpoint behavior was found.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| ARGUS code review | Pass | Reviewed changed web/CSS/helper/test/docs scope against PR497 audit and DAEDALUS lane guardrails. |
| `npm exec --yes pnpm@10.32.1 -- exec tsx --test apps/web/lib/companion-home-context.test.ts apps/web/lib/studio-navigation.test.ts apps/web/components/studio/persona-chat.test.ts` | Pass | 23 focused tests passed after the ARGUS wording patch. |
| `npm exec --yes pnpm@10.32.1 -- run typecheck` | Pass | API typecheck replayed from cache; web typecheck executed and passed. |
| `npm exec --yes pnpm@10.32.1 -- run lint` | Pass | Web lint passed with no warnings or errors. |
| `git diff --check` | Pass | CRLF normalization warnings only; no whitespace errors. |
| `git diff --cached --check` | Pass | No staged whitespace errors. |

## Hosted Proof Required

MIMIR should route ARIADNE for hosted proof before closeout.

ARIADNE should verify:

- signed-in owner can reach `/studio/personas/:personaId`;
- desktop first viewport leads with identity/header, `Companion Home`, private
  chat, companion shortcuts, and context rail before the admin/readback stack;
- `375px` and `390px` mobile stack the home grid and return-card controls
  without horizontal overflow, clipped labels, broken tap targets, or incoherent
  overlap;
- return actions remain owner-triggered and local;
- no public chat behavior, API route, provider/runtime, prompt, schema, billing,
  Redis, Cloudflare, worker, queue, stale endpoint, placeholder control,
  autonomy claim, private/raw/source id, provider payload, token, cookie, stack
  trace, or secret-shaped value appears.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS accepts PR497A as ACCEPT_PR497A_COMPANION_HOME_USABILITY_TRANSLATION_IMPLEMENTATION with one narrow wording patch.
- The private persona home is now companion-first before the admin/readback stack while preserving owner-only route, privacy, and runtime boundaries.
- ARGUS changed the Inbox rail copy to avoid implying a pending-only count because continuityCandidateCount is aggregate.
- Focused tests, typecheck, lint, git diff --check, and git diff --cached --check passed.
Task:
- Route ARIADNE hosted desktop/375px/390px proof for /studio/personas/:personaId before PR497A closeout.
```
