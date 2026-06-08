import { getSupabaseAdmin } from "../lib/supabase";

type LayerPatch = {
  soul?: Record<string, unknown>;
  body?: Record<string, unknown>;
  faculty?: Record<string, unknown>;
  skill?: Record<string, unknown>;
  evolution?: Record<string, unknown>;
};

export async function ensurePersonaLayerProfile(persona: any) {
  const sb = getSupabaseAdmin();
  const defaults = defaultLayerProfile(persona);

  const { data } = await (sb as any)
    .from("persona_layer_profiles")
    .select("*")
    .eq("persona_id", persona.id)
    .eq("owner_user_id", persona.owner_user_id)
    .maybeSingle();

  if (data) return data;

  const { data: created, error } = await (sb as any)
    .from("persona_layer_profiles")
    .insert({
      persona_id: persona.id,
      owner_user_id: persona.owner_user_id,
      ...defaults,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return created;
}

export async function updatePersonaLayerProfile(persona: any, patch: LayerPatch) {
  const sb = getSupabaseAdmin();
  await ensurePersonaLayerProfile(persona);

  const payload: Record<string, unknown> = {};
  for (const key of ["soul", "body", "faculty", "skill", "evolution"] as const) {
    if (patch[key] !== undefined) payload[key] = patch[key];
  }

  const { data, error } = await (sb as any)
    .from("persona_layer_profiles")
    .update(payload)
    .eq("persona_id", persona.id)
    .eq("owner_user_id", persona.owner_user_id)
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  await recordPersonaLifecycleEvent({
    personaId: persona.id,
    ownerUserId: persona.owner_user_id,
    eventType: "layer_update",
    eventLabel: "Persona layer profile updated",
    eventData: { layers: Object.keys(payload) },
  });
  return data;
}

export async function recordPersonaLifecycleEvent(input: {
  personaId: string;
  ownerUserId: string;
  eventType: string;
  eventLabel?: string;
  eventData?: Record<string, unknown>;
}) {
  const sb = getSupabaseAdmin();
  await (sb as any).from("persona_lifecycle_events").insert({
    persona_id: input.personaId,
    owner_user_id: input.ownerUserId,
    event_type: input.eventType,
    event_label: input.eventLabel ?? null,
    event_data: input.eventData ?? {},
  });
}

export async function listPersonaLifecycleEvents(personaId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("persona_lifecycle_events")
    .select("*")
    .eq("persona_id", personaId)
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createPersonaHandoff(input: {
  ownerUserId: string;
  fromPersonaId?: string | null;
  toPersonaId: string;
  conversationId?: string | null;
  summary?: string | null;
  pendingTasks?: unknown[];
  emotionalContext?: Record<string, unknown>;
  continuityRefs?: unknown[];
}) {
  const sb = getSupabaseAdmin();
  const summary = input.summary?.trim() || await buildConversationSummary(input.conversationId, input.ownerUserId);

  const { data, error } = await (sb as any)
    .from("persona_handoffs")
    .insert({
      owner_user_id: input.ownerUserId,
      from_persona_id: input.fromPersonaId ?? null,
      to_persona_id: input.toPersonaId,
      conversation_id: input.conversationId ?? null,
      summary,
      pending_tasks: input.pendingTasks ?? [],
      emotional_context: input.emotionalContext ?? {},
      continuity_refs: input.continuityRefs ?? [],
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);

  await recordPersonaLifecycleEvent({
    personaId: input.toPersonaId,
    ownerUserId: input.ownerUserId,
    eventType: "handoff_in",
    eventLabel: "Context handoff created",
    eventData: {
      fromPersonaId: input.fromPersonaId ?? null,
      conversationId: input.conversationId ?? null,
    },
  });

  if (input.fromPersonaId) {
    await recordPersonaLifecycleEvent({
      personaId: input.fromPersonaId,
      ownerUserId: input.ownerUserId,
      eventType: "handoff_out",
      eventLabel: "Context handed to another persona",
      eventData: {
        toPersonaId: input.toPersonaId,
        conversationId: input.conversationId ?? null,
      },
    });
  }

  return data;
}

export async function listPersonaHandoffs(personaId: string, ownerUserId: string) {
  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("persona_handoffs")
    .select("*")
    .eq("to_persona_id", personaId)
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);
  return data ?? [];
}

async function buildConversationSummary(conversationId: string | null | undefined, ownerUserId: string) {
  if (!conversationId) return "Manual handoff created without an attached conversation.";

  const sb = getSupabaseAdmin();
  const { data: conversation } = await sb
    .from("conversations")
    .select("id, title, owner_user_id")
    .eq("id", conversationId)
    .eq("owner_user_id", ownerUserId)
    .maybeSingle();

  if (!conversation) return "Conversation could not be loaded for handoff.";

  const { data: messages } = await sb
    .from("conversation_messages")
    .select("role, content, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(6);

  const recent = [...(messages ?? [])].reverse()
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n")
    .slice(0, 1800);

  return [
    conversation.title ? `Conversation: ${conversation.title}` : "Conversation handoff",
    recent || "No recent messages available.",
  ].join("\n\n");
}

function defaultLayerProfile(persona: any) {
  return {
    soul: {
      identity: {
        name: persona.name,
        bio: persona.short_description ?? "",
        longDescription: persona.long_description ?? "",
      },
      character: {
        styleNotes: persona.style_notes ?? "",
        awakeningPrompt: persona.awakening_prompt ?? "",
      },
    },
    body: {
      runtime: {
        provider: persona.provider,
        visibility: persona.visibility,
      },
    },
    faculty: {
      memory: {
        enabled: true,
        maxMemories: 500,
        summaryThreshold: 50,
        autoSummarize: true,
      },
    },
    skill: {
      installed: [],
    },
    evolution: {
      enabled: false,
      immutableTraits: [],
      driftBounds: { speakingStyle: 0.25, emotionalTone: 0.25 },
    },
  };
}
