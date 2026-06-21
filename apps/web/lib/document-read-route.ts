export function documentReadRoute(documentId: string, hasSession: boolean) {
  return hasSession ? `/documents/${documentId}` : `/documents/public/${documentId}`;
}

export function shouldFallbackToPublicDocumentRead(hasSession: boolean) {
  return hasSession;
}
