# PR528B2 - Partner Corpus And Provider Preflight ARGUS Result

Owner: ARGUS / A3

Date completed: 2026-07-16

Status: Blocked in the public-corpus and provider slices; private corpus ready

```text
BLOCK_PUBLIC_CORPUS_DOCUMENT_SUMMARY_HAS_NO_CURRENT_HOSTED_WRITE_OR_RENDER_CONTRACT
PRIVATE_CORPUS_READY_FOR_BOUNDED_HOSTED_PREPARATION
BLOCK_PRIVATE_PROVIDER_NO_ACCEPTED_NON_NVIDIA_CHAT_CREDENTIAL_CONFIGURED
```

## Verdict

The three slices must remain separate.

- The private Studio corpus may be prepared now through the bounded packet
  below. Hosted Gemini embeddings and encrypted BYOK storage are configured,
  and the corpus work does not require a chat completion.
- The public corpus must not be created yet. MIMIR's required document summary
  has no current `documents` column, create/update input, public serializer, or
  document-detail render slot. Putting it in the body would alter the approved
  body and misstate the product contract.
- The first private chat must wait. The hosted API has NVIDIA and Gemini
  configured, but no Anthropic or DeepSeek platform credential. Private chat
  deliberately calls the router with `allowPlatformNvidia: false`; Gemini is
  embeddings-only. No accepted chat provider is therefore available now.

This preflight made no account, row, entitlement, provider, model, source,
deployment, storage, billing, queue, Cloudflare, or hosted-state mutation.

## Read-Only Facts

The production deployment health response and a presence-only Railway variable
inventory established these non-secret facts:

| Fact | Result |
| --- | --- |
| API deployment | Ready, production, runtime `e542423bc07a9be77e7ad82f2b5ac6b65af087da` |
| Gemini embeddings | Configured and selected |
| Private storage | Configured |
| Platform NVIDIA | Configured, but policy-blocked for private context |
| Platform Anthropic | Not configured |
| Platform DeepSeek | Not configured |
| BYOK encryption | `AI_PROVIDER_KEY_ENCRYPTION_KEY` present |
| Supported owner BYOK | OpenAI, Anthropic, or DeepSeek only |

No value was printed or copied. The public health route exposed only boolean
readiness. The Railway inspection emitted presence booleans only.

Read-only collision checks found:

- no Space at `continuity-field-notes`;
- no document with the proposed slug;
- no public or private `Aster` persona collision;
- both proposed usernames available; and
- exactly one `documents-and-codexes` forum category.

A deployed read-only PostgREST probe could select a known `documents.id`, but a
`documents.summary` selection failed as an unknown column. Current migrations
and generated database types agree that `documents.summary` does not exist.

## Owner And Entitlement Boundary

Use two dedicated review owners. Sharing one Creator account would be smaller
in account count, but it would give the private review credentials authority to
mutate the retained public editorial chain and couple two different cleanup
lifecycles.

| Owner | Visible identity | Username | Truthful entitlement | Purpose |
| --- | --- | --- | --- | --- |
| Public | `Station Guide` | `station-guide` | `creator` | One public Space, document, and linked discussion |
| Private | `Station Guide` | `station-guide-studio` | `private` | One private persona, Memory, Inbox, Archive, Continuity, and chat proof |

For each owner:

1. Use ordinary `POST /auth/signup` with the selected username and display name.
2. Let the normal profile trigger create the visitor profile.
3. Add only a private Auth `app_metadata` purpose tag, such as
   `station_fixture=pr528_partner_review`, with the owner role and cleanup
   trigger. It must never be serialized into public content.
4. Through a controlled service-role operation, set only the required profile
   tier. Keep `subscription_status=inactive`, Stripe customer/subscription
   fields null, and `is_admin=false`.
5. Sign in again after the tier update so browser and API session readback use
   the current entitlement.

These are explicit nonbilling review entitlements. They are not evidence of a
paid customer, active subscription, partner endorsement, or real community
membership. Capture the before/after profile fields in the private cleanup
ledger without committing owner IDs or timestamps.

