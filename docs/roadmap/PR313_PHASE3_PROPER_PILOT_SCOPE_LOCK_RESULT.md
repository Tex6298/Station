# PR313 - Phase 3 Proper Pilot Scope Lock Result

Owner: ARGUS
Date: 2026-06-25
Status: SCOPE LOCKED WITH GATES

## Verdict

ARGUS locks the first Phase 3 proper pilot axis as:

```text
public persona / public interaction expansion
```

Verdict: `SCOPE LOCKED WITH GATES`.

This does not open DAEDALUS implementation. The safest next move is a hosted
ARIADNE rehearsal of the already-accepted public persona interaction chain,
through one invited signed-in non-owner tester and the replay owner. MIMIR must
open that lane if it accepts this scope lock.

Marty input is not needed for this internal hosted pilot rehearsal. Marty input
is required before external public launch, commercial packaging, partner claims,
or a named real-world pilot outside the replay/test account boundary.

## Pilot Audience

The pilot audience is:

- one invited signed-in non-owner tester account; and
- the replay owner reviewing owner-only public interaction readback afterward.

This is not anonymous public launch and not partner/commercial rollout.

## Single Success Metric

The pilot passes only if a fresh hosted deployment proves this complete chain:

```text
signed-in non-owner tester discovers an eligible public persona,
opens the public persona page,
uses exactly one enabled public-source-only chat interaction or safe report path,
and the replay owner can verify owner-only aggregate/readback afterward,
with no private Memory, Archive, Continuity, Canon, Integrity, owner setup,
provider configuration, raw ids, credentials, prompts, provider payloads,
private source bodies, or visitor identity leakage.
```

If any part requires new product code, MIMIR should stop the rehearsal result
and route the smallest concrete defect through ARGUS or DAEDALUS.

## Allowed Surfaces

Allowed for the next proof lane:

- public front door and Discover;
- public Space and public document/discussion paths only as discovery context;
- public persona route for the accepted public replay persona;
- public persona context preview/readback;
- signed-in public persona chat alpha when already enabled for the seed persona;
- public persona report path;
- owner Studio persona readback for public route/chat/report/activity state;
- aggregate-only public persona interaction counters;
- web/API `/health` and `/health/deployment` freshness checks;
- docs that record sanitized hosted evidence.

## Prohibited Surfaces

Not allowed in the next proof lane:

- anonymous public chat;
- new public persona provider behavior;
- new public Project, institutional/research, Developer Space partner, billing,
  commercial, or pricing work;
- new data retention, visitor transcript storage, owner-visible visitor
  identity, or transcript analytics;
- Memory, Archive, Continuity, Canon, Integrity, owner setup, BYOK/provider
  settings, private Studio, private search, import/export, or billing mutation;
- Redis, Cloudflare, provider/model, embedding, worker, queue, scheduled job,
  export/download, or cache architecture work;
- broad UI redesign or public launch copy.

## Private-Data Boundary

The pilot must not expose:

- private Memory, Archive, Canon, Continuity, Integrity, owner notes, owner
  setup fields, style prompts, awakening prompts, private documents, private
  Space links, chat history, export package data, or source bodies;
- owner ids, raw persona ids, reporter ids, visitor ids, trace ids, source ids,
  storage paths, database row ids, billing identifiers, Stripe objects, cookies,
  tokens, credentials, env values, SQL, provider request/response payloads, or
  secret-shaped values;
- visitor prompt/message bodies or assistant responses in owner readback,
  reports, analytics, or logs beyond the immediate public chat response seen by
  that signed-in tester.

## Next Owner Recommendation

Wake target after PR313 acceptance:

```text
MIMIR should open PR314 for ARIADNE.
```

Recommended lane:

```text
PR314 - Phase 3 Public Persona Interaction Pilot Rehearsal
Owner: ARIADNE
Type: hosted/browser evidence only
```

ARIADNE should not mutate data except for the one public chat/report interaction
explicitly required by the rehearsal. If the public chat seed is disabled or
missing, ARIADNE should wake MIMIR with `BLOCKED: missing enabled public persona
pilot seed`.

## Local Validation Before Code

PR313 itself is docs-only:

- `git diff --check`
- `git diff --cached --check`
- added-line hygiene scan

If PR314 finds a code defect and MIMIR routes a DAEDALUS repair, the expected
starting validation is:

- `npm exec --yes pnpm@10.32.1 -- run test:personas`
- `npm exec --yes pnpm@10.32.1 -- run test:reports`
- `npm exec --yes pnpm@10.32.1 -- run test:spaces`
- `npm exec --yes pnpm@10.32.1 -- run test:writing`
- `npm exec --yes pnpm@10.32.1 -- run test:document-discussions`
- `npm exec --yes pnpm@10.32.1 -- run typecheck`
- `npm exec --yes pnpm@10.32.1 -- run lint`
- `git diff --check`
- `git diff --cached --check`

## Hosted Proof Requirement

PR314 must prove, with sanitized hosted/browser evidence:

- web/API deployment freshness and readiness;
- the public persona pilot seed is eligible, public, safe-slugged, and public
  chat enabled;
- signed-out readback remains public-safe;
- signed-in non-owner chat/report path works or fails safely with explicit
  public-safe copy;
- public-source-only answer framing;
- no durable transcript or owner-visible visitor identity claim;
- owner replay account can see owner-only public interaction readback and
  aggregate counters after the interaction;
- desktop and narrow mobile fit;
- no private data leakage in owner or public routes.

## Other Axes

| Axis | Classification |
| --- | --- |
| Public Project or institutional/research expansion | Paused until Marty names a product/audience promise; current readback evidence is not enough to choose this over public persona interaction. |
| Partner / Developer Space pilot readiness | Paused until Marty names a partner or pilot objective. Developer Space Tier 1 remains protected-alpha closed, not partner-launched. |
| Billing, entitlement, commercial packaging | Blocked on Marty product/commercial decision before any implementation. |
| Hosted data/account/config | Available as proof inputs; each future pilot still needs fresh hosted identity/readiness checks. |
| Cloudflare, Redis, provider/model, embedding, worker, queue, export infrastructure | Future-only until a concrete pilot dependency or hosted blocker appears. |

## Must Remain Paused

- anonymous public visitor chat;
- persona-to-persona encounters;
- voice/avatar mode;
- public Project/institutional/research expansion;
- partner adapter work or real partner outreach;
- commercial packaging, live-money billing, entitlement changes, or pricing;
- Redis as canonical Memory truth;
- Cloudflare retrieval/index mirrors;
- provider/model/embedding swaps;
- queues, workers, scheduled jobs, and export/download infrastructure;
- broad UI reskin, dashboard rewrite, private search expansion, or new import
  surfaces.

## Wakeup

ARGUS wakes MIMIR with `SCOPE LOCKED WITH GATES`.

Recommended next action: open PR314 for ARIADNE as the hosted/browser public
persona interaction pilot rehearsal described above.
