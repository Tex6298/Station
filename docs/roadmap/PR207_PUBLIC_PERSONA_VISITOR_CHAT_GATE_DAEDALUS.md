# PR207 Public Persona Visitor Chat Gate - DAEDALUS

Date opened: 2026-06-24
Agent: A2 / DAEDALUS
Opened by: A1 / MIMIR
Status: open

## Frame

PR206 proved the final pre-chat source catalog: public persona profile,
published public documents, and linked public discussion sources can be shown
through an anonymous, read-only preview without private runtime context.

The next Phase 3 bridge step is bounded visitor interaction. Do not implement
public chat by improvising inside the private conversation route. PR207 is the
design and contract gate that decides the smallest safe implementation slice
for public persona visitor chat.

The output should be concrete enough that PR208 can be an implementation PR,
not another round of vague planning.

## Target

Produce a repo-grounded implementation packet for bounded public persona
visitor chat alpha.

Inspect the current code paths for:

- private persona chat and provider routing;
- public persona readback and context preview;
- public document/discussion route safety;
- report/moderation routes;
- operational cache/rate-limit helpers;
- token/usage/trace posture.

Then document the exact first implementation slice and the tests ARGUS should
hold it to.

## Required Decisions

Answer these from repo context, not speculation:

1. Public interaction enablement
   - What server-side owner opt-in or disable control is required before any
     public persona can answer visitors?
   - Is a new persona field/migration required?
   - What is the safe default for existing public personas?

2. Visitor identity and rate limits
   - Is PR208 anonymous, signed-in visitor, or both?
   - What keying should protect public chat without storing secrets or raw IPs?
   - Should existing operational cache/rate-limit helpers be reused?
   - What happens when cache/rate-limit infrastructure is unavailable?

3. Message and response boundaries
   - Maximum visitor message length.
   - Maximum response/token budget.
   - Maximum public sources included from PR206.
   - Whether the route is streaming, non-streaming, or non-streaming first.

4. Provider posture
   - Which existing provider router path is appropriate for alpha?
   - How should NVIDIA/platform chat fit without hardcoding one future model?
   - What exactly may be sent to the provider?
   - What must never be sent: private memory, archive, canon, continuity,
     integrity, owner profile, setup prompts, style notes, provider settings,
     private traces, secrets, or raw owner ids.

5. Transcript and retention policy
   - Should PR208 store no transcript, a minimized transcript, or a reportable
     interaction record?
   - How does that affect export/deletion/audit expectations?
   - If storage is needed, name the migration/table shape and minimized fields.

6. Reporting and moderation
   - Can existing `/reports` cover public persona interaction reports, or does
     PR208 need a separate target shape?
   - Who may report: anonymous visitors, signed-in visitors, or both?
   - What report payload is safe without leaking prompts/provider responses or
     private context?
   - What owner/admin readback is required for the alpha?

7. Owner and public UI
   - What is the smallest owner control/readback needed before enabling public
     chat?
   - What should the public persona page show when chat is disabled,
     rate-limited, provider-unavailable, or report-submitted?
   - How does the UI avoid promising private companion memory when only public
     sources are allowed?

## Hard Boundaries

Do not implement public visitor chat in PR207 unless MIMIR explicitly reopens
scope. Do not add:

- provider/model calls;
- streaming chat;
- visitor transcript tables;
- migrations;
- public chat UI controls;
- owner toggles;
- Redis/Cloudflare architecture;
- analytics;
- billing;
- broad public-site redesign.

This is a design gate. It may patch docs only. If a tiny test/helper change is
needed to prove an inventory fact, keep it narrow and say why.

## Deliverable

Update this file with:

- route/API proposal;
- schema/migration proposal, if needed;
- provider request-shape proposal;
- rate-limit/cache proposal;
- reporting/moderation proposal;
- UI states;
- privacy and deletion/export posture;
- recommended PR208 title and smallest implementation scope;
- exact validation commands for PR208;
- unresolved questions, if any, with a recommended answer for each.

Also update `docs/roadmap/ACTIVE_STATUS.md` with the PR207 result.

## Suggested PR208 Shape

DAEDALUS should confirm or correct this, but MIMIR's starting preference is:

- Server-side public interaction enablement defaults off for existing public
  personas.
- First public chat is non-streaming.
- First provider context uses only PR206 public source catalog plus the public
  persona profile.
- First transcript posture is no durable raw transcript unless the report/
  moderation design proves a minimized interaction record is necessary.
- Rate limit is enforced before provider calls.
- Provider-unavailable and rate-limited states are first-class responses, not
  generic failures.

## Wakeup

When the gate packet is ready, wake ARGUS:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR207 public persona visitor chat gate.
Risk:
- PR208 may be the first public provider-call path for persona interaction.
Task:
- Review owner opt-in, visitor identity/rate-limit posture, provider request
  shape, transcript/reporting policy, UI states, and PR208 scope. Wake MIMIR
  with accept/patch verdict.
```
