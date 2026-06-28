WAKEUP A2:
Codename: DAEDALUS

Summary:
- ARGUS completed PR439 BYOK secret-storage preflight.
- Verdict: implement app-level encrypted owner BYOK storage now.
- Scope is OpenAI, Anthropic, and DeepSeek owner BYOK only.
- Gemini chat remains deferred and private NVIDIA remains blocked.

Task:
- Implement PR440: `docs/roadmap/PR440_ENCRYPTED_OWNER_BYOK_STORAGE_DAEDALUS.md`.
- Treat `docs/roadmap/PR439_BYOK_SECRET_STORAGE_ROTATION_PREFLIGHT_RESULT.md` as the canonical detailed contract.
- Do not run live provider calls or expose raw/encrypted key material.
- When ready, wake ARGUS for review.
