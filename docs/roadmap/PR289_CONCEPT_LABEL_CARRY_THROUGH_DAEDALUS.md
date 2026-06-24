# PR289 - Concept Label Carry-Through

Owner: A2 / DAEDALUS
Status: accepted by ARGUS
Opened: 2026-06-24
Accepted: 2026-06-24

## Purpose

Repair the remaining hosted private persona answer failure after PR288.

PR288 proved the hosted deployment includes PR287 and the answer now uses
selected context enough to recall both invented retrieval phrases. The answer
still failed because it dropped both paired accepted concept labels.

This lane starts after selected-context placement. Keep retrieval, context
assembly, and provider routing closed unless new provider-prompt evidence proves
selected labels are absent from the provider-facing payload.

## Starting Evidence

PR288 hosted proof:

- Web/API were fresh on `main` with PR287 runtime implementation included.
- Replay-owner auth/session and intended private platform replay persona
  selection passed.
- Context preview and latest conversation trace showed Canon, Memory,
  Integrity, Archive, and Continuity context present.
- Sanitized context inspection contained both accepted concept labels and both
  matching invented retrieval phrases.
- Rejected-control evidence stayed absent.
- The chat answer returned HTTP 200, stayed short, avoided raw source-body
  copying, and excluded the rejected control.
- The answer recalled both invented retrieval phrases.
- The answer recalled neither accepted concept label.

## Questions To Answer

1. Do selected concept labels reach the provider-facing final user message in a
   shape that clearly pairs each label with its supporting phrase/fact?
2. Does the current `memory (title): content` focus shape make the title look
   optional while the content looks like the answer?
3. Can provider-facing focus make label/fact pairs explicit without hardcoding
   replay labels, hosted ids, test account details, or staging prompt wording?
4. Should the final provider-facing instruction say that when a selected line
   has a label/title/name, factual answers should include that label with the
   relevant phrase unless the owner explicitly asks otherwise?
5. Can tests prove the label and phrase survive as a pair in the final provider
   message while stored owner messages and traces remain clean?

## Patch Rule

Patch the narrowest concept-label carry-through defect.

Acceptable patch shapes include:

- changing provider selected-context focus lines from parenthetical title
  formatting to explicit paired fields such as selected label/name plus
  supporting fact;
- adding a generic final focus instruction that preserves labels/titles/names
  with their relevant facts for direct factual answers;
- increasing or protecting compact label/title budget only if truncation is
  shown to drop the useful label;
- adding focused route/provider-payload tests proving explicit label/fact pairs
  reach the final provider-facing owner message.

Do not hardcode seeded anchor strings, replay persona names, hosted ids, test
account details, or staging prompt wording. The repair must generalize to any
owner-safe selected context.

If evidence shows selected labels are absent before provider payload assembly,
classify that precisely and wake MIMIR. Do not broaden into retrieval, schema,
seed, import, provider routing, embeddings, Redis, Cloudflare, queue, worker,
billing, Stripe, public UI, or Studio UI work without a new lane.

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

Run or add focused conversation route tests proving:

- selected labels and supporting phrases are paired explicitly in the
  provider-facing final user message;
- stored owner `conversation_messages` remain unchanged;
- trace/session/readiness metadata do not store private selected strings;
- no retry behavior is introduced unless explicitly justified and reviewed.

Run a no-secret added-line hygiene scan before wakeup.

## Result Shape

Create:

```text
docs/roadmap/PR289_CONCEPT_LABEL_CARRY_THROUGH_RESULT.md
```

Record:

- root cause or strongest remaining hypothesis;
- whether provider-facing label/fact pairing was implicated;
- patch summary and whether any label/title budget changed;
- validation commands and results;
- stored-message, trace, and source-copy safety status;
- whether MIMIR should open an ARIADNE PR290 hosted rerun.

## Handoff

Wake ARGUS with:

```text
WAKEUP A3:
Codename: ARGUS
Summary:
- DAEDALUS completed PR289 Concept Label Carry-Through.
- [root cause/hypothesis and patch summary]
Validation:
- [commands and results]
Risk:
- Review label/fact pairing, provider payload wording, stored-message boundary, no hardcoded replay anchors, no scope creep, and no secret/raw-data leakage.
Task:
- Review the patch.
- If accepted, recommend whether MIMIR should open ARIADNE hosted PR290 rerun.
```
