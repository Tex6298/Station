# PR285 - Answer Label Preservation Repair

Owner: A2 / DAEDALUS
Status: accepted by ARGUS
Opened: 2026-06-24
Accepted: 2026-06-24

## Purpose

Repair the remaining hosted private persona answer failure after PR284.

PR284 proved that PR283 moved the system in the right direction: hosted context
contained the full two-anchor set, and the single chat answer recalled both
invented retrieval phrases. The failure is now narrower. The answer did not
preserve the paired accepted anchor concept labels.

This lane starts after selected context exists and after the final answer-focus
guard. Do not reopen retrieval, embeddings, provider routing, schema, seeds, or
imports unless new evidence proves selected context is absent from provider
prompt delivery.

## Starting Evidence

PR284 hosted proof:

- Web/API were fresh on `main` with PR283 implementation commit `8783a02b`.
- Replay-owner auth/session and intended private platform replay persona
  selection passed.
- Context preview and latest conversation trace showed the full two-anchor set.
- Rejected-control evidence stayed absent.
- The chat answer returned HTTP 200, stayed short, avoided raw source-body
  copying, and excluded the rejected control.
- The answer recalled both invented retrieval phrases.
- The answer recalled neither accepted anchor concept label.

## Questions To Answer

1. Does private answer focus include selected source titles, labels, concept
   labels, or only compacted source text?
2. Are the accepted concept labels present in selected context metadata,
   source titles, or source strings before answer-focus construction?
3. Does the current string-array prompt API discard useful source labels before
   the final focus block is built?
4. Can the repair preserve paired labels and phrases generically, without
   hardcoding replay persona names, hosted ids, seeded labels, or staging prompt
   text?
5. Does the repair keep rejected-control exclusion, source-copy safety, prompt
   injection boundaries, and private-data hygiene intact?

## Patch Rule

Patch the narrowest label-preservation defect.

Preferred patch shapes:

- include selected source titles or labels in the final answer-focus lines when
  that metadata is already available;
- preserve paired label/content facts in private runtime context formatting
  before the prompt builder compacts them;
- extend the prompt input shape narrowly if the existing string arrays are the
  reason source labels are being discarded;
- add focused tests proving selected labels and phrases both reach the
  provider-facing private prompt.

The repair must be generic. Do not hardcode seeded anchor strings, replay
persona text, hosted ids, test account details, or staging prompt wording.

If the selected concept labels are not available anywhere before provider
payload assembly, classify that as the result and wake MIMIR. Do not broaden
into schema, seed, import, or retrieval work without a new lane.

## Non-Scope

Do not change:

- retrieval selection, vector/lexical ranking, embeddings, provider routing, or
  model choice;
- database schema, migrations, seeds, imports, Redis, Cloudflare, queues, or
  workers;
- billing, Stripe, public UI, Studio UI, or human-demo flows;
- the full two-anchor recall acceptance bar.

Do not commit raw prompts, completions, provider payloads, hosted logs, SQL,
private source bodies, raw ids, credentials, cookies, or tokens.

## Required Validation

Run the smallest relevant set, and broaden if the patch touches more layers:

```bash
npm exec --yes pnpm@10.32.1 -- run test:retrieval-metadata
npm exec --yes pnpm@10.32.1 -- run test:persona-context
npm exec --yes pnpm@10.32.1 -- run test:conversation-archive
npm exec --yes pnpm@10.32.1 -- run test:replay-readiness
npm exec --yes pnpm@10.32.1 -- run typecheck
npm exec --yes pnpm@10.32.1 -- run lint
git diff --check
git diff --cached --check
```

If the prompt input shape or private context builder changes, add focused tests
that prove selected source labels/titles and selected source text both survive
into the private provider-facing prompt.

Run a no-secret added-line hygiene scan before wakeup.

## Result Shape

Create:

```text
docs/roadmap/PR285_ANSWER_LABEL_PRESERVATION_REPAIR_RESULT.md
```

Record:

- root cause or strongest remaining hypothesis;
- where selected labels were lost or preserved;
- patch summary and whether prompt input shape changed;
- proof that labels and phrases both reach the provider-facing private prompt;
- rejected-control/source-copy/prompt-injection safety status;
- validation commands and results;
- whether MIMIR should open an ARIADNE PR286 hosted rerun.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR285 Answer Label Preservation Repair.
- [root cause/hypothesis and patch summary]
Validation:
- [commands and results]
Risk:
- Review prompt-boundary safety, label/source preservation, no hardcoded replay anchors, no scope creep, and no secret/raw-data leakage.
Task:
- Review the patch.
- If accepted, recommend whether MIMIR should open ARIADNE hosted PR286 rerun.
```
