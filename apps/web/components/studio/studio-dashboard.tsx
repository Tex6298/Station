import Link from "next/link";
import type { PersonaSummary } from "@station/types/persona";
import { studioDashboardMemoryStop, studioNewChatHref } from "@/lib/studio-navigation";
import {
  StudioActionRow,
  StudioEmptyState,
  StudioErrorState,
  StudioFrame,
  StudioPanel,
  StudioPlaceStrip,
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
  integrityAvailable: boolean;
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

const archiveDestinations = [
  { icon: "O", label: "Choose an onboarding path", detail: "Fresh Start, Awakening, Migrator, or API Bridge", href: "/studio/onboarding" },
  { icon: "A", label: "Open global archive", detail: "Search owner-scoped archived material and import status", href: "/studio/archive" },
  { icon: "E", label: "Export workspace", detail: "Review portable JSON and Markdown export bundles", href: "/studio/export" },
];

const usageSurfaces = [
  {
    label: "Billing",
    value: "Plan",
    detail: "Subscription state, entitlement limits, and token-credit separation.",
    href: "/billing",
  },
  {
    label: "Settings",
    value: "Tokens",
    detail: "Server-reported token-credit balance and storage usage.",
    href: "/settings",
  },
  {
    label: "Archive",
    value: "Sources",
    detail: "Owner-wide source state without invented usage math.",
    href: "/studio/archive",
  },
];

function integrityStatus(status: IntegrityDuePersona["sessionStatus"]) {
  if (status === "never") return { label: "No session", detail: "Start one to strengthen continuity", tone: "danger" as const, action: "Start" };
  if (status === "overdue") return { label: "Overdue", detail: "Integrity session overdue", tone: "danger" as const, action: "Start" };
  if (status === "due_soon") return { label: "Due soon", detail: "Session due this week", tone: "warning" as const, action: "Start" };
  return { label: "Up to date", detail: "Continuity check current", tone: "good" as const, action: "View" };
}

function Shell({ children }: { children: React.ReactNode }) {
  return <StudioFrame>{children}</StudioFrame>;
}

function Header({ personas }: { personas: PersonaSummary[] }) {
  const personaCount = personas.length;
  const companionHref = studioNewChatHref(personas);

  return (
    <header className="studio-dashboard-header">
      <div className="studio-dashboard-header-copy">
        <div className="studio-dashboard-eyebrow">Private Studio</div>
        <h1 className="studio-dashboard-title">Welcome back.</h1>
        <p className="studio-dashboard-intro">
          {personaCount > 0
            ? `${personaCount} persona${personaCount === 1 ? "" : "s"} ready for conversation, Memory, and continuity work.`
            : "Create a persona to begin private conversation, Memory, and continuity work."}
        </p>
        <StudioPlaceStrip
          label="Dashboard"
          detail={personaCount > 0 ? "Your private companions and due work." : "Private setup starts with a persona."}
          privacy="Owner-only Studio"
          state="Nothing becomes public until you choose to publish."
          action={<Link href="/studio/assistant" className="studio-dashboard-place-action">Station Assistant</Link>}
        />
      </div>
      <StudioActionRow>
        {personaCount > 0 ? (
          <Link href={companionHref} className="studio-dashboard-action" data-variant="primary">Open Companion</Link>
        ) : (
          <Link href="/studio/new" className="studio-dashboard-action" data-variant="primary">New Persona</Link>
        )}
        {personaCount > 0 ? <Link href="/studio/new" className="studio-dashboard-action">New Persona</Link> : null}
        <Link href="/studio/onboarding" className="studio-dashboard-action">Choose Path</Link>
        <Link href="/space" className="studio-dashboard-action" data-variant="public">Open Public Space</Link>
      </StudioActionRow>
    </header>
  );
}

function ContinueList({ personas }: { personas: PersonaSummary[] }) {
  const rows = personas.slice(0, 3);
  const newChatHref = studioNewChatHref(personas);

  return (
    <section className="studio-dashboard-panel" data-priority="primary">
      <SectionTitle title="Your companions" action="New Chat" href={newChatHref} />
      {rows.length === 0 ? (
        <EmptyLine text="No companions yet. Create a persona to begin." />
      ) : (
        <div className="studio-dashboard-list">
          {rows.map((persona, index) => (
            <Link key={persona.id} href={`/studio/personas/${persona.id}`} className="studio-dashboard-row">
              <ColorDot index={index} />
              <span className="studio-dashboard-row-copy">
                <strong>{persona.name}</strong>
                <small>{persona.shortDescription ?? "Open the current thread and continue the conversation."}</small>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function MemoryOrientation({ personas }: { personas: PersonaSummary[] }) {
  const memoryStop = studioDashboardMemoryStop(personas);

  return (
    <section className="studio-dashboard-panel studio-dashboard-memory">
      <SectionTitle title="Memory" action={memoryStop.actionLabel} href={memoryStop.href} />
      <Link href={memoryStop.href} className="studio-dashboard-row" data-align="start">
        <span className="studio-dashboard-icon" data-tone="memory" aria-hidden="true">M</span>
        <span className="studio-dashboard-row-copy">
          <span className="studio-dashboard-row-heading">
            <strong>{memoryStop.statusLabel}</strong>
            <StudioStatusBadge tone={personas.length > 0 ? "good" : "warning"}>{memoryStop.privacy}</StudioStatusBadge>
          </span>
          <small>{memoryStop.statusDetail}</small>
          <small>{memoryStop.body}</small>
        </span>
      </Link>
    </section>
  );
}

function IntegrityList({
  integrityDue,
  available,
}: {
  integrityDue: IntegrityDuePersona[];
  available: boolean;
}) {
  const dueRows = integrityDue.filter((persona) => persona.sessionStatus !== "ok");

  return (
    <section className="studio-dashboard-panel" data-priority="primary">
      <SectionTitle title="Integrity due" />
      {!available ? (
        <EmptyLine text="Integrity due status is temporarily unavailable." />
      ) : dueRows.length === 0 ? (
        <EmptyLine text="No Integrity Sessions are currently due." />
      ) : (
        <div className="studio-dashboard-list studio-dashboard-due-list">
          {dueRows.map((persona) => {
            const status = integrityStatus(persona.sessionStatus);
            return (
              <div key={persona.id} className="studio-dashboard-row">
                <StudioStatusBadge tone={status.tone}>{status.label}</StudioStatusBadge>
                <span className="studio-dashboard-row-copy">
                  <strong>{persona.name}</strong>
                  <small>{persona.lastSession ? `${status.detail} - ${formatDate(persona.lastSession)}` : status.detail}</small>
                </span>
                <Link href={`/studio/personas/${persona.id}/calibration`} className="studio-dashboard-mini-action">
                  {status.action}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function UsageStats() {
  return (
    <section className="studio-dashboard-panel">
      <SectionTitle title="Authoritative usage" action="Billing" href="/billing" />
      <div className="studio-dashboard-metrics">
        {usageSurfaces.map((surface) => (
          <Link key={surface.label} href={surface.href} className="studio-dashboard-metric">
            <strong>{surface.value}</strong>
            <span>{surface.label}</span>
            <small>{surface.detail}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ArchiveAndPortability() {
  return (
    <section className="studio-dashboard-panel">
      <SectionTitle title="Archive and portability" action="Document Migrator" href="/studio/onboarding" />
      <div className="studio-dashboard-list">
        {archiveDestinations.map((destination) => (
          <Link key={destination.label} href={destination.href} className="studio-dashboard-row">
            <span className="studio-dashboard-icon" aria-hidden="true">{destination.icon}</span>
            <span className="studio-dashboard-row-copy">
              <strong>{destination.label}</strong>
              <small>{destination.detail}</small>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PersonaOverview({ personas }: { personas: PersonaSummary[] }) {
  return (
    <section className="studio-dashboard-panel">
      <SectionTitle title="All personas" action="Add" href="/studio/new" />
      {personas.length === 0 ? (
        <EmptyLine text="No personas yet." />
      ) : (
        <div className="studio-dashboard-list">
          {personas.map((persona, index) => (
            <Link key={persona.id} href={`/studio/personas/${persona.id}`} className="studio-dashboard-row">
              <ColorDot index={index} />
              <span className="studio-dashboard-row-copy">
                <strong>{persona.name}</strong>
                <small>{PROVIDER_LABELS[persona.provider] ?? persona.provider} - {persona.visibility}</small>
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function MoreStudioTools({ personas }: { personas: PersonaSummary[] }) {
  return (
    <details className="studio-dashboard-tools">
      <summary>
        <span>
          <strong>More Studio tools</strong>
          <small>Usage, archive, portability, and the full persona list</small>
        </span>
      </summary>
      <div className="studio-dashboard-tools-grid">
        <UsageStats />
        <ArchiveAndPortability />
        <PersonaOverview personas={personas} />
      </div>
    </details>
  );
}

function SectionTitle({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div className="studio-dashboard-section-title">
      <h2>{title}</h2>
      {action && href ? <Link href={href}>{action}</Link> : null}
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="studio-dashboard-empty">{text}</p>;
}

function ColorDot({ index }: { index: number }) {
  const colors = ["#2563eb", "#0f766e", "#be123c", "#7c3aed", "#9a6a08"];
  return <span className="studio-dashboard-dot" style={{ background: colors[index % colors.length] }} aria-hidden="true" />;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function StudioDashboard({ personas, integrityDue, integrityAvailable, loading, error, signedIn }: StudioDashboardProps) {
  if (loading) {
    return (
      <Shell>
        <Header personas={[]} />
        <StudioPanel><StudioEmptyState>Loading your workspace...</StudioEmptyState></StudioPanel>
      </Shell>
    );
  }

  if (!signedIn) {
    return (
      <Shell>
        <Header personas={[]} />
        <StudioPanel className="studio-auth-panel">
          <h2>Sign in to open Studio</h2>
          <p>Studio is the private side of Station: personas, chat, notes, archive, and publishing tools.</p>
          <StudioActionRow>
            <Link href="/login" className="studio-dashboard-action" data-variant="primary">Sign In</Link>
            <Link href="/signup" className="studio-dashboard-action">Join Station</Link>
          </StudioActionRow>
        </StudioPanel>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell>
        <Header personas={[]} />
        <StudioErrorState>{error}</StudioErrorState>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header personas={personas} />
      <div className="studio-dashboard-primary-grid">
        <ContinueList personas={personas} />
        <IntegrityList integrityDue={integrityDue} available={integrityAvailable} />
      </div>
      <MemoryOrientation personas={personas} />
      <MoreStudioTools personas={personas} />
    </Shell>
  );
}
