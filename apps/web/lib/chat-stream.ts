import { apiPost, apiUrl } from "./api-client";
import type { ConversationMessage } from "@station/types/persona";

export type ChatStreamStatus = {
  stage: string;
  message: string;
};

export type ChatStreamComplete = {
  conversationId: string;
  reply: ConversationMessage;
};

export type ChatStreamError = {
  status?: number;
  error: string;
  code?: string;
  classification?: string;
};

export type SendPersonaChatInput = {
  personaId: string;
  content: string;
  conversationId?: string | null;
  token: string;
  onStatus?: (status: ChatStreamStatus) => void;
};

export async function sendPersonaChatWithStream(input: SendPersonaChatInput): Promise<ChatStreamComplete> {
  if (!supportsReadableStream()) {
    return sendPersonaChatFallback(input);
  }

  let response: Response;
  try {
    response = await fetch(apiUrl(`/conversations/persona/${input.personaId}/chat/stream`), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.token}`,
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        content: input.content,
        conversationId: input.conversationId ?? undefined,
      }),
      cache: "no-store",
    });
  } catch {
    return sendPersonaChatFallback(input);
  }

  if (!response.ok || !response.body || !response.headers.get("content-type")?.includes("text/event-stream")) {
    return sendPersonaChatFallback(input);
  }

  return consumeChatStream(response.body, input.onStatus);
}

async function sendPersonaChatFallback(input: SendPersonaChatInput): Promise<ChatStreamComplete> {
  return apiPost<ChatStreamComplete>(
    `/conversations/persona/${input.personaId}/chat`,
    { content: input.content, conversationId: input.conversationId ?? undefined },
    input.token
  );
}

export async function consumeChatStream(
  body: ReadableStream<Uint8Array>,
  onStatus?: (status: ChatStreamStatus) => void
): Promise<ChatStreamComplete> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const parts = buffer.split(/\r?\n\r?\n/);
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const event = parseSseEvent(part);
      if (!event) continue;
      if (event.event === "chat.status") {
        onStatus?.(event.data as ChatStreamStatus);
      }
      if (event.event === "chat.complete") {
        return event.data as ChatStreamComplete;
      }
      if (event.event === "chat.error") {
        const error = event.data as ChatStreamError;
        throw new Error(error.error || "Message failed.");
      }
    }

    if (done) break;
  }

  throw new Error("Chat stream ended before completion.");
}

function parseSseEvent(chunk: string): { event: string; data: unknown } | null {
  const eventLine = chunk.split(/\r?\n/).find((line) => line.startsWith("event:"));
  const dataLine = chunk.split(/\r?\n/).find((line) => line.startsWith("data:"));
  if (!eventLine || !dataLine) return null;

  const event = eventLine.slice("event:".length).trim();
  const rawData = dataLine.slice("data:".length).trim();
  if (!event || !rawData) return null;

  try {
    return { event, data: JSON.parse(rawData) };
  } catch {
    return null;
  }
}

function supportsReadableStream() {
  return typeof ReadableStream !== "undefined" && typeof TextDecoder !== "undefined";
}
