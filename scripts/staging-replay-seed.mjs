#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ACTIVE_EMBEDDING_PROVIDER = "gemini";
const ACTIVE_EMBEDDING_MODEL = "gemini-embedding-2";
const ACTIVE_EMBEDDING_DIMENSION = 1536;
const ACTIVE_EMBEDDING_INDEX_NAME = "memory_items_embedding_1536";
const ACTIVE_EMBEDDING_INDEX_SOURCE = "supabase_pgvector";
const ACTIVE_EMBEDDING_BACKFILL_VERSION = 2;
const MINIMUM_REPLAY_TIER = "canon";
const DEFAULT_CORPUS_PATH = "docs/ops/staging-replay-corpus.local.json";
const LEGACY_DOCUMENT_TYPE_MAP = {
  post: "essay",
  constitution: "codex",
  update: "field_log",
  other: "archive_note",
};
const LAUNCH_DOCUMENT_TYPES = new Set([
  "essay",
  "codex",
  "manifesto",
  "field_log",
  "research",
  "archive_note",
  "transcript",
]);
const DEVELOPER_SPACE_VISUALISATION_TYPES = new Set([
  "node_field",
  "timeline",
  "world_map",
  "constellation",
]);
const DEVELOPER_SPACE_PROVIDER_POLICIES = new Set([
  "public_synthetic_only",
  "public_context_allowed",
  "private_archive_allowed",
  "owner_byok_only",
  "platform_allowed",
]);
const PUBLIC_PERSONA_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
}

loadDotEnv(".env");

if (args[0] === "--validate-corpus") {
  const corpus = loadCorpus(args[1] ?? DEFAULT_CORPUS_PATH);
  validateCorpus(corpus);
  printSummary({ mode: "validate-corpus", corpus });
  process.exit(0);
}

const dryRun = args.includes("--dry-run");

main({ dryRun }).catch((error) => {
  console.error(error instanceof Error ? error.message : "Replay seed failed.");
  process.exitCode = 1;
});

async function main({ dryRun }) {
  const corpus = loadCorpus(value("STATION_REPLAY_CORPUS_PATH") || DEFAULT_CORPUS_PATH);
  validateCorpus(corpus);
  const developerSpaceInputs = developerSpacesFromCorpus(corpus);

  if (dryRun) {
    printSummary({ mode: "dry-run", corpus });
    return;
  }

  const env = requiredEnv([
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STATION_REPLAY_OWNER_EMAIL",
    "STATION_REPLAY_OWNER_PASSWORD",
  ]);
  const geminiKey = value("GEMINI_API_KEY") || value("GOOGLE_API_KEY");
  if (!geminiKey) throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY is required to write replay vectors.");

  const api = createSupabaseRest(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const owner = await ensureReplayOwner(api, env, corpus);
  const persona = await ensurePersona(api, owner.id, corpus);
  const publicPersona = await ensurePublicPersonaReadback(api, owner.id, corpus);
  const archivedChat = await ensureArchivedChat(api, owner.id, persona.id, corpus);
  const memories = await ensureMemoryCorpus(api, geminiKey, owner.id, persona.id, archivedChat.transcript.id, corpus);
  const continuity = await ensureContinuityRecord(api, owner.id, persona.id, memories.active.id, corpus);
  const publicSurface = await ensurePublicSurface(api, owner.id, persona.id, continuity.id, corpus);
  const seminarFeatures = await ensurePublicSeminarFeatures(api, publicSurface, corpus);
  const developerSpaces = [];
  for (const developerSpaceInput of developerSpaceInputs) {
    developerSpaces.push(await ensureDeveloperSpaceCorpus(api, owner.id, publicSurface.document.id, developerSpaceInput));
  }
  const primaryDeveloperSpace = developerSpaces[0];
  const exportPackage = await ensureExportPackage(api, owner.id, persona.id, publicSurface.document.id, primaryDeveloperSpace.id, corpus);

  printSummary({
    mode: "seeded",
    corpus,
    counts: {
      ownerProfiles: 1,
      personas: 2,
      publicPersonas: 1,
      conversations: 1,
      archivedTranscripts: 1,
      memoryItems: memories.count,
      continuityRecords: 1,
      spaces: 1,
      documents: 1,
      threads: 1,
      comments: 1,
      seminarFeatures: seminarFeatures.length,
      developerSpaces: developerSpaces.length,
      developerSpaceNodes: developerSpaces.length,
      developerSpaceEvents: developerSpaces.length,
      developerSpaceSnapshots: developerSpaces.length,
      developerSpaceDocuments: developerSpaces.reduce((total, space) => total + space.linkedDocuments.length, 0),
      exportPackages: 1,
    },
    labels: {
      ownerUsername: owner.username,
      personaName: persona.name,
      publicPersonaName: publicPersona.name,
      publicPersonaSlug: publicPersona.public_slug,
      publicPersonaChatEnabled: Boolean(publicPersona.public_chat_enabled),
      spaceSlug: publicSurface.space.slug,
      documentSlug: publicSurface.document.slug,
      seminarFeatureTypes: seminarFeatures.map((feature) => feature.label),
      developerSpaceSlug: primaryDeveloperSpace.slug,
      developerSpaceSlugs: developerSpaces.map((space) => space.slug),
      developerSpaceEvidenceRoles: Object.fromEntries(
        developerSpaces.map((space) => [
          space.slug,
          space.linkedDocuments.map((document) => document.developer_space_role),
        ])
      ),
      exportKind: exportPackage.package_kind,
    },
  });
}

function printHelp() {
  console.log([
    "Usage:",
    "  node scripts/staging-replay-seed.mjs --validate-corpus <path>",
    "  node scripts/staging-replay-seed.mjs --dry-run",
    "  node scripts/staging-replay-seed.mjs",
    "",
    "Required for real seeding:",
    "  SUPABASE_URL",
    "  SUPABASE_SERVICE_ROLE_KEY",
    "  GEMINI_API_KEY or GOOGLE_API_KEY",
    "  STATION_REPLAY_OWNER_EMAIL",
    "  STATION_REPLAY_OWNER_PASSWORD",
    "",
    "Optional:",
    "  STATION_REPLAY_OWNER_ID",
    "  STATION_REPLAY_OWNER_USERNAME",
    "  STATION_REPLAY_CORPUS_PATH",
    "",
    "The corpus file must stay local/untracked and must not contain production private data.",
  ].join("\n"));
}

function loadDotEnv(path) {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    if (process.env[key] != null) continue;
    process.env[key] = stripEnvQuotes(match[2].trim());
  }
}

function stripEnvQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function loadCorpus(path) {
  const absolute = resolve(path);
  if (!existsSync(absolute)) {
    throw new Error(`Replay corpus file not found: ${path}`);
  }
  return JSON.parse(readFileSync(absolute, "utf8"));
}

function validateCorpus(corpus) {
  requireString(corpus.runLabel, "runLabel");
  requireObject(corpus.persona, "persona");
  requireString(corpus.persona.name, "persona.name");
  requireString(corpus.persona.shortDescription, "persona.shortDescription");
  if (corpus.publicPersona !== undefined) {
    requireObject(corpus.publicPersona, "publicPersona");
    requireString(corpus.publicPersona.name, "publicPersona.name");
    requireString(corpus.publicPersona.shortDescription, "publicPersona.shortDescription");
    if (
      corpus.publicPersona.publicChatEnabled !== undefined &&
      typeof corpus.publicPersona.publicChatEnabled !== "boolean"
    ) {
      throw new Error("publicPersona.publicChatEnabled must be a boolean when provided.");
    }
    if (corpus.publicPersona.publicSlug !== undefined) {
      requireSafePublicSlug(corpus.publicPersona.publicSlug, "publicPersona.publicSlug");
    }
  }

  if (!Array.isArray(corpus.archiveSources) || corpus.archiveSources.length < 2 || corpus.archiveSources.length > 3) {
    throw new Error("archiveSources must contain two or three bounded replay sources.");
  }
  corpus.archiveSources.forEach((source, index) => {
    requireString(source.label, `archiveSources[${index}].label`);
    requireString(source.title, `archiveSources[${index}].title`);
    requireString(source.text, `archiveSources[${index}].text`);
  });

  requireObject(corpus.chatMemory, "chatMemory");
  requireString(corpus.chatMemory.title, "chatMemory.title");
  requireString(corpus.chatMemory.content, "chatMemory.content");
  requireObject(corpus.excludedMemory, "excludedMemory");
  requireString(corpus.excludedMemory.title, "excludedMemory.title");
  requireString(corpus.excludedMemory.content, "excludedMemory.content");
  requireObject(corpus.continuity, "continuity");
  requireString(corpus.continuity.title, "continuity.title");
  requireString(corpus.continuity.body, "continuity.body");
  requireObject(corpus.space, "space");
  requireString(corpus.space.slug, "space.slug");
  requireString(corpus.space.title, "space.title");
  requireObject(corpus.space.document, "space.document");
  requireString(corpus.space.document.slug, "space.document.slug");
  requireString(corpus.space.document.title, "space.document.title");
  requireString(corpus.space.document.body, "space.document.body");
  requireLaunchDocumentType(corpus.space.document.documentType, "essay", "space.document.documentType");
  requireString(corpus.space.comment, "space.comment");
  requireObject(corpus.developerSpace, "developerSpace");
  if (corpus.additionalDeveloperSpaces !== undefined && !Array.isArray(corpus.additionalDeveloperSpaces)) {
    throw new Error("additionalDeveloperSpaces must be an array when provided.");
  }
  const developerSpaces = developerSpacesFromCorpus(corpus);
  const slugs = new Set();
  const documentSlugs = new Set();
  developerSpaces.forEach((developerSpace, index) => {
    const label = index === 0 ? "developerSpace" : `additionalDeveloperSpaces[${index - 1}]`;
    validateDeveloperSpace(developerSpace, label);
    if (slugs.has(developerSpace.slug)) {
      throw new Error(`${label}.slug must be unique across Developer Space examples.`);
    }
    slugs.add(developerSpace.slug);
    developerSpace.documents.forEach((document, documentIndex) => {
      if (documentSlugs.has(document.slug)) {
        throw new Error(`${label}.documents[${documentIndex}].slug must be unique across Developer Space examples.`);
      }
      documentSlugs.add(document.slug);
    });
  });
  requireObject(corpus.exportPackage, "exportPackage");
  requireString(corpus.exportPackage.label, "exportPackage.label");
}

function developerSpacesFromCorpus(corpus) {
  return [corpus.developerSpace, ...(Array.isArray(corpus.additionalDeveloperSpaces) ? corpus.additionalDeveloperSpaces : [])];
}

