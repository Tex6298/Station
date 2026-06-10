# Free embeddings decision

Date: 2026-06-10

Status: ARGUS recommendation for MIMIR. This is not a provider switch.

## Verdict

No production-safe free embedding route is ready for Station replay/staging now.

Keep the active retrieval lane on OpenAI `text-embedding-3-small` over Supabase
pgvector `vector(1536)`, and keep NVIDIA on chat only. Gemini remains the
closest future free-trial candidate because Station already has dormant prep for
1536-dimensional Gemini rows, but it should not be enabled until MIMIR opens and
accepts a separate migration/reindex/hostile-smoke lane.

## Provider comparison

| Candidate | Free shape | Fit for Station now | Recommendation |
| --- | --- | --- | --- |
| Gemini embeddings | Google lists Gemini Embedding 2 and Gemini Embedding on free and paid tiers. Free-tier rows are marked as used to improve Google products; rate limits vary by project/tier and are checked in AI Studio. | Best technical fit of the free options because it can output 1536-dimensional vectors and the repo now has dormant provider metadata/RPC prep. Not safe for private replay until data-policy, migration `029`, reindex, and hostile retrieval smoke are accepted. | Defer. Treat as the first candidate for a later ablated embedding lane, not the active replay lane. |
| Cloudflare Workers AI + Vectorize | Workers AI has a daily free allocation, and Vectorize has a free prototyping tier. | Requires Cloudflare account/setup, a Workers AI embedding adapter, Vectorize or Supabase write path decisions, deletion/export/reindex semantics, and hostile owner-scope review. It is a new platform lane, not minimum config. | Defer. Useful later if Cloudflare is chosen as a remote mirror/index layer. |
| Hugging Face Inference Providers | Hugging Face gives small monthly free credits for routed inference. | Too small and provider-routed for dependable staging replay; would add another key/provider/reliability lane without solving Station's current privacy/reindex gates. | Reject for current replay. Reconsider only for experiments. |
| Local/Ollama embeddings | No hosted per-token cost. | Not production-safe on current Railway staging without GPU/hosted model operations, model/version pinning, uptime, and reindex gates. | Reject for current replay. Could be local-dev only later. |
| Existing OpenAI default | Not free. | Already matches current schema, tests, RPCs, and fallback behavior. It is the least risky path for replay evidence. | Keep active. Configure key or explicitly waive remote vector proof. |

## Minimum safe config if MIMIR later opens Gemini

Do not apply this in the current replay lane. If MIMIR later opens the Gemini
ablation lane, the minimum scope is:

1. Apply migration `029_gemini_embedding_provider_prep.sql` to staging.
2. Set only the embedding provider envs needed for the test lane:
   - `EMBEDDINGS_PROVIDER=gemini`
   - `EMBEDDING_MODEL=gemini-embedding-2`
   - `EMBEDDING_DIM=1536`
   - `GEMINI_API_KEY` or `GOOGLE_API_KEY`
3. Reindex a bounded replay corpus into Gemini rows with
   `embedding_provider='gemini'` and `embedding_backfill_version=2`.
4. Run hostile retrieval smoke before replay:
   - same owner/persona retrieves expected rows;
   - another owner/persona retrieves no private rows;
   - lifecycle filters still block rejected, quarantined, expired, and
     superseded memories;
   - keyword fallback still works when vector retrieval produces no candidates;
   - evidence stores counts/modes/ratings only, not private excerpts.
5. Roll back by restoring `EMBEDDINGS_PROVIDER=openai` and stopping Gemini
   writes; leave or null Gemini rows only after scoped review.

## Sources checked

- Google Gemini API pricing:
  `https://ai.google.dev/gemini-api/docs/pricing`
- Google Gemini API rate limits:
  `https://ai.google.dev/gemini-api/docs/rate-limits`
- Google Gemini Embedding GA note:
  `https://developers.googleblog.com/gemini-embedding-available-gemini-api/`
- Cloudflare Workers AI pricing:
  `https://developers.cloudflare.com/workers-ai/platform/pricing/`
- Cloudflare Vectorize pricing:
  `https://developers.cloudflare.com/vectorize/platform/pricing/`
- Hugging Face Inference Providers pricing:
  `https://huggingface.co/docs/inference-providers/en/pricing`
