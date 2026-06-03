"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import { StorageUsagePanel } from "@/components/settings/storage-usage-panel";
import { TokenUsagePanel } from "@/components/settings/token-usage-panel";
import type { PersonaSummary } from "@station/types/persona";

const publicLinks = [
  { label: "Blog Posts", href: "/studio/publishing", mark: "B" },
  { label: "Public Space", href: "/space", mark: "P" },
];

const workspaceLinks = [
  { label: "Global Archive", href: "/studio/archive", mark: "A", detail: "Recent import queue" },
  { label: "Notes and Scratchpad", href: "/studio/notes", mark: "N" },
  { label: "Export Workspace", href: "/studio/export", mark: "E" },
  { label: "Settings", href: "/settings", mark: "S" },
];

function activeFor(pathname: string, href: string) {
  if (href === "/studio") return pathname === "/studio";
  return pathname.startsWith(href);
}

function NavLink({
  label,
  href,
  mark,
  detail,
}: {
  label: string;
  href: string;
  mark: string;
  detail?: string;
}) {
  const pathname = usePathname();
  const active = activeFor(pathname, href);

  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        minHeight: 36,
        borderRadius: 8,
        padding: "7px 9px",
        background: active ? "#16233a" : "transparent",
        color: active ? "#f8fafc" : "#b6c0ce",
        textDecoration: "none",
      }}
    >
      <span style={markBox}>{mark}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13, fontWeight: active ? 700 : 500 }}>{label}</span>
        {detail ? <span style={{ display: "block", color: "#687386", fontSize: 11 }}>{detail}</span> : null}
      </span>
    </Link>
  );
}

function PersonaRow({ persona, index }: { persona: PersonaSummary; index: number }) {
  const pathname = usePathname();
  const href = `/studio/personas/${persona.id}`;
  const active = pathname.startsWith(href);
  const colors = ["#2563eb", "#0f766e", "#be123c", "#7c3aed", "#ca8a04"];

  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        borderRadius: 8,
        padding: "7px 9px",
        background: active ? "#16233a" : "transparent",
        textDecoration: "none",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: colors[index % colors.length], flex: "0 0 auto" }} />
      <span style={{ minWidth: 0, flex: 1 }}>
        <span style={{ display: "block", color: active ? "#f8fafc" : "#cbd5e1", fontSize: 13, fontWeight: active ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {persona.name}
        </span>
        <span style={{ display: "block", color: "#687386", fontSize: 11 }}>
          {persona.visibility} - 0 chats
        </span>
      </span>
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: "#687386", fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", margin: "16px 9px 7px" }}>
      {children}
    </div>
  );
}

export function StudioSidebar() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      try {
        const data = await apiGet<{ personas: PersonaSummary[] }>("/personas", session.access_token);
        setPersonas(data.personas ?? []);
      } catch {
        setPersonas([]);
      }
    });
  }, []);

  return (
    <aside
      style={{
        width: 292,
        minHeight: "calc(100vh - 52px)",
        maxHeight: "calc(100vh - 52px)",
        position: "sticky",
        top: 52,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #1f2937",
        background: "#0d121c",
        flex: "0 0 auto",
      }}
    >
      <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid #1f2937" }}>
        <Link href="/studio" style={{ display: "flex", alignItems: "center", gap: 10, color: "#f8fafc", textDecoration: "none" }}>
          <span style={{ ...markBox, width: 34, height: 34, color: "#dbeafe", background: "#12305f", borderColor: "#2563eb" }}>S</span>
          <span>
            <span style={{ display: "block", fontSize: 15, fontWeight: 800 }}>Station</span>
            <span style={{ display: "block", color: "#8ea0b8", fontSize: 12 }}>Studio</span>
          </span>
        </Link>
      </div>

      <div style={{ overflowY: "auto", padding: 12, flex: 1 }}>
        <Link href="/studio/publish" style={publishButton}>Publish</Link>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 10 }}>
          <Link href="/studio" style={smallAction}>New Chat</Link>
          <Link href="/studio/new" style={smallAction}>New Persona</Link>
        </div>

        <label style={{ display: "block", marginTop: 12 }}>
          <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>Search personas and chat history</span>
          <input
            placeholder="Search personas, chats..."
            style={{
              width: "100%",
              border: "1px solid #2f3747",
              borderRadius: 8,
              background: "#090f19",
              color: "#e5e7eb",
              padding: "10px 11px",
              fontSize: 13,
            }}
          />
        </label>

        <SectionLabel>Your Public Presence</SectionLabel>
        <div style={{ display: "grid", gap: 2 }}>
          {publicLinks.map((link) => <NavLink key={link.label} {...link} />)}
        </div>

        <SectionLabel>Personas</SectionLabel>
        <div style={{ display: "grid", gap: 2 }}>
          {personas.length > 0
            ? personas.map((persona, index) => <PersonaRow key={persona.id} persona={persona} index={index} />)
            : <div style={{ color: "#687386", fontSize: 12, padding: "7px 9px" }}>No personas yet.</div>}
          <NavLink label="Add persona" href="/studio/new" mark="+" />
        </div>

        <div style={{ height: 1, background: "#1f2937", margin: "16px 0 0" }} />
        <div style={{ display: "grid", gap: 2, marginTop: 12 }}>
          {workspaceLinks.map((link) => <NavLink key={link.label} {...link} />)}
        </div>
      </div>

      <div style={{ borderTop: "1px solid #1f2937", padding: 12 }}>
        <div style={{ marginBottom: 10 }}>
          <TokenUsagePanel compact />
        </div>
        <div style={{ marginBottom: 10 }}>
          <StorageUsagePanel compact />
        </div>
        <button
          type="button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid #2f3747",
            borderRadius: 8,
            background: "#101827",
            color: "#e5e7eb",
            padding: 10,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <span style={markBox}>?</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: "block", fontSize: 13, fontWeight: 700 }}>Station Assistant</span>
            <span style={{ display: "block", color: "#8ea0b8", fontSize: 11 }}>Help, settings, archive</span>
          </span>
          <span style={{ color: "#687386", fontSize: 12 }}>^</span>
        </button>
      </div>
    </aside>
  );
}

const markBox = {
  width: 24,
  height: 24,
  borderRadius: 7,
  border: "1px solid #334155",
  background: "#101827",
  color: "#bfdbfe",
  display: "grid",
  placeItems: "center",
  fontSize: 11,
  fontWeight: 800,
  flex: "0 0 auto",
};

const publishButton = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
};

const smallAction = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 34,
  border: "1px solid #2f3747",
  borderRadius: 8,
  background: "#101827",
  color: "#d1d5db",
  fontSize: 12,
  fontWeight: 700,
  textDecoration: "none",
};
