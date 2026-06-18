# PR36 - Launch-Core Human Rehearsal

Date: 2026-06-18
Status: opened for ARIADNE
Owner: ARIADNE runs the human rehearsal first. DAEDALUS fixes exact defects if
ARIADNE wakes A2. ARGUS reviews code fixes if any. MIMIR closes or resequences.

## Purpose

After PR31-PR35 hardened chat runtime budget, streaming envelope, continuity
context, topology budget, and provider route metadata, Station needs a human-eye
launch-core rehearsal against the current Railway staging app.

This is not an invitation to add more architecture. It is a pass/fail rehearsal
of whether the launch-core journey works well enough, what exact defects remain,
and whether any remaining gap genuinely triggers Cloudflare/NESTstyle memory
work instead of normal Station/Supabase/Gemini follow-up.

Primary staging URL:

```text
https://stationweb-production.up.railway.app
```

## ARIADNE Task

Run the current live staging app as a human user. Use the replay/staging account
available in the environment without printing credentials.

Rehearse the launch-core sufficient path:

1. choose an onboarding path;
2. create or import a persona;
3. chat with context assembled from Canon, Memory, recent turns, and Integrity
   output;
4. archive a chat;
5. review and accept/edit/reject Memory and Canon candidates;
6. search the private archive;
7. export data;
8. publish a private draft as a labelled public document;
9. display that document on a public Space;
10. discuss it in the forum under correct visibility rules;
11. use Station Assistant to understand and operate the above.

Also check:

- desktop and 375-390px mobile usability for the touched path;
- auth persistence after refresh and normal navigation;
- public chain: `/` to `/discover` to public Space to public document to linked
  forum discussion;
- Continuity as a reachable stop, not only runtime-context counts;
- whether Archive import/source states are still too thin for a demo;
- whether Developer Space still has live state but weak methodology/field-log
  storytelling;
- whether any button/control appears live but does nothing;
- whether any route leaks private context, debug data, raw provider payloads, or
  route metadata to the wrong surface.

## Cloudflare Trigger Check

Do not ask Marty for Cloudflare config during this rehearsal.

Record only whether the current launch-core path actually needs a live
Cloudflare lane. The default expected answer is still "not yet" unless ARIADNE
finds a concrete retrieval, latency, public-edge, or NESTstyle-memory defect
that current Station/Supabase/Gemini behavior cannot reasonably cover.

If ARIADNE believes Cloudflare is now needed, the result must name:

- the exact user-facing failure;
- the route and action that exposes it;
- why Supabase/Gemini/current runtime context is insufficient;
- whether the first Cloudflare target should be public/Discover retrieval,
  private Studio retrieval, or prototype-only.

## Non-Scope

- Do not redesign the site broadly in this rehearsal.
- Do not add Cloudflare, Redis/Valkey memory, provider streaming, embedding
  migration, model marketplace UI, or BYOK secret storage.
- Do not print credentials, cookies, tokens, private prompts, private archive
  text, provider keys, raw provider payloads, or screenshots containing secrets.
- Do not leave work asleep if a defect is found.

## Required Handoff

ARIADNE must wake the next agent.

If there are code/product defects that block launch-core rehearsal, wake
DAEDALUS with:

- exact route;
- viewport;
- account role;
- clicked control or action;
- expected behavior;
- actual behavior;
- screenshot path or concise visual description;
- whether it is blocker, sharp edge, or polish;
- the narrowest recommended fix.

If there are no code blockers, wake MIMIR with:

- pass/fail verdict;
- remaining caveats;
- launch-core readiness recommendation;
- whether Cloudflare remains deferred;
- whether DAEDALUS or ARGUS is needed next.

## Validation Artifacts

ARIADNE should create or update:

```text
docs/roadmap/PR36_LAUNCH_CORE_HUMAN_REHEARSAL_ARIADNE.md
```

If ARIADNE makes any local docs-only notes, run:

```bash
git diff --check
```
