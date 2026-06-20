"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { CommunityNotificationRecord } from "@station/types";
import { apiGet, apiPatch } from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  markAllNotificationsReadPath,
  markNotificationReadPath,
  notificationListPath,
  notificationReadLabel,
  notificationTypeLabel,
  notificationVisibleSummary,
  safeNotificationHref,
  type NotificationFilter,
} from "@/lib/community-notifications";

export default function NotificationsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [filter, setFilter] = useState<NotificationFilter>("unread");
  const [notifications, setNotifications] = useState<CommunityNotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async (accessToken: string, nextFilter: NotificationFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<{ notifications: CommunityNotificationRecord[] }>(
        notificationListPath({ filter: nextFilter, limit: 50 }),
        accessToken
      );
      setNotifications(data.notifications ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    getSession().then((session) => {
      if (cancelled) return;
      setAuthReady(true);
      if (!session) return;
      const accessToken = session.accessToken ?? session.access_token;
      setToken(accessToken);
      void loadNotifications(accessToken, "unread");
    }).catch(() => {
      if (!cancelled) setAuthReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [loadNotifications]);

  async function changeFilter(nextFilter: NotificationFilter) {
    setFilter(nextFilter);
    if (token) await loadNotifications(token, nextFilter);
  }

  async function markRead(notificationId: string) {
    if (!token) return;
    setUpdatingId(notificationId);
    setError(null);
    try {
      const data = await apiPatch<{ notification: CommunityNotificationRecord }>(
        markNotificationReadPath(notificationId),
        {},
        token
      );
      setNotifications((current) => current
        .map((notification) => notification.id === notificationId ? data.notification : notification)
        .filter((notification) => filter === "all" || !notification.readAt));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark notification read.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function markAllRead() {
    if (!token) return;
    setMarkingAll(true);
    setError(null);
    try {
      await apiPatch(markAllNotificationsReadPath(), {}, token);
      if (filter === "unread") {
        setNotifications([]);
      } else {
        await loadNotifications(token, filter);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark notifications read.");
    } finally {
      setMarkingAll(false);
    }
  }

  if (!authReady) {
    return (
      <main className="station-page">
        <div className="station-page-inner">
          <div className="station-card" style={centerCard}>Loading notifications...</div>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="station-page">
        <div className="station-page-inner">
          <header className="station-page-header">
            <div>
              <div className="station-eyebrow">Community</div>
              <h1 className="station-page-title">Notifications</h1>
            </div>
            <Link href="/forums" className="station-link-button">Forums</Link>
          </header>
          <div className="station-card" style={centerCard}>
            <Link href="/login" style={{ color: "#534ab7", fontWeight: 800 }}>Sign in</Link>
            <span style={{ color: "#687078" }}> to view your notifications.</span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="station-page">
      <div className="station-page-inner" style={{ maxWidth: 880 }}>
        <header className="station-page-header">
          <div>
            <div className="station-eyebrow">Community</div>
            <h1 className="station-page-title">Notifications</h1>
            <p className="station-page-lede">Forum activity and moderation status updates for your account.</p>
          </div>
          <Link href="/forums" className="station-link-button">Forums</Link>
        </header>

        <section className="station-card" style={{ display: "grid", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => changeFilter("unread")} style={filterButton(filter === "unread")}>
                Unread
              </button>
              <button type="button" onClick={() => changeFilter("all")} style={filterButton(filter === "all")}>
                All
              </button>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={markingAll || notifications.every((notification) => notification.readAt)}
              style={actionButton}
            >
              {markingAll ? "Marking..." : "Mark all read"}
            </button>
          </div>

          {error && <div style={errorBox}>{error}</div>}

          {loading ? (
            <div style={centerCard}>Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div style={centerCard}>No notifications in this view.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {notifications.map((notification) => {
                const href = safeNotificationHref(notification);
                return (
                  <article key={notification.id} style={notificationRow(Boolean(notification.readAt))}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                        <span style={typePill}>{notificationTypeLabel(notification.type)}</span>
                        <span style={readPill(Boolean(notification.readAt))}>{notificationReadLabel(notification)}</span>
                        <span style={{ color: "#8b8f92", fontSize: 12 }}>
                          {new Date(notification.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h2 style={{ margin: "0 0 4px", color: "#1f2529", fontSize: 15 }}>{notification.title}</h2>
                      <p style={{ margin: 0, color: "#687078", fontSize: 13, lineHeight: 1.55 }}>
                        {notificationVisibleSummary(notification)}
                      </p>
                      {href && (
                        <Link href={href} style={{ color: "#534ab7", fontSize: 13, fontWeight: 800, display: "inline-block", marginTop: 8 }}>
                          Open
                        </Link>
                      )}
                    </div>
                    {!notification.readAt && (
                      <button
                        type="button"
                        onClick={() => markRead(notification.id)}
                        disabled={updatingId === notification.id}
                        style={actionButton}
                      >
                        {updatingId === notification.id ? "Saving..." : "Mark read"}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const centerCard = {
  color: "#687078",
  textAlign: "center" as const,
  padding: "2rem",
};

const actionButton = {
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  background: "#fff",
  color: "#1f2529",
  fontSize: 13,
  fontWeight: 800,
  padding: "0.45rem 0.75rem",
  cursor: "pointer",
};

function filterButton(active: boolean) {
  return {
    ...actionButton,
    background: active ? "#1f2529" : "#fff",
    color: active ? "#fff" : "#1f2529",
  };
}

function notificationRow(read: boolean) {
  return {
    border: "1px solid #d8d3c8",
    borderRadius: 8,
    background: read ? "#ffffff" : "#f8f7f4",
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    flexWrap: "wrap" as const,
  };
}

const typePill = {
  border: "1px solid #d8d3c8",
  borderRadius: 999,
  background: "#fff",
  color: "#534ab7",
  padding: "0.14rem 0.5rem",
  fontSize: 11,
  fontWeight: 800,
};

function readPill(read: boolean) {
  return {
    ...typePill,
    color: read ? "#687078" : "#25633f",
    background: read ? "#fff" : "#e9f5ee",
  };
}

const errorBox = {
  border: "1px solid #7d2e2e",
  borderRadius: 8,
  background: "#2d1515",
  color: "#eb5757",
  padding: "0.65rem 0.75rem",
  fontSize: 13,
};
