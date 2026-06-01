import Link from "next/link";
import type {
  DocumentRecord,
  ForumCategory,
  PersonaSummary,
  SpaceRecord,
  ThreadRecord,
} from "@station/types";

type DeveloperSpace = {
  name: string;
  status: "Live" | "Research" | "Seeking testers" | "Education" | "New";
  tag: string;
  description: string;
  stats: [string, string];
  href: string;
};

type DiscoverHomeProps = {
  personas: PersonaSummary[];
  spaces: SpaceRecord[];
  documents: DocumentRecord[];
  categories: ForumCategory[];
  threads: ThreadRecord[];
};

const developerSpaces: DeveloperSpace[] = [
  {
    name: "Animus V3 Observatory",
    status: "Live",
    tag: "experiment",
    description: "Continuity fragments, similarity drift, and crystallisation cycles.",
    stats: ["749 fragments", "0.65 similarity"],
    href: "/discover",
  },
  {
    name: "Archive Bridge",
    status: "Seeking testers",
    tag: "agent system",
    description: "A migration layer for importing chat histories into persona archives.",
    stats: ["42 imports", "18 testers"],
    href: "/discover",
  },
  {
    name: "Lattice Kit",
    status: "Research",
    tag: "framework",
    description: "Structural topology tools for building non-linear memory maps.",
    stats: ["12 maps", "3 papers"],
    href: "/discover",
  },
  {
    name: "Companion Field Notes",
    status: "Education",
    tag: "companion",
    description: "Public teaching notes on continuity, tone, and boundary design.",
    stats: ["9 lessons", "2 cohorts"],
    href: "/discover",
  },
];

const statusStyles: Record<DeveloperSpace["status"], { background: string; color: string; border: string }> = {
  Live: { background: "#09261f", color: "#6ee7b7", border: "#145943" },
  Research: { background: "#202333", color: "#c7d2fe", border: "#3b4262" },
  "Seeking testers": { background: "#2d2108", color: "#facc15", border: "#6b4e0c" },
  Education: { background: "#19202d", color: "#93c5fd", border: "#324966" },
  New: { background: "#08263c", color: "#67e8f9", border: "#155e75" },
};

function SectionHeader({
  icon,
  title,
  href,
  action,
}: {
  icon: string;
  title: string;
  href: string;
  action: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={iconBox}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: 18, lineHeight: 1.2 }}>{title}</h2>
      <Link href={href} style={{ marginLeft: "auto", color: "#9ca3af", fontSize: 13, textDecoration: "none" }}>
        {action}
      </Link>
    </div>
  );
}

