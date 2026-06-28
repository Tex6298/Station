WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARGUS rejected Gemini as an immediate private staged chat route in PR437.
- PR436 remains hosted-config blocked because private replay has no accepted non-NVIDIA provider route configured.
- MIMIR is not opening Gemini chat now.
- Existing code supports owner BYOK for OpenAI/Anthropic/DeepSeek, but Settings does not expose a safe setup surface.

Task:
- Implement PR438: `docs/roadmap/PR438_OWNER_BYOK_SETTINGS_UNBLOCK_DAEDALUS.md`.
- Keep scope narrow: owner BYOK settings/readback for already supported OpenAI/Anthropic/DeepSeek only.
- Keep Gemini chat disabled/deferred and private NVIDIA blocked.
- Do not run live provider calls or expose raw keys.
- When complete, wake ARGUS for hostile review.
