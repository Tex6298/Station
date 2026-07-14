"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { PersonaSummary } from "@station/types/persona";
import {
  studioPersonaCompanionShortcuts,
  studioPersonaConversationHref,
} from "@/lib/studio-navigation";
import {
  filterPersonaConversations,
  personaConversationTitle,
  type PersonaConversationSummary,
} from "@/lib/persona-conversations";

export function PersonaCompanionSidebar({
  persona,
  personas,
  conversations,
  selectedConversationId,
}: {
  persona: PersonaSummary;
  personas: PersonaSummary[];
  conversations: PersonaConversationSummary[];
  selectedConversationId: string | null;
}) {
  const [filter, setFilter] = useState("");
  const mobileDisclosureRef = useRef<HTMLDetailsElement>(null);
  const mobileSummaryRef = useRef<HTMLElement>(null);
  const visibleThreads = filterPersonaConversations(conversations, filter);
  const shortcuts = studioPersonaCompanionShortcuts(persona.id);
  const ownedPersonas = personas.some((candidate) => candidate.id === persona.id)
    ? personas
    : [persona, ...personas];
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedConversationId);
  const selectedThreadLabel = selectedConversation
    ? personaConversationTitle(selectedConversation)
    : selectedConversationId
      ? "Unavailable thread"
      : "New conversation";
  const newChatHref = studioPersonaConversationHref(persona.id, "new");
  const careLinks = [
    ...shortcuts,
    { label: "Canon", href: `/studio/personas/${persona.id}/canon` },
    { label: "Archive", href: `/studio/personas/${persona.id}/files` },
  ];

  function closeMobileAfterSelection(event: React.MouseEvent<HTMLElement>) {
    if (event.target instanceof Element && event.target.closest("a")) {
      mobileDisclosureRef.current?.removeAttribute("open");
      mobileSummaryRef.current?.focus();
    }
  }

  return (
    <>
      <aside className="studio-companion-sidebar" aria-label={`${persona.name} conversations`}>
        <div className="studio-companion-sidebar-actions">
          <Link href={newChatHref} className="studio-companion-sidebar-primary">New chat</Link>
          <Link href="/studio/new">New persona</Link>
        </div>

        <div className="studio-companion-sidebar-scroll">
          <div className="studio-companion-sidebar-label">Companions</div>
          <nav className="studio-companion-personas" aria-label="Your companions">
            {ownedPersonas.map((candidate, index) => (
              <Link
                key={candidate.id}
                href={`/studio/personas/${candidate.id}`}
                className="studio-companion-persona"
                aria-current={candidate.id === persona.id ? "page" : undefined}
                title={candidate.name}
              >
                <span className="studio-companion-persona-dot" data-index={index % 5} aria-hidden="true" />
                <span>{candidate.name}</span>
              </Link>
            ))}
          </nav>

          <details className="studio-companion-disclosure studio-companion-threads">
            <summary>
              <span>Threads</span>
              <small>{selectedThreadLabel} / {conversations.length}</small>
            </summary>
            <div className="studio-companion-disclosure-panel">
              <label className="studio-companion-filter">
                <span className="visually-hidden">Filter {persona.name}&apos;s threads</span>
                <input
                  value={filter}
                  onChange={(event) => setFilter(event.currentTarget.value)}
                  placeholder="Find thread"
                  aria-label={`Filter ${persona.name}'s threads`}
                />
              </label>
              <nav className="studio-companion-thread-list" aria-label={`${persona.name} threads`}>
                <ThreadLink
                  href={newChatHref}
                  label="New conversation"
                  selected={selectedConversationId === null}
                />
                {visibleThreads.map((conversation) => (
                  <ThreadLink
                    key={conversation.id}
                    href={studioPersonaConversationHref(persona.id, conversation.id)}
                    label={personaConversationTitle(conversation)}
                    selected={selectedConversationId === conversation.id}
                    archived={conversation.status === "archived"}
                  />
                ))}
              </nav>
              {conversations.length > 0 && visibleThreads.length === 0 ? (
                <p className="studio-companion-filter-empty">No matching threads.</p>
              ) : null}
              {conversations.length === 0 ? (
                <p className="studio-companion-filter-empty">No saved threads yet.</p>
              ) : null}
            </div>
          </details>

          <details className="studio-companion-disclosure studio-companion-care">
            <summary>
              <span>Companion care</span>
              <small>Memory, continuity, profile</small>
            </summary>
            <nav className="studio-companion-sidebar-links" aria-label="Companion care">
              {careLinks.map((link) => (
                <Link key={link.href} href={link.href}>{link.label}</Link>
              ))}
              <Link href="/studio">Studio home</Link>
              <Link href="/studio/publish">Publish</Link>
            </nav>
          </details>
        </div>

        <Link href="/settings" className="studio-companion-settings">Settings</Link>
      </aside>

      <details ref={mobileDisclosureRef} className="studio-companion-mobile-nav">
        <summary ref={mobileSummaryRef}>
          <span>
            <small>Private companion</small>
            <strong>{persona.name}</strong>
          </span>
          <span>Navigate</span>
        </summary>
        <div className="studio-companion-mobile-panel" onClick={closeMobileAfterSelection}>
          <div className="studio-companion-mobile-current">
            <span>Current thread</span>
            <strong>{selectedThreadLabel}</strong>
            <small>Owner-only conversation</small>
          </div>

          <nav className="studio-companion-mobile-grid" aria-label="Companion actions">
            <Link href={newChatHref} aria-current={selectedConversationId === null ? "page" : undefined}>New chat</Link>
            <Link href="/studio/new">New persona</Link>
          </nav>

          <section className="studio-companion-mobile-section">
            <span>Companions</span>
            <nav className="studio-companion-mobile-list" aria-label="Your mobile companions">
              {ownedPersonas.map((candidate) => (
                <Link
                  key={candidate.id}
                  href={`/studio/personas/${candidate.id}`}
                  aria-current={candidate.id === persona.id ? "page" : undefined}
                >
                  {candidate.name}
                </Link>
              ))}
            </nav>
          </section>

          <section className="studio-companion-mobile-section">
            <span>Threads</span>
            <label className="studio-companion-filter">
              <span className="visually-hidden">Filter {persona.name}&apos;s mobile threads</span>
              <input
                value={filter}
                onChange={(event) => setFilter(event.currentTarget.value)}
                placeholder="Find thread"
                aria-label={`Filter ${persona.name}'s mobile threads`}
              />
            </label>
            <nav className="studio-companion-mobile-list" aria-label={`${persona.name} mobile threads`}>
              <Link href={newChatHref} aria-current={selectedConversationId === null ? "page" : undefined}>
                New conversation
              </Link>
              {visibleThreads.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={studioPersonaConversationHref(persona.id, conversation.id)}
                  aria-current={selectedConversationId === conversation.id ? "page" : undefined}
                >
                  <span>{personaConversationTitle(conversation)}</span>
                  {conversation.status === "archived" ? <small>Archived</small> : null}
                </Link>
              ))}
            </nav>
            {conversations.length > 0 && visibleThreads.length === 0 ? (
              <p className="studio-companion-filter-empty">No matching threads.</p>
            ) : null}
            {conversations.length === 0 ? (
              <p className="studio-companion-filter-empty">No saved threads yet.</p>
            ) : null}
          </section>

          <section className="studio-companion-mobile-section">
            <span>Companion care</span>
            <nav className="studio-companion-mobile-grid" aria-label="Mobile companion care">
              {careLinks.map((link) => (
                <Link key={link.href} href={link.href}>{link.label}</Link>
              ))}
            </nav>
          </section>

          <nav className="studio-companion-mobile-grid" aria-label="Mobile Studio destinations">
            <Link href="/studio">Studio home</Link>
            <Link href="/studio/publish">Publish</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </div>
      </details>
    </>
  );
}

function ThreadLink({
  href,
  label,
  selected,
  archived = false,
}: {
  href: string;
  label: string;
  selected: boolean;
  archived?: boolean;
}) {
  return (
    <Link
      href={href}
      className="studio-companion-thread"
      aria-current={selected ? "page" : undefined}
      title={label}
    >
      <span>{label}</span>
      {archived ? <small>Archived</small> : null}
    </Link>
  );
}
