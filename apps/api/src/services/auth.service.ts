import { getSupabaseAdmin } from "../lib/supabase";
import type { Tier } from "@station/db";

export interface SignUpInput {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface AuthResult {
  userId: string;
  email: string;
  tier: Tier;
  accessToken: string;
  refreshToken: string;
}

/**
 * Sign up a new user.
 * Supabase creates the auth.users row; the handle_new_user trigger
 * automatically creates the matching profiles row.
 */
export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const sb = getSupabaseAdmin();

  const { data, error } = await sb.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: false, // set true in production to require email verification
    user_metadata: {
      username: input.username,
      display_name: input.displayName ?? input.username,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to create user.");
  }

  // Sign in immediately to get tokens
  const signInResult = await signIn({ email: input.email, password: input.password });
  return signInResult;
}

/**
 * Sign in an existing user and return tokens + tier.
 */
export async function signIn(input: SignInInput): Promise<AuthResult> {
  const sb = getSupabaseAdmin();

  // Use signInWithPassword via the anon-key client
  const { createClient } = await import("@supabase/supabase-js");
  const anonClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );

  const { data, error } = await anonClient.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.session || !data.user) {
    throw new Error(error?.message ?? "Invalid credentials.");
  }

  // Fetch tier from profiles
  const { data: profile } = await sb
    .from("profiles")
    .select("tier")
    .eq("id", data.user.id)
    .single();

  return {
    userId: data.user.id,
    email: data.user.email!,
    tier: (profile?.tier ?? "visitor") as Tier,
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

/**
 * Validate a JWT and return the user's id + tier.
 * Used by requireAuth middleware.
 */
export async function validateToken(
  accessToken: string
): Promise<{ userId: string; tier: Tier; isAdmin: boolean } | null> {
  const sb = getSupabaseAdmin();

  const { data: { user }, error } = await sb.auth.getUser(accessToken);
  if (error || !user) return null;

  const { data: profile } = await sb
    .from("profiles")
    .select("tier, is_admin")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    tier: (profile?.tier ?? "visitor") as Tier,
    isAdmin: profile?.is_admin ?? false,
  };
}

/**
 * Sign out — revokes the session server-side.
 */
export async function signOut(accessToken: string): Promise<void> {
  const { createClient } = await import("@supabase/supabase-js");
  const client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
  await client.auth.signOut();
}
