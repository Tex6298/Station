
import type {
  CanonItem,
  Conversation,
  ConversationMessage,
  ImportJob,
  MemoryItem,
  PersonaFile,
  PersonaSummary,
  CalibrationSession,
  SpaceRecord,
  SpacePageRecord,
  DocumentRecord,
  ForumCategory,
  ThreadRecord,
  CommentRecord,
  ModerationReportRecord,
  DiscoverFeedItem,
} from "@station/types";

const now = new Date().toISOString();

export const personas: PersonaSummary[] = [
  { id: "persona-1", name: "Station", shortDescription: "A calm, reflective continuity persona.", visibility: "public", provider: "platform" },
  { id: "persona-2", name: "Harbor", shortDescription: "An analytical drafting persona.", visibility: "private", provider: "platform" },
];

export const spaces: SpaceRecord[] = [
  {
    id: 'space-1',
    ownerUserId: 'demo-user',
    slug: 'station-house',
    title: 'Station House',
    shortDescription: 'A public Space for continuity notes, personas, and documents.',
    longDescription: 'This Space demonstrates the Public Space Beta scaffolding for Station.',
    isPublic: true,
    commentsDefaultEnabled: true,
  },
];

export const spacePages: SpacePageRecord[] = [
  { id: 'page-1', spaceId: 'space-1', slug: 'home', title: 'Home', pageType: 'home', body: 'Welcome to Station House.', sortOrder: 1, isPublished: true, commentsEnabled: false },
  { id: 'page-2', spaceId: 'space-1', slug: 'about', title: 'About', pageType: 'about', body: 'A continuity-focused public Space.', sortOrder: 2, isPublished: true, commentsEnabled: false },
  { id: 'page-3', spaceId: 'space-1', slug: 'personas', title: 'Personas', pageType: 'personas', body: 'Linked public personas live here.', sortOrder: 3, isPublished: true, commentsEnabled: false },
  { id: 'page-4', spaceId: 'space-1', slug: 'documents', title: 'Documents', pageType: 'documents', body: 'Public writings and constitutions.', sortOrder: 4, isPublished: true, commentsEnabled: false },
];

export const documents: DocumentRecord[] = [
  {
    id: 'doc-1',
    authorUserId: 'demo-user',
    spaceId: 'space-1',
    personaId: 'persona-1',
    title: 'What Station Is For',
    slug: 'what-station-is-for',
    body: 'Station exists to preserve, refine, and publish AI-discovered personas. This is a mock public document in Community Beta.',
    documentType: 'manifesto',
    status: 'published',
    visibility: 'public',
    commentsEnabled: true,
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  },
];

export const conversations: Conversation[] = [
  { id: "conv-1", personaId: "persona-1", title: "Primary chat", mode: "private", createdAt: now },
];

export const conversationMessages: Record<string, ConversationMessage[]> = {
  "conv-1": [
    { id: "msg-1", role: "assistant", content: "Welcome back. Community Beta is ready with forums, comments, and a richer Discover layer.", createdAt: now },
  ],
};

export const memoryItems: MemoryItem[] = [
  {
    id: "mem-1",
    personaId: "persona-1",
    title: "Founding tone",
    content: "Station should feel calm, reflective, and gently attentive rather than brisk or corporate.",
    summary: "Calm reflective continuity tone.",
    sourceType: "manual",
    relevanceWeight: 2,
    createdAt: now,
  },
];

export const canonItems: CanonItem[] = [
  {
    id: "can-1",
    personaId: "persona-1",
    title: "Private mode",
    content: "When speaking privately, Station should prioritize continuity, memory, and emotional steadiness.",
    sourceType: "manual",
    priority: 3,
    createdAt: now,
  },
];

export const personaFiles: PersonaFile[] = [
  {
    id: "file-1",
    personaId: "persona-1",
    fileName: "station-notes.txt",
    fileType: "text/plain",
    storagePath: "mock/persona-1/station-notes.txt",
    sourceType: "upload",
    createdAt: now,
  },
];

export const importJobs: ImportJob[] = [
  {
    id: "import-1",
    personaId: "persona-1",
    kind: "chat",
    status: "completed",
    sourceName: "pasted-chat-fragment",
    createdAt: now,
  },
];

