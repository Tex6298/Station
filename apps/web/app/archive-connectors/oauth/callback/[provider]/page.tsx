"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { ApiRequestError } from "@/lib/api-client";
import {
  archiveConnectorCallbackProviderLabel,
  archiveConnectorCallbackRestartCopy,
  exchangeArchiveConnectorOAuthCallback,
  parseArchiveConnectorOAuthCallback,
  readStoredArchiveConnectorCallbackAccessToken,
} from "@/lib/archive-connector-oauth-callback";

type CallbackView =
  | { state: "checking" }
  | { state: "restart"; title: string; body: string }
  | { state: "connected"; providerLabel: string; localRedirectPath: string | null }
  | { state: "failed"; title: string; body: string };

export default function ArchiveConnectorOAuthCallbackPage({
  params,
}: {
  params: { provider: string };
}) {
  const [view, setView] = useState<CallbackView>({ state: "checking" });

  useEffect(() => {
    let active = true;
    const searchParams = new URLSearchParams(window.location.search);

    // Scrub provider callback values before auth recovery, API calls, or detailed rendering.
    window.history.replaceState(null, "", window.location.pathname);

    const parsed = parseArchiveConnectorOAuthCallback({
      provider: params.provider,
      searchParams,
    });

    if (parsed.status !== "ready") {
      const copy = archiveConnectorCallbackRestartCopy(parsed.status);
      setView({ state: "restart", ...copy });
      return () => {
        active = false;
      };
    }

    const accessToken = readStoredArchiveConnectorCallbackAccessToken();
    if (!accessToken) {
      const copy = archiveConnectorCallbackRestartCopy("missing_state");
      setView({ state: "restart", ...copy });
      return () => {
        active = false;
      };
    }

    exchangeArchiveConnectorOAuthCallback({
      provider: parsed.provider,
      stateHandle: parsed.stateHandle,
      code: parsed.code,
      accessToken,
    })
      .then((response) => {
        if (!active) return;
        setView({
          state: "connected",
          providerLabel: archiveConnectorCallbackProviderLabel(response.provider),
          localRedirectPath: response.localRedirectPath,
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiRequestError && (error.status === 401 || error.status === 409)) {
          const copy = archiveConnectorCallbackRestartCopy("missing_state");
          setView({ state: "restart", ...copy });
          return;
        }

        setView({
          state: "failed",
          title: "Connector setup could not finish",
          body: "Station could not finish this connector callback right now. Restart connector setup from Station.",
        });
      });

    return () => {
      active = false;
    };
  }, [params.provider]);

  return (
    <main style={shellStyle}>
      <section style={panelStyle} aria-live="polite">
        <p style={eyebrowStyle}>Archive connector</p>
        {view.state === "checking" ? (
          <>
            <h1 style={titleStyle}>Verifying connector setup</h1>
            <p style={bodyStyle}>Station is checking this connector session.</p>
          </>
        ) : null}

        {view.state === "restart" || view.state === "failed" ? (
          <>
            <h1 style={titleStyle}>{view.title}</h1>
            <p style={bodyStyle}>{view.body}</p>
          </>
        ) : null}

        {view.state === "connected" ? (
          <>
            <h1 style={titleStyle}>{view.providerLabel} connected</h1>
            <p style={bodyStyle}>
              Station saved this connector session. Return to Station to continue from the persona Archive tab.
            </p>
            {view.localRedirectPath ? (
              <a style={linkStyle} href={view.localRedirectPath}>
                Return to Station
              </a>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}

const shellStyle = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "32px",
  background: "#f7f4ee",
  color: "#171717",
} satisfies CSSProperties;

const panelStyle = {
  width: "min(100%, 560px)",
} satisfies CSSProperties;

const eyebrowStyle = {
  margin: "0 0 12px",
  color: "#5f625b",
  fontSize: "14px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0,
} satisfies CSSProperties;

const titleStyle = {
  margin: "0",
  fontSize: "32px",
  lineHeight: 1.15,
  letterSpacing: 0,
} satisfies CSSProperties;

const bodyStyle = {
  margin: "16px 0 0",
  maxWidth: "48ch",
  color: "#3a3d37",
  fontSize: "16px",
  lineHeight: 1.6,
} satisfies CSSProperties;

const linkStyle = {
  display: "inline-block",
  marginTop: "24px",
  color: "#0b5f6a",
  fontWeight: 700,
} satisfies CSSProperties;
