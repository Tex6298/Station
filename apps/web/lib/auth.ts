import { createBrowserClient } from "@station/db";

/**
 * Returns a Supabase browser client for use in React components.
 * Lazily created - safe to call on every render.
 */
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = createBrowserClient();
  }
  return _client;
}

/**
 * Returns true if there is an active Supabase session.
 */
export async function isAuthenticated(): Promise<boolean> {
  const sb = getSupabaseClient();
  const { data } = await sb.auth.getSession();
  return !!data.session;
}

/**
 * Returns the current session, or null if unauthenticated.
 */
export async function getSession() {
  const sb = getSupabaseClient();
  const { data } = await sb.auth.getSession();
  return data.session;
}

/**
 * Returns the current user object, or null if unauthenticated.
 */
export async function getCurrentUser() {
  const sb = getSupabaseClient();
  const { data } = await sb.auth.getUser();
  return data.user ?? null;
}

/**
 * Sign in with email + password.
 */
export async function signIn(email: string, password: string) {
  const sb = getSupabaseClient();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  return data.session;
}

/**
 * Sign up with email + password + display name.
 * Creates the Supabase auth user; the DB trigger auto-creates the profile row.
 */
export async function signUp(email: string, password: string, displayName: string) {
  const sb = getSupabaseClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw new Error(error.message);
  return data.session;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const sb = getSupabaseClient();
  await sb.auth.signOut();
}