## Public Corpus Blocker

The accepted public document requires this exact summary:

```text
A practical boundary between continuity and reinvention.
```

The current contract cannot preserve it honestly:

- `POST /documents` and `PATCH /documents/:id` do not accept `summary`;
- the `documents` table and generated type have no `summary` column;
- public and owner document serializers cannot return it;
- the document detail has no summary render slot;
- Discover and Space excerpts currently derive from `body`; and
- version snapshots do not durably include a document summary.

Do not put the summary at the start of the approved body, silently omit it, use
provenance fields, or claim that a `document_versions.summary` field supplies a
current document summary.

The smallest repair is a separate source/deploy lane that:

1. adds nullable `documents.summary` through a migration and generated type;
2. accepts and persists it on document create/update;
3. selects and serializes it on owner and public reads;
4. renders it on document detail;
5. uses `summary ?? body` for Discover and Space excerpts without changing the
   canonical body;
6. includes it in document version snapshots and restoration; and
7. adds focused API, feed, detail, version, and null-fallback tests.

After that repair is deployed and the hosted column/readback is proven, the
public packet below becomes authorized. ARGUS did not patch source because the
lane expressly permits only this result and ARGUS state.

## Public Implementation Packet

Run this only after the summary repair is deployed. Use the public owner token
for every product API call and record returned IDs only in the private cleanup
ledger.

1. Create the public Space with `POST /spaces`:

```json
{
  "slug": "continuity-field-notes",
  "title": "Continuity Field Notes",
  "shortDescription": "Public notes on how long-running AI companions can remember, change, and stay accountable.",
  "isPublic": true,
  "commentsDefaultEnabled": true
}
```

The route creates the Space and its four standard Space pages. Do not customize
unrequested layout, theme, pages, or public persona state.

2. Create the draft with `POST /documents`. Start with comments disabled so the
   approved linked thread can be created before the document discussion helper
   runs:

```json
{
  "spaceId": "<space-id>",
  "title": "What should a companion keep steady?",
  "slug": "what-should-a-companion-keep-steady",
  "summary": "A practical boundary between continuity and reinvention.",
  "body": "A useful companion should not remember everything. It should remember what helps a relationship remain legible: commitments, durable preferences, unresolved questions, and the reasons behind important choices.\n\nContinuity is not sameness. A person can change their mind, abandon a plan, or ask for a new tone. Good memory preserves the path without turning an old version of someone into a permanent instruction.\n\nThat means every remembered detail needs provenance. Was it stated by the user, agreed over time, inferred from a conversation, or imported from an archive? The answer changes how confidently the companion should use it.\n\nThe practical test is simple: keep enough context to continue with care, and leave enough room for the next conversation to matter.",
  "documentType": "essay",
  "visibility": "public",
  "commentsEnabled": false
}
```

The route must retain normal `user_authored` and `manual` provenance. Do not
insert a document directly.

3. Publish with `POST /documents/<document-id>/publish`:

```json
{
  "visibility": "public"
}
```

Use the real server `published_at`. Do not backdate or rewrite it.

4. Resolve the unique `documents-and-codexes` category ID through
   `GET /forums/categories`, then create the exact linked thread with
   `POST /forums/threads`:

```json
{
  "categoryId": "<documents-and-codexes-category-id>",
  "title": "What belongs in continuity, and what should be allowed to change?",
  "body": "Where would you draw the line between useful continuity and an old preference that should be allowed to fade? Share a principle, a failure mode, or a question you would want a companion to ask before treating something as durable.",
  "linkedSpaceId": "<space-id>",
  "linkedDocumentId": "<document-id>"
}
```

The route derives public visibility, zero engagement, and normal user-authored
provenance. It may create the owner's `community_user_profiles` row. Do not add
votes, comments, Watches, witnesses, reports, pins, staff state, or moderation.

5. Enable document comments with `PATCH /documents/<document-id>`:

```json
{
  "commentsEnabled": true
}
```

