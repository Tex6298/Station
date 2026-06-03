import type { ChatProvider } from "./base";
import type { ChatProviderInput, ChatProviderResponse } from "../types";

export class AnthropicProvider implements ChatProvider {
  constructor(
    private readonly config: {
      apiKey: string;
      model?: string;
    }
  ) {}

  async sendMessage(input: ChatProviderInput): Promise<ChatProviderResponse> {
    const model = input.model ?? this.config.model ?? "claude-haiku-4-5";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        ...(input.system ? { system: input.system } : {}),
        messages: input.messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ role: m.role, content: m.content })),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic request failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
      model?: string;
      usage?: {
        input_tokens?: number;
        output_tokens?: number;
      };
    };

    const text = data.content?.find((c) => c.type === "text")?.text ?? "";
    return {
      content: text,
      model: data.model ?? model,
      usage: {
        inputTokens: data.usage?.input_tokens,
        outputTokens: data.usage?.output_tokens,
      },
    };
  }
}
