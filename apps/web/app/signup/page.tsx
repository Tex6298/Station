"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, signIn } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email,       setEmail]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [error,       setError]       = useState<string | null>(null);
  const [loading,     setLoading]     = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName || !email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }

    setError(null);
    setLoading(true);
    try {
      const session = await signUp(email, password, displayName);
      // If Supabase email confirmation is disabled the session is returned immediately
      if (session) {
        router.push("/studio");
      } else {
        // Email confirmation required - redirect to a holding page
        router.push("/signup/confirm");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
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
          <div style={{ color: "#666", fontSize: "0.875rem" }}>Create your account</div>
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
                Display name
              </label>
              <input
                className="input"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you appear to others"
                autoComplete="name"
                autoFocus
              />
            </div>

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
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "#888", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Password
              </label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", color: "#888", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Confirm password
              </label>
              <input
                className="input"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="********"
                autoComplete="new-password"
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#0d111a", borderRadius: 8, fontSize: "0.78rem", color: "#555", lineHeight: 1.6 }}>
            By creating an account you agree to our terms of service. Station is a platform for the AI persona community - be kind.
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "#555" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#7c6af7", fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </main>
  );
}