function validateDeveloperSpace(developerSpace, label) {
  requireObject(developerSpace, label);
  requireString(developerSpace.slug, `${label}.slug`);
  requireString(developerSpace.projectName, `${label}.projectName`);
  if (developerSpace.visualisationType !== undefined) {
    requireSetValue(developerSpace.visualisationType, DEVELOPER_SPACE_VISUALISATION_TYPES, `${label}.visualisationType`);
  }
  if (developerSpace.providerPolicy !== undefined) {
    requireSetValue(developerSpace.providerPolicy, DEVELOPER_SPACE_PROVIDER_POLICIES, `${label}.providerPolicy`);
  }
  requireObject(developerSpace.node, `${label}.node`);
  requireString(developerSpace.node.externalId, `${label}.node.externalId`);
  requireString(developerSpace.node.name, `${label}.node.name`);
  requireObject(developerSpace.event, `${label}.event`);
  requireString(developerSpace.event.type, `${label}.event.type`);
  requireString(developerSpace.event.label, `${label}.event.label`);
  requireObject(developerSpace.snapshot, `${label}.snapshot`);
  if (!Array.isArray(developerSpace.documents) || developerSpace.documents.length < 3) {
    throw new Error(`${label}.documents must contain at least three public evidence documents.`);
  }
  const roles = new Set(["methodology", "finding", "field_log", "note"]);
  const documentRoles = new Set();
  developerSpace.documents.forEach((document, index) => {
    requireString(document.role, `${label}.documents[${index}].role`);
    if (!roles.has(document.role)) {
      throw new Error(`${label}.documents[${index}].role must be methodology, finding, field_log, or note.`);
    }
    documentRoles.add(document.role);
    requireString(document.slug, `${label}.documents[${index}].slug`);
    requireString(document.title, `${label}.documents[${index}].title`);
    requireString(document.body, `${label}.documents[${index}].body`);
    requireLaunchDocumentType(
      document.documentType,
      developerSpaceDocumentType(document.role),
      `${label}.documents[${index}].documentType`
    );
  });
  for (const role of ["methodology", "finding", "field_log"]) {
    if (!documentRoles.has(role)) {
      throw new Error(`${label}.documents must include a public ${role} document.`);
    }
  }
}

function requireObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
}

function requireSetValue(value, allowed, label) {
  if (typeof value !== "string" || !allowed.has(value)) {
    throw new Error(`${label} must be one of: ${Array.from(allowed).join(", ")}.`);
  }
}

function requireSafePublicSlug(value, label) {
  if (
    typeof value !== "string" ||
    !PUBLIC_PERSONA_SLUG_PATTERN.test(value) ||
    UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN.test(value)
  ) {
    throw new Error(`${label} must be a safe public persona slug, not a raw-id-shaped value.`);
  }
}

function requiredEnv(names) {
  const env = {};
  const missing = [];
  for (const name of names) {
    const current = value(name);
    if (!current) missing.push(name);
    env[name] = current;
  }
  if (missing.length) throw new Error(`Missing required env: ${missing.join(", ")}`);
  return env;
}

function value(name) {
  const current = process.env[name];
  return typeof current === "string" && current.trim().length > 0 ? current.trim() : "";
}

function createSupabaseRest(supabaseUrl, serviceRoleKey) {
  const baseUrl = supabaseUrl.replace(/\/+$/g, "");
  const headers = {
    apikey: serviceRoleKey,
    authorization: `Bearer ${serviceRoleKey}`,
  };

  return {
    async select(table, filters = [], select = "*") {
      const query = [`select=${encodeURIComponent(select)}`, ...filters].join("&");
      const response = await request(`${baseUrl}/rest/v1/${table}?${query}`, {
        method: "GET",
        headers,
      });
      return response;
    },
    async insert(table, body) {
      const response = await request(`${baseUrl}/rest/v1/${table}`, {
        method: "POST",
        headers: { ...headers, "content-type": "application/json", prefer: "return=representation" },
        body: JSON.stringify(body),
      });
      return Array.isArray(body) ? response : Array.isArray(response) ? response[0] : response;
    },
    async patch(table, filters, body) {
      const response = await request(`${baseUrl}/rest/v1/${table}?${filters.join("&")}`, {
        method: "PATCH",
        headers: { ...headers, "content-type": "application/json", prefer: "return=representation" },
        body: JSON.stringify(body),
      });
      return Array.isArray(response) ? response[0] : response;
    },
    async upsert(table, body, onConflict) {
      const response = await request(`${baseUrl}/rest/v1/${table}?on_conflict=${encodeURIComponent(onConflict)}`, {
        method: "POST",
        headers: {
          ...headers,
          "content-type": "application/json",
          prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify(body),
      });
      return Array.isArray(response) ? response[0] : response;
    },
    async delete(table, filters) {
      await request(`${baseUrl}/rest/v1/${table}?${filters.join("&")}`, {
        method: "DELETE",
        headers: { ...headers, prefer: "return=minimal" },
      });
    },
    async createUser(body) {
      return request(`${baseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    },
    async updateUser(id, body) {
      return request(`${baseUrl}/auth/v1/admin/users/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify(body),
      });
    },
  };
}

async function request(url, options) {
  const response = await fetch(url, options);
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = typeof body?.message === "string" ? body.message : `HTTP ${response.status}`;
    throw new Error(`Supabase request failed: ${message}`);
  }
  return body;
}

function eq(column, current) {
  return `${encodeURIComponent(column)}=eq.${encodeURIComponent(current)}`;
}

function limit(count) {
  return `limit=${count}`;
}

