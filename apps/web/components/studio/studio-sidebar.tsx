"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  STUDIO_MOBILE_NAV_SUMMARY_LABEL,
  activeStudioHref,
  filterStudioPersonas,
  studioRouteContext,
  studioNewChatHref,
  studioPersonaHref,
  studioPersonaIdFromRoute,
  studioPublicLinks,
  studioWorkspaceLinks,
  type StudioRouteContext,
} from "@/lib/studio-navigation";
import type { PersonaSummary } from "@station/types/persona";

const railSecondaryLinks = [
  { label: "Dashboard", href: "/studio", mark: "D", detail: "Private Studio overview" },
  { label: "Publish", href: "/studio/publish", mark: "P", detail: "Prepare public-safe work" },
  ...studioWorkspaceLinks.filter((link) => link.href !== "/settings"),
  ...studioPublicLinks,
];

function RailLink({
  label,
  href,
  mark,
  detail,
  className = "",
}: {
  label: string;
  href: string;
  mark: string;
  detail?: string;
  className?: string;
}) {
  const pathname = usePathname();
  const active = activeStudioHref(pathname, href);

  return (
    <Link
      href={href}
      className={`studio-rail-link ${className}`.trim()}
      data-active={active}
      aria-current={active ? "page" : undefined}
    >
      <span className="studio-rail-mark" aria-hidden="true">{mark}</span>
      <span className="studio-rail-link-copy">
        <strong>{label}</strong>
        {detail ? <small>{detail}</small> : null}
      </span>
    </Link>
  );
}

function PersonaRow({ persona, index }: { persona: PersonaSummary; index: number }) {
  const pathname = usePathname();
  const href = studioPersonaHref(persona);
  const active = pathname.startsWith(href);
  const colors = ["#2563eb", "#0f766e", "#be123c", "#7c3aed", "#9a6a08"];

  return (
    <Link
      href={href}
      className="studio-rail-persona"
      data-active={active}
      aria-current={active ? "page" : undefined}
      title={persona.name}
    >
      <span
        className="studio-rail-persona-dot"
        style={{ background: colors[index % colors.length] }}
        aria-hidden="true"
      />
      <span>{persona.name}</span>
    </Link>
  );
}

export function StudioSidebar() {
  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [personaFilter, setPersonaFilter] = useState("");
  const pathname = usePathname();
  const currentContext = studioRouteContext(pathname, personas);
  const activePersonaId = studioPersonaIdFromRoute(pathname);
  const newChatHref = studioNewChatHref(personas, activePersonaId);
  const visiblePersonas = filterStudioPersonas(personas, personaFilter);

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
    <>
      <StudioMobileNav personas={personas} currentContext={currentContext} newChatHref={newChatHref} />
      <aside className="studio-sidebar-desktop" aria-label="Studio workspace navigation">
        <div className="studio-rail-actions">
          <Link href={newChatHref} className="studio-rail-action" data-variant="primary">New Chat</Link>
          <Link href="/studio/new" className="studio-rail-action">New Persona</Link>
        </div>

        <nav className="studio-rail-scroll" aria-label="Studio personas and destinations">
          <div className="studio-rail-section-label">Personas</div>
          <div className="studio-rail-personas">
            {personas.length > 0
              ? visiblePersonas.map((persona, index) => (
                <PersonaRow key={persona.id} persona={persona} index={index} />
              ))
              : <p className="studio-rail-empty">No personas yet.</p>}
            {personas.length > 0 && visiblePersonas.length === 0
              ? <p className="studio-rail-empty">No matching personas.</p>
              : null}
          </div>

          <details className="studio-rail-secondary">
            <summary>More Studio</summary>
            <div className="studio-rail-secondary-panel">
              <label className="studio-rail-filter">
                <span className="visually-hidden">Filter personas</span>
                <input
                  value={personaFilter}
                  onChange={(event) => setPersonaFilter(event.currentTarget.value)}
                  placeholder="Find persona"
                  aria-label="Filter personas"
                />
              </label>
              <CurrentPlace context={currentContext} />
              <div className="studio-rail-secondary-links">
                {railSecondaryLinks.map((link) => <RailLink key={`${link.href}-${link.label}`} {...link} />)}
              </div>
            </div>
          </details>
        </nav>

        <RailLink label="Settings" href="/settings" mark="S" className="studio-rail-settings" />
      </aside>
    </>
  );
}

function CurrentPlace({ context }: { context: StudioRouteContext }) {
  return (
    <div className="studio-current-place" aria-label="Current Studio place">
      <span>Current stop</span>
      <strong>{context.label}</strong>
      <small>{context.detail}</small>
      <em>{context.privacy}</em>
      <small>{context.state}</small>
      <Link href={context.nextAction.href} className="studio-current-place-action">
        {context.nextAction.label}
      </Link>
    </div>
  );
}

function StudioMobileNav({
  personas,
  currentContext,
  newChatHref,
}: {
  personas: PersonaSummary[];
  currentContext: StudioRouteContext;
  newChatHref: string;
}) {
  const disclosureRef = useRef<HTMLDetailsElement>(null);

  function closeAfterSelection(event: React.MouseEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest("a")) {
      disclosureRef.current?.removeAttribute("open");
    }
  }

  return (
    <details ref={disclosureRef} className="studio-mobile-nav">
      <summary aria-label={STUDIO_MOBILE_NAV_SUMMARY_LABEL}>
        <span className="studio-mobile-nav-current">
          <small>{currentContext.privacy}</small>
          <strong>{currentContext.label}</strong>
        </span>
      </summary>
      <nav
        className="studio-mobile-nav-panel"
        aria-label="Studio mobile navigation"
        onClick={closeAfterSelection}
      >
        <div className="studio-mobile-current-card">
          <span>Current stop</span>
          <strong>{currentContext.label}</strong>
          <small>{currentContext.detail}</small>
          <small>{currentContext.privacy}</small>
          <small>{currentContext.state}</small>
          <Link href={currentContext.nextAction.href}>{currentContext.nextAction.label}</Link>
        </div>

        <div className="studio-mobile-nav-grid" aria-label="Studio actions">
          <MobileNavLink href="/studio" label="Dashboard" />
          <MobileNavLink href={newChatHref} label="New Chat" />
          <MobileNavLink href="/studio/new" label="New Persona" />
          <MobileNavLink href="/studio/publish" label="Publish" />
        </div>

        <div className="studio-mobile-nav-section">
          <span>Studio</span>
          <div className="studio-mobile-nav-grid">
            {studioWorkspaceLinks.map((link) => (
              <MobileNavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </div>
        </div>

        <div className="studio-mobile-nav-section">
          <span>Public presence</span>
          <div className="studio-mobile-nav-grid">
            {studioPublicLinks.map((link) => (
              <MobileNavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </div>
        </div>

        <div className="studio-mobile-nav-section">
          <span>Personas</span>
          <div className="studio-mobile-persona-list">
            {personas.length > 0
              ? personas.map((persona) => (
                <MobileNavLink key={persona.id} href={studioPersonaHref(persona)} label={persona.name} />
              ))
              : <p>No personas yet.</p>}
          </div>
        </div>
      </nav>
    </details>
  );
}

function MobileNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = activeStudioHref(pathname, href);
  return (
    <Link href={href} data-active={active} aria-current={active ? "page" : undefined}>
      {label}
    </Link>
  );
}
