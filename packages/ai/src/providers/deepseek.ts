import type { ChatProvider } from "./base";
import type { ChatProviderInput, ChatProviderResponse } from "../types";

export class DeepseekProvider implements ChatProvider {
  constructor(private readonly config: { apiKey?: string; baseUrl: string; model?: string }) {}

  async sendMessage(input: ChatProviderInput): Promise<ChatProviderResponse> {
    if (!this.config.apiKey) {
      const lastUserMessage = [...input.messages].reverse().find((message) => message.role === "user");
      return {
        content: `Mock DeepSeek reply: ${lastUserMessage?.content ?? "Hello."}`,
        model: this.config.model || "deepseek-chat",
      };
    }

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: input.model || this.config.model || "deepseek-chat",
        messages: [
          ...(input.system ? [{ role: "system", content: input.system }] : []),
          ...input.messages,
        ],
        ...(input.maxOutputTokens ? { max_tokens: input.maxOutputTokens } : {}),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`DeepSeek request failed: ${response.status} ${text}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }>; model?: string };
    return {
      content: data.choices?.[0]?.message?.content || "",
      model: data.model || input.model || this.config.model || "deepseek-chat",
    };
  }
}