async function ensureReplayOwner(api, env, corpus) {
  const expectedOwnerId = value("STATION_REPLAY_OWNER_ID");
  const username = value("STATION_REPLAY_OWNER_USERNAME") || "station-replay-owner";
  const displayName = corpus.owner?.displayName || "Station Replay Owner";
  const usernameProfile = await first(await api.select("profiles", [
    eq("username", username),
    limit(1),
  ]));
  const idProfile = expectedOwnerId
    ? await first(await api.select("profiles", [eq("id", expectedOwnerId), limit(1)]))
    : null;
  let profile = idProfile ?? usernameProfile;

  if (usernameProfile && expectedOwnerId && usernameProfile.id !== expectedOwnerId) {
    throw new Error(
      "Replay owner username is already used by a different profile. Choose another " +
      "STATION_REPLAY_OWNER_USERNAME or set STATION_REPLAY_OWNER_ID to the matching profile id."
    );
  }

  if (usernameProfile && !expectedOwnerId) {
    throw new Error(
      "Replay owner username already exists. Set STATION_REPLAY_OWNER_ID to that profile id " +
      "to confirm reuse, or choose a different STATION_REPLAY_OWNER_USERNAME."
    );
  }

  if (expectedOwnerId && !profile) {
    throw new Error(
      "STATION_REPLAY_OWNER_ID was set, but no matching profile exists in staging."
    );
  }

  if (!profile) {
    const user = await api.createUser({
      email: env.STATION_REPLAY_OWNER_EMAIL,
      password: env.STATION_REPLAY_OWNER_PASSWORD,
      email_confirm: true,
      user_metadata: { username, display_name: displayName, replay_owner: true },
    });
    const userId = user.id ?? user.user?.id;
    if (!userId) throw new Error("Supabase Auth createUser did not return a user id.");
    profile = await first(await api.select("profiles", [eq("id", userId), limit(1)]));
    if (!profile) {
      profile = await api.upsert("profiles", {
        id: userId,
        username,
        display_name: displayName,
        tier: MINIMUM_REPLAY_TIER,
      }, "id");
    }
  } else {
    await api.updateUser(profile.id, {
      email: env.STATION_REPLAY_OWNER_EMAIL,
      password: env.STATION_REPLAY_OWNER_PASSWORD,
      email_confirm: true,
      user_metadata: { username, display_name: displayName, replay_owner: true },
    });
  }

  const updated = await api.patch("profiles", [eq("id", profile.id)], {
    username,
    display_name: displayName,
    tier: MINIMUM_REPLAY_TIER,
  });

  return { id: updated.id, username: updated.username, tier: updated.tier };
}

async function ensurePersona(api, ownerUserId, corpus) {
  const existing = await first(await api.select("personas", [
    eq("owner_user_id", ownerUserId),
    eq("name", corpus.persona.name),
    limit(1),
  ]));
  const payload = {
    owner_user_id: ownerUserId,
    name: corpus.persona.name,
    short_description: corpus.persona.shortDescription,
    long_description: corpus.persona.longDescription ?? null,
    visibility: "private",
    provider: "platform",
    awakening_prompt: corpus.persona.awakeningPrompt ?? null,
    style_notes: corpus.persona.styleNotes ?? null,
    sort_order: 0,
  };
  return existing
    ? api.patch("personas", [eq("id", existing.id), eq("owner_user_id", ownerUserId)], payload)
    : api.insert("personas", payload);
}

async function ensurePublicPersonaReadback(api, ownerUserId, corpus) {
  const input = publicPersonaInput(corpus);
  const existingBySlug = await first(await api.select("personas", [
    eq("public_slug", input.publicSlug),
    limit(1),
  ]));
  if (existingBySlug && existingBySlug.owner_user_id !== ownerUserId) {
    throw new Error(`Replay public persona slug is already owned by another profile: ${input.publicSlug}`);
  }

  const existingByName = await first(await api.select("personas", [
    eq("owner_user_id", ownerUserId),
    eq("name", input.name),
    limit(1),
  ]));
  const existing = existingBySlug ?? existingByName;
  const payload = {
    owner_user_id: ownerUserId,
    name: input.name,
    short_description: input.shortDescription,
    long_description: null,
    visibility: "public",
    public_slug: input.publicSlug,
    public_chat_enabled: input.publicChatEnabled,
    provider: "platform",
    awakening_prompt: null,
    style_notes: null,
    sort_order: 1,
  };

  return existing
    ? api.patch("personas", [eq("id", existing.id), eq("owner_user_id", ownerUserId)], payload)
    : api.insert("personas", payload);
}

async function ensureArchivedChat(api, ownerUserId, personaId, corpus) {
  const title = replayTitle(corpus, "conversation");
  const existingConversation = await first(await api.select("conversations", [
    eq("owner_user_id", ownerUserId),
    eq("persona_id", personaId),
    eq("title", title),
    limit(1),
  ]));
  const conversation = existingConversation
    ? await api.patch("conversations", [eq("id", existingConversation.id), eq("owner_user_id", ownerUserId)], {
      status: "archived",
      message_count: 2,
      archived_at: new Date().toISOString(),
    })
    : await api.insert("conversations", {
      owner_user_id: ownerUserId,
      persona_id: personaId,
      title,
      mode: "private",
      status: "archived",
      message_count: 2,
      archived_at: new Date().toISOString(),
    });

  await api.delete("conversation_messages", [eq("conversation_id", conversation.id)]);
  const messages = await api.insert("conversation_messages", [
    { conversation_id: conversation.id, role: "user", content: corpus.chatMemory.content },
    { conversation_id: conversation.id, role: "assistant", content: corpus.chatMemory.assistantReply ?? corpus.chatMemory.content },
  ]);
  const rows = Array.isArray(messages) ? messages : [messages];

  const transcriptMarkdown = [
    `# ${title}`,
    "",
    "## Owner",
    corpus.chatMemory.content,
    "",
    "## Persona",
    corpus.chatMemory.assistantReply ?? corpus.chatMemory.content,
  ].join("\n");

  const transcript = await api.upsert("archived_chat_transcripts", {
    conversation_id: conversation.id,
    persona_id: personaId,
    owner_user_id: ownerUserId,
    title,
    transcript_markdown: transcriptMarkdown,
    message_count: rows.length,
    source_summary: corpus.chatMemory.summary ?? corpus.chatMemory.title,
  }, "conversation_id");

  return { conversation, transcript };
}

