import Link from "next/link";

export function NotesScratchpad() {
  return (
    <main className="studio-notes-unavailable" aria-labelledby="studio-notes-title">
      <section className="studio-notes-panel">
        <p className="studio-notes-eyebrow">Owner-only Studio</p>
        <h1 id="studio-notes-title">Notes unavailable</h1>
        <p>
          Station does not currently save Notes on this route. The previous
          scratchpad kept text only in the open page and did not create a
          durable Notes record, so a refresh did not restore that text.
        </p>
        <p>
          Global Archive is a separate owner-only view of existing preserved
          source material. It is not Notes storage, and text from this route is
          not carried there.
        </p>
        <nav className="studio-notes-actions" aria-label="Notes unavailable actions">
          <Link href="/studio/archive">Open Global Archive</Link>
          <Link href="/studio">Back to Studio</Link>
        </nav>
      </section>
    </main>
  );
}
