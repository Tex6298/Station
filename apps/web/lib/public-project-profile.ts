const SAFE_PROJECT_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_SHAPED_SLUG_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function publicProjectProfileCopy() {
  return "Public Project profiles are derived from public Project metadata and already-public Developer Space observatories.";
}

export function publicProjectDeveloperSpaceCountLabel(count: number) {
  if (count === 0) return "No public Developer Spaces";
  if (count === 1) return "1 public Developer Space";
  return `${count.toLocaleString("en-GB")} public Developer Spaces`;
}

export function publicProjectEmptyDeveloperSpacesCopy() {
  return "No attached public Developer Space observatories are available for this Project yet.";
}

export function publicProjectHref(slug: string | null | undefined) {
  if (!slug || !SAFE_PROJECT_SLUG_PATTERN.test(slug) || UUID_SHAPED_SLUG_PATTERN.test(slug)) {
    return null;
  }
  return `/projects/public/${slug}`;
}
