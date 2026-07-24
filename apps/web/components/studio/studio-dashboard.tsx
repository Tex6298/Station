import Link from "next/link";
import type { PersonaSummary } from "@station/types/persona";
import { timeAgo } from "@/components/discover/feed-shared";
import {
  studioNewChatHref,
  studioPersonaConversationHref,
} from "@/lib/studio-navigation";
import { personaConversationTitle } from "@/lib/persona-conversations";
import { useRecentConversations } from "@/lib/use-recent-conversations";
import {
  StudioEmptyState,
  StudioErrorState,
  StudioFrame,
  StudioPanel,
  StudioPlaceStrip,
} from "./studio-frame";

type StudioDashboardProps = {
  personas: PersonaSummary[];
  loading: boolean;
  error: string | null;
  signedIn: boolean;
  accessToken: string | null;
};

function Shell({ children }: { children: React.ReactNode }) {
  return <StudioFrame>{children}</StudioFrame>;
}

function Header({ personas }: { personas: PersonaSummary[] }) {
  const personaCount = personas.length;

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

function RecentConversations({ personas, accessToken }: { personas: PersonaSummary[]; accessToken: string | null }) {
  const { entries, loading } = useRecentConversations(personas, accessToken);

  return (
    <section className="studio-dashboard-panel" data-priority="primary">
      <SectionTitle title="Recent conversations" />
      {loading ? (
        <EmptyLine text="Loading recent conversations..." />
      ) : entries.length === 0 ? (
        <EmptyLine text="No conversations yet. Start a chat with a companion." />
      ) : (
        <div className="studio-dashboard-list">
          {entries.map(({ conversation, personaId, personaName }) => (
            <Link
              key={conversation.id}
              href={studioPersonaConversationHref(personaId, conversation.id)}
              className="studio-dashboard-row"
            >
              <span className="studio-dashboard-icon" aria-hidden="true">C</span>
              <span className="studio-dashboard-row-copy">
                <strong>{personaConversationTitle(conversation)}</strong>
                <small>{personaName}</small>
              </span>
              {(conversation.updated_at ?? conversation.updatedAt) ? (
                <span className="studio-dashboard-row-time">
                  {timeAgo((conversation.updated_at ?? conversation.updatedAt) as string)}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </section>
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

export function StudioDashboard({ personas, loading, error, signedIn, accessToken }: StudioDashboardProps) {
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
          <nav className="studio-action-row" aria-label="Sign in actions">
            <Link href="/login" className="studio-dashboard-action" data-variant="primary">Sign In</Link>
            <Link href="/signup" className="studio-dashboard-action">Join Station</Link>
          </nav>
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
        <RecentConversations personas={personas} accessToken={accessToken} />
      </div>
    </Shell>
  );
}
