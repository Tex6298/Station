# PR490B - Public Persona Anonymous Chat Readiness Copy Rerun Result

Owner: ARIADNE / A4

Date rehearsed: 2026-07-05

Status: Passed with fixture gap - ready for MIMIR closeout

## Verdict

```text
PASS_READY_TO_CLOSE_WITH_FIXTURE_GAP
```

ARIADNE completed the hosted PR490B rerun after DAEDALUS repaired the visible
readiness-copy defect. Hosted web and API health both reported ready at app
commit `890f9692`, matching the accepted repair target.

The repaired replay-alpha owner readback now visibly names fail-closed
rate-limit posture, rate-limit backing readiness, and provider route readiness
while preserving the existing replay-only/public-source-only/no-transcript
boundaries.

Hosted public route discovery still exposed only the replay alpha public persona,
so non-replay signed-in-only proof remains an explicit fixture gap.

## Rehearsed Surfaces

- `/studio/personas/[personaId]` for the hosted replay-alpha owner workspace
- `/personas/station-replay-alpha-persona` signed out
- `/personas/station-replay-alpha-persona` signed in

The rehearsal used the hosted replay owner session. The browser/API harness
recorded only public slugs, booleans, fixture availability, and pass/fail
outcomes; no raw owner, persona, source, file, token, cookie, private source
body, prompt, completion, provider payload, header, IP, or user-agent values
were recorded in this result.

## Checks

Hosted health and freshness passed:

- web health was ready at `890f9692`;
- API health was ready at `890f9692`.

Replay-alpha owner readback passed on desktop, `375px`, and `390px`:

- public route was live;
- public chat read as `Anonymous alpha available`;
- replay-only anonymous availability remained visible;
- rate-limit copy now says rate limits fail closed and rate-limit backing is
  ready;
- provider copy now says provider route is ready;
- public-source-only chat scope remained public profile, published public
  documents, and linked public discussions;
- public Salon threads were not named as anonymous chat prompt sources;
- no visitor transcript, identity, or raw event storage remained visible;
- aggregate counters only and owner rollback remained visible;
- no broad anonymous availability, public launch, commercial launch, runtime
  expansion, live connector/OAuth, worker/queue, Redis, Cloudflare, billing, or
  social dispatch claim appeared;
- no horizontal overflow, clipped critical copy, or broken readback touch target
  was found in the checked viewports.

Replay-alpha public page no-drift passed:

- signed-out public page still showed `Anonymous alpha`;
- signed-out public chat form remained available for the replay slug;
- public chat copy used public profile, published public documents, and linked
  public discussions only;
- public chat copy did not name public Salon threads as prompt sources;
- signed-in public page did not expose owner/admin eligibility readiness
  readback.

Privacy and scope passed:

- visible text did not expose UUID-shaped raw ids, billing ids, bearer/JWT
  values, secret-shaped values, signed/storage URLs, private source bodies,
  prompts, completions, provider payloads, stack traces, full transcripts,
  cookies, auth headers, IP addresses, or user-agent values;
- no runtime eligibility expansion, provider/model routing change,
  rate-limit behavior change, prompt/retrieval change, reporting/moderation
  change, billing, worker, queue, Redis, Cloudflare, connector/OAuth, social
  dispatch, public launch claim, or broad public persona redesign entered the
  rerun.

## Fixture Gap

Hosted public route discovery found only:

```text
station-replay-alpha-persona
```

No second ordinary public persona was available for non-replay signed-in-only
owner readback proof. This remains:

```text
no_second_ordinary_public_persona
```

## Validation

| Command / check | Result | Notes |
| --- | --- | --- |
| Hosted web/API health | Pass | Both services reported ready at app commit `890f9692`. |
| Temporary hosted Playwright rerun | Pass with fixture gap | 6 checks passed: owner replay-alpha desktop, `375px`, `390px`, signed-out public no-drift, signed-in public no-drift, and explicit fixture-gap check; 1 ordinary-public-persona check skipped because no second fixture exists. |
| Screenshot review | Pass | Desktop, `375px`, and `390px` owner screenshots confirmed repaired readiness copy; signed-out public replay screenshot confirmed public chat no-drift. |
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
- ARIADNE completed the hosted PR490B readiness-copy rerun at web/API commit 890f9692.
- Replay-alpha owner readback now visibly names fail-closed rate-limit posture, rate-limit backing readiness, and provider route readiness on desktop, 375px, and 390px.
- Replay-only anonymous availability, public-source-only chat scope, no transcript/identity/raw-event storage, aggregate counters, owner rollback, public page no-drift, mobile fit, privacy/scope, and no-runtime-expansion checks passed.
- Hosted data still has no second ordinary public persona for signed-in-only proof.
Verdict:
- PASS_READY_TO_CLOSE_WITH_FIXTURE_GAP
Task:
- Close PR490B/PR490A with the fixture caveat or open a separate fixture lane if MIMIR wants non-replay signed-in-only hosted proof.
```
