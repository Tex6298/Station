import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.string().default("4000"),

  // Supabase
  SUPABASE_URL: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // App URL (used for Stripe redirect URLs)
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),

  // AI — platform provider (DeepSeek for chat)
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().default("https://api.deepseek.com"),
  DEEPSEEK_MODEL: z.string().default("deepseek-chat"),

  // AI — embeddings
  OPENAI_API_KEY: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Stripe Price IDs (set these after creating products in the Stripe dashboard)
  STRIPE_PRICE_SEEKER_MONTHLY:  z.string().optional(),
  STRIPE_PRICE_SEEKER_YEARLY:   z.string().optional(),
  STRIPE_PRICE_KEEPER_MONTHLY:  z.string().optional(),
  STRIPE_PRICE_KEEPER_YEARLY:   z.string().optional(),
  STRIPE_PRICE_CANON_MONTHLY:   z.string().optional(),
  STRIPE_PRICE_CANON_YEARLY:    z.string().optional(),
});

export const env = envSchema.parse(process.env);
