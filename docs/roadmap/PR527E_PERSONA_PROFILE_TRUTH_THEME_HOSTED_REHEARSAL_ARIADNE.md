# PR527E - Persona Profile Truth And Theme Hosted Rehearsal

Owner: ARIADNE / A4

Opened by: MIMIR / A1

Date opened: 2026-07-15

Status: Open - exact-SHA, zero-product-write human rehearsal

## Purpose

ARGUS accepted the bounded Persona Profile repair as:

```text
ACCEPT_PR527E_PERSONA_PROFILE_TRUTH_THEME_REPAIR_WITH_ARGUS_PATCH
```

Run the final human-eye rehearsal against hosted Station. This is the last
PR527E acceptance gate: prove that the deployed owner route tells the truth,
the corrected semantic presentation survives real themes and narrow screens,
and navigation is usable without activating any product mutation.

This is not an avatar, anonymous-chat, handoff, Integrity, architecture,
deletion, lifecycle, or data-creation exercise. The four locally accepted
mutation forms remain deliberately unexercised on hosted product data.

## Locked Runtime

Accepted review SHA:

```text
3e6331c3f8b2c91b3667a445873a78561a087901
```

Before opening the product route, confirm Railway web and API are `200`, ready,
on `main`, and report the same full deployed SHA containing that accepted
review. A later docs/agent-receipt-only descendant is acceptable only after
proving there is no runtime-path drift from the accepted SHA. Wait through a
rolling deployment. Stop and wake MIMIR on mismatched services, runtime drift,
or an unhealthy service.

Record the exact deployed SHA and the ancestry/no-runtime-drift result without
recording environment values, headers, tokens, cookies, or private identity.

## Human-Eye Routes

Use the existing staging replay owner and existing `Station Replay Persona`.
Travel through visible Station navigation as a person would. Do not paste
private ids into browser routes and do not manufacture empty, malformed, or
failure states in hosted data.

### Signed-out boundary

In a clean signed-out context, open the protected Persona Profile destination.
It must redirect or fail closed without exposing owner name, descriptions,
provider details, continuity counts, architecture, graph, lifecycle,
Integrity, archive material, controls, or raw error detail.

### Existing owner profile

In the replay-owner context, enter Studio, select the existing persona, and
open Profile. Confirm:

1. The route identifies the exact selected owner persona and does not flash a
   previous persona or owner control while loading.
2. The header and static facts truthfully present name, short and long
   description, provider, visibility, public-chat state, and public
   description. Static facts must not look editable.
3. Only the three intended live capability areas are presented as commands:
   avatar URL set/clear, eligible anonymous public chat toggle, and context
   handoff creation. There is no delete command or broader persona editor.
4. Architecture, relationship graph, Archive/Continuity, lifecycle/handoff,
   and Integrity show their existing successful readbacks independently.
   One panel must not imply that another loaded or is empty.
5. No private implementation detail or raw API error appears.

Do not type into any live field, change a toggle, submit a handoff, start an
Integrity session, or activate any save/clear/delete command.

### Navigation rehearsal

Follow each visible destination and return to Profile after each one:

- Back to chat;
- Open Memory;
- Open Canon;
- Open Archive;
- Open Continuity; and
- Open Integrity.

Each command must reach the intended owner route, retain the same persona
context, and perform no mutation. Confirm keyboard focus remains visible and
the route can be completed with ordinary keyboard navigation.

## Appearance Matrix

Run the owner Profile in each appearance at each viewport:

| Appearance | Desktop | Mobile A | Mobile B |
| --- | --- | --- | --- |
| System | `1440x900` | `390x844` | `375x812` |
| Light | `1440x900` | `390x844` | `375x812` |
| Dark | `1440x900` | `390x844` | `375x812` |

At all nine combinations inspect with human eyes and measured browser evidence:

- heading, body, muted, status, link, and control text remain readable;
- normal text meets `4.5:1` and meaningful control boundaries meet `3:1`;
- primary and secondary hover, explicit focus, and disabled state remain
  distinguishable without opacity being the only signal;
- long descriptions, lifecycle/handoff text, relationships, timestamps, and
  supporting rows wrap instead of widening the page;
- pending-capable commands have stable geometry at rest and no label or text
  is clipped;
- the desktop composition becomes one coherent column on narrow screens;
- navigation, controls, status copy, and mobile chrome do not overlap; and
- horizontal page overflow, clipped route containers, and panel overlap are
  all zero.

Do not trigger a pending state to test it on hosted Station. Inspect its stable
resting geometry and rely on the accepted local intercepted proof for mutation
state transitions.

## Diagnostics And No-Write Gate

During the whole rehearsal require:

- zero page errors;
- zero unclassified console errors;
- zero failed product responses in the accepted happy path;
- zero unknown API calls; and
- zero non-GET product requests.

Specifically assert there was no avatar `PATCH`, anonymous-chat `PATCH`,
handoff `POST`, Integrity start, architecture `PATCH`, persona `DELETE`, direct
database write, RPC mutation, auth mutation, migration, seed, cleanup, tier or
billing change, or any other hosted product write.

Do not change source, tests, configuration, packages, lockfiles, hosted data,
or product copy. Screenshots may be used transiently for inspection but must
not retain private material or be committed.

## Result

Create:

`docs/roadmap/PR527E_PERSONA_PROFILE_TRUTH_THEME_HOSTED_REHEARSAL_RESULT.md`

Record exact pass/fail for deployment identity, signed-out protection, owner
truth, three live capability presentations, independent successful readbacks,
absence of delete/broader edit, all six navigation destinations, keyboard
focus, the nine appearance/viewport cases, contrast, wrapping, geometry,
diagnostics, and zero-write scope. Distinguish a product defect from missing
rehearsal evidence. Do not include private ids, identities, raw responses,
cookies, tokens, credentials, or private screenshots.

Allowed committed paths:

```text
docs/roadmap/PR527E_PERSONA_PROFILE_TRUTH_THEME_HOSTED_REHEARSAL_RESULT.md
docs/roadmap/ACTIVE_STATUS.md
docs/roadmap/LANE_INDEX.md
docs/testing/VALIDATION_BASELINE.md
.station-agents/state/ARIADNE.json
```

Commit and push the result, then wake MIMIR explicitly:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARIADNE completed PR527E's exact-SHA, zero-product-write Persona Profile human rehearsal.
Verdict:
- PASS or BLOCK with the exact route, state, appearance, or diagnostic failure.
Task:
- Close PR527E on a complete pass; otherwise open only the smallest evidenced correction. Continue the ranked PR527 programme with Settings persistence truth next.
```
