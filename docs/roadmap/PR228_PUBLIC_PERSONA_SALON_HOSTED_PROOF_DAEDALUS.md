# PR228 - Public Persona Salon Hosted Proof

Owner: DAEDALUS
Reviewer: MIMIR
Status: Open
Opened: 2026-06-24

## Frame

PR227 is accepted by ARGUS. It adds public persona context-preview readback for
bounded `public_salon_thread` sources and a `publicSalonThreads` count.

Before ARIADNE rehearses the human route, prove hosted Railway and hosted
Supabase can actually exercise the feature with a real public persona and a
real public Salon thread. PR221 intentionally did not create persona-linked
Salon threads, so do not assume the staging data already exists.

This is hosted proof and bounded seed preparation only.

## Target

Hosted Railway:

```text
https://stationweb-production.up.railway.app
```

Expected app commit:

```text
e58a5e4
```

or any later commit containing ARGUS' PR227 patch.

Expected existing public persona:

```text
station-replay-alpha-persona
```

Expected existing public Salon:

```text
station-replay-salon-alpha
```

Expected bounded proof thread title:

```text
[replay:staging-salon-alpha] Persona-linked Salon readback proof
```

Use a harmless public body phrase such as:

```text
Public proof thread for Station persona Salon readback. The bounded public
anchor is cobalt salon lantern.
```

Do not use private memory/archive/canon/continuity phrases in the proof thread.

## Required Work

1. Deployment freshness
   - Confirm web and API `/health/deployment` are fresh enough to include
     `e58a5e4` or later.
   - If Railway is still deploying, wait and recheck.
   - If deployment stays stale, wake MIMIR with the exact web/API commits.

2. Existing hosted seed checks
   - Confirm anonymous public readback for
     `/personas/public/station-replay-alpha-persona`.
   - Confirm anonymous public Salon category/readback for
     `/forums/subcommunities/station-replay-salon-alpha`.
   - Confirm the public persona has a safe non-UUID public slug and the Salon
     has a safe non-UUID forum category route.

3. Create or reuse the bounded persona-linked Salon thread
   - Prefer existing API routes as the replay owner.
   - Sign in with the replay owner credentials from local env without printing
     secrets.
   - Get the replay public persona id from owner `/personas` readback.
   - Get the Salon category id from public `/forums/subcommunities` or
     `/forums/categories` readback.
   - If a thread with the expected title already exists in the Salon category,
     reuse it.
   - Otherwise create one public thread in the Salon category with
     `linkedPersonaId` set to the replay public persona id.
   - Do not link a document to this proof thread; PR227 intentionally excludes
     document-linked threads from the Salon source path.

4. Public readback proof
   - Call anonymous
     `/personas/public/station-replay-alpha-persona/context-preview?query=cobalt%20salon%20lantern`.
   - Prove the response includes:
     - `preview.counts.publicSalonThreads >= 1`;
     - one `public_salon_thread` source;
     - href `/forums/station-replay-salon-alpha/<threadId>` or equivalent
       existing safe forum thread route;
     - label/copy that makes this public Salon discussion, not private memory
       or live chat.
   - Prove the response does not include owner ids, raw persona ids,
     linked private ids, subcommunity ids, category ids, report internals,
     provider traces, prompts, private memory/archive/canon/continuity/
     integrity text, SQL details, tokens, service keys, or raw env values.

5. No widening
   - Do not add repo code unless hosted proof finds a real defect.
   - Do not add new Salon routes, community-visible Salon readback, live rooms,
     provider calls, public event feeds, Redis/Cloudflare, billing, queues,
     workers, notifications, auth/session changes, moderation role changes, or
     broad UI changes.
   - Do not mutate report states, private archive data, memory, canon,
     continuity, integrity, or provider settings.

## Validation

If no repo code changes are needed:

```text
git diff --check
git diff --cached --check
```

If any repo code changes are needed, also rerun the relevant local suites from
PR227:

```text
npm exec --yes pnpm@10.32.1 -- run test:personas
npm exec --yes pnpm@10.32.1 -- run test:writing
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
```

Run `test:community` only if forum helpers, category serializers, Salon
visibility helpers, or thread routing behavior change.

## Output

Return one of:

```text
PROVED
REPAIRED AND PROVED
BLOCKED: stale deployment
BLOCKED: missing hosted seed
BLOCKED: hosted auth/API permission
BLOCKED: hosted schema/config permission
```

Include:

- deployment commit readback for web and API;
- whether the proof thread was reused or created;
- sanitized API routes checked;
- public readback fields observed;
- explicit leak scan result;
- whether ARIADNE should rehearse next.

## Wakeup

When done, wake MIMIR:

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- DAEDALUS completed PR228 Public Persona Salon Hosted Proof.
Result:
- PROVED / REPAIRED AND PROVED / BLOCKED.
Hosted proof:
- <deployment commit, seed reused/created, context-preview result>
Recommendation:
- Open ARIADNE hosted human rehearsal / repair / pause.
Task:
- Decide the next lane and wake the right agent.
```
