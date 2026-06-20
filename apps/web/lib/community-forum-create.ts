import { canCreateThread } from "@station/auth";
import type { AuthUser } from "@station/types";

export interface ThreadCreateFormState {
  title: string;
  body: string;
  linkedPersonaId?: string | null;
  linkedSpaceId?: string | null;
}

export interface ThreadCreatePayload {
  categoryId: string;
  title: string;
  body: string;
  linkedPersonaId?: string;
  linkedSpaceId?: string;
}

export function canCreateCommunityThread(user: AuthUser | null | undefined) {
  return canCreateThread(user ?? null);
}

export function categoryPath(categorySlug: string) {
  return `/forums/${categorySlug}`;
}

export function newThreadPath(categorySlug: string) {
  return `${categoryPath(categorySlug)}/new`;
}

export function threadCreatePath() {
  return "/forums/threads";
}

export function threadDetailPath(categorySlug: string, threadId: string) {
  return `${categoryPath(categorySlug)}/${threadId}`;
}

export function buildThreadCreatePayload(
  input: ThreadCreateFormState & { categoryId: string },
  allowedLinks: {
    personas?: Array<{ id: string }>;
    spaces?: Array<{ id: string }>;
  } = {}
): ThreadCreatePayload {
  const payload: ThreadCreatePayload = {
    categoryId: input.categoryId,
    title: input.title.trim(),
    body: input.body.trim(),
  };

  if (isAllowedId(input.linkedPersonaId, allowedLinks.personas)) {
    payload.linkedPersonaId = input.linkedPersonaId!.trim();
  }

  if (isAllowedId(input.linkedSpaceId, allowedLinks.spaces)) {
    payload.linkedSpaceId = input.linkedSpaceId!.trim();
  }

  return payload;
}

function isAllowedId(value: string | null | undefined, allowedRows?: Array<{ id: string }>) {
  const id = value?.trim();
  if (!id || !allowedRows) return false;
  return allowedRows.some((row) => row.id === id);
}
