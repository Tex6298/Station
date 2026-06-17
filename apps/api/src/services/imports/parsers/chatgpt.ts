import type { ParsedImport } from "./types";

type ChatGptNode = {
  id?: string;
  message?: {
    author?: { role?: string };
    content?: { parts?: unknown[]; text?: unknown };
    create_time?: number | null;
  } | null;
};

export function parseChatGptExport(parsed: unknown, sourceName: string): ParsedImport | null {
  if (!isRecord(parsed) || !isRecord(parsed.mapping)) return null;

  const turns = Object.values(parsed.mapping)
    .map((node, index) => normalizeNode(node, index))
    .filter((turn): turn is NonNullable<typeof turn> => Boolean(turn))
    .sort((a, b) => {
      if (a.createdAt === b.createdAt) return a.index - b.index;
      if (a.createdAt === null) return 1;
      if (b.createdAt === null) return -1;
      return a.createdAt - b.createdAt;
    });

  if (turns.length === 0) return null;

  return {
    format: "chatgpt",
    text: turns.map((turn) => `[${turn.role}]: ${turn.text}`).join("\n"),
    metadata: {
      parser: "chatgpt",
      sourceName,
      messageCount: turns.length,
      title: typeof parsed.title === "string" ? parsed.title : undefined,
    },
  };
}

function normalizeNode(node: unknown, index: number) {
  if (!isRecord(node)) return null;
  const message = node.message;
  if (!isRecord(message)) return null;

  const role = normalizeRole(isRecord(message.author) ? message.author.role : null);
  const text = textFromContent(message.content);
  if (!text) return null;

  return {
    role,
    text,
    createdAt: typeof message.create_time === "number" ? message.create_time : null,
    index,
  };
}

function textFromContent(content: unknown) {
  if (!isRecord(content)) return "";

  if (Array.isArray(content.parts)) {
    return content.parts
      .filter((part): part is string => typeof part === "string")
      .join(" ")
      .trim();
  }

  return typeof content.text === "string" ? content.text.trim() : "";
}

function normalizeRole(role: unknown) {
  return typeof role === "string" && role.trim() ? role.trim() : "unknown";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