The discussion helper must recover the already-linked active public thread and
set `discussion_thread_id`; it must not generate a second `Discuss: ...` thread.

6. Validate anonymously through all of:

- `GET /discover/feed?tab=new`;
- `GET /spaces/continuity-field-notes`;
- `GET /documents/public/<document-id>`;
- `GET /documents/<document-id>/discussion`;
- `GET /threads/<thread-id>`; and
- Discover search by exact title and a body phrase.

### Latest truth

Normal publication is sufficient. The Latest feed orders eligible public
documents by genuine `published_at`, and the unified feed uses genuine event
times. A thread linked to a document is excluded from the standalone thread
feed card, preventing a fabricated duplicate. `discover_feed` is reserved for
the separate featured/staff contract and must not be written for this packet.

## Private Corpus Implementation Packet

This packet may run before chat-provider configuration. Keep every product row
under the private owner and Aster, with private visibility.

1. Create Aster with `POST /personas`:

```json
{
  "name": "Aster",
  "shortDescription": "A thoughtful companion for long-running creative work.",
  "visibility": "private",
  "provider": "platform",
  "awakeningPrompt": "Keep decisions, open questions, and the reasons behind changes visible. Treat old preferences as revisable rather than permanent instructions.",
  "styleNotes": "Warm, specific, and direct about tradeoffs. Separate remembered facts from present inference, and leave room for the user to revise an old preference."
}
```

Omit `longDescription` rather than duplicating another field. The route creates
the persona and may initialize its layer profile and created lifecycle event.

2. Create the two curated items through
   `POST /memory/persona/<persona-id>`. Store each approved summary as both
   `summary` and `content`; this is deliberate curated Memory, not an inferred
   model result:

```json
{
  "title": "Working rhythm",
  "summary": "End planning conversations with one clear next action and preserve unresolved questions for the next session.",
  "content": "End planning conversations with one clear next action and preserve unresolved questions for the next session.",
  "sourceType": "manual",
  "relevanceWeight": 1.25
}
```

```json
{
  "title": "Feedback preference",
  "summary": "Name the tradeoff plainly, then offer a recommendation instead of hiding behind a list of possibilities.",
  "content": "Name the tradeoff plainly, then offer a recommendation instead of hiding behind a list of possibilities.",
  "sourceType": "manual",
  "relevanceWeight": 1.25
}
```

Require Gemini embedding metadata and active memory lifecycle readback. Never
record these as chat-derived or model-extracted.

3. Preview the Archive source with `POST /imports/preview`. This is a parser
check and writes no import state:

```json
{
  "personaId": "<persona-id>",
  "sourceKind": "file",
  "sourceName": "Companion design notes",
  "fileType": "text/plain",
  "content": "Continuity should help a conversation resume without forcing it to repeat. Preserve the reason behind a decision when that reason will matter later.\n\nWhen a preference changes, keep the old context as provenance rather than using it as the current instruction. Confidence should follow the source: user-stated, agreed, inferred, or imported."
}
```

Require a plain-text preview with no structured-import candidates.

4. Request a signed upload with
   `GET /persona-files/persona/<persona-id>/upload-url`, passing URL-encoded
   `fileName=Companion design notes` and `fileSize=341`. Upload the
   exact body to the returned private `persona-files` signed URL with
   `Content-Type: text/plain`. The URL and token are secrets for the duration of
   the upload and must not be logged.

5. Register the uploaded object with
   `POST /persona-files/persona/<persona-id>/register`:

```json
{
  "fileName": "Companion design notes",
  "fileType": "text/plain",
  "fileSize": 341,
  "storagePath": "<server-returned-storage-path>",
  "sourceType": "upload",
  "processImmediately": true
}
```

The current protected-alpha route processes inline; this packet does not
activate a worker or queue. Poll `GET /imports/<job-id>/status` until completed.
Require one processed private file, a completed file import job, one or more
private archive chunks tied to that file, Gemini embedding metadata, lifecycle
rows, and truthful storage accounting.

