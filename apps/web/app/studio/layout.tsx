import { StudioSidebar } from "@/components/studio/studio-sidebar";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="studio-app-shell">
      <StudioSidebar />
      <div className="studio-app-content">
        {children}
      </div>
    </div>
  );
}
