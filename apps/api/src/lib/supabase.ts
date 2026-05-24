import { createClient } from "@supabase/supabase-js";
import type { Database } from "@station/db";

type SupabaseAdminClient = ReturnType<typeof createClient<Database>>;

let _client: SupabaseAdminClient | null = null;

export function setSupabaseAdminForTests(client: SupabaseAdminClient | null) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("setSupabaseAdminForTests can only be used while NODE_ENV is test.");
  }
  _client = client;
}

/**
 * Returns a singleton Supabase service-role client for the API.
 * The service role bypasses RLS - only use server-side.
 */
export function getSupabaseAdmin() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.");
  }
  _client = createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
  return _client;
}

/**
 * Creates a short-lived Supabase client scoped to a specific user JWT.
 * Used to validate tokens and respect RLS in user-facing queries.
 */
export function getSupabaseForUser(accessToken: string) {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set.");
  }
  return createClient<Database>(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
}
