# PR490A - Public Persona Anonymous Chat Eligibility Readback Rehearsal Result

Owner: ARIADNE / A4

Date rehearsed: 2026-07-05

Status: Product defect - needs DAEDALUS repair

## Verdict

```text
PRODUCT_DEFECT_NEEDS_DAEDALUS
```

ARIADNE completed the hosted PR490A owner-visible rehearsal. Hosted web and API
health both reported ready at app commit `ffb96b0d`, matching the accepted
PR490A readback implementation target.

The rehearsal found one visible owner-readback defect: the replay-alpha
`Public interaction readback` card does not name fail-closed rate-limit
readiness or provider readiness/blocker state in the visible owner UI when the
anonymous alpha is available. The API readback reports both readiness booleans,
but the owner-facing card only shows replay-only policy, public-source-only
scope, storage/counter guarantees, owner rollback, and owner-paid/no-transcript
copy.

This is a copy/readback gap, not a runtime expansion or privacy failure.

## Rehearsed Surfaces

- `/studio/personas/[personaId]` for the hosted replay-alpha owner workspace
- `/personas/station-replay-alpha-persona` signed out
- `/personas/station-replay-alpha-persona` signed in

The rehearsal used the hosted replay owner session. The browser/API harness
recorded only public slugs, booleans, fixture availability, and pass/fail
outcomes; no raw owner, persona, source, file, token, cookie, private source
body, prompt, completion, provider payload, header, IP, or user-agent values
were recorded in this result.

## Blocking Defect

On desktop, `375px`, and `390px`, the owner `Public interaction readback`
section passed the following visible checks:

- public route was live;
- public chat read as `Anonymous alpha available`;
- replay-only policy was visible;
- public-source-only scope was visible as public profile, published public
  documents, and linked public discussions;
- public Salon threads were not named as anonymous chat prompt sources;
- no visitor transcript, identity, or raw events were promised;
- aggregate counters only and owner rollback were visible;
- no broad anonymous availability, public launch, or commercial launch claim
  appeared.

The same visible section failed both required readiness checks:

- no visible `fail-closed` or `rate-limit` readiness copy appeared;
- no visible provider readiness or provider blocker-state copy appeared.

DAEDALUS should make the smallest UI/helper-copy repair so the owner card names
fail-closed rate-limit posture and provider readiness/blocker state without
showing provider payloads, keys, model config, private context, runtime
eligibility changes, or new controls.

## Fixture Gap

Hosted public route discovery found only the replay alpha public persona. No
second ordinary public persona was available for non-replay signed-in-only
owner readback proof.

This is an explicit fixture gap:

```text
no_second_ordinary_public_persona
```

Because a blocking visible owner-readback defect exists, the overall verdict is
`PRODUCT_DEFECT_NEEDS_DAEDALUS`, not
`PASS_READY_TO_CLOSE_WITH_FIXTURE_GAP`.

## Passing Checks

Hosted health and freshness passed:

- web health was ready at `ffb96b0d`;
- API health was ready at `ffb96b0d`.

Replay-alpha owner readback otherwise passed:

- owner workspace loaded on desktop, `375px`, and `390px`;
- public-route, anonymous-alpha, replay-only, public-source-only,
  no-transcript/no-identity/no-raw-events, aggregate-counter, owner-rollback,
  and owner-paid/no-transcript copy rendered;
- public Salon threads were not named as chat prompt sources;
- no public launch, commercial launch, or broad anonymous claims appeared.

Replay-alpha public page no-drift passed:

- signed-out public page still showed `Anonymous alpha`;
- signed-out public chat form remained available for the replay slug;
- public chat copy used public profile, published public documents, and linked
  public discussions only;
- public chat copy did not name public Salon threads as prompt sources;
- signed-in public page did not expose owner/admin eligibility readback,
  owner rollback, aggregate counters, fail-closed posture, or provider readiness
  details.

Privacy and scope passed except for the readiness-copy product defect:

- visible text did not expose UUID-shaped raw ids, billing ids, bearer/JWT
  values, secret-shaped values, signed/storage URLs, private source bodies,
  prompts, completions, provider payloads, stack traces, full transcripts,
  cookies, auth headers, IP addresses, or user-agent values;
- no runtime eligibility expansion, provider/model call change,
  prompt/retrieval change, reporting/moderation change, billing, worker, queue,
  Redis, Cloudflare, connector/OAuth, social dispatch, public launch claim, or
  broad public persona redesign entered the rehearsal.

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted web/API health | Pass | Both services reported ready at app commit `ffb96b0d`. |
| Temporary hosted Playwright rehearsal | Fail - product defect | 3 owner-readback viewport checks failed because visible copy omitted fail-closed rate-limit readiness and provider readiness/blocker state; 3 public/no-drift checks passed; 1 ordinary-public-persona check was skipped for fixture gap. |
| Screenshot review | Fail - product defect | Desktop, `375px`, and `390px` owner screenshots confirmed the missing readiness copy; signed-out public replay screenshot confirmed public chat no-drift. |
| Ordinary public persona fixture discovery | Gap | Public route discovery found only the replay alpha public persona. |
| `git diff --check` | Pass | Whitespace check passed with CRLF normalization warnings only. |

`npm exec` emitted npm warnings about pnpm-only `.npmrc` keys during the
temporary Playwright run; those warnings are already documented as fallback
runner noise and were not validation failures.

## Wakeup

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed the hosted PR490A anonymous chat eligibility readback rehearsal at web/API commit ffb96b0d.
- Replay-alpha owner readback, public route, public-source-only scope, no-transcript/no-identity/no-raw-event copy, owner rollback, public page no-drift, mobile fit, and privacy/scope checks passed.
- Visible owner readback does not name fail-closed rate-limit readiness or provider readiness/blocker state when anonymous alpha is available.
- Hosted data still has no second ordinary public persona for signed-in-only proof.
Verdict:
- PRODUCT_DEFECT_NEEDS_DAEDALUS
Task:
- Route the smallest DAEDALUS copy/readback repair for visible rate-limit/provider readiness, then wake ARIADNE for rerun.
```
