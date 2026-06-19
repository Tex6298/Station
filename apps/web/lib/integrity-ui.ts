export type IntegrityOutputType = "memory_candidate" | "canon_candidate" | "preference" | "boundary" | "theme";
export type IntegrityOutputStatus = "pending" | "accepted" | "rejected" | "edited";

export interface IntegrityOutputLike {
  output_type: IntegrityOutputType;
  status: IntegrityOutputStatus;
  written_to?: string | null;
}

export interface IntegrityHistorySessionLike {
  session_type: string;
  status: string;
  clusters_covered?: string[] | null;
  completed_at?: string | null;
  started_at: string;
  integrity_session_outputs?: IntegrityOutputLike[];
}

const SESSION_LABELS: Record<string, string> = {
  initial: "Initial baseline",
  periodic: "Periodic check-in",
  migration: "Migration review",
  pre_publication: "Pre-publication review",
  manual: "Manual review",
};

const CLUSTER_LABELS: Record<string, string> = {
  identity: "Identity",
  relationship: "Relationship",
  tone: "Tone",
  continuity: "Continuity",
  boundaries: "Boundaries",
  themes: "Themes",
};

const OUTPUT_LABELS: Record<IntegrityOutputType, string> = {
  memory_candidate: "Memory candidate",
  canon_candidate: "Canon candidate",
  preference: "Preference update",
  boundary: "Boundary",
  theme: "Recurring theme",
};

const STATUS_LABELS: Record<IntegrityOutputStatus | string, string> = {
  pending: "Pending review",
  accepted: "Accepted",
  rejected: "Dismissed",
  edited: "Edited and accepted",
  in_progress: "In progress",
  completed: "Completed",
  abandoned: "Abandoned",
};

const DESTINATION_LABELS: Record<string, string> = {
  memory: "Memory",
  canon: "Canon",
  preference_profile: "Preference profile",
};

export function integritySessionTypeLabel(type: string) {
  return SESSION_LABELS[type] ?? labelize(type);
}

export function integrityClusterLabel(cluster?: string | null) {
  return cluster ? CLUSTER_LABELS[cluster] ?? labelize(cluster) : "Integrity Session";
}

export function integrityOutputTypeLabel(type: IntegrityOutputType) {
  return OUTPUT_LABELS[type] ?? labelize(type);
}

export function integrityStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? labelize(status);
}

export function integrityDestinationForOutput(type: IntegrityOutputType) {
  if (type === "canon_candidate") return "Canon";
  if (type === "preference" || type === "theme") return "Preference profile";
  return "Memory";
}

export function integrityWrittenDestinationLabel(destination?: string | null) {
  if (!destination) return null;
  return DESTINATION_LABELS[destination] ?? labelize(destination);
}

export function integrityReviewCopy(output: IntegrityOutputLike) {
  const destination = integrityDestinationForOutput(output.output_type);
  return {
    accept: `Accept writes this to ${destination}.`,
    edit: `Edit then accept writes your edited text to ${destination}.`,
    reject: "Dismiss keeps the session record but does not write this output.",
  };
}

export function integrityHistorySummary(sessions: IntegrityHistorySessionLike[]) {
  const outputs = sessions.flatMap((session) => session.integrity_session_outputs ?? []);
  const latest = sessions[0] ?? null;
  return {
    totalSessions: sessions.length,
    latestStatus: latest ? integrityStatusLabel(latest.status) : "No sessions",
    latestDate: latest?.completed_at ?? latest?.started_at ?? null,
    pending: outputs.filter((output) => output.status === "pending").length,
    accepted: outputs.filter((output) => output.status === "accepted").length,
    edited: outputs.filter((output) => output.status === "edited").length,
    rejected: outputs.filter((output) => output.status === "rejected").length,
  };
}

export function integrityClusterListLabel(clusters?: string[] | null) {
  if (!clusters?.length) return "No clusters completed yet";
  return clusters.map(integrityClusterLabel).join(", ");
}

function labelize(value: string) {
  return value.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}
