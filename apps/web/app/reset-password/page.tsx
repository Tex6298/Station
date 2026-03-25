"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/auth";

export default function ResetPasswordPage() {
  const [email,     setEmail]     = useState("");
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [loading,   setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError("Please enter your email."); return; }
    setError(null);
    setLoading(true);
    try {
      const sb = getSupabaseClient();
      const { error: err } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password/update`,
      });
      if (err) throw new Error(err.message);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "0.35rem" }}>Station</div>
          <div style={{ color: "#666", fontSize: "0.875rem" }}>Reset your password</div>
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>✉️</div>
              <p style={{ color: "#ccc", fontSize: "0.9rem", lineHeight: 1.7 }}>
                If an account exists for <strong>{email}</strong>, a reset link is on its way.
              </p>
            </div>
          ) : (
            <>
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
                    Email address
                  </label>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "0.7rem", background: "#7c6af7", border: "none", borderRadius: 10,
                    color: "#fff", fontWeight: 600, fontSize: "0.95rem",
                    cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "#555" }}>
          <Link href="/login" style={{ color: "#7c6af7" }}>Back to sign in</Link>
        </div>
      </div>
    </main>
  );
}
