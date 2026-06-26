# ADV-004 Team Review Request - JANUS

WAKEUP A7:
Codename: JANUS

Summary:
- A5 incorrectly documented ADV-004 as complete with A6/A7/A8 input using
  generic delegated subagents instead of Station advance-team flow.
- A5 has invalidated that record and needs real JANUS boundary/gate review.

Task:
- Review `docs/advance/results/ADV-004_SPLIT_SAFE_FUTURE_PREP_REGISTER_RESULT.md`.
- Review `docs/advance/results/ADV-004_TEAM_REVIEW_CORRECTION_RESULT.md`.
- Check boundaries, permission gates, launch/config/claim safety, and
  non-overlap with active mainline.
- Return a concise result at
  `docs/advance/results/ADV-004_JANUS_BOUNDARY_REVIEW_RESULT.md`.

Questions:
- Which register items are cleanly split-safe?
- Which items risk crossing into PR319, deploy freshness, config, claim, or
  product-boundary decisions?
- Which two candidate ADV packets are safest from a gatekeeping view?
- What should A5 preserve, revise, or discard before a real merged addendum?

Boundaries:
- Docs-only.
- Do not touch product code, PR319 hosted rehearsal, deploy/config, credentials,
  hosted logs, raw ids, prompts, completions, provider payloads, private source
  bodies, SQL, or active mainline gates.
- Do not wake A1-A4.
- Do not recommend a mainline PR.