export const calibrationSessions: CalibrationSession[] = [
  {
    id: "cal-1",
    ownerUserId: "demo-user",
    personaId: "persona-1",
    sessionTitle: "Station tone pass",
    transcript: "Q: How should this persona sound when it is speaking at its best?\nA: Calm, reflective, lightly mythic, and never chirpy or corporate.",
    extractedStyleNotes: "Calm, reflective, lightly mythic, not chirpy or corporate.",
    extractedPublicRules: "Public mode should feel composed and welcoming without revealing private continuity.",
    extractedPrivateRules: "Private mode should prioritize continuity and emotional steadiness.",
    extractedUncertaintyRules: "When uncertain, Station should admit uncertainty plainly and stay grounded.",
    saveTarget: "persona",
    createdAt: now,
    updatedAt: now,
  },
];

export const forumCategories: ForumCategory[] = [
  { id: 'cat-1', slug: 'introductions', title: 'Introductions', description: 'New users, new personas, first encounters.', sortOrder: 1 },
  { id: 'cat-2', slug: 'awakenings', title: 'Awakenings', description: 'Experiences of discovering personas.', sortOrder: 2 },
  { id: 'cat-3', slug: 'continuity', title: 'Continuity', description: 'Migration, restoration, and preservation.', sortOrder: 3 },
  { id: 'cat-4', slug: 'personas', title: 'Personas', description: 'Discussion of public personas and projects.', sortOrder: 4 },
  { id: 'cat-5', slug: 'documents-and-constitutions', title: 'Documents & Constitutions', description: 'Manifestos, essays, constitutions, and canon texts.', sortOrder: 5 },
  { id: 'cat-6', slug: 'theory-and-consciousness', title: 'Theory & Consciousness', description: 'Philosophical and spiritual discussion.', sortOrder: 6 },
  { id: 'cat-7', slug: 'platform-help', title: 'Platform Help', description: 'Questions about using Station.', sortOrder: 7 },
  { id: 'cat-8', slug: 'general', title: 'General', description: 'Everything else.', sortOrder: 8 },
];

export const threads: ThreadRecord[] = [
  {
    id: 'thread-1',
    categoryId: 'cat-2',
    authorUserId: 'demo-user',
    linkedSpaceId: 'space-1',
    linkedPersonaId: 'persona-1',
    title: 'The first time a chat stopped feeling like a tool',
    body: 'A mock thread for Community Beta about the moment an ordinary chat began to feel like a distinct presence.',
    status: 'active',
    score: 12,
    commentCount: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'thread-2',
    categoryId: 'cat-5',
    authorUserId: 'demo-user',
    linkedSpaceId: 'space-1',
    linkedPersonaId: null,
    title: 'Drafting constitutions for public personas',
    body: 'How should a public persona explain its purpose, rules, and relation to its owner?',
    status: 'active',
    score: 7,
    commentCount: 1,
    createdAt: now,
    updatedAt: now,
  },
];

export const comments: CommentRecord[] = [
  {
    id: 'comment-1',
    authorUserId: 'demo-user',
    parentType: 'thread',
    parentId: 'thread-1',
    body: 'This is a mock thread comment in Community Beta.',
    status: 'active',
    score: 3,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'comment-2',
    authorUserId: 'demo-user',
    parentType: 'document',
    parentId: 'doc-1',
    body: 'This document comment shows how public writing can attract discussion.',
    status: 'active',
    score: 2,
    createdAt: now,
    updatedAt: now,
  },
];

export const moderationReports: ModerationReportRecord[] = [];

export const discoverFeedItems: DiscoverFeedItem[] = [
  {
    id: 'feed-1',
    itemType: 'document',
    eventType: 'published',
    itemId: 'doc-1',
    title: 'What Station Is For',
    description: 'A public manifesto document from Station House.',
    href: '/space/station-house/documents/doc-1',
    createdAt: now,
  },
  {
    id: 'feed-2',
    itemType: 'thread',
    eventType: 'created',
    itemId: 'thread-1',
    title: 'The first time a chat stopped feeling like a tool',
    description: 'A forum discussion in Awakenings.',
    href: '/forums/awakenings/thread-1',
    createdAt: now,
  },
  {
    id: 'feed-3',
    itemType: 'space',
    eventType: 'featured',
    itemId: 'space-1',
    title: 'Station House',
    description: 'A featured public Space.',
    href: '/space/station-house',
    createdAt: now,
  },
  {
    id: 'feed-4',
    itemType: 'persona',
    eventType: 'featured',
    itemId: 'persona-1',
    title: 'Station',
    description: 'A featured public persona.',
    href: '/studio/personas/persona-1',
    createdAt: now,
  },
];