6. There is no owner API that creates a hand-curated pending Inbox candidate.
Perform exactly one controlled service-role insert into
`continuity_candidates`, referencing the Archive file rather than inventing a
chat transcript or model extraction:

```json
{
  "archived_chat_transcript_id": null,
  "source_table": "persona_files",
  "source_id": "<persona-file-id>",
  "source_label": "Companion design notes",
  "persona_id": "<persona-id>",
  "owner_user_id": "<private-owner-id>",
  "candidate_type": "memory",
  "title": "Decision log",
  "content": "Keep a short record of decisions and why they changed, but ask before treating a temporary experiment as durable.",
  "rationale": "Suggested from Companion design notes for owner review before it becomes active Memory.",
  "source_message_ids": [],
  "status": "pending"
}
```

Read it back only through
`GET /conversations/persona/<persona-id>/candidates?status=pending&source=import`.
Record privately that this was a controlled editorial insert. Do not claim the
product or a model inferred it.

7. Create the Continuity record with
   `POST /continuity/persona/<persona-id>/records`:

```json
{
  "recordType": "timeline",
  "title": "Collaboration brief",
  "summary": "Aster keeps decisions and open questions legible while treating preferences as revisable.",
  "visibility": "private",
  "metadata": {
    "purpose": "partner_review",
    "retention": "until_pr528_review_decision"
  }
}
```

The metadata is owner-private. No visible corpus field may mention a ticket,
agent, test, proof, replay, synthetic ID, staging, or cleanup instruction.

8. Validate owner readback in Studio, Aster, Memory, pending Inbox, Archive, and
   Continuity. With no token, and with a fresh unrelated owner token, require
   zero disclosure from private APIs and zero matches for `Aster`, `Decision
   log`, `Companion design notes`, `Collaboration brief`, and distinctive body
   phrases in Discover/search.

## Provider Configuration Boundary

Current private chat resolves to:

```text
nvidia_platform_blocked_private_context
```

That is the correct safe failure. `POST /conversations/persona/:id/chat`
supplies `allowPlatformNvidia: false`. With NVIDIA present and Anthropic and
DeepSeek absent, the router returns a policy/configuration error before any
provider call. Gemini remains the configured embedding route and is not a chat
route.

The smallest recommended platform repair is:

1. add a non-empty `ANTHROPIC_API_KEY` to the Railway production API service
   through a secret-safe input path;
2. leave NVIDIA configured but still forbidden for private context;
3. redeploy the API; and
4. require `GET /health/deployment` to report Anthropic readiness without
   exposing a value, followed by a bounded trace whose route is exactly
   `anthropic_platform`.

An existing `DEEPSEEK_API_KEY` platform credential would also satisfy the
implemented non-NVIDIA fallback, but none is present. Do not add both for this
lane. MIMIR should choose one explicit platform configuration owner; Anthropic
is preferred because it is the dedicated first non-NVIDIA platform route when
NVIDIA is policy-blocked.

Owner BYOK is an accepted alternative only if the private owner supplies their
own OpenAI, Anthropic, or DeepSeek key. Set it through
`PATCH /settings/ai-provider` with `aiMode=byok` and exactly one supported key,
then set Aster's `provider` to that same family. The server must encrypt it in
`ai_provider_byok_secrets`; the hosted encryption key is ready. Never put a
platform key into owner BYOK, point OpenAI at NVIDIA, commit a key, or invent a
Gemini chat provider.

## Bounded Chat Proof

Run this only after a readiness check proves one accepted route. Take a private
pre-count first because the route creates the conversation and owner message
before provider resolution; if the request fails, delete that exact shell too.

1. Send one `POST /conversations/persona/<persona-id>/chat` request:

```json
{
  "content": "I am revising a long-running project. What should we keep steady, and what should we be willing to change?"
}
```

2. Require a non-empty assistant reply relevant to continuity, decisions,
   revisable preferences, or tradeoffs. Do not require or seed exact wording.
