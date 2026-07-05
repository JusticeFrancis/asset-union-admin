import { NextRequest } from "next/server";
import { Property } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { beginPropertyProvisioning } from "@/lib/server/integrations";
import { handleRouteError, HttpError, ok } from "@/lib/server/http";
import { propertyDetail } from "@/lib/server/property-serializers";
import { recordActivity } from "@/lib/server/activity";

export async function POST(request: NextRequest, context: { params: Promise<{ propertyId: string }> }) {
  try {
    const { admin } = await requireAdmin(request, "integrations.manage");
    const { propertyId } = await context.params;
    if (!(await Property.exists({ _id: propertyId }))) throw new HttpError(404, "NOT_FOUND", "Property not found.");
    await beginPropertyProvisioning(propertyId);
    const property = await Property.findById(propertyId);
    await recordActivity({ request, admin, action: "Retried property legal and banking provisioning", operation: "update", resourceType: "property_integration", resourceId: propertyId, resourceName: property?.name || "" });
    return ok(propertyDetail(property));
  } catch (error) { return handleRouteError(error); }
}