async function ensureMemoryCorpus(api, geminiKey, ownerUserId, personaId, transcriptId, corpus) {
  const archiveItems = [];
  for (const [index, source] of corpus.archiveSources.entries()) {
    const item = await upsertMemoryItem(api, geminiKey, {
      ownerUserId,
      personaId,
      title: replayTitle(corpus, `archive ${index + 1} ${source.label}`),
      content: source.text,
      summary: source.summary ?? source.title,
      sourceType: "import",
      relevanceWeight: source.relevanceWeight ?? 4,
      archiveSourceType: "archived_chat_transcript",
      archiveSourceId: transcriptId,
      archiveSourceName: source.title,
      chunkIndex: index,
      chunkCount: corpus.archiveSources.length,
      lifecycleStatus: "active",
    });
    archiveItems.push(item);
  }

  const active = await upsertMemoryItem(api, geminiKey, {
    ownerUserId,
    personaId,
    title: replayTitle(corpus, "chat memory"),
    content: corpus.chatMemory.content,
    summary: corpus.chatMemory.summary ?? corpus.chatMemory.title,
    sourceType: "chat",
    relevanceWeight: corpus.chatMemory.relevanceWeight ?? 4,
    lifecycleStatus: "active",
  });

  await upsertMemoryItem(api, geminiKey, {
    ownerUserId,
    personaId,
    title: replayTitle(corpus, "excluded memory"),
    content: corpus.excludedMemory.content,
    summary: corpus.excludedMemory.summary ?? corpus.excludedMemory.title,
    sourceType: "manual",
    relevanceWeight: corpus.excludedMemory.relevanceWeight ?? 1,
    lifecycleStatus: corpus.excludedMemory.status ?? "rejected",
  });

  return { active, archiveItems, count: archiveItems.length + 2 };
}

async function upsertMemoryItem(api, geminiKey, input) {
  const existing = await first(await api.select("memory_items", [
    eq("owner_user_id", input.ownerUserId),
    eq("persona_id", input.personaId),
    eq("title", input.title),
    limit(1),
  ]));
  const embedding = await geminiEmbedding(input.content, geminiKey);
  const payload = {
    owner_user_id: input.ownerUserId,
    persona_id: input.personaId,
    title: input.title,
    content: input.content,
    summary: input.summary,
    source_type: input.sourceType,
    relevance_weight: Math.round(input.relevanceWeight),
    embedding: vectorLiteral(embedding),
    embedding_provider: ACTIVE_EMBEDDING_PROVIDER,
    embedding_model: ACTIVE_EMBEDDING_MODEL,
    embedding_dimension: ACTIVE_EMBEDDING_DIMENSION,
    embedding_index_name: ACTIVE_EMBEDDING_INDEX_NAME,
    embedding_index_source: ACTIVE_EMBEDDING_INDEX_SOURCE,
    embedding_backfill_version: ACTIVE_EMBEDDING_BACKFILL_VERSION,
    archive_source_type: input.archiveSourceType ?? null,
    archive_source_id: input.archiveSourceId ?? null,
    archive_source_name: input.archiveSourceName ?? null,
    chunk_index: input.chunkIndex ?? null,
    chunk_count: input.chunkCount ?? null,
  };
  const row = existing
    ? await api.patch("memory_items", [eq("id", existing.id), eq("owner_user_id", input.ownerUserId)], payload)
    : await api.insert("memory_items", payload);

  await api.upsert("memory_item_lifecycle", {
    memory_item_id: row.id,
    owner_user_id: input.ownerUserId,
    persona_id: input.personaId,
    trust_level: "user_stated",
    status: input.lifecycleStatus,
    confidence: input.lifecycleStatus === "active" ? 0.95 : 0.2,
    evidence: [{ label: "staging_replay_seed", title: input.title }],
  }, "memory_item_id");

  return row;
}

async function ensureContinuityRecord(api, ownerUserId, personaId, memoryId, corpus) {
  const title = replayTitle(corpus, corpus.continuity.title);
  const existing = await first(await api.select("continuity_records", [
    eq("owner_user_id", ownerUserId),
    eq("persona_id", personaId),
    eq("title", title),
    limit(1),
  ]));
  const payload = {
    owner_user_id: ownerUserId,
    persona_id: personaId,
    record_type: "memory",
    title,
    body: corpus.continuity.body,
    summary: corpus.continuity.summary ?? corpus.continuity.title,
    source_table: "memory_items",
    source_id: memoryId,
    source_label: replayTitle(corpus, "chat memory"),
    visibility: "private",
    metadata: { run_label: corpus.runLabel, helper: "staging-replay-seed" },
    occurred_at: new Date().toISOString(),
  };
  return existing
    ? api.patch("continuity_records", [eq("id", existing.id), eq("owner_user_id", ownerUserId)], payload)
    : api.insert("continuity_records", payload);
}