3. Require a sanitized trace with the expected accepted route, provider family,
   model label, successful state, nonzero token counts, and no prompt,
   completion, context body, key, signed URL, or private identifier in evidence.
   The trace must never name the NVIDIA route.
4. Read the exact conversation through
   `GET /conversations/<conversation-id>?personaId=<persona-id>`, refresh the
   browser, and return through the conversation list/card to prove persistence
   and return-to-thread behavior.
5. Repeat anonymous and cross-owner private-route and public-search leakage
   probes. Require zero private content disclosure.
6. Delete the proof conversation with
   `DELETE /conversations/<conversation-id>` and require zero conversation and
   message rows for that ID.

Conversation deletion cascades its messages. Trace sessions and token
transactions use `ON DELETE SET NULL`; retain those owner-private, content-free
records as truthful evidence that a real model call and token charge occurred.
Do not erase or rewind real usage. Full account cleanup later removes the
owner-scoped trace and usage records.

## Write Allow-List

Every hosted implementation must start with zero target collisions and end with
an exact write receipt. Only these writes are allowed:

| Phase | Canonical writes allowed |
| --- | --- |
| Account setup | Two `auth.users`/identities and normal Auth session records; two `profiles`; private Auth app metadata; profile tier/status fields; trigger-maintained `token_usage` and `storage_usage` |
| Public corpus | `spaces`, four standard `space_pages`, `documents`, `document_versions`, one `threads` row, one `community_user_profiles` row |
| Private persona | `personas`, `persona_layer_profiles`, one created `persona_lifecycle_events` row |
| Private Memory | `memory_items`, `memory_item_lifecycle`, Gemini embedding/provider metadata in those rows, truthful storage usage |
| Private Archive | One object in private `persona-files`, `persona_files`, `import_jobs`, archive `memory_items`, `memory_item_lifecycle`, truthful storage usage |
| Private Inbox | Exactly one controlled `continuity_candidates` insert sourced from the persona file |
| Private Continuity | One `continuity_records` row |
| BYOK alternative | `ai_provider_byok_secrets`, `profiles.ai_mode`, and Aster's `personas.provider` only |
| Chat proof | One `conversations` row, two `conversation_messages`, `ai_trace_sessions`, `ai_trace_events`, `token_usage`, and `token_transactions`, followed by exact conversation/message cleanup |

Normal cache invalidations caused by these product routes are permitted as
transient operational effects, not canonical corpus. Do not activate or write
a queue.

The allow-list excludes `discover_feed`, votes, comments, Watches, witnesses,
notifications, reports, staff/featured/pinned/hidden state, active subscription
or Stripe rows, top-ups, billing records, Cloudflare, workers, background
queues, partner adapters, connectors, social publishing, UI/source changes,
public personas, and any cross-owner private row.

## Retained-State Ledger

Before the first write, create one encrypted or OS-protected local cleanup
manifest in an already ignored location. It must never be committed. Keep
passwords and any BYOK value in a password manager or secret input path, not in
the manifest, shell history, process arguments, logs, screenshots, docs, or UI
evidence.

The manifest must record, privately:

- both Auth/profile IDs, purpose tags, roles, pre/post entitlement fields, and
  cleanup trigger;
- every Space/page/document/version/thread/community-profile ID;
- Aster, layer, lifecycle, Memory/lifecycle, file, storage path, import job,
  archive chunk/lifecycle, candidate, and Continuity IDs;
- provider mode and provider family, plus only the secret-row ID and server
  readback metadata if BYOK was used;
- every bounded conversation/message/trace/event/transaction ID and pre/post
  usage count; and
- zero-count baselines for forbidden feed, engagement, billing, moderation,
  notification, connector, queue, and public-leakage surfaces.

Retain the two owners and curated corpus only through Marty and his partner's
PR528 review. The bounded chat conversation is not retained. After feedback,
MIMIR must explicitly promote/replace the editorial material or order cleanup;
silence is not promotion.

## Cleanup Packet

On an explicit MIMIR cleanup decision, use the private manifest and serialize
the work:

