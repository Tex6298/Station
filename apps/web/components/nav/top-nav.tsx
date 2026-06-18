"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { AuthUser } from "@station/types";
import { restoreSession, signOut } from "@/lib/auth";
import { LOGIN_REDIRECT_PARAM, isProtectedRoute } from "@/lib/auth-routes";
import { SIGNED_MOBILE_TOP_NAV_MENU_ROUTES } from "@/lib/studio-navigation";

type NavUser = AuthUser & { email: string; isAdmin: boolean };

const NAV_LINKS = [
  ["/discover", "Discover"],
  ["/writing", "Writing"],
  ["/forums",   "Forums"],
];

const AUTH_NAV_LINK_LABELS: Record<(typeof SIGNED_MOBILE_TOP_NAV_MENU_ROUTES)[number], string> = {
  "/studio": "Studio",
  "/space": "My Space",
  "/developer-spaces": "Developer",
};

const AUTH_NAV_LINKS = SIGNED_MOBILE_TOP_NAV_MENU_ROUTES.map((href) => [href, AUTH_NAV_LINK_LABELS[href]] as const);

export function TopNav() {
  const router   = useRouter();
  const pathname = usePathname();

  const [user,        setUser]        = useState<NavUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const displayName = user?.email ?? "";
  const initials = user
    ? displayName.slice(0, 2).toUpperCase()
    : "";

  return (
    <nav className="top-nav" aria-label="Primary navigation">
      <div className="top-nav-shell">
        <Link href="/" className="top-nav-brand">
          Station
        </Link>

        <div className="top-nav-link-group" aria-label="Primary sections">
          {NAV_LINKS.map(([href, label]) => (
            <TopNavLink key={href} href={href} label={label} active={pathname.startsWith(href)} scope="public" />
          ))}

          {user && AUTH_NAV_LINKS.map(([href, label]) => (
            <TopNavLink key={href} href={href} label={label} active={pathname.startsWith(href)} scope="auth" />
          ))}
        </div>

        <div className="top-nav-account">
        {!authChecked ? (
          <div className="top-nav-skeleton" />
        ) : user ? (
          <div ref={menuRef} className="top-nav-menu">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="top-nav-user-button"
              data-open={menuOpen ? "true" : "false"}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label={`${displayName} account menu`}
            >
              <div className="top-nav-avatar">
                {initials}
              </div>
              <span className="top-nav-user-email">
                {displayName}
              </span>
              <span className="top-nav-caret">v</span>
            </button>

            {menuOpen && (
              <div className="top-nav-dropdown" role="menu">
                <div className="top-nav-dropdown-header">
                  <div className="top-nav-dropdown-email">{displayName}</div>
                  <div className="top-nav-tier">
                    {user.tier}
                  </div>
                </div>

                {[["/studio", "Studio"], ["/space", "My Space"], ["/developer-spaces", "Developer Spaces"], ["/billing", "Billing"], ["/settings", "Settings"]].map(([href, label]) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="top-nav-menu-link" role="menuitem">
                    {label}
                  </Link>
                ))}

                <div className="top-nav-menu-divider">
                  <button onClick={handleSignOut} className="top-nav-signout" role="menuitem">
                    Sign out
                  </button>
                </div>
              </div>
            )}
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
    <Link href={href} className="top-nav-link" data-active={active ? "true" : "false"} data-nav-scope={scope}>
      {label}
    </Link>
  );
}