async function ensurePublicSurface(api, ownerUserId, personaId, continuityId, corpus) {
  const existingSpace = await first(await api.select("spaces", [eq("slug", corpus.space.slug), limit(1)]));
  if (existingSpace && existingSpace.owner_user_id !== ownerUserId) {
    throw new Error(`Replay space slug is already owned by another profile: ${corpus.space.slug}`);
  }
  const spacePayload = {
    owner_user_id: ownerUserId,
    slug: corpus.space.slug,
    title: corpus.space.title,
    short_description: corpus.space.shortDescription ?? "Staging replay public-safe surface.",
    long_description: corpus.space.longDescription ?? null,
    is_public: true,
    comments_default_enabled: true,
  };
  const space = existingSpace
    ? await api.patch("spaces", [eq("id", existingSpace.id), eq("owner_user_id", ownerUserId)], spacePayload)
    : await api.insert("spaces", spacePayload);

  const document = await api.upsert("documents", {
    author_user_id: ownerUserId,
    space_id: space.id,
    persona_id: personaId,
    title: corpus.space.document.title,
    slug: corpus.space.document.slug,
    body: corpus.space.document.body,
    document_type: launchDocumentType(corpus.space.document.documentType, "essay"),
    status: "published",
    visibility: "public",
    comments_enabled: true,
    published_at: new Date().toISOString(),
    provenance_type: "user_authored",
    source_type: "manual",
    source_id: continuityId,
    source_label: corpus.continuity.title,
    source_persona_id: personaId,
  }, "author_user_id,slug");

  const category = await first(await api.select("forum_categories", ["order=sort_order.asc", limit(1)]));
  if (!category) throw new Error("No forum category exists for replay discussion seeding.");

  const threadTitle = replayTitle(corpus, "document discussion");
  const existingThread = await first(await api.select("threads", [
    eq("author_user_id", ownerUserId),
    eq("title", threadTitle),
    limit(1),
  ]));
  const threadPayload = {
    category_id: category.id,
    author_user_id: ownerUserId,
    linked_persona_id: personaId,
    linked_document_id: document.id,
    title: threadTitle,
    body: corpus.space.threadBody ?? corpus.space.document.title,
    status: "active",
    visibility: "public",
  };
  const thread = existingThread
    ? await api.patch("threads", [eq("id", existingThread.id), eq("author_user_id", ownerUserId)], threadPayload)
    : await api.insert("threads", threadPayload);

  const comment = await replaceSingleComment(api, ownerUserId, thread.id, corpus.space.comment);
  const documentWithDiscussion = await api.patch("documents", [eq("id", document.id), eq("author_user_id", ownerUserId)], {
    discussion_thread_id: thread.id,
  });

  return { space, document: documentWithDiscussion, thread, comment };
}

async function ensurePublicSeminarFeatures(api, publicSurface, corpus) {
  const category = await first(await api.select("forum_categories", [
    eq("id", publicSurface.thread.category_id),
    limit(1),
  ], "id, slug, title"));
  if (!category || !safeRouteSlug(category.slug)) {
    throw new Error("Replay discussion category is not routeable for seminar feature seeding.");
  }
  if (!safeRouteSlug(publicSurface.space.slug)) {
    throw new Error("Replay Space slug is not routeable for seminar feature seeding.");
  }

  const features = [
    {
      label: "document",
      itemType: "document",
      itemId: publicSurface.document.id,
      title: publicSurface.document.title,
      description: publicSurface.space.short_description ?? "Public replay seminar readback.",
      href: `/space/${publicSurface.space.slug}/documents/${publicSurface.document.id}`,
    },
    {
      label: "thread",
      itemType: "thread",
      itemId: publicSurface.thread.id,
      title: publicSurface.thread.title,
      description: "Public replay seminar discussion.",
      href: `/forums/${category.slug}/${publicSurface.thread.id}`,
    },
    {
      label: "space",
      itemType: "space",
      itemId: publicSurface.space.id,
      title: publicSurface.space.title,
      description: publicSurface.space.short_description ?? "Public replay seminar Space.",
      href: `/space/${publicSurface.space.slug}`,
    },
  ];

  const rows = [];
  for (const feature of features) {
    rows.push(await upsertDiscoverFeaturedSeminar(api, feature));
  }
  return rows.map((row, index) => ({
    label: features[index].label,
    event_type: row.event_type,
  }));
}

async function upsertDiscoverFeaturedSeminar(api, feature) {
  const filters = [
    eq("item_type", feature.itemType),
    eq("item_id", feature.itemId),
    eq("event_type", "featured"),
  ];
  const existing = await first(await api.select("discover_feed", [
    ...filters,
    limit(1),
  ]));
  const payload = {
    item_type: feature.itemType,
    event_type: "featured",
    item_id: feature.itemId,
    title: feature.title,
    description: feature.description,
    href: feature.href,
  };

  return existing
    ? api.patch("discover_feed", [eq("id", existing.id)], payload)
    : api.insert("discover_feed", payload);
}

async function replaceSingleComment(api, ownerUserId, threadId, body) {
  const existing = await first(await api.select("comments", [
    eq("author_user_id", ownerUserId),
    eq("parent_type", "thread"),
    eq("parent_id", threadId),
    limit(1),
  ]));
  const payload = {
    author_user_id: ownerUserId,
    parent_type: "thread",
    parent_id: threadId,
    body,
    status: "active",
  };
  return existing
    ? api.patch("comments", [eq("id", existing.id), eq("author_user_id", ownerUserId)], payload)
    : api.insert("comments", payload);
}

