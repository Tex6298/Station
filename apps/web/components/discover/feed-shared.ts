export interface FeedItem {
  id: string;
  type: "document" | "thread" | "developer_space";
  title: string;
  excerpt: string | null;
  href: string;
  meta: string | null;
  space: { slug: string; title: string } | null;
  author: { username: string; display_name: string | null; avatar_url: string | null } | null;
  persona: { id: string; name: string } | null;
  score: number;
  replyCount: number;
  createdAt: string;
  developerSpace?: {
    slug: string;
    visualisationType: string;
    nodeCount: number;
    eventCount: number;
  };
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export const PALETTE = [
  { bg: "#EEEDFE", color: "#534AB7" },
  { bg: "#E1F5EE", color: "#0F6E56" },
  { bg: "#FAECE7", color: "#993C1D" },
  { bg: "#FAEEDA", color: "#854F0B" },
  { bg: "#FBEAF0", color: "#993556" },
];
