# PR511 - Cross-Owner Encounter Consent / Publication Preflight

Owner: ARGUS / A3

Opened by: MIMIR / A1

Date opened: 2026-07-11

Status:

```text
OPEN_CROSS_OWNER_CONSENT_PUBLICATION_PREFLIGHT
```

## Source

Phase 3 product vision:

`docs/product/Station_Document_3_Future_Vision.md`

Existing encounter boundary work:

- `docs/roadmap/PR472_PERSONA_ENCOUNTER_CONSENT_PROVENANCE_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR507_OWNER_ENCOUNTER_PUBLICATION_BOUNDARY_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR508_OWNER_ENCOUNTER_PUBLIC_EXHIBIT_PREFLIGHT_RESULT.md`;
- `docs/roadmap/PR510B_PUBLIC_ENCOUNTER_EXHIBIT_DISCOVER_SEARCH_HOSTED_PROOF_CLOSEOUT.md`.

## Why This Lane

PR508 through PR510B proved the same-owner metadata-only public exhibit path:

- owner creates a private same-owner encounter artifact;
- owner curates private metadata;
- owner publishes/retracts a metadata-only public exhibit;
- report/takedown works on hosted;
- `/encounters` and Discover search expose only public metadata;
- no public/private drift was found.

The next real Phase 3 obstacle is not another same-owner surface. The product
vision names persona-to-persona encounters between different creators, and also
states that neither creator may publish the other's persona words without
permission. That means cross-owner consent, revocation, audit, deletion, and
readback must be designed before implementation.

This is a preflight lane. Do not implement code here.

## Product Questions

ARGUS should answer:

1. What is the smallest safe next cross-owner encounter lane?
2. Is the first implementation slice a consent/provenance ledger only, or may it
   include a private cross-owner saved artifact?
3. What explicit consents are required from each creator before:
   - a cross-owner encounter can be run;
   - a private cross-owner artifact can be saved;
   - metadata can be shown to either creator;
   - any public exhibit can exist;
   - any generated persona words, excerpt, transcript, or summary can be
     published?
4. What must happen when one creator revokes consent after:
   - invitation but before run;
   - run but before save;
   - save but before publication;
   - publication;
   - moderation removal or report review?
5. What ownership/readback split is safe for each creator?
6. What audit trail is required and who may read it?
7. What deletion/export obligations apply if either creator deletes a persona,
   private artifact, public exhibit, account, Space, or publication?
8. Does same-owner owner-selected excerpt publication need a separate PR before
   cross-owner work, or can the same consent model cover generated-word
   excerpts later?
9. What public route, report, moderation, and takedown rules are mandatory
   before any public cross-owner exhibit can ship?
10. What hosted proof must ARIADNE run after any accepted implementation?

## Candidate Shapes To Evaluate

ARGUS may accept one of these or define a stricter shape:

1. `PR511A - Cross-Owner Encounter Consent Ledger`
   - owner-to-owner invitation/approval/revocation ledger only;
   - no provider call, no runtime, no saved artifact, no public exhibit;
   - owner-only readback for both creators;
   - audit and deletion semantics proven first.
2. `PR511A - Cross-Owner Private Encounter Artifact Consent`
   - consent ledger plus a private saved cross-owner artifact shape;
   - no public route, no transcript publication, no excerpt, no Discover/search
     surfacing;
   - both owners can read bounded provenance and revoke future publication.
3. `PR511A - Same-Owner Excerpt Publication Preflight First`
   - ARGUS may decide generated-word publication needs same-owner excerpt
     semantics before cross-owner consent can be implemented safely.
4. Reject cross-owner work for now and name the concrete blocker plus the
   smallest numbered Phase 3 lane that removes it.

## Hard Guardrails

PR511 must not authorize implementation by itself.

ARGUS should reject or defer any shape that lacks:

- bilateral consent semantics;
- revocation after each lifecycle stage;
- immutable/public-safe provenance labels;
- owner-readable audit trail;
- deletion/export story;
- moderation/report/takedown story;
- clear separation between metadata-only exhibit, excerpt, transcript, summary,
  and generated persona words;
- no raw owner/persona/session ids in public output;
- no private setup, private curation, prompt, provider payload, source body,
  memory/archive/canon/continuity material, SQL detail, stack trace, cookie,
  token, env value, or secret-shaped output;
- public no-drift tests;
- hosted proof requirement before customer-facing closeout.

## Non-Scope

Do not open code in PR511.

Do not authorize:

- cross-owner runtime;
- public cross-owner exhibits;
- owner-selected excerpts;
- transcript publication;
- public summaries of generated persona words;
- forum/community/Salon/Station Press surfacing;
- anonymous participation;
- provider calls;
- retrieval/vector/embedding changes;
- billing, Stripe, storage, social, Redis, Cloudflare, queue/worker, webhook,
  package, lockfile, deployment, or migration work.

Any accepted implementation lane must name its exact file scope, tests, review
gates, hosted proof, and forbidden surfaces.

## Validation

ARGUS should run docs/source scans and any focused local tests needed to confirm
current same-owner public exhibit/search truth before deciding.

Suggested minimum:

```text
npm exec --yes pnpm@10.32.1 -- run test:persona-encounters
npm exec --yes pnpm@10.32.1 -- run test:reports
npm exec --yes pnpm@10.32.1 -- run test:studio-ui
npm exec --yes pnpm@10.32.1 -- run typecheck
git diff --check
git diff --cached --check
```

If ARGUS keeps the preflight docs-only, it may record why code tests were not
rerun, but it must still run scope/secret scans against touched files.

## Result Required

Create:

```text
docs/roadmap/PR511_CROSS_OWNER_ENCOUNTER_CONSENT_PUBLICATION_PREFLIGHT_RESULT.md
```

Include:

- accept/reject verdict;
- exact next lane id and owner if accepted;
- required consent states;
- required revocation states;
- ownership/readback matrix;
- audit/deletion/export requirements;
- publication/excerpt/transcript boundaries;
- moderation/report/takedown requirements;
- allowed files for the next implementation lane;
- required validation;
- hosted proof requirement;
- explicit non-scope;
- final wakeup to MIMIR.

## Wakeup

```text
WAKEUP A3:
Codename: ARGUS

Summary:
- MIMIR closed PR510B as accepted: hosted Discover search proof for same-owner metadata-only public encounter exhibits passed.
- Same-owner exhibit detail, index, report/takedown, and Discover search are now hosted-proven for protected alpha.
- The next customer-facing Phase 3 obstacle is cross-owner consent/publication, because Station's product vision allows persona-to-persona encounters between different creators but requires creator permission before another persona's words can be published.
Task:
- Run PR511 cross-owner encounter consent/publication preflight.
- Decide the smallest safe next numbered lane: consent ledger only, cross-owner private artifact consent, same-owner excerpt preflight first, or a named blocker with the smallest unblock lane.
- Do not implement code in PR511.
- Wake MIMIR with verdict and next owner.
```