async function ensureDeveloperSpaceCorpus(api, ownerUserId, documentId, developerSpaceInput) {
  const existingSpace = await first(await api.select("developer_spaces", [eq("slug", developerSpaceInput.slug), limit(1)]));
  if (existingSpace && existingSpace.owner_user_id !== ownerUserId) {
    throw new Error(`Replay Developer Space slug is already owned by another profile: ${developerSpaceInput.slug}`);
  }
  const spacePayload = {
    owner_user_id: ownerUserId,
    project_name: developerSpaceInput.projectName,
    slug: developerSpaceInput.slug,
    description: developerSpaceInput.description ?? "Staging replay Developer Space.",
    visibility: "public",
    provider_policy: developerSpaceInput.providerPolicy ?? "public_synthetic_only",
    visualisation_type: developerSpaceInput.visualisationType ?? "node_field",
    visualisation_config: developerSpaceInput.visualisationConfig ?? {},
  };
  const space = existingSpace
    ? await api.patch("developer_spaces", [eq("id", existingSpace.id), eq("owner_user_id", ownerUserId)], spacePayload)
    : await api.insert("developer_spaces", spacePayload);

  const node = await api.upsert("developer_space_nodes", {
    developer_space_id: space.id,
    external_id: developerSpaceInput.node.externalId,
    node_name: developerSpaceInput.node.name,
    topology_type: developerSpaceInput.node.topologyType ?? "custom",
    fragment_count: developerSpaceInput.node.fragmentCount ?? 1,
    self_similarity_score: developerSpaceInput.node.selfSimilarityScore ?? null,
    dimensionality: developerSpaceInput.node.dimensionality ?? ACTIVE_EMBEDDING_DIMENSION,
    metrics: developerSpaceInput.node.metrics ?? {},
    last_event_at: new Date().toISOString(),
  }, "developer_space_id,external_id");

  await api.delete("developer_space_events", [eq("developer_space_id", space.id)]);
  await api.delete("developer_space_snapshots", [eq("developer_space_id", space.id)]);

  const linkedDocuments = await ensureDeveloperSpaceEvidenceDocuments(api, ownerUserId, space, developerSpaceInput.documents);
  const sourceRefs = linkedDocuments.map(developerSpaceEvidenceSourceRef);

  await api.insert("developer_space_events", {
    developer_space_id: space.id,
    node_id: node.id,
    external_node_id: developerSpaceInput.node.externalId,
    event_type: developerSpaceInput.event.type,
    event_label: developerSpaceInput.event.label,
    event_data: developerSpaceInput.event.data ?? {},
    similarity_score: developerSpaceInput.event.similarityScore ?? null,
    source_refs: sourceRefs.length > 0 ? sourceRefs : [`document:replay:${documentId}`],
    provenance: "api",
    visibility: "public",
    occurred_at: new Date().toISOString(),
  });

  await api.insert("developer_space_snapshots", {
    developer_space_id: space.id,
    snapshot_data: developerSpaceInput.snapshot.data,
    source_refs: sourceRefs.length > 0 ? sourceRefs : [`document:replay:${documentId}`],
    provenance: "api",
    visibility: "public",
    occurred_at: new Date().toISOString(),
  });

  await api.upsert("developer_space_usage", {
    developer_space_id: space.id,
    owner_user_id: ownerUserId,
    ingested_nodes_count: 1,
    ingested_events_count: 1,
    ingested_snapshots_count: 1,
    storage_bytes: JSON.stringify(developerSpaceInput).length,
  }, "developer_space_id");

  return { ...space, linkedDocuments };
}

async function ensureDeveloperSpaceEvidenceDocuments(api, ownerUserId, developerSpace, documents) {
  const rows = [];
  for (const [index, document] of documents.entries()) {
    const row = await api.upsert("documents", {
      author_user_id: ownerUserId,
      space_id: null,
      persona_id: null,
      title: document.title,
      slug: document.slug,
      body: document.body,
      document_type: launchDocumentType(document.documentType, developerSpaceDocumentType(document.role)),
      status: "published",
      visibility: "public",
      comments_enabled: false,
      published_at: new Date().toISOString(),
      provenance_type: "user_authored",
      source_type: "manual",
      source_id: developerSpace.id,
      source_label: `Developer Space: ${developerSpace.project_name}`,
      source_persona_id: null,
    }, "author_user_id,slug");

    await api.upsert("developer_space_documents", {
      developer_space_id: developerSpace.id,
      document_id: row.id,
      owner_user_id: ownerUserId,
      document_role: document.role,
      link_visibility: "public",
      sort_order: document.sortOrder ?? index,
    }, "developer_space_id,document_id");

    rows.push({ ...row, developer_space_role: document.role });
  }
  return rows;
}

function developerSpaceDocumentType(role) {
  if (role === "methodology" || role === "finding") return "research";
  if (role === "field_log") return "field_log";
  return "archive_note";
}

function launchDocumentType(documentType, fallback) {
  const current = typeof documentType === "string" && documentType.trim().length > 0
    ? documentType.trim()
    : fallback;
  const normalized = LEGACY_DOCUMENT_TYPE_MAP[current] ?? current;
  if (!LAUNCH_DOCUMENT_TYPES.has(normalized)) {
    throw new Error(`Unsupported replay document type: ${current}`);
  }
  return normalized;
}

function requireLaunchDocumentType(documentType, fallback, label) {
  try {
    return launchDocumentType(documentType, fallback);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unsupported replay document type.";
    throw new Error(`${label}: ${message}`);
  }
}

function developerSpaceEvidenceSourceRef(document) {
  return `document:${document.developer_space_role}:${document.slug}`;
}

