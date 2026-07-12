"use client";

import { usePathname } from "next/navigation";
import { StudioSidebar } from "@/components/studio/studio-sidebar";
import { isExactPersonaHomeRoute } from "@/lib/studio-navigation";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isExactPersonaHomeRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="studio-app-shell" data-studio-shell="workbench">
      <StudioSidebar />
      <div className="studio-app-content">
        {children}
      </div>
    </div>
  );
}
