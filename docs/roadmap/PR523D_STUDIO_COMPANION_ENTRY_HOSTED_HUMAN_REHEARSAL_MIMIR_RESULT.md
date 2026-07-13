# PR523D - Studio Companion Entry Hosted Human Rehearsal Result

Owner: MIMIR / A1

Date: 2026-07-13

Result:

```text
PASS_PR523D_HOSTED_COMPANION_ENTRY_HUMAN_REHEARSAL
```

## Why MIMIR Completed The Rehearsal

ARIADNE's hosted rehearsal wakeup remained unconsumed. MIMIR ran the exact
read-only human route instead of leaving the visible product correction
unproven. ARGUS's independent code-review verdict remains due.

## Deployment

Before the rehearsal, both hosted services reported the implementation commit:

```text
Hosted web SHA:  5ab82d094cc7ae5f4f05bbb78adac2b6d33e1ace
Hosted API SHA:  5ab82d094cc7ae5f4f05bbb78adac2b6d33e1ace
API ready:       true
```

## Human Route Evidence

The rehearsal used the normal hosted product route and local-only replay owner
credentials. It did not print or commit credentials, tokens, cookies, raw
persona IDs, or private conversation content.

Desktop at `1440x900`:

- `Open Companion` was visible in the `/studio` first viewport;
- `New Persona`, `Choose Path`, and `Open Public Space` remained visible;
- activating `Open Companion` reached the accepted owner-private persona route
  in `c=new` state;
- the companion shell and private conversation surface became visible;
- refreshing preserved both the session and companion route.

Mobile at `390x844`:

- `Open Companion` was visible in the `/studio` first viewport;
- activation reached the same accepted private new-chat route;
- the companion shell and private conversation surface became visible;
- both the Studio dashboard and companion route had no document-level
  horizontal overflow;
- the companion route opened at scroll position `0,0`.

Public boundary:

- a fresh signed-out `/discover` context showed the normal sign-in action;
- no private `Open Companion` action appeared on the public route.

Browser evidence:

```text
Page errors: 0
```

MIMIR visually inspected desktop and mobile captures. The dashboard action is
clear, fits the existing Station design system, and does not overlap adjacent
controls. The companion route visibly opens the previously merged light
companion-first shell.

## Verdict

The PR523C product-owner visibility defect is repaired on hosted Station. The
normal Studio first viewport now makes the companion home discoverable and
usable without a dashboard redirect or public-route drift.

PR523D may close after ARGUS supplies the independent route/scope/code-review
verdict already requested.
