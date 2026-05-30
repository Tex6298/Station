"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { AuthUser } from "@station/types";
import { restoreSession, signOut } from "@/lib/auth";
import { LOGIN_REDIRECT_PARAM, isProtectedRoute } from "@/lib/auth-routes";

type NavUser = AuthUser & { email: string; isAdmin: boolean };

const NAV_LINKS = [
  ["/discover", "Discover"],
  ["/forums",   "Forums"],
];

const AUTH_NAV_LINKS = [
  ["/studio", "Studio"],
  ["/space",  "My Space"],
  ["/developer-spaces", "Developer"],
];

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
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      display: "flex", alignItems: "center", gap: "0.25rem",
      padding: "0 1.25rem", height: 52,
      background: "rgba(8, 11, 19, 0.86)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid #1c2535",
    }}>
      <Link href="/" style={{ fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em", marginRight: "0.5rem", textDecoration: "none", color: "inherit" }}>
        Station
      </Link>

      {NAV_LINKS.map(([href, label]) => (
        <Link key={href} href={href} style={{
          padding: "0.3rem 0.65rem", borderRadius: 7, fontSize: "0.85rem", textDecoration: "none",
          color: pathname.startsWith(href) ? "#fff" : "#94a3b8",
          background: pathname.startsWith(href) ? "#1a1f2e" : "transparent",
        }}>
          {label}
        </Link>
      ))}

      {user && AUTH_NAV_LINKS.map(([href, label]) => (
        <Link key={href} href={href} style={{
          padding: "0.3rem 0.65rem", borderRadius: 7, fontSize: "0.85rem", textDecoration: "none",
          color: pathname.startsWith(href) ? "#fff" : "#94a3b8",
          background: pathname.startsWith(href) ? "#1a1f2e" : "transparent",
        }}>
          {label}
        </Link>
      ))}

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {!authChecked ? (
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a1f2e" }} />
        ) : user ? (
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                background: menuOpen ? "#1a1f2e" : "transparent",
                border: "1px solid " + (menuOpen ? "#2a2f3e" : "transparent"),
                borderRadius: 20, padding: "0.2rem 0.5rem 0.2rem 0.2rem",
                cursor: "pointer", color: "inherit",
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "#7c6af7", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "#fff",
              }}>
                {initials}
              </div>
              <span style={{ fontSize: "0.82rem", maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </span>
              <span style={{ fontSize: "0.65rem", color: "#68738a" }}>v</span>
            </button>

            {menuOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 6px)",
                background: "#0f1220", border: "1px solid #1e2535", borderRadius: 10,
                minWidth: 190, padding: "0.4rem", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                zIndex: 100,
              }}>
                <div style={{ padding: "0.5rem 0.75rem 0.6rem", borderBottom: "1px solid #1e2535", marginBottom: "0.3rem" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600 }}>{displayName}</div>
                  <div style={{
                    display: "inline-block", marginTop: "0.2rem",
                    fontSize: "0.68rem", padding: "0.1rem 0.4rem", borderRadius: 999,
                    background: "#1a1535", border: "1px solid #2a2050", color: "#7c6af7",
                    textTransform: "capitalize",
                  }}>
                    {user.tier}
                  </div>
                </div>

                {[["/studio", "Studio"], ["/space", "My Space"], ["/developer-spaces", "Developer Spaces"], ["/billing", "Billing"], ["/settings", "Settings"]].map(([href, label]) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                    display: "block", padding: "0.45rem 0.75rem", borderRadius: 7,
                    fontSize: "0.85rem", textDecoration: "none", color: "#ccc",
                  }}>
                    {label}
                  </Link>
                ))}

                <div style={{ borderTop: "1px solid #1e2535", marginTop: "0.3rem", paddingTop: "0.3rem" }}>
                  <button onClick={handleSignOut} style={{
                    width: "100%", textAlign: "left", padding: "0.45rem 0.75rem", borderRadius: 7,
                    fontSize: "0.85rem", background: "none", border: "none", color: "#666", cursor: "pointer",
                  }}>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <Link href="/login" style={{
              padding: "0.35rem 0.8rem", borderRadius: 8, fontSize: "0.82rem",
              textDecoration: "none", color: "#888",
            }}>
              Sign in
            </Link>
            <Link href="/signup" style={{
              padding: "0.35rem 0.85rem", borderRadius: 8, fontSize: "0.82rem",
              textDecoration: "none", color: "#fff", background: "#7c6af7", fontWeight: 500,
            }}>
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
