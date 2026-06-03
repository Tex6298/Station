"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api-client";
import { getSession } from "@/lib/auth";

type StorageUsage = {
  bytesUsed: number;
  bytesLimit: number;
  percentUsed: number;
  categories: Record<string, number>;
};

const labels: Record<string, string> = {
  uploadedFiles: "Uploaded files",
  importedContent: "Imported content",
  memoryItems: "Memory",
  canonItems: "Canon",
  integritySessions: "Integrity sessions",
  publishedDocuments: "Published documents",
  archivedChatTranscripts: "Archived chats",
};

export function StorageUsagePanel({ compact = false }: { compact?: boolean }) {
  const [storage, setStorage] = useState<StorageUsage | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSession().then(async (session) => {
      if (!session) return;
      try {
        const data = await apiGet<{ storage: StorageUsage }>("/storage/me", session.accessToken);
        setStorage(data.storage);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load storage.");
      }
    });
  }, []);

  if (error) {
    return <p style={{ margin: 0, color: "#fca5a5", fontSize: 12 }}>{error}</p>;
  }

  if (!storage) {
    return <p style={{ margin: 0, color: "#7d8796", fontSize: 12 }}>Loading storage...</p>;
  }

  const tone = storage.percentUsed >= 95 ? "#ef4444" : storage.percentUsed >= 80 ? "#facc15" : "#38bdf8";

  return (
    <div style={{ display: "grid", gap: compact ? 8 : 12 }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "#d1d5db", fontSize: compact ? 12 : 13, marginBottom: 6 }}>
          <span>{formatBytes(storage.bytesUsed)} used</span>
          <span>{formatBytes(storage.bytesLimit)} limit</span>
        </div>
        <div style={{ height: compact ? 7 : 9, borderRadius: 999, background: "#0b1220", border: "1px solid #202938", overflow: "hidden" }}>
          <div style={{ width: `${storage.percentUsed}%`, height: "100%", background: tone }} />
        </div>
        {storage.percentUsed >= 80 ? (
          <p style={{ margin: "7px 0 0", color: tone, fontSize: 12 }}>
            {storage.percentUsed >= 100 ? "Storage is full. Archive and upload operations are blocked." : "Storage is nearing its limit."}
          </p>
        ) : null}
      </div>

      {!compact ? (
        <div style={{ display: "grid", gap: 8 }}>
          {Object.entries(storage.categories).map(([key, value]) => (
            <div key={key}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#a9b0bd", fontSize: 12, marginBottom: 4 }}>
                <span>{labels[key] ?? key}</span>
                <span>{formatBytes(value)}</span>
              </div>
              <div style={{ height: 5, borderRadius: 999, background: "#0b1220", overflow: "hidden" }}>
                <div style={{ width: `${categoryPercent(value, storage.bytesLimit)}%`, height: "100%", background: "#2563eb" }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function categoryPercent(bytes: number, limit: number) {
  if (limit <= 0) return 0;
  return Math.min(100, Math.round((bytes / limit) * 1000) / 10);
}

function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}
