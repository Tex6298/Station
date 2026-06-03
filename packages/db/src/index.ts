import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

declare const process: { env: Record<string, string | undefined> };

export type * from "./types";

/**
 * Server-side Supabase client (uses service role key - never expose to browser).
 * Import this in API routes and server actions only.
 */
export function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Browser-safe Supabase client (uses anon key).
 * Import this in Next.js client components only.
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set."
    );
  }
  return createClient<Database>(url, key);
}
