import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { handleRouteError, ok } from "@/lib/server/http";
import { transitionProperty } from "@/lib/server/property-transitions";

export async function POST(request: NextRequest, context: { params: Promise<{ propertyId: string }> }) {
  try {
    const { admin } = await requireAdmin(request, "properties.approve");
    const { propertyId } = await context.params;
    return ok((await transitionProperty({ request, admin, propertyId, to: "active", allowedFrom: ["paused"], action: "Resumed property" })).result);
  } catch (error) { return handleRouteError(error); }
}
