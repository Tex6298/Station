import { NextResponse } from "next/server";
import { buildWebDeploymentIdentity } from "@/lib/deployment-identity";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    ok: true,
    ready: true,
    deploymentIdentity: buildWebDeploymentIdentity(),
    generatedAt: new Date().toISOString(),
  });
}
