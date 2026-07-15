import type { AuthUser } from "@station/types";

export const AUTH_STORAGE_KEY = "station.auth.session.v1";

export interface AuthApiResponse {
  userId: string;
  email: string;
  tier: AuthUser["tier"];
  accessToken: string;
  refreshToken: string;
}

export interface StationSession {
  accessToken: string;
  refreshToken: string;
  access_token: string;
  refresh_token: string;
  user: AuthUser & { email: string; isAdmin: boolean };
  createdAt: string;
}

export interface StoredAuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser & { email: string; isAdmin: boolean };
  createdAt: string;
}

export function deriveUsername(input: {
  username?: string;
  displayName?: string;
  email: string;
}): string {
  const candidate = input.username || input.displayName || input.email.split("@")[0] || "station-user";
  const normalized = candidate
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

  return normalized.length >= 3 ? normalized : `${normalized}user`.slice(0, 30);
}

export function sessionFromAuthResponse(response: AuthApiResponse): StationSession {
  return withSessionAliases({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    user: {
      id: response.userId,
      email: response.email,
      tier: response.tier,
      isAdmin: false,
    },
    createdAt: new Date().toISOString(),
  });
}

export function sessionWithUser(
  session: StationSession,
  user: AuthUser & { email: string; isAdmin?: boolean }
): StationSession {
  return withSessionAliases({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: {
      id: user.id,
      email: user.email,
      tier: user.tier,
      isAdmin: user.isAdmin ?? false,
    },
    createdAt: session.createdAt,
  });
}

export function parseStoredSession(value: string | null): StationSession | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StoredAuthSession>;
    if (
      !parsed.accessToken ||
      !parsed.refreshToken ||
      !parsed.user?.id ||
      !parsed.user.email ||
      !parsed.user.tier
    ) {
      return null;
    }

    return withSessionAliases({
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      user: {
        id: parsed.user.id,
        email: parsed.user.email,
        tier: parsed.user.tier,
        isAdmin: parsed.user.isAdmin ?? false,
      },
      createdAt: parsed.createdAt ?? new Date().toISOString(),
    });
  } catch {
    return null;
  }
}

export function parseStoredSessionFromStorage(
  storage: Pick<Storage, "getItem"> | null | undefined
): StationSession | null {
  if (!storage) return null;
  try {
    return parseStoredSession(storage.getItem(AUTH_STORAGE_KEY));
  } catch {
    return null;
  }
}

export function serializeSession(session: StationSession): string {
  return JSON.stringify({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    user: session.user,
    createdAt: session.createdAt,
  } satisfies StoredAuthSession);
}

function withSessionAliases(session: StoredAuthSession): StationSession {
  return {
    ...session,
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  };
}
