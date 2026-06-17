import type { ParsedImport } from "./types";

export function parseClaudeExport(parsed: unknown, sourceName: string): ParsedImport | null {
  const source = normalizeClaudeSource(parsed);
  if (!source) return null;

  const turns = source.messages
    .map((message, index) => normalizeMessage(message, index))
    .filter((turn): turn is NonNullable<typeof turn> => Boolean(turn))
    .sort((a, b) => {
      if (a.createdAt === b.createdAt) return a.index - b.index;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      return a.createdAt.localeCompare(b.createdAt);
    });

  if (turns.length === 0) return null;

  return {
    format: "claude",
    text: turns.map((turn) => `[${turn.role}]: ${turn.text}`).join("\n"),
    metadata: {
      parser: "claude",
      sourceName,
      messageCount: turns.length,
      title: source.title,
    },
  };
}

function normalizeClaudeSource(parsed: unknown) {
  if (Array.isArray(parsed)) {
    const firstConversation = parsed.find((item) => isRecord(item) && Array.isArray(item.chat_messages));
    if (!isRecord(firstConversation) || !Array.isArray(firstConversation.chat_messages)) return null;
    return {
      messages: firstConversation.chat_messages,
      title: typeof firstConversation.name === "string" ? firstConversation.name : undefined,
    };
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.chat_messages)) return null;
  return {
    messages: parsed.chat_messages,
    title: typeof parsed.name === "string" ? parsed.name : undefined,
  };
}

function normalizeMessage(message: unknown, index: number) {
  if (!isRecord(message)) return null;
  const role = normalizeRole(message.sender ?? message.role);
  const text = textFromClaudeMessage(message);
  if (!text) return null;

  return {
    role,
    text,
    createdAt: typeof message.created_at === "string" ? message.created_at : null,
    index,
  };
}

function textFromClaudeMessage(message: Record<string, unknown>) {
  if (typeof message.text === "string") return message.text.trim();
  if (typeof message.content === "string") return message.content.trim();

  if (Array.isArray(message.content)) {
    return message.content
      .map((part) => {
        if (typeof part === "string") return part;
        if (isRecord(part) && typeof part.text === "string") return part.text;
        return "";
      })
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  return "";
}

function normalizeRole(role: unknown) {
  if (role === "human") return "user";
  if (role === "assistant") return "assistant";
  return typeof role === "string" && role.trim() ? role.trim() : "unknown";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
