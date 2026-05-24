import type { DocumentRecord } from '@station/types';

export function DocumentCard({ document, spaceSlug }: { document: DocumentRecord; spaceSlug?: string }) {
  const href = spaceSlug ? `/space/${spaceSlug}/documents/${document.id}` : '#';
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <h3 style={{ marginTop: 0 }}>{document.title}</h3>
        <span className="pill">{document.status}</span>
      </div>
      <p>{document.body.slice(0, 140)}{document.body.length > 140 ? '...' : ''}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <a className="button" href={href}>Read</a>
        <span className="pill">{document.documentType}</span>
      </div>
    </div>
  );
}
