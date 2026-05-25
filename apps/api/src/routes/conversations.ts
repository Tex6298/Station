import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import { assemblePersonaRuntimeContext, buildPersonaContext } from "@station/ai/retrieval/context-builder";
import { resolveProvider } from "@station/ai/providers/router";
import { saveMessageAsMemory } from "../services/archive.service";
import { env } from "../lib/env";

const chatSchema = z.object({
  content: z.string().min(1).max(8000),
  conversationId: z.string().uuid().optional(),
});

const contextPreviewSchema = z.object({
  query: z.string().max(8000).optional(),
});

const saveMemorySchema = z.object({
  messageId: z.string().uuid(),
  relevanceWeight: z.number().min(0.1).max(5).optional(),
});

const saveCanonSchema = z.object({
  messageId: z.string().uuid(),
  title: z.string().max(120).optional(),
  priority: z.number().int().min(1).max(10).optional(),
});

export const conversationsRouter = Router();
conversationsRouter.use(requireAuth);

// -- List conversations for a persona -----------------------------------------
conversationsRouter.get("/persona/:personaId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data, error } = await sb
    .from("conversations")
    .select("id, persona_id, title, mode, created_at, updated_at")
    .eq("persona_id", req.params.personaId)
    .eq("owner_user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ conversations: data });
});

// -- Preview the private continuity context that would be sent at runtime ------
conversationsRouter.get("/persona/:personaId/context-preview", async (req, res) => {
  const parsed = contextPreviewSchema.safeParse({ query: req.query.query });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const { personaId } = req.params;

  const { data: persona, error: personaErr } = await sb
    .from("personas")
    .select("id, name, short_description, long_description, visibility, provider, awakening_prompt, style_notes, owner_user_id")
    .eq("id", personaId)
    .single();

  if (personaErr || !persona) return res.status(404).json({ error: "Persona not found." });
  if (persona.owner_user_id !== userId) return res.status(403).json({ error: "Not your persona." });

  const { data: profile } = await sb
    .from("profiles")
    .select("byok_openai_key")
    .eq("id", userId)
    .single();

  const query = parsed.data.query?.trim() || "Preview how this persona loads private continuity.";
  const context = await assemblePersonaRuntimeContext({
    supabase: sb,
    persona: {
      id: persona.id,
      name: persona.name,
      shortDescription: persona.short_description,
      longDescription: persona.long_description,
      visibility: persona.visibility as "private" | "public",
      awakeningPrompt: persona.awakening_prompt,
      styleNotes: persona.style_notes,
    },
    ownerUserId: userId,
    userQuery: query,
    embeddingApiKey: profile?.byok_openai_key ?? env.OPENAI_API_KEY,
  });

  return res.json({ query, context });
});

// -- Get a single conversation with messages -----------------------------------
conversationsRouter.get("/:conversationId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: conv, error } = await sb
    .from("conversations")
    .select("*")
    .eq("id", req.params.conversationId)
    .eq("owner_user_id", userId)
    .single();

  if (error || !conv) return res.status(404).json({ error: "Conversation not found." });

  const { data: messages } = await sb
    .from("conversation_messages")
    .select("id, role, content, tokens_used, provider_used, created_at")
    .eq("conversation_id", conv.id)
    .order("created_at", { ascending: true });

  return res.json({ conversation: conv, messages: messages ?? [] });
});

