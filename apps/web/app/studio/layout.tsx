import { StudioSidebar } from "@/components/studio/studio-sidebar";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", minHeight: "calc(100vh - 52px)", background: "#0b0e14" }}>
      <StudioSidebar />
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