1. If BYOK was used, clear the exact provider through
   `PATCH /settings/ai-provider`, return `aiMode` to `platform`, and prove no
   active owner secret row. A platform environment secret is not fixture-owned
   and is not deleted by corpus cleanup.
2. Delete any failed or successful proof conversation through the owner API;
   prove messages are gone and usage remains truthful until account deletion.
3. Delete the pending candidate, then delete the Archive file through
   `DELETE /persona-files/<file-id>` so the private storage object is removed
   and storage accounting is released before owner cascade.
4. Delete the private Continuity record, curated Memory rows, and Aster, or
   identify them for the subsequent owner cascade. Do not leave archive chunks
   or lifecycle rows orphaned.
5. Delete the public document through its API, then call the owner thread-delete
   API for the linked thread. Both operations tombstone the linked discussion;
   the later public-owner cascade must hard-remove it. Delete the Space after
   document/thread cleanup.
6. Sign out and revoke current sessions, then delete both exact Auth users with
   the Supabase admin API. Profile ownership cascades the remaining scoped rows.
7. Explicitly remove any fixture-owned `discover_feed` item by recorded item ID
   if an implementation violated the allow-list; the expected count is zero and
   it has no protecting resource foreign key.
8. Check every recorded ID and owner ID for residue across Auth, profiles,
   Spaces/pages, documents/versions, threads/community profiles, personas and
   lifecycle, Memory and lifecycle, files/import jobs/storage objects,
   candidates, Continuity, conversations/messages, traces/events, token and
   storage usage/transactions, and any accidental feed/engagement rows.
9. Require no target public slug, username profile, linked document/thread,
   storage prefix, private search match, cross-owner disclosure, or orphan.
   Repeat the fresh read-only restoration snapshot once more before declaring
   cleanup complete.

Do not use broad timestamp deletion, truncate shared tables, delete unrelated
provider configuration, or infer ownership from visible titles alone.

## Validation

ARGUS completed the read-only inspection against current source, migrations,
generated database types, tests, deployed health, Railway presence inventory,
and narrowly selected hosted schema/collision reads. No private row body,
secret, token, signed URL, owner ID, or private timestamp was emitted or
committed.

| Command | Result |
| --- | --- |
| `npx --yes pnpm@10.32.1 --filter @station/types --filter @station/config --filter @station/db --filter @station/auth --filter @station/ai build` | Pass |
| Combined API route run: Spaces, document discussions, community, personas, Memory, import preview, Continuity records, Archive retrieval, conversation Archive/chat, and AI settings | Pass, `96/96` |
| Combined Auth and provider-router run | Pass, `22/22` |

The provider-router run specifically covered BYOK precedence, Station
Anthropic, accepted non-NVIDIA routes when NVIDIA is blocked, the exact
NVIDIA-only private fail-closed route, and safe missing-config reporting. The
route run covered owner/cross-owner/public visibility, linked-discussion
recovery, Discover private-search separation, encrypted key storage, import
preview, Archive retrieval, pending candidate readback, chat persistence and
cleanup behavior, and stable non-secret failures.

## Routing Decision

MIMIR can route three independent next actions:

1. A narrow document-summary source/migration/deploy lane, after which the
   public corpus packet can run.
2. The private DATA2 corpus preparation lane now, including Gemini embeddings,
   but excluding chat.
3. One explicit provider configuration lane for platform Anthropic (preferred),
   platform DeepSeek, or genuine owner BYOK. The bounded chat proof runs only
   after that lane passes sanitized readiness.

No corpus task needs to wait merely because the accepted chat credential is
missing. The public corpus does need to wait for its own summary contract.

## Handoff

```text
WAKEUP A1:
Codename: MIMIR
Summary:
- ARGUS completed the PR528B2 partner corpus/provider boundary preflight.
Verdict:
- Public/private corpus and provider verdicts recorded separately.
Task:
- Route the accepted hosted corpus/config slices without weakening provider policy or delaying independent work on a missing key.
```
