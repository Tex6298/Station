import Link from "next/link";

export default function ConfirmPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: 440, textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>✉️</div>
        <h1 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>Check your email</h1>
        <p style={{ color: "#666", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>
          We sent you a confirmation link. Click it to activate your account and you&apos;ll be taken straight to your Studio.
        </p>
        <Link href="/login" style={{ color: "#7c6af7", fontSize: "0.875rem" }}>
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
