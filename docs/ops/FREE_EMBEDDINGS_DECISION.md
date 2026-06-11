# Free embeddings decision

Date: 2026-06-10

Status: corrected MIMIR operating decision. Gemini is the selected embedding
direction because it has a free tier.

## Verdict

Use Gemini embeddings as the active target for Station replay/staging because
Gemini has a free tier and supports the current 1536-dimensional vector shape.

OpenAI `text-embedding-3-small` remains the fallback/rollback path for the
existing Supabase pgvector `vector(1536)` contract. NVIDIA remains chat/model
provider work, not the current embedding provider. Gemini still requires the
normal safety work before data-backed replay is considered proven: migration
`029`, bounded corpus reindex, and hostile retrieval smoke.

## Provider comparison

| Candidate | Free shape | Fit for Station now | Recommendation |
| --- | --- | --- | --- |
| Gemini embeddings | Google lists Gemini Embedding 2 and Gemini Embedding on free and paid tiers. Free-tier rows are marked as used to improve Google products; rate limits vary by project/tier and are checked in AI Studio. | Best technical fit of the free options because it can output 1536-dimensional vectors and the repo has provider metadata/RPC prep. Needs data-policy, migration `029`, reindex, and hostile retrieval smoke before data-backed replay proof. | Active target. Configure Gemini first, then prove it with migration/reindex/smoke. |
| Cloudflare Workers AI + Vectorize | Workers AI has a daily free allocation, and Vectorize has a free prototyping tier. | Requires Cloudflare account/setup, a Workers AI embedding adapter, Vectorize or Supabase write path decisions, deletion/export/reindex semantics, and hostile owner-scope review. It is a new platform lane, not minimum config. | Defer. Useful later if Cloudflare is chosen as a remote mirror/index layer. |
| Hugging Face Inference Providers | Hugging Face gives small monthly free credits for routed inference. | Too small and provider-routed for dependable staging replay; would add another key/provider/reliability lane without solving Station's current privacy/reindex gates. | Reject for current replay. Reconsider only for experiments. |
| Local/Ollama embeddings | No hosted per-token cost. | Not production-safe on current Railway staging without GPU/hosted model operations, model/version pinning, uptime, and reindex gates. | Reject for current replay. Could be local-dev only later. |
| Existing OpenAI default | Not free. | Already matches current schema, tests, RPCs, and fallback behavior. It is useful as a fallback while Gemini migration/reindex is being proven. | Keep as fallback/rollback, not the chosen active target. |

## Minimum safe Gemini config

Apply this for the Gemini embedding lane. The minimum scope is:

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
5. Roll back, if needed, by restoring `EMBEDDINGS_PROVIDER=openai` and stopping Gemini
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