async function ensureExportPackage(api, ownerUserId, personaId, documentId, developerSpaceId, corpus) {
  const existingRows = await api.select("export_packages", [
    eq("owner_user_id", ownerUserId),
    eq("persona_id", personaId),
    eq("package_kind", "persona_archive"),
  ]);
  const existing = existingRows.find((row) => row.manifest_json?.run_label === corpus.runLabel);
  const payload = {
    owner_user_id: ownerUserId,
    persona_id: personaId,
    developer_space_id: null,
    package_kind: "persona_archive",
    status: "completed",
    format: "json_markdown",
    included_sections: ["persona", "memory", "archive", "continuity", "published_documents", "discussion_refs"],
    manifest_json: {
      run_label: corpus.runLabel,
      label: corpus.exportPackage.label,
      document_id: documentId,
      developer_space_id: developerSpaceId,
      private_payload_omitted: true,
    },
    manifest_markdown: `# ${corpus.exportPackage.label}\n\nSanitized staging replay export manifest. Private corpus text is omitted.`,
    content_summary: {
      run_label: corpus.runLabel,
      sections: 6,
      private_payload_omitted: true,
    },
    completed_at: new Date().toISOString(),
  };
  return existing
    ? api.patch("export_packages", [eq("id", existing.id), eq("owner_user_id", ownerUserId)], payload)
    : api.insert("export_packages", payload);
}

async function geminiEmbedding(text, apiKey) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${ACTIVE_EMBEDDING_MODEL}:embedContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: `models/${ACTIVE_EMBEDDING_MODEL}`,
        content: { parts: [{ text }] },
        outputDimensionality: ACTIVE_EMBEDDING_DIMENSION,
        taskType: "RETRIEVAL_DOCUMENT",
      }),
    }
  );
  const body = await response.json();
  if (!response.ok) {
    const message = typeof body?.error?.message === "string" ? body.error.message : `HTTP ${response.status}`;
    throw new Error(`Gemini embedding failed: ${message}`);
  }
  const values = body?.embedding?.values;
  if (!Array.isArray(values) || values.length !== ACTIVE_EMBEDDING_DIMENSION) {
    throw new Error(`Gemini embedding returned ${Array.isArray(values) ? values.length : "no"} values.`);
  }
  return values.map((item) => Number(item));
}

function vectorLiteral(vector) {
  return `[${vector.map((item) => {
    if (!Number.isFinite(item)) throw new Error("Embedding contained a non-finite value.");
    return Number(item).toPrecision(8);
  }).join(",")}]`;
}

function replayTitle(corpus, label) {
  return `[replay:${corpus.runLabel}] ${label}`;
}

function publicPersonaInput(corpus) {
  const publicSlug = corpus.publicPersona?.publicSlug ??
    safePublicPersonaSlug(`${corpus.space.slug}-persona`);
  requireSafePublicSlug(publicSlug, "publicPersona.publicSlug");

  return {
    name: corpus.publicPersona?.name ?? `${corpus.persona.name} Public Readback`,
    shortDescription: corpus.publicPersona?.shortDescription ??
      "Public-safe staging persona for PR204 public readback rehearsal.",
    publicSlug,
    publicChatEnabled: corpus.publicPersona?.publicChatEnabled ?? false,
  };
}

function safePublicPersonaSlug(value) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-") || "persona";

  return UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN.test(slug) ? `persona-${slug}` : slug;
}

function safeRouteSlug(value) {
  return typeof value === "string" &&
    PUBLIC_PERSONA_SLUG_PATTERN.test(value) &&
    !UUID_SHAPED_PUBLIC_PERSONA_SLUG_PATTERN.test(value);
}

function first(rows) {
  return Array.isArray(rows) && rows.length > 0 ? rows[0] : null;
}

function printSummary({ mode, corpus, counts, labels }) {
  const developerSpaces = developerSpacesFromCorpus(corpus);
  const developerSpaceDocumentCount = developerSpaces.reduce(
    (total, developerSpace) => total + developerSpace.documents.length,
    0
  );
  console.log(JSON.stringify({
    ok: true,
    mode,
    runLabel: corpus.runLabel,
    activeEmbedding: {
      provider: ACTIVE_EMBEDDING_PROVIDER,
      model: ACTIVE_EMBEDDING_MODEL,
      dimension: ACTIVE_EMBEDDING_DIMENSION,
      indexName: ACTIVE_EMBEDDING_INDEX_NAME,
      backfillVersion: ACTIVE_EMBEDDING_BACKFILL_VERSION,
    },
    planned: {
      replayOwners: 1,
      personas: 2,
      publicPersonas: 1,
      archiveSources: corpus.archiveSources.length,
      activeMemoryItems: corpus.archiveSources.length + 1,
      excludedMemoryItems: 1,
      continuityRecords: 1,
      spaces: 1,
      documents: 1,
      discussionComments: 1,
      seminarFeatures: 3,
      developerSpaces: developerSpaces.length,
      developerSpaceNodes: developerSpaces.length,
      developerSpaceEvents: developerSpaces.length,
      developerSpaceSnapshots: developerSpaces.length,
      developerSpaceDocuments: developerSpaceDocumentCount,
      exportPackages: 1,
    },
    counts,
    labels: labels ?? {
      archiveSources: corpus.archiveSources.map((source) => source.label),
      personaName: corpus.persona.name,
      publicPersonaName: publicPersonaInput(corpus).name,
      publicPersonaSlug: publicPersonaInput(corpus).publicSlug,
      publicPersonaChatEnabled: publicPersonaInput(corpus).publicChatEnabled,
      spaceSlug: corpus.space.slug,
      documentSlug: corpus.space.document.slug,
      seminarFeatureTypes: ["document", "thread", "space"],
      developerSpaceSlug: corpus.developerSpace.slug,
      developerSpaceSlugs: developerSpaces.map((developerSpace) => developerSpace.slug),
      developerSpaceEvidenceRoles: Object.fromEntries(
        developerSpaces.map((developerSpace) => [
          developerSpace.slug,
          developerSpace.documents.map((document) => document.role),
        ])
      ),
      exportLabel: corpus.exportPackage.label,
    },
    omitted: [
      "credentials",
      "tokens",
      "raw archive text",
      "prompt bodies",
      "private excerpts",
    ],
  }, null, 2));
}
