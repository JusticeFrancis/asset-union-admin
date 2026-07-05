import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { handleRouteError, HttpError, ok, readJson } from "@/lib/server/http";
import { transitionProperty } from "@/lib/server/property-transitions";

export async function POST(request: NextRequest, context: { params: Promise<{ propertyId: string }> }) {
  try {
    const { admin } = await requireAdmin(request, "properties.approve");
    const { propertyId } = await context.params;
    const body = await readJson<{ reason?: string }>(request);
    if (!body.reason?.trim()) throw new HttpError(400, "REASON_REQUIRED", "A rejection reason is required.");
    return ok((await transitionProperty({ request, admin, propertyId, to: "rejected", allowedFrom: ["submitted"], action: "Rejected property", reason: body.reason.trim() })).result);
  } catch (error) { return handleRouteError(error); }
}
