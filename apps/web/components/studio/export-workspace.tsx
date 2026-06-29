"use client";

import Link from "next/link";
import {
  exportBackupSurfaceStateLabel,
  exportBackupTrustSummary,
  exportBackupTrustSurfaces,
  workspaceExportScopeReadback,
  type ExportBackupSurface,
  type WorkspaceExportScopeReadback,
  type WorkspaceExportScopeRow,
} from "@/lib/export-trust";

const surfaces = exportBackupTrustSurfaces();
const liveSurfaces = surfaces.filter((surface) => surface.state === "live");
const futureSurfaces = surfaces.filter((surface) => surface.state !== "live");
const summary = exportBackupTrustSummary(surfaces);
const workspaceScope = workspaceExportScopeReadback(surfaces);

export function ExportWorkspace() {
  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "#0b0e14" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(16px, 4vw, 32px) 48px" }}>
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#93c5fd", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
              Export trust
            </div>
            <h1 style={{ margin: "8px 0 6px", color: "#f8fafc", fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05 }}>
              Export and backup readback
            </h1>
            <p style={{ margin: 0, color: "#a9b0bd", fontSize: 15, lineHeight: 1.6, maxWidth: 720 }}>
              Current Station exports are scoped owner-only JSON/Markdown packages. This page names the live readback routes and the backup/export pieces that are still future work.
            </p>
          </div>
          <Link href="/studio" style={primaryButton}>Open personas</Link>
        </header>

        <WorkspaceScopeReadback readback={workspaceScope} />

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 330px", gap: 18, alignItems: "start" }}>
          <section style={panel}>
            <SectionTitle title="Live package readback" />
            <div style={{ display: "grid", gap: 12 }}>
              {liveSurfaces.map((surface) => (
                <ExportSurfaceRow key={surface.id} surface={surface} />
              ))}
            </div>
          </section>

          <aside style={{ display: "grid", gap: 14 }}>
            <section style={panel}>
              <SectionTitle title="Current summary" />
              <div style={{ display: "grid", gap: 9, color: "#cbd5e1", fontSize: 13 }}>
                <SummaryRow label="Mapped surfaces" value={summary.total.toString()} />
                <SummaryRow label="Live packages" value={summary.live.toString()} />
                <SummaryRow label="Preview only" value={summary.preview.toString()} />
                <SummaryRow label="Future lanes" value={summary.future.toString()} />
                <SummaryRow label="Global job" value="Not enabled" />
              </div>
            </section>

            <section style={panel}>
              <SectionTitle title="Trust boundary" />
              <div style={{ display: "grid", gap: 10, color: "#cbd5e1", fontSize: 13, lineHeight: 1.5 }}>
                <p style={{ margin: 0 }}>
                  Bundle readback is authenticated and owner-only. Existing routes return stored manifests and file hashes; they do not create public download URLs.
                </p>
                <p style={{ margin: 0 }}>
                  Full workspace export, original file packaging, PDF/binary output, managed backup, restore drills, and Station Press remain outside the current product surface.
                </p>
              </div>
            </section>
          </aside>
        </div>

        <section style={{ ...panel, marginTop: 18 }}>
          <SectionTitle title="Preview and future boundaries" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
            {futureSurfaces.map((surface) => (
              <ExportSurfaceRow key={surface.id} surface={surface} compact />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function WorkspaceScopeReadback({ readback }: { readback: WorkspaceExportScopeReadback }) {
  return (
    <section style={{ ...panel, marginBottom: 18 }} aria-labelledby="workspace-scope-readback-title">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <SectionTitle title="Workspace scope readback" id="workspace-scope-readback-title" />
          <p style={{ margin: "-4px 0 0", color: "#a9b0bd", fontSize: 13, lineHeight: 1.55, maxWidth: 760 }}>
            {readback.summary}
          </p>
        </div>
        <span style={statusPill}>Owner-only scope map</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14, marginTop: 14 }}>
        <div style={{ display: "grid", gap: 10 }}>
          <h3 style={subhead}>Live scoped packages</h3>
          {readback.livePackageClasses.map((row) => (
            <article key={row.id} style={scopeRow}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <strong style={{ color: "#f8fafc", fontSize: 13 }}>{row.label}</strong>
                <span style={livePill}>{formatPackageKind(row.packageKind)}</span>
              </div>
              <p style={scopeCopy}>{row.detail}</p>
              <p style={scopeFinePrint}>
                {row.format} / {row.includedSections.join(" / ")}
              </p>
            </article>
          ))}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <h3 style={subhead}>Future or excluded scope</h3>
          <div style={{ display: "grid", gap: 8 }}>
            {readback.futureUnavailable.map((row) => (
              <ScopePillRow key={row.id} row={row} />
            ))}
            {readback.excludedMaterial.map((row) => (
              <ScopePillRow key={row.id} row={row} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 14 }}>
        <div style={scopeRow}>
          <h3 style={subhead}>Current bundle format</h3>
          <p style={scopeCopy}>{readback.currentBundleFormat}</p>
        </div>
        <div style={scopeRow}>
          <h3 style={subhead}>Decisions still needed</h3>
          <p style={scopeCopy}>{readback.decisionsNeeded.map((row) => row.label).join(" / ")}</p>
        </div>
        <div style={scopeRow}>
          <h3 style={subhead}>Next owner actions</h3>
          <p style={scopeCopy}>{readback.nextActions.join(" ")}</p>
        </div>
      </div>

      <p style={{ margin: "14px 0 0", color: "#94a3b8", fontSize: 12, lineHeight: 1.55 }}>{readback.boundary}</p>
    </section>
  );
}

function ExportSurfaceRow({
  surface,
  compact = false,
}: {
  surface: ExportBackupSurface;
  compact?: boolean;
}) {
  return (
    <article style={compact ? compactSurfaceRow : surfaceRow}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 800 }}>{surface.title}</div>
          {surface.packageKind ? (
            <div style={{ color: "#8ea0b8", fontSize: 12, marginTop: 4 }}>{formatPackageKind(surface.packageKind)}</div>
          ) : null}
        </div>
        <span style={surface.state === "live" ? livePill : surface.state === "preview" ? statusPill : disabledButton}>
          {exportBackupSurfaceStateLabel(surface.state)}
        </span>
      </div>
      <p style={{ margin: "0.75rem 0 0", color: "#cbd5e1", fontSize: 13, lineHeight: 1.55 }}>
        {surface.readback}
      </p>
      <p style={{ margin: "0.55rem 0 0", color: "#8ea0b8", fontSize: 12, lineHeight: 1.55 }}>
        {surface.boundary}
      </p>
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <span style={{ color: "#64748b", fontSize: 12, lineHeight: 1.45 }}>{surface.limitation}</span>
        {surface.href ? (
          <Link href={surface.href} style={miniButton}>
            {surface.actionLabel}
          </Link>
        ) : (
          <span style={disabledButton}>{surface.actionLabel}</span>
        )}
      </div>
    </article>
  );
}

function ScopePillRow({ row }: { row: WorkspaceExportScopeRow }) {
  return (
    <div style={scopePillRow}>
      <span style={row.state === "future" ? statusPill : disabledButton}>{row.state === "future" ? "Future" : "Excluded"}</span>
      <div>
        <strong style={{ color: "#f8fafc", fontSize: 12 }}>{row.label}</strong>
        <p style={{ margin: "0.25rem 0 0", color: "#94a3b8", fontSize: 12, lineHeight: 1.45 }}>{row.detail}</p>
      </div>
    </div>
  );
}

function SectionTitle({ title, id }: { title: string; id?: string }) {
  return <h2 id={id} style={{ margin: "0 0 12px", color: "#f8fafc", fontSize: 16 }}>{title}</h2>;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, borderBottom: "1px solid #202938", paddingBottom: 8 }}>
      <span style={{ color: "#8ea0b8" }}>{label}</span>
      <span style={{ color: "#f8fafc", fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function formatPackageKind(value: string) {
  return value.replace(/_/g, " ");
}

const panel = {
  border: "1px solid #263244",
  background: "#101622",
  borderRadius: 8,
  padding: 16,
};

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
  cursor: "pointer",
};

const surfaceRow = {
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  padding: 14,
};

const compactSurfaceRow = {
  ...surfaceRow,
  minHeight: 220,
};

const scopeRow = {
  border: "1px solid #202938",
  borderRadius: 8,
  background: "#0d1420",
  padding: 12,
};

const scopePillRow = {
  ...scopeRow,
  display: "grid",
  gridTemplateColumns: "86px minmax(0, 1fr)",
  gap: 10,
  alignItems: "start",
};

const subhead = {
  margin: 0,
  color: "#f8fafc",
  fontSize: 13,
};

const scopeCopy = {
  margin: "0.5rem 0 0",
  color: "#cbd5e1",
  fontSize: 12,
  lineHeight: 1.5,
};

const scopeFinePrint = {
  margin: "0.45rem 0 0",
  color: "#8ea0b8",
  fontSize: 11,
  lineHeight: 1.45,
};

const miniButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #334155",
  borderRadius: 7,
  background: "#111827",
  color: "#dbeafe",
  padding: "6px 8px",
  fontSize: 12,
  textDecoration: "none",
  cursor: "pointer",
};

const livePill = {
  ...miniButton,
  borderColor: "#14532d",
  background: "#082f1f",
  color: "#86efac",
  cursor: "default",
};

const statusPill = {
  ...miniButton,
  borderColor: "#6b4e0c",
  background: "#2d2108",
  color: "#facc15",
  cursor: "default",
};

const disabledButton = {
  ...miniButton,
  color: "#687386",
  cursor: "default",
};
