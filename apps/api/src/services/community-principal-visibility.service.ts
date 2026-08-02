type SupabaseLike = {
  from: (table: string) => any;
};

type PrincipalRow = {
  category_id: string;
  institution_id?: string | null;
  status?: string | null;
  visibility?: string | null;
};

export async function filterRowsByEffectiveSubcommunityPrincipal<T>(input: {
  sb: SupabaseLike;
  rows: T[];
  categoryId: (row: T) => string | null | undefined;
  requireSubcommunity?: boolean;
  visibleSubcommunityVisibilities?: readonly string[];
}) {
  const categoryIds = [...new Set(input.rows.map(input.categoryId).filter((id): id is string => Boolean(id)))];
  if (categoryIds.length === 0) return input.requireSubcommunity ? [] : input.rows;

  const { data: subcommunities, error: subcommunityError } = await input.sb
    .from("community_subcommunities")
    .select("category_id, institution_id, status, visibility")
    .in("category_id", categoryIds);
  if (subcommunityError) throw new Error("Could not verify community principal visibility.");

  const principalByCategory = new Map<string, PrincipalRow>(
    (subcommunities ?? []).map((row: PrincipalRow) => [row.category_id, row])
  );
  const institutionIds = [...new Set(
    (subcommunities ?? []).map((row: PrincipalRow) => row.institution_id).filter((id: unknown): id is string => typeof id === "string")
  )];
  const effectiveInstitutionIds = new Set<string>();
  const visibleSubcommunityVisibilities = new Set(input.visibleSubcommunityVisibilities ?? ["public"]);

  if (institutionIds.length > 0) {
    const { data: institutions, error: institutionError } = await input.sb
      .from("institutions")
      .select("id, verification_status, public_status")
      .in("id", institutionIds);
    if (institutionError) throw new Error("Could not verify Institution community visibility.");
    for (const institution of institutions ?? []) {
      if (institution.verification_status === "verified" && institution.public_status === "public") {
        effectiveInstitutionIds.add(institution.id);
      }
    }
  }

  return input.rows.filter((row) => {
    const categoryId = input.categoryId(row);
    const principal = categoryId ? principalByCategory.get(categoryId) : undefined;
    if (!principal) return !input.requireSubcommunity;
    if (!principal.institution_id) return true;
    return principal.status === "active" &&
      visibleSubcommunityVisibilities.has(String(principal.visibility)) &&
      effectiveInstitutionIds.has(principal.institution_id);
  });
}
