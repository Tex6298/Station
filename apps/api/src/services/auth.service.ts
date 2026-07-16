import { getSupabaseAdmin, getSupabaseAuthClient } from "../lib/supabase";
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

export interface RefreshSessionInput {
  refreshToken: string;
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
    // API signup returns a session immediately in this beta flow, so the
    // server deliberately confirms admin-created email users.
    email_confirm: true,
    user_metadata: {
      username: input.username,
      display_name: input.displayName ?? input.username,
    },
  });

  if (error || !data.user) {
    throw new Error(error?.message ?? "Failed to create user.");
  }

  return signIn({ email: input.email, password: input.password });
}

/**
 * Sign in an existing user and return tokens + tier.
 */
export async function signIn(input: SignInInput): Promise<AuthResult> {
  const anonClient = getSupabaseAuthClient();

  const { data, error } = await anonClient.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.session || !data.user) {
    throw new Error(error?.message ?? "Invalid credentials.");
  }

  return authResultFromSession(data.user.id, data.user.email!, data.session);
}

/**
 * Refresh a stored browser session without requiring the password again.
 */
export async function refreshSession(input: RefreshSessionInput): Promise<AuthResult> {
  const anonClient = getSupabaseAuthClient();

  const { data, error } = await anonClient.auth.refreshSession({
    refresh_token: input.refreshToken,
  });

  if (error || !data.session || !data.user?.id || !data.user.email) {
    throw new Error(error?.message ?? "Could not refresh session.");
  }

  return authResultFromSession(data.user.id, data.user.email, data.session);
}

/**
 * Validates a JWT and returns the user's id, email, tier, and admin flag.
 * Used by requireAuth middleware.
 */
export async function validateToken(
  accessToken: string
): Promise<{ userId: string; email: string; tier: Tier; isAdmin: boolean } | null> {
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
    email: user.email!,
    tier: (profile?.tier ?? "visitor") as Tier,
    isAdmin: profile?.is_admin ?? false,
  };
}

/**
 * Sign out - revokes the session server-side.
 */
export async function signOut(accessToken: string): Promise<void> {
  const { error } = await getSupabaseAdmin().auth.admin.signOut(accessToken, "local");
  if (error) {
    throw new Error(error.message ?? "Sign out failed.");
  }
}

async function authResultFromSession(
  userId: string,
  email: string,
  session: { access_token: string; refresh_token: string }
): Promise<AuthResult> {
  const sb = getSupabaseAdmin();
  const { data: profile } = await sb
    .from("profiles")
    .select("tier")
    .eq("id", userId)
    .single();

  return {
    userId,
    email,
    tier: (profile?.tier ?? "visitor") as Tier,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
}
