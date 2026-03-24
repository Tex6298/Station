import type { ChatProvider } from "./base";
import type { ChatProviderInput, ChatProviderResponse } from "../types";

export class OpenAIProvider implements ChatProvider {
  constructor(
    private readonly config: {
      apiKey: string;
      model?: string;
      baseUrl?: string;
    }
  ) {}

  async sendMessage(input: ChatProviderInput): Promise<ChatProviderResponse> {
    const baseUrl = this.config.baseUrl ?? "https://api.openai.com/v1";
    const model = input.model ?? this.config.model ?? "gpt-4o-mini";

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(input.system ? [{ role: "system", content: input.system }] : []),
          ...input.messages,
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI request failed: ${response.status} ${text}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      model?: string;
    };

    return {
      content: data.choices?.[0]?.message?.content ?? "",
      model: data.model ?? model,
    };
  }
}
