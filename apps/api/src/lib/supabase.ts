import { createClient } from "@supabase/supabase-js";
import type { Database } from "@station/db";

type SupabaseAdminClient = ReturnType<typeof createClient<Database>>;
type SupabaseAuthClient = ReturnType<typeof createClient<Database>>;

let _client: SupabaseAdminClient | null = null;
let _authClientFactory: ((accessToken?: string) => SupabaseAuthClient) | null = null;

export function setSupabaseAdminForTests(client: SupabaseAdminClient | null) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("setSupabaseAdminForTests can only be used while NODE_ENV is test.");
  }
  _client = client;
}

export function setSupabaseAuthClientFactoryForTests(
  factory: ((accessToken?: string) => SupabaseAuthClient) | null
) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("setSupabaseAuthClientFactoryForTests can only be used while NODE_ENV is test.");
  }
  _authClientFactory = factory;
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
 * Returns an anon Supabase auth client for password sign-in/sign-out flows.
 */
export function getSupabaseAuthClient(accessToken?: string) {
  if (_authClientFactory) return _authClientFactory(accessToken);
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set.");
  }
  return createClient<Database>(url, anonKey, {
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    auth: { persistSession: false },
  });
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