function FilterPills({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 14 }}>
      {items.map((item, index) => (
        <button
          key={item}
          type="button"
          style={{
            border: "1px solid " + (index === 0 ? "#2563eb" : "#2f3747"),
            background: index === 0 ? "#12305f" : "#111827",
            color: index === 0 ? "#dbeafe" : "#a9b0bd",
            borderRadius: 999,
            padding: "6px 11px",
            fontSize: 12,
            whiteSpace: "nowrap",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function DeveloperCard({ project }: { project: DeveloperSpace }) {
  const status = statusStyles[project.status];

  return (
    <Link href={project.href} style={cardLink}>
      <article style={{ ...smallCard, width: 196, minHeight: 158 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ ...pill, background: status.background, color: status.color, borderColor: status.border }}>
            {project.status}
          </span>
          <span style={{ marginLeft: "auto", color: "#7dd3fc", fontSize: 11 }}>{project.tag}</span>
        </div>
        <h3 style={cardTitle}>{project.name}</h3>
        <p style={cardCopy}>{project.description}</p>
        <div style={{ display: "flex", gap: 10, color: "#8ea0b8", fontSize: 11, marginTop: "auto" }}>
          <span>{project.stats[0]}</span>
          <span>{project.stats[1]}</span>
        </div>
      </article>
    </Link>
  );
}

function WritingCardView({ document, spaceSlug }: { document: DocumentRecord; spaceSlug: string }) {
  const tag = document.documentType;
  const date = document.publishedAt ?? document.updatedAt;

  return (
    <Link href={`/space/${spaceSlug}/documents/${document.id}`} style={cardLink}>
      <article style={{ ...smallCard, width: 178, minHeight: 190, padding: 0, overflow: "hidden" }}>
        <div style={writingThumb}>
          <span style={{ fontWeight: 700, color: "#f8fafc" }}>{tag.slice(0, 1).toUpperCase()}</span>
        </div>
        <div style={{ padding: 12, display: "grid", gap: 7 }}>
          <span style={{ color: "#fca5a5", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{tag}</span>
          <h3 style={{ ...cardTitle, WebkitLineClamp: 2 }}>{document.title}</h3>
          <p style={{ ...cardCopy, WebkitLineClamp: 1 }}>{document.body || "No excerpt available."}</p>
          <span style={{ color: "#7d8796", fontSize: 11 }}>{formatShortDate(date)}</span>
        </div>
      </article>
    </Link>
  );
}

function SpaceCard({ space, index }: { space: SpaceRecord; index: number }) {
  const initials = space.title.slice(0, 2).toUpperCase();
  const colors = ["#2563eb", "#0f766e", "#be123c", "#7c3aed"];

  return (
    <Link href={`/space/${space.slug}`} style={cardLink}>
      <article style={{ ...smallCard, width: 174, minHeight: 176, padding: 0, overflow: "hidden" }}>
        <div style={{ height: 52, background: `linear-gradient(135deg, ${colors[index % colors.length]}, #1f2937)` }} />
        <div style={{ padding: "0 12px 12px" }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "#0b0e14",
            border: "1px solid #334155",
            color: "#f8fafc",
            fontSize: 12,
            fontWeight: 700,
            marginTop: -17,
            marginBottom: 10,
          }}>
            {initials}
          </div>
          <h3 style={cardTitle}>{space.title}</h3>
          <p style={cardCopy}>{space.shortDescription ?? "A public Station space for writing, personas, and documents."}</p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
            {["continuity", "archive"].map((tag) => (
              <span key={tag} style={{ ...pill, color: "#b7c4d6" }}>{tag}</span>
            ))}
          </div>
        </div>
      </article>
    </Link>
  );
}

function ForumColumns({ categories, threads }: { categories: ForumCategory[]; threads: ThreadRecord[] }) {
  const newest = threads.slice(0, 4);
  const trending = [...threads].sort((a, b) => b.score - a.score).slice(0, 4);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
      <ForumList title="Newest posts" threads={newest} categories={categories} mode="newest" />
      <ForumList title="Trending discussions" threads={trending} categories={categories} mode="trending" />
    </div>
  );
}

function ForumList({
  title,
  threads,
  categories,
  mode,
}: {
  title: string;
  threads: ThreadRecord[];
  categories: ForumCategory[];
  mode: "newest" | "trending";
}) {
  return (
    <div style={{ ...panel, padding: 14 }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 13, color: "#e5e7eb" }}>{title}</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {threads.map((thread) => {
          const category = categories.find((item) => item.id === thread.categoryId);
          return (
            <Link key={thread.id} href={`/forums/${category?.slug ?? "general"}/${thread.id}`} style={{ textDecoration: "none" }}>
              <article style={{ borderTop: "1px solid #202938", paddingTop: 10 }}>
                <div style={{ color: "#8ea0b8", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
                  {category?.title ?? "Forum"}
                </div>
                <div style={{ color: "#f3f4f6", fontSize: 13, fontWeight: 600, lineHeight: 1.35, marginTop: 3 }}>
                  {thread.title}
                </div>
                <div style={{ color: "#7d8796", fontSize: 11, marginTop: 5 }}>
                  {thread.commentCount} replies - {mode === "trending" ? `${thread.score} votes` : "just now"}
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function formatShortDate(value: string | undefined) {
  if (!value) return "recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recently";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function DiscoverHome({ personas, spaces, documents, categories, threads }: DiscoverHomeProps) {
  const publicSpaces = spaces.slice(0, 4);
  const personaCount = personas.filter((persona) => persona.visibility === "public").length || personas.length;
  const publicDocuments = documents.filter((document) => document.status === "published" && document.visibility === "public");

  return (
    <main style={{ background: "#0b0e14", minHeight: "calc(100vh - 52px)" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(16px, 4vw, 32px) 48px" }}>
        <section style={hero}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ color: "#93c5fd", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700 }}>
              Station - now in beta
            </div>
            <h1 style={{ margin: "10px 0 10px", fontSize: "clamp(34px, 6vw, 64px)", lineHeight: 1.02, letterSpacing: 0 }}>
              Discover the public edge of AI persona culture.
            </h1>
            <p style={{ margin: 0, maxWidth: 640, color: "#cbd5e1", fontSize: 16, lineHeight: 1.7 }}>
              Browse developer experiments, public spaces, writing, and forum discussion from people building continuity-focused AI companions and research systems.
            </p>
          </div>
          <form action="/discover" style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              name="q"
              placeholder="Search projects, writing, spaces, forum..."
              style={{
                flex: "1 1 320px",
                minWidth: 0,
                border: "1px solid #334155",
                borderRadius: 8,
                background: "#08111f",
                color: "#f8fafc",
                padding: "13px 14px",
                fontSize: 14,
              }}
            />
            <Link href="/about" style={secondaryButton}>What is this?</Link>
            <Link href="/signup" style={primaryButton}>Join Station</Link>
          </form>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 22, color: "#8ea0b8", fontSize: 12 }}>
            <span>{developerSpaces.length} developer spaces</span>
            <span>{publicDocuments.length} writing items</span>
            <span>{publicSpaces.length} public spaces</span>
            <span>{personaCount} public personas</span>
          </div>
        </section>

        <section style={section}>
          <SectionHeader icon="D" title="Developer spaces" href="/discover" action="View all" />
          <FilterPills items={["All", "Experiment", "Agent system", "Companion", "Framework"]} />
          <div style={rowScroller}>
            {developerSpaces.map((project) => <DeveloperCard key={project.name} project={project} />)}
          </div>
        </section>

        <section style={section}>
          <SectionHeader icon="W" title="Latest writing" href="/writing" action="Browse all" />
          <div style={{ marginBottom: 14 }}>
            <input
              placeholder="Search essays, codexes, research..."
              style={{
                width: "100%",
                border: "1px solid #2f3747",
                borderRadius: 8,
                background: "#0d1420",
                color: "#e5e7eb",
                padding: "11px 12px",
                fontSize: 13,
              }}
            />
          </div>
          <div style={rowScroller}>
            {publicDocuments.length === 0 ? (
              <div style={{ ...smallCard, minWidth: 260, minHeight: 120, color: "#7d8796", display: "grid", alignContent: "center" }}>
                Published public documents will appear here.
              </div>
            ) : publicDocuments.map((document) => {
              const space = spaces.find((item) => item.id === document.spaceId);
              return space ? <WritingCardView key={document.id} document={document} spaceSlug={space.slug} /> : null;
            })}
          </div>
        </section>

        <section style={section}>
          <SectionHeader icon="S" title="Public spaces" href="/space" action="Browse all" />
          <div style={rowScroller}>
            {publicSpaces.map((space, index) => <SpaceCard key={space.id} space={space} index={index} />)}
          </div>
        </section>

        <section style={section}>
          <SectionHeader icon="F" title="Forum" href="/forums" action="Open forum" />
          <ForumColumns categories={categories} threads={threads} />
        </section>
      </div>
    </main>
  );
}

const hero = {
  border: "1px solid #223044",
  borderRadius: 8,
  padding: "clamp(22px, 4vw, 38px)",
  background: "linear-gradient(135deg, #0f172a 0%, #111827 48%, #1b2531 100%)",
  boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
};

const section = {
  marginTop: 26,
};

const panel = {
  border: "1px solid #263244",
  background: "#101622",
  borderRadius: 8,
};

const smallCard = {
  ...panel,
  padding: 12,
  display: "flex",
  flexDirection: "column" as const,
};

const cardLink = {
  textDecoration: "none",
  color: "inherit",
  display: "block",
  flex: "0 0 auto",
};

const rowScroller = {
  display: "flex",
  gap: 12,
  overflowX: "auto" as const,
  paddingBottom: 8,
};

const iconBox = {
  width: 28,
  height: 28,
  border: "1px solid #334155",
  borderRadius: 8,
  background: "#0f172a",
  color: "#bfdbfe",
  display: "grid",
  placeItems: "center",
  fontSize: 12,
  fontWeight: 700,
};

const pill = {
  border: "1px solid #334155",
  borderRadius: 999,
  padding: "3px 7px",
  background: "#111827",
  color: "#9ca3af",
  fontSize: 10,
  lineHeight: 1,
};

const cardTitle = {
  margin: 0,
  color: "#f8fafc",
  fontSize: 13,
  fontWeight: 600,
  lineHeight: 1.35,
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
};

const cardCopy = {
  margin: "7px 0 0",
  color: "#a9b0bd",
  fontSize: 11,
  lineHeight: 1.45,
  overflow: "hidden",
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical" as const,
};

const writingThumb = {
  height: 64,
  background: "linear-gradient(135deg, #7f1d1d, #0f766e)",
  display: "grid",
  placeItems: "center",
};

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 44,
  padding: "0 16px",
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
