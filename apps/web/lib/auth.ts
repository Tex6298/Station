import { createBrowserClient } from "@station/db";
import type { AuthUser } from "@station/types";
import { apiGet, apiPost } from "./api-client";
import { STATION_AUTH_COOKIE } from "./auth-routes";
import {
  AUTH_STORAGE_KEY,
  deriveUsername,
  parseStoredSessionFromStorage,
  serializeSession,
  sessionFromAuthResponse,
  sessionWithUser,
  type AuthApiResponse,
  type StationSession,
} from "./auth-session";

/**
 * Returns a Supabase browser client for flows that still use Supabase directly,
 * such as password reset emails.
 */
let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!_client) {
    _client = createBrowserClient();
  }
  return _client;
}

export async function isAuthenticated(): Promise<boolean> {
  return Boolean(await restoreSession());
}

export async function getSession(): Promise<StationSession | null> {
  return restoreSession();
}

export async function restoreSession(): Promise<StationSession | null> {
  const session = readStoredSession();
  if (!session) return null;

  try {
    const user = await fetchCurrentUser(session.accessToken);
    const restored = sessionWithUser(session, user);
    saveSession(restored);
    return restored;
  } catch {
    return refreshStoredSession(session);
  }
}

export async function getCurrentUser() {
  const session = await restoreSession();
  return session?.user ?? null;
}

export async function signIn(email: string, password: string): Promise<StationSession> {
  const result = await apiPost<AuthApiResponse>("/auth/signin", { email, password });
  return saveAndVerify(result);
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  username?: string
): Promise<StationSession> {
  const result = await apiPost<AuthApiResponse>("/auth/signup", {
    email,
    password,
    username: deriveUsername({ username, displayName, email }),
    displayName,
  });
  return saveAndVerify(result);
}

export async function signOut(): Promise<void> {
  const session = await restoreSession();
  try {
    if (session) {
      await apiPost<void>("/auth/signout", {}, session.accessToken);
    }
  } finally {
    clearStoredSession();
  }
}

export function readStoredSession(): StationSession | null {
  return parseStoredSessionFromStorage(browserStorage());
}

export function saveSession(session: StationSession): void {
  const storage = browserStorage();
  storage?.setItem(AUTH_STORAGE_KEY, serializeSession(session));
  setAuthCookie(true);
}

export function clearStoredSession(): void {
  const storage = browserStorage();
  storage?.removeItem(AUTH_STORAGE_KEY);
  setAuthCookie(false);
}

async function saveAndVerify(response: AuthApiResponse): Promise<StationSession> {
  const initial = sessionFromAuthResponse(response);
  saveSession(initial);
  try {
    const user = await fetchCurrentUser(initial.accessToken);
    const verified = sessionWithUser(initial, user);
    saveSession(verified);
    return verified;
  } catch (error) {
    clearStoredSession();
    throw error;
  }
}

async function refreshStoredSession(session: StationSession): Promise<StationSession | null> {
  try {
    const refreshed = await apiPost<AuthApiResponse>("/auth/refresh", {
      refreshToken: session.refreshToken,
    });
    const next = sessionFromAuthResponse(refreshed);
    saveSession(next);
    const user = await fetchCurrentUser(next.accessToken);
    const verified = sessionWithUser(next, user);
    saveSession(verified);
    return verified;
  } catch {
    clearStoredSession();
    return null;
  }
}

async function fetchCurrentUser(accessToken: string): Promise<AuthUser & { email: string; isAdmin: boolean }> {
  const data = await apiGet<{ user: AuthUser }>("/auth/me", accessToken);
  if (!data.user.email) {
    throw new Error("Authenticated user is missing an email address.");
  }
  return {
    id: data.user.id,
    email: data.user.email,
    tier: data.user.tier,
    isAdmin: data.user.isAdmin ?? false,
  };
}

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function setAuthCookie(authenticated: boolean): void {
  if (typeof document === "undefined") return;

  if (!authenticated) {
    document.cookie = `${STATION_AUTH_COOKIE}=; Path=/; SameSite=Lax; Max-Age=0`;
    return;
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${STATION_AUTH_COOKIE}=1; Path=/; SameSite=Lax; Max-Age=2592000${secure}`;
}
