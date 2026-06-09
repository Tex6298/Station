"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/auth";
import { validateNewPassword } from "@/lib/password-reset";

type RecoveryState = "checking" | "ready" | "updated" | "error";

export default function UpdatePasswordPage() {
  const [status, setStatus] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prepareRecoverySession() {
      try {
        const sb = getSupabaseClient();
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await sb.auth.exchangeCodeForSession(code);
          if (error) throw error;
          window.history.replaceState(null, "", "/reset-password/update");
        }

        const { data, error } = await sb.auth.getSession();
        if (error) throw error;
        if (!data.session) {
          throw new Error("Open the latest password reset link from your email.");
        }

        if (!cancelled) {
          setStatus("ready");
          setMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(error instanceof Error ? error.message : "This reset link is invalid or expired.");
        }
      }
    }

    prepareRecoverySession();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationError = validateNewPassword(password, confirmPassword);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const sb = getSupabaseClient();
      const { error } = await sb.auth.updateUser({ password });
      if (error) throw error;
      await sb.auth.signOut();
      setStatus("updated");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to update your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: 0, marginBottom: "0.35rem" }}>
            Station
          </div>
          <div style={{ color: "#666", fontSize: "0.875rem" }}>Choose a new password</div>
        </div>

        <div className="card" style={{ padding: "2rem" }}>
          {status === "checking" && (
            <div style={{ color: "#94a3b8", textAlign: "center" }}>Checking reset link...</div>
          )}

          {status === "error" && (
            <ResetMessage
              tone="error"
              message={message ?? "This reset link is invalid or expired."}
              action={<Link href="/reset-password" style={{ color: "#7c6af7" }}>Request a new link</Link>}
            />
          )}

          {status === "updated" && (
            <ResetMessage
              tone="success"
              message="Your password has been updated. Sign in with the new password to continue."
              action={<Link href="/login" style={{ color: "#7c6af7" }}>Back to sign in</Link>}
            />
          )}

          {status === "ready" && (
            <>
              {message && (
                <div style={{
                  background: "#2d1515", border: "1px solid #7d2e2e", color: "#eb5757",
                  borderRadius: 8, padding: "0.65rem 0.9rem", marginBottom: "1.25rem", fontSize: "0.875rem"
                }}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.875rem" }}>
                <PasswordField
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                  autoFocus
                />
                <PasswordField
                  label="Confirm password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  autoComplete="new-password"
                />
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
                  {loading ? "Updating..." : "Update password"}
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

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  autoFocus = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "0.78rem", color: "#888", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <input
        className="input"
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="********"
        autoComplete={autoComplete}
        autoFocus={autoFocus}
      />
    </div>
  );
}

function ResetMessage({
  tone,
  message,
  action,
}: {
  tone: "success" | "error";
  message: string;
  action: ReactNode;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.75rem", color: tone === "success" ? "#8fd4a8" : "#eb5757" }}>
        {tone === "success" ? "Password updated" : "Reset link unavailable"}
      </div>
      <p style={{ color: "#ccc", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1rem" }}>
        {message}
      </p>
      <div style={{ fontSize: "0.9rem" }}>{action}</div>
    </div>
  );
}
