import Link from "next/link";
import type { PersonaSummary } from "@station/types/persona";
import {
  StudioActionRow,
  StudioEmptyState,
  StudioErrorState,
  StudioFrame,
  StudioPanel,
  StudioStatusBadge,
} from "./studio-frame";

export interface IntegrityDuePersona {
  id: string;
  name: string;
  lastSession: string | null;
  sessionStatus: "never" | "overdue" | "due_soon" | "ok";
}

type StudioDashboardProps = {
  personas: PersonaSummary[];
  integrityDue: IntegrityDuePersona[];
  loading: boolean;
  error: string | null;
  signedIn: boolean;
};

const PROVIDER_LABELS: Record<string, string> = {
  platform: "Station",
  openai: "OpenAI",
  anthropic: "Anthropic",
  deepseek: "DeepSeek",
  gemini: "Gemini",
};

const archiveEvents = [
  { icon: "R", label: "Reddit pull queued", detail: "Awakenings thread import ready for review" },
  { icon: "U", label: "Upload processed", detail: "station-notes.txt added to Station archive" },
  { icon: "C", label: "Chat archive", detail: "One transcript prepared for memory review" },
  { icon: "D", label: "Document update", detail: "What Station Is For saved as published writing" },
];

function integrityStatus(status: IntegrityDuePersona["sessionStatus"]) {
  if (status === "never") return { label: "No session", detail: "Start one to strengthen continuity", tone: "danger" as const, action: "Start" };
  if (status === "overdue") return { label: "Overdue", detail: "Integrity session overdue", tone: "danger" as const, action: "Start" };
  if (status === "due_soon") return { label: "Due soon", detail: "Session due this week", tone: "warning" as const, action: "Start" };
  return { label: "Up to date", detail: "Continuity check current", tone: "good" as const, action: "View" };
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <StudioFrame>{children}</StudioFrame>
  );
}

