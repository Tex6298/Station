export interface PersonaConversationSummary {
  id: string;
  persona_id?: string;
  personaId?: string;
  title?: string | null;
  status?: "active" | "archived";
  message_count?: number;
  messageCount?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export type PersonaConversationTarget =
  | { kind: "new"; id: null }
  | { kind: "conversation"; id: string };

export function personaConversationTarget(
  queryValue: string | null | undefined,
  conversations: Array<Pick<PersonaConversationSummary, "id">>,
): PersonaConversationTarget {
  if (queryValue === "new") return { kind: "new", id: null };
  if (queryValue?.trim()) return { kind: "conversation", id: queryValue.trim() };
  return conversations[0]
    ? { kind: "conversation", id: conversations[0].id }
    : { kind: "new", id: null };
}

export function personaConversationBelongsToPersona(
  conversation: Pick<PersonaConversationSummary, "persona_id" | "personaId">,
  personaId: string,
) {
  const conversationPersonaId = conversation.persona_id ?? conversation.personaId;
  return conversationPersonaId === personaId;
}

export function personaConversationTitle(
  conversation: Pick<PersonaConversationSummary, "title">,
  fallback = "Untitled conversation",
) {
  return conversation.title?.trim() || fallback;
}

export function filterPersonaConversations<T extends Pick<PersonaConversationSummary, "title">>(
  conversations: T[],
  query: string,
) {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return conversations;
  return conversations.filter((conversation) => personaConversationTitle(conversation).toLocaleLowerCase().includes(normalized));
}
