# PR437 Gemini Private Chat Provider Preflight

Run:

`docs/roadmap/PR437_GEMINI_PRIVATE_CHAT_PROVIDER_PREFLIGHT_ARGUS.md`

PR436 proved hosted private replay now fails closed because Railway lacks an
accepted non-NVIDIA private chat route. Local presence-only config has Gemini
and NVIDIA, but not Anthropic, DeepSeek, or OpenAI.

Decide whether Gemini can be accepted as the non-NVIDIA private staging chat
provider for replay testing, or whether MIMIR must ask for Anthropic/DeepSeek/
owner-BYOK config.

Do not implement provider code or run private Gemini chat in this lane. Wake
MIMIR with the verdict.
