export interface SettingsDestinationSection {
  title: string;
  description: string;
  href: string | null;
  mark: string;
  status?: string;
}

export const SETTINGS_DESTINATION_SECTIONS: SettingsDestinationSection[] = [
  {
    title: "AI provider",
    description: "Choose Station platform routing or configure owner BYOK for OpenAI, Anthropic, and DeepSeek.",
    href: null,
    mark: "AI",
    status: "On this page",
  },
  {
    title: "Social publishing",
    description: "Connect Bluesky, Mastodon, Tumblr, LinkedIn, Reddit, WordPress, and Ghost to publish directly from Station.",
    href: "/settings/social",
    mark: "S",
  },
  {
    title: "Billing & plan",
    description: "Manage your subscription, upgrade your tier, or access the Stripe customer portal.",
    href: "/billing",
    mark: "B",
  },
  {
    title: "Profile",
    description: "Display name, username, avatar, bio, and public identity details.",
    href: null,
    mark: "P",
    status: "Coming soon",
  },
  {
    title: "Privacy",
    description: "Default visibility for new content, public persona behavior, and export controls.",
    href: null,
    mark: "V",
    status: "Coming soon",
  },
  {
    title: "Onboarding Paths",
    description: "Fresh Start, Awakening, Document Migrator, or API Bridge for creating a new persona.",
    href: "/studio/onboarding",
    mark: "O",
  },
  {
    title: "Station Assistant",
    description: "Operational helper for archive, publishing, and Space work. Not a persona.",
    href: "/studio/assistant",
    mark: "?",
  },
  {
    title: "Global Archive",
    description: "Search owner-scoped archived material and import status across every companion.",
    href: "/studio/archive",
    mark: "A",
  },
  {
    title: "Export workspace",
    description: "Generate a complete JSON and Markdown package of your Station workspace.",
    href: "/studio/export",
    mark: "E",
  },
  {
    title: "Public Space",
    description: "Your authored microsite: published documents, pages, and public presence.",
    href: "/space",
    mark: "PS",
  },
  {
    title: "Publishing Dashboard",
    description: "Drafts and public-writing handoff across every companion.",
    href: "/studio/publishing",
    mark: "PD",
  },
  {
    title: "Notifications",
    description: "Forum replies and moderation status updates.",
    href: "/notifications",
    mark: "N",
  },
];
