"use client";

import { useState } from "react";
import Link from "next/link";
import type { PersonaSummary } from "@station/types/persona";
import {
  filterStudioPersonas,
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
  const visibleThreads = filterPersonaConversations(conversations, filter);
  const visiblePersonas = filterStudioPersonas(
    personas.filter((candidate) => candidate.id !== persona.id),
    filter,
  );
  const shortcuts = studioPersonaCompanionShortcuts(persona.id);
  const newChatHref = studioPersonaConversationHref(persona.id, "new");

  return (
    <>
      <aside className="studio-companion-sidebar" aria-label={`${persona.name} conversations`}>
        <div className="studio-companion-sidebar-brand">
          <Link href="/studio">Station</Link>
          <span>Private companion</span>
        </div>

        <div className="studio-companion-sidebar-actions">
          <Link href={newChatHref} className="studio-companion-sidebar-primary">New chat</Link>
          <Link href="/studio/new">New persona</Link>
        </div>

        <label className="studio-companion-filter">
          <span>Filter this companion&apos;s threads and your personas</span>
          <input
            value={filter}
            onChange={(event) => setFilter(event.currentTarget.value)}
            placeholder="Filter threads or personas"
          />
        </label>

        <div className="studio-companion-sidebar-scroll">
          <div className="studio-companion-sidebar-label">{persona.name}</div>
          <Link
            href={newChatHref}
            className="studio-companion-thread"
            aria-current={selectedConversationId === null ? "page" : undefined}
          >
            <span>New conversation</span>
          </Link>
          {visibleThreads.map((conversation) => (
            <Link
              key={conversation.id}
              href={studioPersonaConversationHref(persona.id, conversation.id)}
              className="studio-companion-thread"
              aria-current={selectedConversationId === conversation.id ? "page" : undefined}
            >
              <span>{personaConversationTitle(conversation)}</span>
              {conversation.status === "archived" ? <small>Archived</small> : null}
            </Link>
          ))}
          {conversations.length > 0 && visibleThreads.length === 0 ? (
            <p className="studio-companion-filter-empty">No matching threads.</p>
          ) : null}

          <div className="studio-companion-sidebar-label">Companion care</div>
          <nav className="studio-companion-sidebar-links" aria-label="Companion care">
            {shortcuts.map((shortcut) => (
              <Link key={shortcut.href} href={shortcut.href}>{shortcut.label}</Link>
            ))}
          </nav>

          <div className="studio-companion-sidebar-label">Other personas</div>
          <nav className="studio-companion-sidebar-links" aria-label="Other personas">
            {visiblePersonas.map((candidate) => (
              <Link key={candidate.id} href={`/studio/personas/${candidate.id}`}>{candidate.name}</Link>
            ))}
            {personas.length > 1 && visiblePersonas.length === 0 ? (
              <p className="studio-companion-filter-empty">No matching personas.</p>
            ) : null}
          </nav>
        </div>

        <nav className="studio-companion-sidebar-footer" aria-label="Studio destinations">
          <Link href="/studio">Studio home</Link>
          <Link href="/studio/publish">Publish</Link>
          <Link href="/settings">Settings</Link>
        </nav>
      </aside>

      <details className="studio-companion-mobile-nav">
        <summary>
          <span>
            <small>Private companion</small>
            <strong>{persona.name}</strong>
          </span>
          <span>Navigate</span>
        </summary>
        <nav aria-label={`${persona.name} mobile navigation`}>
          <Link href={newChatHref} aria-current={selectedConversationId === null ? "page" : undefined}>New chat</Link>
          <Link href="/studio">Studio home</Link>
          {shortcuts.map((shortcut) => (
            <Link key={shortcut.href} href={shortcut.href}>{shortcut.label}</Link>
          ))}
          {conversations.slice(0, 6).map((conversation) => (
            <Link
              key={conversation.id}
              href={studioPersonaConversationHref(persona.id, conversation.id)}
              aria-current={selectedConversationId === conversation.id ? "page" : undefined}
            >
              {personaConversationTitle(conversation)}
            </Link>
          ))}
        </nav>
      </details>
    </>
  );
}
