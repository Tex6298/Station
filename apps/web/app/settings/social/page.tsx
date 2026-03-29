"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiGet, apiPost, apiDelete, apiPatch } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

interface Connection {
  id: string;
  platform: string;
  handle: string | null;
  meta: Record<string, string>;
  connected_at: string;
}

const PLATFORM_INFO: Record<string, { label: string; icon: string; color: string; authType: "simple" | "oauth"; hint?: string }> = {
  bluesky:   { label: "Bluesky",    icon: "🦋", color: "#0085ff", authType: "simple",  hint: "Use an App Password from bsky.app → Settings → App Passwords" },
  mastodon:  { label: "Mastodon",   icon: "🐘", color: "#563acc", authType: "simple",  hint: "Get an access token from your instance → Settings → Development → New Application" },
  tumblr:    { label: "Tumblr",     icon: "📝", color: "#35465c", authType: "oauth"  },
  linkedin:  { label: "LinkedIn",   icon: "💼", color: "#0a66c2", authType: "oauth"  },
  reddit:    { label: "Reddit",     icon: "🤖", color: "#ff4500", authType: "oauth",  hint: "After connecting, set your default subreddit below" },
  wordpress: { label: "WordPress",  icon: "🌐", color: "#21759b", authType: "simple",  hint: "Use an Application Password from WP Admin → Users → Profile → Application Passwords" },
  ghost:     { label: "Ghost",      icon: "👻", color: "#212121", authType: "simple",  hint: "Create an Admin API key in Ghost Admin → Integrations → Add custom integration" },
};

const CHAR_LIMITS: Record<string, number> = {
  bluesky: 300, mastodon: 500, tumblr: 4096,
  linkedin: 3000, reddit: 40000, wordpress: 0, ghost: 0,
};

