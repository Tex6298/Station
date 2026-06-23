import { isAdmin, tierLimits } from "@station/auth/permissions";
import type { AuthUser } from "@station/types";

export function canExposeExistingPublicPersona(
  user: AuthUser | null | undefined,
  existingPublicPersonaCount: number
): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;

  const limit = tierLimits(user).publicPersonas;
  return limit < 0 || existingPublicPersonaCount <= limit;
}

export async function ownerCanExposeExistingPublicPersonas(sb: any, ownerUserId: string) {
  const { data: profile, error: profileError } = await sb
    .from("profiles")
    .select("id, tier, is_admin")
    .eq("id", ownerUserId)
    .maybeSingle();

  if (profileError || !profile) return false;

  const { count, error: countError } = await sb
    .from("personas")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", ownerUserId)
    .eq("visibility", "public");

  if (countError || count === null) return false;

  return canExposeExistingPublicPersona(
    {
      id: ownerUserId,
      tier: profile.tier ?? "visitor",
      isAdmin: profile.is_admin ?? false,
    },
    count ?? 0
  );
}
