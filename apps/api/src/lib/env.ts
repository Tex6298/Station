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

  // AI - platform provider (DeepSeek for chat)
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().default("https://api.deepseek.com"),
  DEEPSEEK_MODEL: z.string().default("deepseek-chat"),
  ANTHROPIC_API_KEY: z.string().optional(),

  // AI - embeddings
  OPENAI_API_KEY: z.string().optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Stripe Price IDs (set these after creating products in the Stripe dashboard)
  STRIPE_PRICE_BASIC_MONTHLY:   z.string().optional(),
  STRIPE_PRICE_BASIC_YEARLY:    z.string().optional(),
  STRIPE_PRICE_CREATOR_MONTHLY: z.string().optional(),
  STRIPE_PRICE_CREATOR_YEARLY:  z.string().optional(),
  STRIPE_PRICE_SEEKER_MONTHLY:  z.string().optional(), // legacy alias
  STRIPE_PRICE_SEEKER_YEARLY:   z.string().optional(), // legacy alias
  STRIPE_PRICE_KEEPER_MONTHLY:  z.string().optional(), // legacy alias
  STRIPE_PRICE_KEEPER_YEARLY:   z.string().optional(), // legacy alias
  STRIPE_PRICE_CANON_MONTHLY:   z.string().optional(),
  STRIPE_PRICE_CANON_YEARLY:    z.string().optional(),

  // Social publishing - OAuth app credentials
  // Create apps at: tumblr.com/oauth/apps, linkedin.com/developers, reddit.com/prefs/apps
  TUMBLR_CLIENT_ID:     z.string().optional(),
  TUMBLR_CLIENT_SECRET: z.string().optional(),
  LINKEDIN_CLIENT_ID:     z.string().optional(),
  LINKEDIN_CLIENT_SECRET: z.string().optional(),
  REDDIT_CLIENT_ID:     z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),

  // API's own public URL (used for OAuth redirect URIs)
  API_URL: z.string().default("http://localhost:4000"),

  // JWT secret (for auth + OAuth state tokens)
  JWT_SECRET: z.string().default("change-me-in-production"),
});

export const env = envSchema.parse(process.env);
