import { PersonaHeader } from "@/components/studio/persona-header";
import { mockFiles, mockPersonas } from "@/lib/mock-data";

export default function PersonaFilesPage({ params }: { params: { personaId: string } }) {
  const persona = mockPersonas.find((p) => p.id === params.personaId) ?? mockPersonas[0];
  const items = mockFiles.filter((item) => item.personaId === persona.id);
  return (
    <main className="container grid" style={{ gap: 16 }}>
      <PersonaHeader persona={persona} />
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Files & Imports</h2>
        <p>Uploaded continuity material, imported chat exports, and supporting files.</p>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <strong>{item.fileName}</strong> - {item.sourceType}
              <div>{item.storagePath}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