function SocialSettingsContent() {
  const searchParams = useSearchParams();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading]         = useState(true);
  const [token, setToken]             = useState<string | null>(null);
  const [banner, setBanner]           = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Per-platform form state
  const [forms, setForms] = useState<Record<string, Record<string, string>>>({});
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error     = searchParams.get("error");
    if (connected) setBanner({ type: "success", text: `${PLATFORM_INFO[connected]?.label ?? connected} connected successfully.` });
    if (error)     setBanner({ type: "error",   text: decodeURIComponent(error) });

    getSession().then(async (session) => {
      if (!session) return;
      setToken(session.access_token);
      const data = await apiGet<{ connections: Connection[] }>("/social/connections", session.access_token).catch(() => ({ connections: [] }));
      setConnections(data.connections ?? []);
      setLoading(false);
    });
  }, [searchParams]);

  function setForm(platform: string, field: string, value: string) {
    setForms((prev) => ({ ...prev, [platform]: { ...(prev[platform] ?? {}), [field]: value } }));
  }

  const isConnected = (platform: string) => connections.some((c) => c.platform === platform);
  const getConnection = (platform: string) => connections.find((c) => c.platform === platform);

  async function connectSimple(platform: string) {
    if (!token) return;
    const f = forms[platform] ?? {};
    setConnecting(platform);
    try {
      const meta: Record<string, string> = {};
      let accessToken = "";
      let handle = "";

      if (platform === "bluesky") {
        accessToken = f.appPassword ?? "";
        handle      = f.handle ?? "";
        meta.handle = handle;
      } else if (platform === "mastodon") {
        accessToken         = f.accessToken ?? "";
        meta.instanceUrl    = f.instanceUrl ?? "";
        handle              = f.instanceUrl ?? "mastodon";
      } else if (platform === "wordpress") {
        accessToken      = f.appPassword ?? "";
        meta.siteUrl     = f.siteUrl ?? "";
        meta.username    = f.username ?? "";
        handle           = f.siteUrl ?? "wordpress";
      } else if (platform === "ghost") {
        accessToken   = f.adminApiKey ?? "";
        meta.siteUrl  = f.siteUrl ?? "";
        handle        = f.siteUrl ?? "ghost";
      }

      await apiPost("/social/connections/simple", { platform, handle, accessToken, meta }, token);
      const data = await apiGet<{ connections: Connection[] }>("/social/connections", token);
      setConnections(data.connections ?? []);
      setForms((prev) => ({ ...prev, [platform]: {} }));
      setBanner({ type: "success", text: `${PLATFORM_INFO[platform].label} connected.` });
    } catch (e) {
      setBanner({ type: "error", text: (e instanceof Error ? e.message : "Connection failed.") });
    } finally {
      setConnecting(null);
    }
  }

  async function connectOAuth(platform: string) {
    if (!token) return;
    setConnecting(platform);
    try {
      const data = await apiGet<{ authUrl: string }>(`/social/auth/${platform}`, token);
      window.location.href = data.authUrl;
    } catch (e) {
      setBanner({ type: "error", text: (e instanceof Error ? e.message : "OAuth init failed.") });
      setConnecting(null);
    }
  }

  async function disconnect(connectionId: string, platform: string) {
    if (!token) return;
    if (!confirm(`Disconnect ${PLATFORM_INFO[platform]?.label ?? platform}?`)) return;
    try {
      await apiDelete(`/social/connections/${connectionId}`, token);
      setConnections((prev) => prev.filter((c) => c.id !== connectionId));
      setBanner({ type: "success", text: "Account disconnected." });
    } catch (e) {
      setBanner({ type: "error", text: (e instanceof Error ? e.message : "Failed to disconnect.") });
    }
  }

  async function updateMeta(connectionId: string, meta: Record<string, string>) {
    if (!token) return;
    try {
      await apiPatch(`/social/connections/${connectionId}`, { meta }, token);
      setConnections((prev) =>
        prev.map((c) => c.id === connectionId ? { ...c, meta: { ...c.meta, ...meta } } : c)
      );
      setBanner({ type: "success", text: "Settings saved." });
    } catch (e) {
      setBanner({ type: "error", text: (e instanceof Error ? e.message : "Save failed.") });
    }
  }

  if (loading) return <main className="container"><div className="card" style={{ padding: "3rem", textAlign: "center", color: "#555" }}>Loading…</div></main>;

  return (
    <main className="container" style={{ maxWidth: 700 }}>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ margin: "0 0 0.25rem" }}>Social publishing</h1>
        <p style={{ margin: 0, color: "#666", fontSize: "0.875rem" }}>
          Connect your accounts to publish directly from Station.
        </p>
      </div>

      {banner && (
        <div style={{
          background: banner.type === "success" ? "#0d2010" : "#2d1515",
          border: `1px solid ${banner.type === "success" ? "#1a4a20" : "#7d2e2e"}`,
          color:  banner.type === "success" ? "#4ade80"  : "#eb5757",
          borderRadius: 8, padding: "0.65rem 0.9rem", marginBottom: "1.25rem",
          fontSize: "0.875rem", display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          {banner.text}
          <button onClick={() => setBanner(null)} style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>✕</button>
        </div>
      )}

      <div style={{ display: "grid", gap: "0.85rem" }}>
        {Object.entries(PLATFORM_INFO).map(([platform, info]) => {
          const conn   = getConnection(platform);
          const f      = forms[platform] ?? {};
          const isBusy = connecting === platform;
          const charLimit = CHAR_LIMITS[platform];

          return (
            <div key={platform} className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: conn ? "0.75rem" : "0" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10, background: info.color + "22",
                  border: `1px solid ${info.color}44`, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "1.1rem", flexShrink: 0,
                }}>
                  {info.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.925rem" }}>{info.label}</div>
                  {charLimit > 0 && (
                    <div style={{ fontSize: "0.72rem", color: "#555" }}>{charLimit.toLocaleString()} char limit</div>
                  )}
                </div>
                {conn ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#4ade80" }}>● Connected</span>
                    <span style={{ fontSize: "0.75rem", color: "#555" }}>{conn.handle}</span>
                    <button
                      onClick={() => disconnect(conn.id, platform)}
                      style={{ padding: "0.25rem 0.6rem", background: "none", border: "1px solid #334155", borderRadius: 6, color: "#666", cursor: "pointer", fontSize: "0.75rem" }}
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  info.authType === "oauth" ? (
                    <button
                      onClick={() => connectOAuth(platform)}
                      disabled={isBusy}
                      style={{ padding: "0.35rem 0.85rem", background: info.color, border: "none", borderRadius: 8, color: "#fff", fontWeight: 500, cursor: "pointer", fontSize: "0.8rem", opacity: isBusy ? 0.7 : 1 }}
                    >
                      {isBusy ? "Redirecting…" : "Connect"}
                    </button>
                  ) : null
                )}
              </div>

              {/* Simple auth form (non-OAuth platforms) */}
              {!conn && info.authType === "simple" && (
                <div style={{ display: "grid", gap: "0.6rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #1e2535" }}>
                  {info.hint && (
                    <div style={{ fontSize: "0.75rem", color: "#555", background: "#0d111a", padding: "0.5rem 0.75rem", borderRadius: 6 }}>
                      {info.hint}
                    </div>
                  )}

                  {platform === "bluesky" && (
                    <>
                      <input className="input" placeholder="Bluesky handle (e.g. you.bsky.social)" value={f.handle ?? ""} onChange={(e) => setForm(platform, "handle", e.target.value)} style={{ fontSize: "0.85rem" }} />
                      <input className="input" type="password" placeholder="App password" value={f.appPassword ?? ""} onChange={(e) => setForm(platform, "appPassword", e.target.value)} style={{ fontSize: "0.85rem" }} />
                    </>
                  )}
                  {platform === "mastodon" && (
                    <>
                      <input className="input" placeholder="Instance URL (e.g. https://mastodon.social)" value={f.instanceUrl ?? ""} onChange={(e) => setForm(platform, "instanceUrl", e.target.value)} style={{ fontSize: "0.85rem" }} />
                      <input className="input" type="password" placeholder="Access token" value={f.accessToken ?? ""} onChange={(e) => setForm(platform, "accessToken", e.target.value)} style={{ fontSize: "0.85rem" }} />
                    </>
                  )}
                  {platform === "wordpress" && (
                    <>
                      <input className="input" placeholder="Site URL (e.g. https://yoursite.com)" value={f.siteUrl ?? ""} onChange={(e) => setForm(platform, "siteUrl", e.target.value)} style={{ fontSize: "0.85rem" }} />
                      <input className="input" placeholder="WordPress username" value={f.username ?? ""} onChange={(e) => setForm(platform, "username", e.target.value)} style={{ fontSize: "0.85rem" }} />
                      <input className="input" type="password" placeholder="Application password" value={f.appPassword ?? ""} onChange={(e) => setForm(platform, "appPassword", e.target.value)} style={{ fontSize: "0.85rem" }} />
                    </>
                  )}
                  {platform === "ghost" && (
                    <>
                      <input className="input" placeholder="Ghost site URL (e.g. https://yoursite.ghost.io)" value={f.siteUrl ?? ""} onChange={(e) => setForm(platform, "siteUrl", e.target.value)} style={{ fontSize: "0.85rem" }} />
                      <input className="input" type="password" placeholder="Admin API key (id:secret)" value={f.adminApiKey ?? ""} onChange={(e) => setForm(platform, "adminApiKey", e.target.value)} style={{ fontSize: "0.85rem" }} />
                    </>
                  )}

                  <button
                    onClick={() => connectSimple(platform)}
                    disabled={isBusy}
                    style={{ padding: "0.45rem 1rem", background: info.color, border: "none", borderRadius: 8, color: "#fff", fontWeight: 500, cursor: "pointer", fontSize: "0.82rem", opacity: isBusy ? 0.7 : 1, justifySelf: "start" }}
                  >
                    {isBusy ? "Connecting…" : "Connect"}
                  </button>
                </div>
              )}

              {/* Reddit: set default subreddit after OAuth */}
              {conn && platform === "reddit" && (
                <div style={{ paddingTop: "0.65rem", borderTop: "1px solid #1e2535", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <input
                    className="input"
                    placeholder="Default subreddit (e.g. AIPersonas)"
                    defaultValue={conn.meta.defaultSubreddit ?? ""}
                    id={`reddit-subreddit-${conn.id}`}
                    style={{ fontSize: "0.82rem", flex: 1 }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById(`reddit-subreddit-${conn.id}`) as HTMLInputElement;
                      updateMeta(conn.id, { defaultSubreddit: el.value.replace(/^r\//, "") });
                    }}
                    style={{ padding: "0.4rem 0.85rem", background: "#334155", border: "none", borderRadius: 8, color: "#ccc", cursor: "pointer", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}

export default function SocialSettingsPage() {
  return (
    <Suspense fallback={<main className="container"><div className="card" style={{ padding: "3rem", textAlign: "center", color: "#555" }}>Loading…</div></main>}>
      <SocialSettingsContent />
    </Suspense>
  );
}
