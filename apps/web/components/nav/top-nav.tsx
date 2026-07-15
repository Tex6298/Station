"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@station/types";
import { restoreSession, signOut } from "@/lib/auth";
import { LOGIN_REDIRECT_PARAM, isProtectedRoute } from "@/lib/auth-routes";
import {
  TOP_NAV_PRIVATE_ROUTES,
  TOP_NAV_PUBLIC_ROUTES,
  activeTopNavHref,
  activeTopNavPrivateRoute,
} from "@/lib/studio-navigation";
import {
  STATION_THEME_MEDIA_QUERY,
  STATION_THEME_PREFERENCES,
  STATION_THEME_STORAGE_KEY,
  type StationThemePreference,
  applyStationTheme,
  persistStationThemePreference,
  readStationThemePreference,
} from "@/lib/theme";

type NavUser = AuthUser & { email: string; isAdmin: boolean };

function stationThemeMedia(): MediaQueryList | null {
  try {
    return typeof window.matchMedia === "function" ? window.matchMedia(STATION_THEME_MEDIA_QUERY) : null;
  } catch {
    return null;
  }
}

function stationThemeStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<NavUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [routeMenuOpen, setRouteMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [themePreference, setThemePreference] = useState<StationThemePreference>("system");
  const themePreferenceRef = useRef<StationThemePreference>("system");
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const routeMenuRef = useRef<HTMLDivElement>(null);
  const routeMenuButtonRef = useRef<HTMLButtonElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const themeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const media = stationThemeMedia();
    const sync = (preference: StationThemePreference) => {
      themePreferenceRef.current = preference;
      setThemePreference(preference);
      applyStationTheme(document.documentElement, preference, media?.matches ?? false);
    };
    const handleMediaChange = () => {
      if (themePreferenceRef.current === "system") sync("system");
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STATION_THEME_STORAGE_KEY) {
        sync(readStationThemePreference(stationThemeStorage()));
      }
    };

    sync(readStationThemePreference(stationThemeStorage()));
    if (media && typeof media.addEventListener === "function") {
      media.addEventListener("change", handleMediaChange);
    } else {
      media?.addListener(handleMediaChange);
    }
    window.addEventListener("storage", handleStorage);
    return () => {
      if (media && typeof media.removeEventListener === "function") {
        media.removeEventListener("change", handleMediaChange);
      } else {
        media?.removeListener(handleMediaChange);
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setAuthChecked(false);
    restoreSession().then((session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      setAuthChecked(true);
      if (!session && isProtectedRoute(pathname)) {
        const loginUrl = `/login?${LOGIN_REDIRECT_PARAM}=${encodeURIComponent(pathname)}`;
        router.replace(loginUrl);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  useEffect(() => {
    setAccountMenuOpen(false);
    setRouteMenuOpen(false);
    setThemeMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (accountMenuRef.current && !accountMenuRef.current.contains(target)) {
        setAccountMenuOpen(false);
      }
      if (routeMenuRef.current && !routeMenuRef.current.contains(target)) {
        setRouteMenuOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(target)) {
        setThemeMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!accountMenuOpen && !routeMenuOpen && !themeMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (routeMenuOpen) {
        setRouteMenuOpen(false);
        routeMenuButtonRef.current?.focus();
        return;
      }
      if (themeMenuOpen) {
        setThemeMenuOpen(false);
        themeButtonRef.current?.focus();
        return;
      }
      setAccountMenuOpen(false);
      accountButtonRef.current?.focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [accountMenuOpen, routeMenuOpen, themeMenuOpen]);

  async function handleSignOut() {
    setAccountMenuOpen(false);
    setRouteMenuOpen(false);
    setThemeMenuOpen(false);
    await signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const displayName = user?.email ?? "";
  const initials = user ? displayName.slice(0, 2).toUpperCase() : "";
  const currentPrivateRoute = user ? activeTopNavPrivateRoute(pathname) : null;
  const currentPrivateLabel = currentPrivateRoute
    ? "compactLabel" in currentPrivateRoute
      ? currentPrivateRoute.compactLabel
      : currentPrivateRoute.label
    : null;

  return (
    <nav className="top-nav" aria-label="Primary navigation">
      <div className="top-nav-shell">
        <Link href="/" className="top-nav-brand">
          Station
        </Link>

        <div className="top-nav-link-group" aria-label="Primary sections">
          {TOP_NAV_PUBLIC_ROUTES.map((route) => (
            <TopNavLink
              key={route.href}
              href={route.href}
              label={route.label}
              active={activeTopNavHref(pathname, route.href)}
              scope="public"
            />
          ))}

          {currentPrivateRoute && currentPrivateLabel ? (
            <TopNavLink
              href={currentPrivateRoute.href}
              label={currentPrivateLabel}
              active
              scope="auth"
            />
          ) : null}
        </div>

        <div ref={routeMenuRef} className="top-nav-route-menu">
          <button
            ref={routeMenuButtonRef}
            type="button"
            className="top-nav-route-menu-button"
            data-open={routeMenuOpen ? "true" : "false"}
            aria-expanded={routeMenuOpen}
            aria-controls="top-nav-route-menu-panel"
            aria-label="Navigation menu"
            onClick={() => {
              setAccountMenuOpen(false);
              setThemeMenuOpen(false);
              setRouteMenuOpen((open) => !open);
            }}
          >
            Menu
          </button>

          {routeMenuOpen ? (
            <div
              id="top-nav-route-menu-panel"
              className="top-nav-dropdown top-nav-route-dropdown"
              role="group"
              aria-label="Station destinations"
            >
              {TOP_NAV_PUBLIC_ROUTES.map((route) => (
                <TopNavMenuLink
                  key={route.href}
                  href={route.href}
                  label={route.label}
                  active={activeTopNavHref(pathname, route.href)}
                  onSelect={() => setRouteMenuOpen(false)}
                />
              ))}
              {user ? <div className="top-nav-menu-divider" /> : null}
              {user
                ? TOP_NAV_PRIVATE_ROUTES.map((route) => (
                    <TopNavMenuLink
                      key={route.href}
                      href={route.href}
                      label={route.label}
                      active={activeTopNavHref(pathname, route.href)}
                      onSelect={() => setRouteMenuOpen(false)}
                    />
                  ))
                : null}
            </div>
          ) : null}
        </div>

        <div ref={themeMenuRef} className="top-nav-theme-menu">
          <button
            ref={themeButtonRef}
            type="button"
            className="top-nav-theme-button"
            data-open={themeMenuOpen ? "true" : "false"}
            aria-expanded={themeMenuOpen}
            aria-haspopup="menu"
            aria-controls="top-nav-theme-menu"
            aria-label={`Appearance: ${themePreference}`}
            title="Appearance"
            onClick={() => {
              setAccountMenuOpen(false);
              setRouteMenuOpen(false);
              setThemeMenuOpen((open) => !open);
            }}
          >
            <span className="top-nav-theme-glyph" aria-hidden="true" />
          </button>

          {themeMenuOpen ? (
            <div
              id="top-nav-theme-menu"
              className="top-nav-dropdown top-nav-theme-dropdown"
              role="menu"
              aria-label="Appearance"
            >
              <div className="top-nav-theme-heading">Appearance</div>
              {STATION_THEME_PREFERENCES.map((preference) => (
                <button
                  key={preference}
                  type="button"
                  className="top-nav-theme-option"
                  role="menuitemradio"
                  aria-checked={themePreference === preference}
                  data-active={themePreference === preference ? "true" : "false"}
                  onClick={() => {
                    const media = stationThemeMedia();
                    themePreferenceRef.current = preference;
                    setThemePreference(preference);
                    persistStationThemePreference(stationThemeStorage(), preference);
                    applyStationTheme(document.documentElement, preference, media?.matches ?? false);
                    setThemeMenuOpen(false);
                    themeButtonRef.current?.focus();
                  }}
                >
                  <span>{preference[0].toUpperCase() + preference.slice(1)}</span>
                  <span aria-hidden="true">{themePreference === preference ? "Selected" : ""}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="top-nav-account">
          {!authChecked ? (
            <div className="top-nav-skeleton" />
          ) : user ? (
            <div ref={accountMenuRef} className="top-nav-menu">
              <button
                ref={accountButtonRef}
                type="button"
                onClick={() => {
                  setRouteMenuOpen(false);
                  setThemeMenuOpen(false);
                  setAccountMenuOpen((open) => !open);
                }}
                className="top-nav-user-button"
                data-open={accountMenuOpen ? "true" : "false"}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                aria-controls="top-nav-account-menu"
                aria-label={`${displayName} account menu`}
              >
                <div className="top-nav-avatar">{initials}</div>
                <span className="top-nav-user-email">{displayName}</span>
                <span className="top-nav-caret" aria-hidden="true">v</span>
              </button>

              {accountMenuOpen ? (
                <div id="top-nav-account-menu" className="top-nav-dropdown" role="menu">
                  <div className="top-nav-dropdown-header">
                    <div className="top-nav-dropdown-email">{displayName}</div>
                    <div className="top-nav-tier">{user.tier}</div>
                  </div>

                  {TOP_NAV_PRIVATE_ROUTES.map((route) => (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={() => setAccountMenuOpen(false)}
                      className="top-nav-menu-link"
                      aria-current={activeTopNavHref(pathname, route.href) ? "page" : undefined}
                      role="menuitem"
                    >
                      {route.label}
                    </Link>
                  ))}

                  <div className="top-nav-menu-divider">
                    <button type="button" onClick={handleSignOut} className="top-nav-signout" role="menuitem">
                      Sign out
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="top-nav-auth-actions">
              <Link href="/login" className="top-nav-auth-link">
                Sign in
              </Link>
              <Link href="/signup" className="top-nav-auth-link top-nav-auth-link-primary">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function TopNavLink({
  href,
  label,
  active,
  scope,
}: {
  href: string;
  label: string;
  active: boolean;
  scope: "public" | "auth";
}) {
  return (
    <Link
      href={href}
      className="top-nav-link"
      data-active={active ? "true" : "false"}
      data-nav-scope={scope}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

function TopNavMenuLink({
  href,
  label,
  active,
  onSelect,
}: {
  href: string;
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <Link
      href={href}
      className="top-nav-menu-link"
      data-active={active ? "true" : "false"}
      aria-current={active ? "page" : undefined}
      onClick={onSelect}
    >
      {label}
    </Link>
  );
}
