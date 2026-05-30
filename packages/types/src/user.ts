export type Tier = "visitor" | "private" | "creator" | "canon" | "institutional";

export interface AuthUser {
  id: string;
  tier: Tier;
  isAdmin?: boolean;
  email?: string;
}

export interface Profile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  tier: Tier;
  aiMode: "platform" | "byok";
  createdAt: string;
  updatedAt: string;
}
