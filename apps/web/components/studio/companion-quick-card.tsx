"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Persona, PersonaSummary } from "@station/types/persona";
import { apiGet, apiPatch } from "@/lib/api-client";
import {
  integrityStatus,
  studioPersonaCompanionShortcuts,
  studioPersonaConversationHref,
  studioPersonaHref,
  type IntegrityDuePersona,
} from "@/lib/studio-navigation";

const ROW_COLORS = ["#2563eb", "#0f766e", "#be123c", "#7c3aed", "#9a6a08"];
const CLOSE_DELAY_MS = 180;

export function CompanionRow({
  persona,
  index,
  accessToken,
  integrity,
}: {
  persona: PersonaSummary;
  index: number;
  accessToken: string | null;
  integrity?: IntegrityDuePersona;
}) {
  const pathname = usePathname();
  const href = studioPersonaHref(persona);
  const active = pathname.startsWith(href);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => () => cancelClose(), []);

  return (
    <div
      ref={containerRef}
      className="studio-companion-quick-wrap"
      data-open={open ? "true" : "false"}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <Link
        href={href}
        className="studio-rail-persona"
        data-active={active}
        aria-current={active ? "page" : undefined}
        title={persona.name}
      >
        <span
          className="studio-rail-persona-dot"
          style={{ background: ROW_COLORS[index % ROW_COLORS.length] }}
          aria-hidden="true"
        />
        <span>{persona.name}</span>
      </Link>

      <div className="studio-companion-quick-triggers">
        <Link
          href={studioPersonaConversationHref(persona.id, "new")}
          className="studio-companion-quick-trigger"
          aria-label={`Start a new chat with ${persona.name}`}
          title="New chat"
        >
          <i className="ti ti-message-circle-2" aria-hidden="true" />
        </Link>
        <button
          type="button"
          className="studio-companion-quick-trigger"
          aria-label={`${persona.name} quick settings`}
          aria-expanded={open}
          title="Quick settings"
          onFocus={cancelClose}
          onClick={() => setOpen((value) => !value)}
        >
          <i className="ti ti-settings" aria-hidden="true" />
        </button>
      </div>

      {open ? <CompanionQuickCard persona={persona} accessToken={accessToken} integrity={integrity} /> : null}
    </div>
  );
}

function CompanionQuickCard({
  persona,
  accessToken,
  integrity,
}: {
  persona: PersonaSummary;
  accessToken: string | null;
  integrity?: IntegrityDuePersona;
}) {
  const [detail, setDetail] = useState<Persona | null>(null);
  const [avatarInput, setAvatarInput] = useState(persona.avatarUrl ?? "");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingAnonymousChat, setSavingAnonymousChat] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!accessToken) return;
    apiGet<{ persona?: Persona }>(`/personas/${persona.id}`, accessToken)
      .then((data) => {
        if (cancelled || !data.persona) return;
        setDetail(data.persona);
        setAvatarInput(data.persona.avatarUrl ?? "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [persona.id, accessToken]);

  const status = integrity ? integrityStatus(integrity.sessionStatus) : null;
  const shortcuts = studioPersonaCompanionShortcuts(persona.id);
  const isPublic = persona.visibility === "public";
  const publicChatEnabled = Boolean(detail?.publicChatEnabled);
  const anonymousChatEnabled = Boolean(detail?.publicAnonymousChatEnabled);
  const editHref = `/studio/personas/${persona.id}/edit`;

  async function saveAvatar() {
    if (!accessToken || savingAvatar) return;
    setSavingAvatar(true);
    setNotice(null);
    try {
      const response = await apiPatch<{ persona?: Persona }>(
        `/personas/${persona.id}`,
        { avatarUrl: avatarInput.trim() || null },
        accessToken,
      );
      if (response.persona) setDetail(response.persona);
      setNotice("Avatar URL saved.");
    } catch {
      setNotice("Avatar URL was not saved. Check the URL and try again.");
    } finally {
      setSavingAvatar(false);
    }
  }

  async function toggleAnonymousChat() {
    if (!accessToken || savingAnonymousChat || !isPublic || !publicChatEnabled) return;
    setSavingAnonymousChat(true);
    setNotice(null);
    try {
      const response = await apiPatch<{ persona?: Persona }>(
        `/personas/${persona.id}`,
        { publicAnonymousChatEnabled: !anonymousChatEnabled },
        accessToken,
      );
      if (response.persona) setDetail(response.persona);
      setNotice(!anonymousChatEnabled ? "Anonymous public chat enabled." : "Anonymous public chat disabled.");
    } catch {
      setNotice("Anonymous public chat was not changed. Try again from the full settings page.");
    } finally {
      setSavingAnonymousChat(false);
    }
  }

  return (
    <div className="studio-companion-quick-card" role="dialog" aria-label={`${persona.name} quick settings`}>
      <Link href={editHref} className="studio-companion-quick-card-title">
        {persona.name}
      </Link>
      {persona.shortDescription ? (
        <p className="studio-companion-quick-card-desc">{persona.shortDescription}</p>
      ) : null}

      <div className="studio-companion-quick-card-badges">
        <span className="studio-status-badge" data-tone="info">{isPublic ? "Public" : "Private"}</span>
        {status ? <span className="studio-status-badge" data-tone={status.tone}>{status.label}</span> : null}
      </div>

      <nav className="studio-companion-quick-card-links" aria-label={`${persona.name} destinations`}>
        {shortcuts.map((shortcut) => (
          <Link key={shortcut.href} href={shortcut.href}>{shortcut.label}</Link>
        ))}
      </nav>

      <div className="studio-companion-quick-card-field">
        <label htmlFor={`quick-avatar-${persona.id}`}>Avatar URL</label>
        <div className="studio-companion-quick-card-field-row">
          <input
            id={`quick-avatar-${persona.id}`}
            value={avatarInput}
            onChange={(event) => setAvatarInput(event.currentTarget.value)}
            placeholder="https://..."
          />
          <button type="button" onClick={saveAvatar} disabled={savingAvatar}>
            {savingAvatar ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <label className="studio-companion-quick-card-toggle" data-disabled={!isPublic || !publicChatEnabled}>
        <input
          type="checkbox"
          checked={anonymousChatEnabled}
          disabled={!isPublic || !publicChatEnabled || savingAnonymousChat}
          onChange={toggleAnonymousChat}
        />
        <span>
          Anonymous public chat
          <small>
            {isPublic && publicChatEnabled
              ? "Visitors can chat without signing in."
              : "Publish this companion with chat enabled first."}
          </small>
        </span>
      </label>

      {notice ? <p className="studio-companion-quick-card-notice">{notice}</p> : null}

      <Link href={editHref} className="studio-companion-quick-card-settings">
        Full settings
      </Link>
    </div>
  );
}
