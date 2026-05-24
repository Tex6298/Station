"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth";

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/studio";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      router.push(redirectTo);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.35rem" }}>
            Station
          </div>
          <div style={{ color: "#666", fontSize: "0.875rem" }}>Sign in to your account</div>
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          {error && (
            <div style={{
              background: "#2d1515", border: "1px solid #7d2e2e", color: "#eb5757",
              borderRadius: 8, padding: "0.65rem 0.9rem", marginBottom: "1.25rem", fontSize: "0.875rem"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.875rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "#888", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Email
              </label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.35rem" }}>
                <label style={{ fontSize: "0.78rem", color: "#888", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Password
                </label>
                <Link href="/reset-password" style={{ fontSize: "0.75rem", color: "#555" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.5rem", padding: "0.7rem",
                background: "#7c6af7", border: "none", borderRadius: 10,
                color: "#fff", fontWeight: 600, fontSize: "0.95rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "#555" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#7c6af7", fontWeight: 500 }}>Create one</Link>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
