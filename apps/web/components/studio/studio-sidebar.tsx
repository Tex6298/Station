"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiGet } from "@/lib/api-client";
import { CompanionRow } from "@/components/studio/companion-quick-card";
import {
  STUDIO_MOBILE_NAV_SUMMARY_LABEL,
  activeStudioHref,
  filterStudioPersonas,
  studioNewChatHref,
  studioPersonaConversationHref,
  studioPersonaHref,
  studioPersonaIdFromRoute,
  type IntegrityDuePersona,
} from "@/lib/studio-navigation";
import { personaConversationTitle } from "@/lib/persona-conversations";
import { useRecentConversations } from "@/lib/use-recent-conversations";
import { useStudioWorkspace } from "@/lib/use-studio-workspace";
import type { PersonaSummary } from "@station/types/persona";
import type { DeveloperSpaceRecord } from "@station/types/developer-space";

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

function RecentConversationsRail({ personas, accessToken }: { personas: PersonaSummary[]; accessToken: string | null }) {
  const { entries, loading } = useRecentConversations(personas, accessToken, 6);

  if (personas.length === 0) return null;

  return (
    <div className="studio-rail-recent">
      <div className="studio-rail-section-label">Recent conversations</div>
      {loading ? (
        <p className="studio-rail-empty">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="studio-rail-empty">No conversations yet.</p>
      ) : (
        <div className="studio-rail-recent-list">
          {entries.map(({ conversation, personaId, personaName }) => (
            <Link
              key={conversation.id}
              href={studioPersonaConversationHref(personaId, conversation.id)}
              className="studio-rail-recent-item"
              title={personaConversationTitle(conversation)}
            >
              <strong>{personaConversationTitle(conversation)}</strong>
              <small>{personaName}</small>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function StudioSidebar() {
  const { personas, integrityDue, accessToken } = useStudioWorkspace();
  const [personaFilter, setPersonaFilter] = useState("");
  const [developerSpaces, setDeveloperSpaces] = useState<DeveloperSpaceRecord[]>([]);
  const pathname = usePathname();
  const activePersonaId = studioPersonaIdFromRoute(pathname);
  const newChatHref = studioNewChatHref(personas, activePersonaId);
  const visiblePersonas = filterStudioPersonas(personas, personaFilter);
  const integrityByPersonaId = new Map<string, IntegrityDuePersona>(
    integrityDue.map((entry) => [entry.id, entry]),
  );

  useEffect(() => {
    if (!accessToken) {
      setDeveloperSpaces([]);
      return;
    }
    apiGet<{ spaces: DeveloperSpaceRecord[] }>("/developer-spaces", accessToken)
      .then((data) => setDeveloperSpaces(data.spaces ?? []))
      .catch(() => setDeveloperSpaces([]));
  }, [accessToken]);

  const hasDeveloperSpace = developerSpaces.length > 0;

  return (
    <>
      <StudioMobileNav
        personas={personas}
        newChatHref={newChatHref}
        accessToken={accessToken}
        hasDeveloperSpace={hasDeveloperSpace}
      />
      <aside className="studio-sidebar-desktop" aria-label="Studio workspace navigation">
        <div className="studio-rail-actions">
          <Link href={newChatHref} className="studio-rail-action" data-variant="primary">New Chat</Link>
          <Link href="/studio/new" className="studio-rail-action">New Persona</Link>
        </div>

        <div className="studio-rail-actions studio-rail-actions-secondary">
          <Link href="/studio/publish" className="studio-rail-action">Publish</Link>
          <Link href="/space" className="studio-rail-action">Public Space</Link>
          {hasDeveloperSpace ? (
            <Link href="/developer-spaces" className="studio-rail-action">Developer</Link>
          ) : null}
        </div>

        <nav className="studio-rail-scroll" aria-label="Studio personas and destinations">
          <label className="studio-rail-filter">
            <span className="visually-hidden">Filter personas</span>
            <input
              value={personaFilter}
              onChange={(event) => setPersonaFilter(event.currentTarget.value)}
              placeholder="Find persona"
              aria-label="Filter personas"
            />
          </label>

          <div className="studio-rail-section-label">Companions</div>
          <div className="studio-rail-personas">
            {personas.length > 0
              ? visiblePersonas.map((persona, index) => (
                <CompanionRow
                  key={persona.id}
                  persona={persona}
                  index={index}
                  accessToken={accessToken}
                  integrity={integrityByPersonaId.get(persona.id)}
                />
              ))
              : <p className="studio-rail-empty">No personas yet.</p>}
            {personas.length > 0 && visiblePersonas.length === 0
              ? <p className="studio-rail-empty">No matching personas.</p>
              : null}
          </div>

          <RecentConversationsRail personas={personas} accessToken={accessToken} />
        </nav>

        <RailLink label="Settings" href="/settings" mark="S" className="studio-rail-settings" />
      </aside>
    </>
  );
}

function StudioMobileNav({
  personas,
  newChatHref,
  accessToken,
  hasDeveloperSpace,
}: {
  personas: PersonaSummary[];
  newChatHref: string;
  accessToken: string | null;
  hasDeveloperSpace: boolean;
}) {
  const disclosureRef = useRef<HTMLDetailsElement>(null);
  const { entries: recentEntries } = useRecentConversations(personas, accessToken, 4);

  function closeAfterSelection(event: React.MouseEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest("a")) {
      disclosureRef.current?.removeAttribute("open");
    }
  }

  return (
    <details ref={disclosureRef} className="studio-mobile-nav">
      <summary aria-label={STUDIO_MOBILE_NAV_SUMMARY_LABEL}>
        <span className="studio-mobile-nav-current">
          <small>Owner-only Studio</small>
          <strong>Studio</strong>
        </span>
      </summary>
      <nav
        className="studio-mobile-nav-panel"
        aria-label="Studio mobile navigation"
        onClick={closeAfterSelection}
      >
        <div className="studio-mobile-nav-grid" aria-label="Studio actions">
          <MobileNavLink href="/studio" label="Dashboard" />
          <MobileNavLink href={newChatHref} label="New Chat" />
          <MobileNavLink href="/studio/new" label="New Persona" />
          <MobileNavLink href="/studio/publish" label="Publish" />
        </div>

        <div className="studio-mobile-nav-section">
          <span>Public presence</span>
          <div className="studio-mobile-nav-grid">
            <MobileNavLink href="/space" label="Public Space" />
            {hasDeveloperSpace ? <MobileNavLink href="/developer-spaces" label="Developer" /> : null}
          </div>
        </div>

        {recentEntries.length > 0 ? (
          <div className="studio-mobile-nav-section">
            <span>Recent conversations</span>
            <div className="studio-mobile-persona-list">
              {recentEntries.map(({ conversation, personaId, personaName }) => (
                <MobileNavLink
                  key={conversation.id}
                  href={studioPersonaConversationHref(personaId, conversation.id)}
                  label={`${personaConversationTitle(conversation)} - ${personaName}`}
                />
              ))}
            </div>
          </div>
        ) : null}

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

        <div className="studio-mobile-nav-grid" aria-label="Account">
          <MobileNavLink href="/settings" label="Settings" />
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
