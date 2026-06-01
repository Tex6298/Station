"use client";

import { useMemo, useState } from "react";

type Note = {
  id: string;
  title: string;
  updatedAt: string;
  body: string;
  pinned?: boolean;
};

const seedNotes: Note[] = [
  {
    id: "note-1",
    title: "Continuity questions for Station",
    updatedAt: "Today",
    pinned: true,
    body: "What does this persona consistently remember about tone, boundary, and public/private separation?",
  },
  {
    id: "note-2",
    title: "Publish flow draft",
    updatedAt: "Yesterday",
    body: "A short post about how archive material becomes a public essay without exposing private context.",
  },
  {
    id: "note-3",
    title: "Persona management follow-ups",
    updatedAt: "3d ago",
    body: "Add real save endpoints for topology, public interaction limits, and avatar colour.",
  },
];

export function NotesScratchpad() {
  const [notes, setNotes] = useState(seedNotes);
  const [selectedId, setSelectedId] = useState(seedNotes[0]?.id ?? "");
  const selected = useMemo(() => notes.find((note) => note.id === selectedId) ?? notes[0], [notes, selectedId]);

  function createNote() {
    const note: Note = {
      id: `note-${Date.now()}`,
      title: "Untitled note",
      updatedAt: "Now",
      body: "",
    };
    setNotes((current) => [note, ...current]);
    setSelectedId(note.id);
  }

  function updateBody(body: string) {
    setNotes((current) => current.map((note) => note.id === selected?.id ? { ...note, body, title: body.split("\n")[0].trim() || "Untitled note", updatedAt: "Now" } : note));
  }

  return (
    <main style={{ minHeight: "calc(100vh - 52px)", background: "#0b0e14" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "24px clamp(16px, 4vw, 32px) 48px" }}>
        <header style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ color: "#93c5fd", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 800 }}>
              Private Workspace
            </div>
            <h1 style={{ margin: "8px 0 6px", color: "#f8fafc", fontSize: "clamp(30px, 5vw, 46px)", lineHeight: 1.05 }}>
              Notes and Scratchpad
            </h1>
            <p style={{ margin: 0, color: "#a9b0bd", fontSize: 15, lineHeight: 1.6, maxWidth: 680 }}>
              A private writing area for fragments that do not need to become a document, archive item, or chat yet.
            </p>
          </div>
          <button type="button" onClick={createNote} style={primaryButton}>
            New note
          </button>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "300px minmax(0, 1fr)", gap: 18, alignItems: "stretch" }}>
          <aside style={panel}>
            <label style={{ display: "block", marginBottom: 12 }}>
              <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>Search notes</span>
              <input placeholder="Search notes..." style={input} />
            </label>
            <div style={{ display: "grid", gap: 8 }}>
              {notes.map((note) => {
                const selectedNote = note.id === selected?.id;
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => setSelectedId(note.id)}
                    style={{
                      ...noteButton,
                      borderColor: selectedNote ? "#2563eb" : "#202938",
                      background: selectedNote ? "#13233d" : "#0d1420",
                    }}
                  >
                    <span style={{ color: "#f8fafc", fontSize: 13, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {note.pinned ? "Pinned - " : ""}{note.title}
                    </span>
                    <span style={{ color: "#8ea0b8", fontSize: 11 }}>{note.updatedAt}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section style={{ ...panel, minHeight: 620, display: "grid", gridTemplateRows: "auto 1fr auto", gap: 14 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", borderBottom: "1px solid #202938", paddingBottom: 12 }}>
              {["B", "I", "H", "List", "Link"].map((item) => (
                <button key={item} type="button" style={toolButton}>{item}</button>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button type="button" style={toolButton}>Pin</button>
                <button type="button" style={toolButton}>Archive</button>
                <button type="button" style={toolButton}>Draft post</button>
                <button type="button" style={toolButton}>Attach</button>
              </div>
            </div>

            <textarea
              value={selected?.body ?? ""}
              onChange={(event) => updateBody(event.target.value)}
              placeholder="Start writing..."
              style={{
                width: "100%",
                minHeight: 460,
                resize: "vertical",
                border: 0,
                outline: "none",
                background: "transparent",
                color: "#f8fafc",
                fontSize: 16,
                lineHeight: 1.7,
                fontFamily: "inherit",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "#7d8796", fontSize: 12, borderTop: "1px solid #202938", paddingTop: 12 }}>
              <span>Private by default</span>
              <span>{(selected?.body ?? "").trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const panel = {
  border: "1px solid #263244",
  background: "#101622",
  borderRadius: 8,
  padding: 16,
};

const input = {
  width: "100%",
  border: "1px solid #334155",
  borderRadius: 8,
  background: "#0d1420",
  color: "#f8fafc",
  padding: "10px 11px",
  fontSize: 13,
};

const noteButton = {
  display: "grid",
  gap: 5,
  width: "100%",
  textAlign: "left" as const,
  border: "1px solid #202938",
  borderRadius: 8,
  padding: 11,
  cursor: "pointer",
};

const primaryButton = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 40,
  border: "1px solid #2563eb",
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  padding: "0 14px",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
};

const toolButton = {
  border: "1px solid #334155",
  borderRadius: 7,
  background: "#0d1420",
  color: "#dbeafe",
  padding: "7px 10px",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};