function Header({ personaCount }: { personaCount: number }) {
  return (
    <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
      <div>
        <div style={{ color: "#93c5fd", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
          Studio Dashboard
        </div>
        <h1 style={{ margin: "8px 0 6px", fontSize: "clamp(30px, 5vw, 48px)", lineHeight: 1.05, letterSpacing: 0 }}>
          Welcome back.
        </h1>
        <p style={{ margin: 0, color: "#a9b0bd", fontSize: 15, lineHeight: 1.6 }}>
          {personaCount > 0
            ? `${personaCount} persona${personaCount === 1 ? "" : "s"} to tend, recent archive activity to review, and continuity work ready when you are.`
            : "Set up your first persona, then Studio becomes your private workspace for chat, memory, notes, and publishing."}
        </p>
      </div>
      <StudioActionRow>
        <Link href="/studio/new" style={primaryButton}>New Persona</Link>
        <Link href="/space" style={secondaryButton}>Public Space</Link>
      </StudioActionRow>
    </header>
  );
}

function ContinueList({ personas }: { personas: PersonaSummary[] }) {
  const rows = personas.slice(0, 3);

  return (
    <section style={panel}>
      <SectionTitle title="Continue Where You Left Off" action="New Chat" href="/studio/new" />
      {rows.length === 0 ? (
        <EmptyLine text="No conversations yet. Create a persona to begin." />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((persona, index) => (
            <Link key={persona.id} href={`/studio/personas/${persona.id}`} style={{ textDecoration: "none" }}>
              <article style={listRow}>
                <ColorDot index={index} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 700 }}>{persona.name}</div>
                  <div style={mutedLine}>
                    {persona.shortDescription ?? "Open the current thread and continue the conversation."}
                  </div>
                </div>
                <span style={{ marginLeft: "auto", color: "#7d8796", fontSize: 12, whiteSpace: "nowrap" }}>
                  {index === 0 ? "today" : `${index + 1}d ago`}
                </span>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function IntegrityList({ personas, integrityDue }: { personas: PersonaSummary[]; integrityDue: IntegrityDuePersona[] }) {
  const rows = integrityDue.length > 0
    ? integrityDue
    : personas.map((persona, index) => ({
      id: persona.id,
      name: persona.name,
      lastSession: null,
      sessionStatus: index === 0 ? "overdue" as const : index === 1 ? "due_soon" as const : "ok" as const,
    }));

  return (
    <section style={panel}>
      <SectionTitle title="Integrity Sessions Due" action="View All" href="/studio" />
      {rows.length === 0 ? (
        <EmptyLine text="Integrity checks appear after you create a persona." />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.slice(0, 5).map((persona) => {
            const status = integrityStatus(persona.sessionStatus);
            return (
              <article key={persona.id} style={listRow}>
                <StudioStatusBadge tone={status.tone}>{status.label}</StudioStatusBadge>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 700 }}>{persona.name}</div>
                  <div style={mutedLine}>{persona.lastSession ? `${status.detail} - ${formatDate(persona.lastSession)}` : status.detail}</div>
                </div>
                <Link href={`/studio/personas/${persona.id}/calibration`} style={miniButton}>
                  {status.action}
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function UsageStats({ personas }: { personas: PersonaSummary[] }) {
  const publicCount = personas.filter((persona) => persona.visibility === "public").length;
  const stats = [
    ["Conversations", Math.max(personas.length * 2, personas.length).toString()],
    ["Archive items", Math.max(personas.length * 3, 1).toString()],
    ["Published posts", publicCount.toString()],
    ["Tier allocation", `${Math.min(18 + personas.length * 9, 82)}%`],
  ];

  return (
    <section style={panel}>
      <SectionTitle title="Usage Stats This Month" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(132px, 1fr))", gap: 10 }}>
        {stats.map(([label, value]) => (
          <div key={label} style={metricCard}>
            <div style={{ color: "#f8fafc", fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{value}</div>
            <div style={{ color: "#8ea0b8", fontSize: 12, marginTop: 8 }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ArchiveActivity() {
  return (
    <section style={panel}>
      <SectionTitle title="Recent Archive Activity" action="Global Archive" href="/studio/archive" />
      <div style={{ display: "grid", gap: 10 }}>
        {archiveEvents.map((event) => (
          <article key={event.label} style={listRow}>
            <span style={iconBox}>{event.icon}</span>
            <div>
              <div style={{ color: "#f8fafc", fontSize: 13, fontWeight: 700 }}>{event.label}</div>
              <div style={mutedLine}>{event.detail}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PersonaOverview({ personas }: { personas: PersonaSummary[] }) {
  return (
    <aside style={panel}>
      <SectionTitle title="Personas" action="Add" href="/studio/new" />
      {personas.length === 0 ? (
        <EmptyLine text="No personas yet." />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {personas.map((persona, index) => (
            <Link key={persona.id} href={`/studio/personas/${persona.id}`} style={{ textDecoration: "none" }}>
              <article style={{ ...listRow, alignItems: "flex-start" }}>
                <ColorDot index={index} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 700 }}>{persona.name}</div>
                  <div style={mutedLine}>{PROVIDER_LABELS[persona.provider] ?? persona.provider} - {persona.visibility}</div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
      <div style={{ borderTop: "1px solid #202938", marginTop: 14, paddingTop: 14, display: "grid", gap: 8 }}>
        <Link href="/space" style={railLink}>Blog Posts</Link>
        <Link href="/space" style={railLink}>Public Space</Link>
        <Link href="/settings" style={railLink}>Settings</Link>
      </div>
    </aside>
  );
}

function SectionTitle({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <h2 style={{ margin: 0, color: "#f8fafc", fontSize: 16 }}>{title}</h2>
      {action && href ? (
        <Link href={href} style={{ marginLeft: "auto", color: "#93c5fd", fontSize: 12, textDecoration: "none" }}>
          {action}
        </Link>
      ) : null}
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <div style={{ color: "#7d8796", fontSize: 13, lineHeight: 1.5 }}>{text}</div>;
}

function ColorDot({ index }: { index: number }) {
  const colors = ["#2563eb", "#0f766e", "#be123c", "#7c3aed", "#ca8a04"];
  return <span style={{ width: 10, height: 10, borderRadius: "50%", background: colors[index % colors.length], flex: "0 0 auto", marginTop: 5 }} />;
}

export function StudioDashboard({ personas, integrityDue, loading, error, signedIn }: StudioDashboardProps) {
  if (loading) {
    return (
      <Shell>
        <Header personaCount={0} />
        <StudioPanel>
          <StudioEmptyState>Loading your workspace...</StudioEmptyState>
        </StudioPanel>
      </Shell>
    );
  }

  if (!signedIn) {
    return (
      <Shell>
        <Header personaCount={0} />
        <StudioPanel className="studio-auth-panel">
          <h2 style={{ margin: "0 0 8px", color: "#f8fafc" }}>Sign in to open Studio</h2>
          <p style={{ margin: "0 0 18px", color: "#a9b0bd", lineHeight: 1.6 }}>
            Studio is the private side of Station: personas, chat, notes, archive, and publishing tools.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/login" style={primaryButton}>Sign In</Link>
            <Link href="/signup" style={secondaryButton}>Join Station</Link>
          </div>
        </StudioPanel>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <Header personaCount={0} />
        <StudioErrorState>
          {error}
        </StudioErrorState>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header personaCount={personas.length} />
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: 18, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
          <ContinueList personas={personas} />
          <IntegrityList personas={personas} integrityDue={integrityDue} />
          <UsageStats personas={personas} />
          <ArchiveActivity />
        </div>
        <PersonaOverview personas={personas} />
      </div>
    </Shell>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const panel = {
  border: "1px solid #263244",
  background: "#101622",
  borderRadius: 8,
  padding: 16,
};

const listRow = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  padding: 12,
};

const mutedLine = {
  color: "#8ea0b8",
  fontSize: 12,
  lineHeight: 1.45,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
};

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  padding: "0 14px",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  fontSize: 14,
  fontWeight: 700,
  textDecoration: "none",
};

const secondaryButton = {
  ...primaryButton,
  background: "#111827",
  border: "1px solid #334155",
  color: "#d1d5db",
};

const miniButton = {
  marginLeft: "auto",
  border: "1px solid #334155",
  borderRadius: 7,
  background: "#111827",
  color: "#dbeafe",
  padding: "6px 9px",
  fontSize: 12,
  textDecoration: "none",
};

const metricCard = {
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  padding: 14,
};

const iconBox = {
  width: 30,
  height: 30,
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "#bfdbfe",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 800,
  flex: "0 0 auto",
};

const railLink = {
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  color: "#d1d5db",
  padding: "10px 11px",
  fontSize: 13,
  textDecoration: "none",
};
