"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Settings } from "lucide-react";
import type { Persona, PersonaSummary } from "@station/types/persona";
import { apiGet, apiPatch } from "@/lib/api-client";
import {
  companionQuickCardTransition,
  type CompanionQuickCardEvent,
  type CompanionQuickCardMode,
} from "@/lib/companion-quick-card";
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
  const [openMode, setOpenMode] = useState<CompanionQuickCardMode>("closed");
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cardPosition, setCardPosition] = useState<{ left: number; top: number } | null>(null);
  const cardId = `companion-quick-card-${useId().replace(/:/g, "")}`;
  const open = openMode !== "closed";

  function cancelClose() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function transition(event: CompanionQuickCardEvent) {
    setOpenMode((current) => companionQuickCardTransition(current, event));
  }

  function scheduleClose(event: "pointer-leave" | "dismiss") {
    cancelClose();
    closeTimer.current = setTimeout(() => transition(event), CLOSE_DELAY_MS);
  }

  function handleBlur(event: React.FocusEvent<HTMLDivElement>) {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) return;
    scheduleClose("dismiss");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || !open) return;
    event.preventDefault();
    event.stopPropagation();
    cancelClose();
    transition("dismiss");
    triggerRef.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenMode((current) => companionQuickCardTransition(current, "dismiss"));
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => () => cancelClose(), []);

  useEffect(() => {
    if (!open) {
      setCardPosition(null);
      return;
    }

    function placeCard() {
      const anchor = containerRef.current?.getBoundingClientRect();
      const card = cardRef.current?.getBoundingClientRect();
      if (!anchor || !card) return;
      const margin = 8;
      const left = Math.max(margin, Math.min(anchor.right + 6, window.innerWidth - card.width - margin));
      const top = Math.max(margin, Math.min(anchor.top, window.innerHeight - card.height - margin));
      setCardPosition({ left, top });
    }

    placeCard();
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(placeCard);
    if (cardRef.current) resizeObserver?.observe(cardRef.current);
    window.addEventListener("resize", placeCard);
    window.addEventListener("scroll", placeCard, true);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", placeCard);
      window.removeEventListener("scroll", placeCard, true);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="studio-companion-quick-wrap"
      data-open={open ? "true" : "false"}
      data-open-mode={openMode}
      onMouseEnter={() => {
        cancelClose();
        transition("pointer-enter");
      }}
      onMouseLeave={() => scheduleClose("pointer-leave")}
      onFocusCapture={cancelClose}
      onBlurCapture={handleBlur}
      onKeyDown={handleKeyDown}
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
          <MessageCircle size={13} strokeWidth={1.8} aria-hidden="true" />
        </Link>
        <button
          ref={triggerRef}
          type="button"
          className="studio-companion-quick-trigger"
          aria-label={`${persona.name} quick settings`}
          aria-expanded={open}
          aria-controls={cardId}
          aria-haspopup="dialog"
          title="Quick settings"
          onFocus={cancelClose}
          onClick={() => {
            cancelClose();
            transition("toggle-pin");
          }}
        >
          <Settings size={13} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      {open ? (
        <CompanionQuickCard
          id={cardId}
          cardRef={cardRef}
          position={cardPosition}
          persona={persona}
          accessToken={accessToken}
          integrity={integrity}
        />
      ) : null}
    </div>
  );
}

function CompanionQuickCard({
  id,
  cardRef,
  position,
  persona,
  accessToken,
  integrity,
}: {
  id: string;
  cardRef: React.RefObject<HTMLDivElement>;
  position: { left: number; top: number } | null;
  persona: PersonaSummary;
  accessToken: string | null;
  integrity?: IntegrityDuePersona;
}) {
  const [detail, setDetail] = useState<Persona | null>(null);
  const [avatarInput, setAvatarInput] = useState(persona.avatarUrl ?? "");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [savingAnonymousChat, setSavingAnonymousChat] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [detailStatus, setDetailStatus] = useState<"loading" | "ready" | "unavailable">(
    accessToken ? "loading" : "unavailable",
  );

  useEffect(() => {
    let cancelled = false;
    if (!accessToken) {
      setDetailStatus("unavailable");
      return;
    }
    setDetailStatus("loading");
    apiGet<{ persona?: Persona }>(`/personas/${persona.id}`, accessToken)
      .then((data) => {
        if (cancelled) return;
        if (!data.persona) {
          setDetailStatus("unavailable");
          return;
        }
        setDetail(data.persona);
        setAvatarInput(data.persona.avatarUrl ?? "");
        setDetailStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setDetailStatus("unavailable");
      });
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
    if (!accessToken || detailStatus !== "ready" || savingAvatar) return;
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
    <div
      ref={cardRef}
      id={id}
      className="studio-companion-quick-card"
      role="dialog"
      aria-label={`${persona.name} quick settings`}
      style={position ? { left: position.left, top: position.top } : { visibility: "hidden" }}
    >
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

      {detailStatus === "loading" ? (
        <p className="studio-companion-quick-card-notice" role="status">Loading companion settings...</p>
      ) : null}
      {detailStatus === "unavailable" ? (
        <p className="studio-companion-quick-card-notice" role="status">
          Quick settings unavailable. Open full settings to retry.
        </p>
      ) : null}

      <div className="studio-companion-quick-card-field">
        <label htmlFor={`quick-avatar-${persona.id}`}>Avatar URL</label>
        <div className="studio-companion-quick-card-field-row">
          <input
            id={`quick-avatar-${persona.id}`}
            value={avatarInput}
            onChange={(event) => setAvatarInput(event.currentTarget.value)}
            placeholder="https://..."
            disabled={detailStatus !== "ready" || savingAvatar}
          />
          <button type="button" onClick={saveAvatar} disabled={detailStatus !== "ready" || savingAvatar}>
            {savingAvatar ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <label className="studio-companion-quick-card-toggle" data-disabled={!isPublic || !publicChatEnabled}>
        <input
          type="checkbox"
          checked={anonymousChatEnabled}
          disabled={detailStatus !== "ready" || !isPublic || !publicChatEnabled || savingAnonymousChat}
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
