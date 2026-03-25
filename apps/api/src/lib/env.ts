import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("4000"),

  // Supabase
  SUPABASE_URL: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // AI — platform provider (DeepSeek for chat)
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().default("https://api.deepseek.com"),
  DEEPSEEK_MODEL: z.string().default("deepseek-chat"),

  // AI — embeddings (OpenAI text-embedding-3-small)
  // Optional: falls back to pseudo-embeddings in dev if not set
  OPENAI_API_KEY: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
