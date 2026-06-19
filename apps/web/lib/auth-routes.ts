export const STATION_AUTH_COOKIE = "station-auth";
export const LOGIN_REDIRECT_PARAM = "redirect";

export function isProtectedRoute(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  const [first, second, third, fourth] = parts;

  if (first === "studio") return true;
  if (first === "billing") return true;
  if (first === "settings") return true;
  if (first === "projects") return true;

  if (first === "space") {
    if (parts.length === 1) return true;
    if (second === "new") return true;
    if (third === "manage") return true;
    if (third === "documents" && fourth === "new") return true;
  }

  if (first === "developer-spaces" && third === "manage") return true;
  if (first === "forums" && third === "new") return true;

  return false;
}
