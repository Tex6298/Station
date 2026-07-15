"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  isAuthExpired,
  notificationPreferenceStatus,
  NOTIFICATION_PREFERENCES_COPY,
  parseNotificationPreferencesResponse,
} from "@/lib/notification-preferences";

type PanelState =
  | { status: "loading"; token: string | null; value: null; notice: string }
  | { status: "signed-out"; token: null; value: null; notice: string }
  | { status: "ready"; token: string; value: boolean; notice: string }
  | { status: "saving"; token: string; value: boolean; notice: string }
  | { status: "reconciling"; token: string; value: boolean | null; notice: string }
  | { status: "error"; token: string | null; value: null; notice: string };

export function NotificationPreferencesPanel() {
  const [state, setState] = useState<PanelState>({
    status: "loading",
    token: null,
    value: null,
    notice: notificationPreferenceStatus({ loading: true, loadedValue: null }),
  });
  const generation = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    loadInitial();
    return () => {
      mounted.current = false;
      generation.current += 1;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- initial owner read is guarded by request generation refs.

  async function loadInitial() {
    const requestId = ++generation.current;
    setState({
      status: "loading",
      token: null,
      value: null,
      notice: notificationPreferenceStatus({ loading: true, loadedValue: null }),
    });

    try {
      const session = await getSession();
      if (!isCurrent(requestId)) return;
      if (!session) {
        setState({
          status: "signed-out",
          token: null,
          value: null,
          notice: notificationPreferenceStatus({ signedOut: true, loadedValue: null }),
        });
        return;
      }

      const response = await getNotificationPreferences(session.accessToken);
      const parsed = parseNotificationPreferencesResponse(response);
      if (!isCurrent(requestId)) return;
      if (!parsed) throw new Error("Malformed notification preferences.");
      setReady(session.accessToken, parsed.forumReplyNotificationsEnabled);
    } catch (error) {
      if (!isCurrent(requestId)) return;
      if (isAuthExpired(error)) {
        setState({
          status: "signed-out",
          token: null,
          value: null,
          notice: notificationPreferenceStatus({ signedOut: true, loadedValue: null }),
        });
        return;
      }
      setState({
        status: "error",
        token: null,
        value: null,
        notice: notificationPreferenceStatus({ loadFailed: true, loadedValue: null }),
      });
    }
  }

  async function toggleForumReplies(nextValue: boolean) {
    if (state.status !== "ready") return;
    const token = state.token;
    const priorValue = state.value;
    const requestId = ++generation.current;
    setState({
      status: "saving",
      token,
      value: priorValue,
      notice: notificationPreferenceStatus({ saving: true, loadedValue: priorValue }),
    });

    try {
      const response = await updateNotificationPreferences(token, {
        forumReplyNotificationsEnabled: nextValue,
      });
      const parsed = parseNotificationPreferencesResponse(response);
      if (!isCurrent(requestId)) return;
      if (!parsed || parsed.forumReplyNotificationsEnabled !== nextValue) {
        await reconcile(token, priorValue, requestId);
        return;
      }

      setState({
        status: "ready",
        token,
        value: parsed.forumReplyNotificationsEnabled,
        notice: notificationPreferenceStatus({
          loadedValue: parsed.forumReplyNotificationsEnabled,
          savedValue: parsed.forumReplyNotificationsEnabled,
        }),
      });
    } catch (error) {
      if (!isCurrent(requestId)) return;
      if (isAuthExpired(error)) {
        setState({
          status: "signed-out",
          token: null,
          value: null,
          notice: notificationPreferenceStatus({ signedOut: true, loadedValue: null }),
        });
        return;
      }
      await reconcile(token, priorValue, requestId);
    }
  }

  async function reconcile(token: string, priorValue: boolean, parentRequestId: number) {
    if (!isCurrent(parentRequestId)) return;
    setState({
      status: "reconciling",
      token,
      value: priorValue,
      notice: notificationPreferenceStatus({ reconciling: true, loadedValue: priorValue }),
    });

    try {
      const response = await getNotificationPreferences(token);
      const parsed = parseNotificationPreferencesResponse(response);
      if (!isCurrent(parentRequestId)) return;
      if (!parsed) throw new Error("Malformed notification preferences.");
      setState({
        status: "ready",
        token,
        value: parsed.forumReplyNotificationsEnabled,
        notice: "Current account setting reloaded.",
      });
    } catch (error) {
      if (!isCurrent(parentRequestId)) return;
      if (isAuthExpired(error)) {
        setState({
          status: "signed-out",
          token: null,
          value: null,
          notice: notificationPreferenceStatus({ signedOut: true, loadedValue: null }),
        });
        return;
      }
      setState({
        status: "error",
        token,
        value: null,
        notice: notificationPreferenceStatus({ reconcileFailed: true, loadedValue: null }),
      });
    }
  }

  function setReady(token: string, value: boolean) {
    setState({
      status: "ready",
      token,
      value,
      notice: notificationPreferenceStatus({ loadedValue: value }),
    });
  }

  function isCurrent(requestId: number) {
    return mounted.current && generation.current === requestId;
  }

  const checked = state.status === "ready" || state.status === "saving" || state.status === "reconciling"
    ? state.value === true
    : false;
  const disabled = state.status !== "ready";

  return (
    <div style={panelStack}>
      <p style={mutedCopy}>{NOTIFICATION_PREFERENCES_COPY.summary}</p>

      <div style={preferenceRow}>
        <div style={{ minWidth: 0 }}>
          <div style={rowTitle}>{NOTIFICATION_PREFERENCES_COPY.label}</div>
          <p style={mutedCopy}>{NOTIFICATION_PREFERENCES_COPY.description}</p>
        </div>
        <label style={switchWrap}>
          <input
            type="checkbox"
            aria-label="Forum reply notifications"
            checked={checked}
            disabled={disabled}
            onKeyDown={(event) => {
              if (!disabled && !event.repeat && (event.key === " " || event.key === "Enter")) {
                event.preventDefault();
                void toggleForumReplies(!checked);
              }
            }}
            onClick={(event) => {
              event.preventDefault();
              if (!disabled) void toggleForumReplies(!checked);
            }}
            onChange={() => undefined}
            style={checkbox}
          />
        </label>
      </div>

      <p aria-live="polite" style={state.status === "error" || state.status === "signed-out" ? errorCopy : statusCopy}>
        {state.notice}
      </p>

      <div style={unavailableBlock}>
        <p style={mutedCopy}>{NOTIFICATION_PREFERENCES_COPY.unavailableIntro}</p>
        <div style={unavailableList}>
          {NOTIFICATION_PREFERENCES_COPY.unavailable.map((row) => (
            <div key={row} style={unavailableRow}>
              <span>{row}</span>
              <span style={unavailablePill}>Unavailable</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const panelStack: CSSProperties = {
  display: "grid",
  gap: 12,
};

const mutedCopy: CSSProperties = {
  margin: 0,
  color: "#687078",
  fontSize: 13,
  lineHeight: 1.55,
};

const preferenceRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  padding: 12,
};

const rowTitle: CSSProperties = {
  color: "#1f2529",
  fontSize: 14,
  fontWeight: 900,
  marginBottom: 4,
};

const switchWrap: CSSProperties = {
  display: "flex",
  alignItems: "center",
  flex: "0 0 auto",
};

const checkbox: CSSProperties = {
  width: 22,
  height: 22,
  accentColor: "#534ab7",
};

const statusCopy: CSSProperties = {
  margin: 0,
  color: "#24713a",
  fontSize: 13,
  fontWeight: 800,
};

const errorCopy: CSSProperties = {
  margin: 0,
  color: "#b3261e",
  fontSize: 13,
  fontWeight: 800,
};

const unavailableBlock: CSSProperties = {
  display: "grid",
  gap: 10,
};

const unavailableList: CSSProperties = {
  display: "grid",
  gap: 8,
};

const unavailableRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  color: "#1f2529",
  fontSize: 13,
};

const unavailablePill: CSSProperties = {
  color: "#687078",
  fontSize: 12,
  fontWeight: 800,
};
