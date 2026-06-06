type StudioFrameProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function StudioFrame({
  eyebrow = "Private Studio",
  title,
  description,
  actions,
  children,
}: StudioFrameProps) {
  return (
    <main className="studio-frame">
      <div className="studio-frame-inner">
        {(title || description || actions) && (
          <header className="studio-frame-header">
            <div>
              <div className="studio-frame-eyebrow">{eyebrow}</div>
              {title ? <h1>{title}</h1> : null}
              {description ? <p>{description}</p> : null}
            </div>
            {actions ? <StudioActionRow>{actions}</StudioActionRow> : null}
          </header>
        )}
        {children}
      </div>
    </main>
  );
}

export function StudioPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`studio-panel ${className}`.trim()}>{children}</section>;
}

export function StudioEmptyState({ children }: { children: React.ReactNode }) {
  return <div className="studio-empty-state">{children}</div>;
}

export function StudioErrorState({ children }: { children: React.ReactNode }) {
  return <div className="studio-error-state">{children}</div>;
}

export function StudioStatusBadge({
  children,
  tone = "info",
}: {
  children: React.ReactNode;
  tone?: "info" | "good" | "warning" | "danger";
}) {
  return (
    <span className="studio-status-badge" data-tone={tone}>
      {children}
    </span>
  );
}

export function StudioActionRow({ children }: { children: React.ReactNode }) {
  return <div className="studio-action-row">{children}</div>;
}
