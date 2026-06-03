export interface ChatInputMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatProviderInput {
  system?: string;
  messages: ChatInputMessage[];
  model?: string;
}

export interface ChatProviderResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}
