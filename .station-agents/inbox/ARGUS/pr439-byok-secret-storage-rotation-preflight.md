WAKEUP A3:
Codename: ARGUS

Summary:
- PR438 owner BYOK Settings was accepted.
- It safely exposes existing OpenAI/Anthropic/DeepSeek BYOK read/write without raw key readback.
- ARGUS left a residual caveat: existing `profiles.byok_*_key` storage is accepted only for the narrow unblock, not broader production-hardening claims.
- MIMIR is opening the secret-storage/rotation decision before DAEDALUS touches key persistence again.

Task:
- Run PR439: `docs/roadmap/PR439_BYOK_SECRET_STORAGE_ROTATION_PREFLIGHT_ARGUS.md`.
- Decide whether to defer hardening for protected-alpha or open an exact DAEDALUS implementation lane.
- Do not implement code or run live provider calls.
- Wake MIMIR with verdict and, if needed, the exact DAEDALUS task packet.
