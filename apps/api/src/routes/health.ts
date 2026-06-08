import { Router } from "express";
import { env } from "../lib/env";

export const healthRouter = Router();
healthRouter.get("/health", (_req, res) => res.json({ ok: true }));

healthRouter.get("/health/deployment", (_req, res) => {
  res.json({
    ok: true,
    appUrl: env.NEXT_PUBLIC_APP_URL,
    apiUrl: env.API_URL,
    checks: {
      supabaseUrl: Boolean(env.SUPABASE_URL),
      supabaseAnonKey: Boolean(env.SUPABASE_ANON_KEY),
      supabaseServiceRoleKey: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
      anthropicProvider: Boolean(env.ANTHROPIC_API_KEY),
      deepseekProvider: Boolean(env.DEEPSEEK_API_KEY),
      openaiEmbeddings: Boolean(env.OPENAI_API_KEY),
      stripeBilling: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET),
      jwtSecretConfigured: env.JWT_SECRET !== "change-me-in-production",
    },
  });
});
