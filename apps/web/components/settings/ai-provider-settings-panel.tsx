"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  getAiProviderSettings,
  updateAiProviderSettings,
  type AiProviderId,
  type AiProviderMode,
  type AiProviderSettings,
} from "@/lib/api-client";
import { getSession } from "@/lib/auth";
import {
  AI_PROVIDER_SETUP_PROVIDERS,
  AI_PROVIDER_SETTINGS_COPY,
  buildAiProviderSettingsPatch,
  configuredKeyLabel,
  storageStatusLabel,
  timestampReadbackRows,
} from "@/lib/ai-provider-settings";

type PanelState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "ready"; token: string; settings: AiProviderSettings }
  | { status: "error"; message: string };

export function AiProviderSettingsPanel() {
  const [state, setState] = useState<PanelState>({ status: "loading" });
  const [aiMode, setAiMode] = useState<AiProviderMode>("platform");
  const [keyInputs, setKeyInputs] = useState<Partial<Record<AiProviderId, string>>>({});
  const [clearKeys, setClearKeys] = useState<Partial<Record<AiProviderId, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let active = true;

    getSession()
      .then(async (session) => {
        if (!active) return;
        if (!session) {
          setState({ status: "signed-out" });
          return;
        }

        const response = await getAiProviderSettings(session.accessToken);
        if (!active) return;
        setAiMode(response.settings.aiMode);
        setState({ status: "ready", token: session.accessToken, settings: response.settings });
      })
      .catch((error) => {
        if (!active) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "Could not load AI provider settings.",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  const providerReadback = useMemo(() => {
    if (state.status !== "ready") return new Map<AiProviderId, AiProviderSettings["supportedProviders"][number]>();
    return new Map(state.settings.supportedProviders.map((provider) => [provider.provider, provider]));
  }, [state]);

  async function saveSettings() {
    if (state.status !== "ready") return;
    setSaving(true);
    setNotice(null);

    try {
      const response = await updateAiProviderSettings(
        state.token,
        buildAiProviderSettingsPatch({ aiMode, keyInputs, clearKeys })
      );
      setState({ status: "ready", token: state.token, settings: response.settings });
      setAiMode(response.settings.aiMode);
      setKeyInputs({});
      setClearKeys({});
      setNotice({ type: "success", text: "AI provider settings saved." });
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save AI provider settings.",
      });
    } finally {
      setSaving(false);
    }
  }

  function updateKeyInput(provider: AiProviderId, value: string) {
    setKeyInputs((current) => ({ ...current, [provider]: value }));
    if (value.trim()) {
      setClearKeys((current) => ({ ...current, [provider]: false }));
    }
  }

  function updateClearKey(provider: AiProviderId, value: boolean) {
    setClearKeys((current) => ({ ...current, [provider]: value }));
    if (value) {
      setKeyInputs((current) => ({ ...current, [provider]: "" }));
    }
  }

  if (state.status === "loading") {
    return <p style={mutedCopy}>Loading AI provider settings...</p>;
  }

  if (state.status === "signed-out") {
    return <p style={mutedCopy}>Sign in to manage AI provider settings.</p>;
  }

  if (state.status === "error") {
    return <p style={errorCopy}>{state.message}</p>;
  }

  return (
    <div style={panelStack}>
      <p style={mutedCopy}>{AI_PROVIDER_SETTINGS_COPY.summary}</p>

      <div style={modeGroup} role="radiogroup" aria-label="AI provider mode">
        {(["platform", "byok"] as const).map((mode) => (
          <label key={mode} style={modeOption(aiMode === mode)}>
            <input
              type="radio"
              name="ai-provider-mode"
              value={mode}
              checked={aiMode === mode}
              onChange={() => setAiMode(mode)}
            />
            <span style={{ fontWeight: 800 }}>{mode === "platform" ? "Platform" : "BYOK"}</span>
          </label>
        ))}
      </div>

      <div style={copyBox}>
        <p style={copyLine}>{AI_PROVIDER_SETTINGS_COPY.platform}</p>
        <p style={copyLine}>{AI_PROVIDER_SETTINGS_COPY.byok}</p>
        <p style={copyLine}>{AI_PROVIDER_SETTINGS_COPY.gemini}</p>
        <p style={copyLine}>{AI_PROVIDER_SETTINGS_COPY.nvidia}</p>
      </div>

      <div style={providerList}>
        {AI_PROVIDER_SETUP_PROVIDERS.map((provider) => {
          const readback = providerReadback.get(provider.id);
          const timestamps = timestampReadbackRows(readback);
          return (
            <div key={provider.id} style={providerRow}>
              <div style={{ minWidth: 0 }}>
                <div style={providerHeader}>
                  <span>{provider.label}</span>
                  <span style={statusPill(readback?.configured ?? false)}>{configuredKeyLabel(readback)}</span>
                </div>
                <div style={metadataRows}>
                  <span>{storageStatusLabel(readback)}</span>
                  {timestamps.map((row) => (
                    <span key={row}>{row}</span>
                  ))}
                </div>
                <input
                  type="password"
                  autoComplete="off"
                  placeholder={provider.placeholder}
                  value={keyInputs[provider.id] ?? ""}
                  onChange={(event) => updateKeyInput(provider.id, event.target.value)}
                  style={input}
                  aria-label={`${provider.label} API key`}
                />
              </div>
              <label style={clearRow}>
                <input
                  type="checkbox"
                  checked={clearKeys[provider.id] === true}
                  onChange={(event) => updateClearKey(provider.id, event.target.checked)}
                />
                Clear stored key
              </label>
            </div>
          );
        })}
      </div>

      {notice && (
        <p style={notice.type === "success" ? successCopy : errorCopy}>{notice.text}</p>
      )}

      <button type="button" onClick={saveSettings} disabled={saving} style={saveButton}>
        {saving ? "Saving..." : "Save AI provider settings"}
      </button>
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

const copyBox: CSSProperties = {
  border: "1px solid #d8d3c8",
  background: "#f8f7f4",
  borderRadius: 8,
  padding: 12,
};

const copyLine: CSSProperties = {
  ...mutedCopy,
  margin: "0 0 6px",
};

const modeGroup: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 8,
};

const modeOption = (selected: boolean): CSSProperties => ({
  display: "flex",
  alignItems: "center",
  gap: 8,
  border: `1px solid ${selected ? "#534ab7" : "#d8d3c8"}`,
  background: selected ? "#f0eefb" : "#ffffff",
  borderRadius: 8,
  padding: "0.55rem 0.65rem",
  color: "#1f2529",
  fontSize: 13,
});

const providerList: CSSProperties = {
  display: "grid",
  gap: 10,
};

const providerRow: CSSProperties = {
  display: "grid",
  gap: 8,
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  padding: 12,
};

const providerHeader: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  marginBottom: 8,
  color: "#1f2529",
  fontSize: 13,
  fontWeight: 900,
};

const metadataRows: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.35rem 0.5rem",
  marginBottom: 8,
  color: "#687078",
  fontSize: 11,
  lineHeight: 1.35,
};

const statusPill = (configured: boolean): CSSProperties => ({
  border: "1px solid #d8d3c8",
  borderRadius: 999,
  background: configured ? "#edf7ef" : "#f8f7f4",
  color: configured ? "#24713a" : "#687078",
  padding: "0.14rem 0.48rem",
  fontSize: 11,
  fontWeight: 800,
});

const input: CSSProperties = {
  width: "100%",
  border: "1px solid #d8d3c8",
  borderRadius: 8,
  padding: "0.55rem 0.65rem",
  color: "#1f2529",
  background: "#ffffff",
  fontSize: 13,
  boxSizing: "border-box",
};

const clearRow: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  color: "#687078",
  fontSize: 12,
};

const saveButton: CSSProperties = {
  border: 0,
  borderRadius: 8,
  background: "#1f2529",
  color: "#ffffff",
  padding: "0.65rem 0.85rem",
  fontWeight: 900,
  cursor: "pointer",
};

const successCopy: CSSProperties = {
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