// -- Send a message (main chat endpoint) --------------------------------------
conversationsRouter.post("/persona/:personaId/chat", async (req, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;
  const { personaId } = req.params;
  const { content, conversationId } = parsed.data;

  // Load persona (verify ownership)
  const { data: persona, error: personaErr } = await sb
    .from("personas")
    .select("id, name, short_description, long_description, visibility, provider, awakening_prompt, style_notes, owner_user_id")
    .eq("id", personaId)
    .single();

  if (personaErr || !persona) return res.status(404).json({ error: "Persona not found." });
  if (persona.owner_user_id !== userId) return res.status(403).json({ error: "Not your persona." });

  // Load user profile for BYOK keys + ai_mode
  const { data: profile } = await sb
    .from("profiles")
    .select("ai_mode, byok_openai_key, byok_anthropic_key, byok_deepseek_key")
    .eq("id", userId)
    .single();

  // Get or create conversation
  let convId = conversationId;
  if (!convId) {
    const { data: newConv, error: convErr } = await sb
      .from("conversations")
      .insert({
        persona_id: personaId,
        owner_user_id: userId,
        title: `${persona.name} - ${new Date().toLocaleDateString("en-GB")}`,
        mode: "private",
      })
      .select("id")
      .single();

    if (convErr || !newConv) return res.status(500).json({ error: "Could not create conversation." });
    convId = newConv.id;
  }

  // Load existing messages for this conversation (last 20 turns)
  const { data: history } = await sb
    .from("conversation_messages")
    .select("role, content")
    .eq("conversation_id", convId)
    .order("created_at", { ascending: true })
    .limit(20);

  // Save the user message
  await sb.from("conversation_messages").insert({
    conversation_id: convId,
    role: "user",
    content,
  });

  // Build RAG system prompt
  const { systemPrompt, canonCount, memoryCount, integrityCount, archiveCount } = await buildPersonaContext({
    supabase: sb,
    persona: {
      id: persona.id,
      name: persona.name,
      shortDescription: persona.short_description,
      longDescription: persona.long_description,
      visibility: persona.visibility as "private" | "public",
      awakeningPrompt: persona.awakening_prompt,
      styleNotes: persona.style_notes,
    },
    ownerUserId: userId,
    userQuery: content,
    embeddingApiKey: profile?.byok_openai_key ?? env.OPENAI_API_KEY,
  });

  // Resolve provider
  const provider = resolveProvider({
    provider: persona.provider as "platform" | "openai" | "anthropic" | "deepseek" | "gemini",
    aiMode: (profile?.ai_mode ?? "platform") as "platform" | "byok",
    byokOpenaiKey: profile?.byok_openai_key,
    byokAnthropicKey: profile?.byok_anthropic_key,
    byokDeepseekKey: profile?.byok_deepseek_key,
    platformDeepseekKey: env.DEEPSEEK_API_KEY,
    platformDeepseekBaseUrl: env.DEEPSEEK_BASE_URL,
    platformDeepseekModel: env.DEEPSEEK_MODEL,
  });

  // Send to LLM
  const messages = [
    ...(history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user" as const, content },
  ];

  const aiResponse = await provider.sendMessage({ system: systemPrompt, messages });

  // Save assistant reply
  const { data: savedReply } = await sb
    .from("conversation_messages")
    .insert({
      conversation_id: convId,
      role: "assistant",
      content: aiResponse.content,
      provider_used: aiResponse.model,
    })
    .select("id, role, content, provider_used, created_at")
    .single();

  // Touch conversation updated_at
  await sb
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", convId);

  return res.json({
    conversationId: convId,
    reply: savedReply,
    _debug: { canonCount, memoryCount, integrityCount, archiveCount, provider: aiResponse.model },
  });
});

// -- Save last assistant message as memory -------------------------------------
conversationsRouter.post("/:conversationId/save-memory", async (req, res) => {
  const parsed = saveMemorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: conv } = await sb
    .from("conversations")
    .select("persona_id, owner_user_id")
    .eq("id", req.params.conversationId)
    .single();

  if (!conv || conv.owner_user_id !== userId) return res.status(403).json({ error: "Not authorised." });

  const { data: message } = await sb
    .from("conversation_messages")
    .select("content, role")
    .eq("id", parsed.data.messageId)
    .eq("conversation_id", req.params.conversationId)
    .single();

  if (!message || message.role !== "assistant") {
    return res.status(400).json({ error: "Message not found or not an assistant message." });
  }

  const item = await saveMessageAsMemory({
    conversationId: req.params.conversationId,
    personaId: conv.persona_id,
    ownerUserId: userId,
    content: message.content,
    relevanceWeight: parsed.data.relevanceWeight,
  });

  return res.status(201).json({ memoryItem: item });
});

// -- Save last assistant message as canon --------------------------------------
conversationsRouter.post("/:conversationId/save-canon", async (req, res) => {
  const parsed = saveCanonSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { data: conv } = await sb
    .from("conversations")
    .select("persona_id, owner_user_id")
    .eq("id", req.params.conversationId)
    .single();

  if (!conv || conv.owner_user_id !== userId) return res.status(403).json({ error: "Not authorised." });

  const { data: message } = await sb
    .from("conversation_messages")
    .select("content, role")
    .eq("id", parsed.data.messageId)
    .eq("conversation_id", req.params.conversationId)
    .single();

  if (!message || message.role !== "assistant") {
    return res.status(400).json({ error: "Message not found or not an assistant message." });
  }

  const { data: canon, error } = await sb
    .from("canon_items")
    .insert({
      persona_id: conv.persona_id,
      owner_user_id: userId,
      title: parsed.data.title ?? "Saved from chat",
      content: message.content,
      source_type: "chat",
      priority: parsed.data.priority ?? 2,
    })
    .select("*")
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ canonItem: canon });
});

// -- Delete a conversation -----------------------------------------------------
conversationsRouter.delete("/:conversationId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const userId = req.user!.id;

  const { error } = await sb
    .from("conversations")
    .delete()
    .eq("id", req.params.conversationId)
    .eq("owner_user_id", userId);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});
