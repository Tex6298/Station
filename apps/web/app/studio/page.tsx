"use client";

import { StudioDashboard } from "@/components/studio/studio-dashboard";
import { useStudioWorkspace } from "@/lib/use-studio-workspace";

export default function StudioPage() {
  const { personas, loading, error, signedIn, accessToken } = useStudioWorkspace();

  return (
    <StudioDashboard
      personas={personas}
      loading={loading}
      error={error}
      signedIn={signedIn}
      accessToken={accessToken}
    />
  );
}
