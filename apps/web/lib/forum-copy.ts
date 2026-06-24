const CATEGORY_DESCRIPTION_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\u00c3\u00a2\u00c2\u0080\u00c2\u0094|\u00c3\u00a2\u20ac\u201a\u00ac\u00e2\u20ac\u009d|\u00e2\u20ac\u201d|\u00e2\u20ac\u201c/g, "-"],
];

export function forumCategoryDescriptionCopy(description?: string | null) {
  if (!description) return null;
  return CATEGORY_DESCRIPTION_REPLACEMENTS.reduce(
    (copy, [pattern, replacement]) => copy.replace(pattern, replacement),
    description
  );
}
