import { NextRequest } from "next/server";
import { Property } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { connectDb } from "@/lib/server/db";
import { handleRouteError, HttpError, noContent, ok, readJson } from "@/lib/server/http";
import { derivePropertyFields, propertyDetail } from "@/lib/server/property-serializers";
import { recordActivity } from "@/lib/server/activity";
import { beginPropertyProvisioning } from "@/lib/server/integrations";

export async function GET(request: NextRequest, context: { params: Promise<{ propertyId: string }> }) {
  try {
    await requireAdmin(request, "properties.view");
    await connectDb();
    const { propertyId } = await context.params;
    const property = await Property.findById(propertyId);
    if (!property) throw new HttpError(404, "NOT_FOUND", "Property not found.");
    return ok(propertyDetail(property));
  } catch (error) { return handleRouteError(error); }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ propertyId: string }> }) {
  try {
    const { admin } = await requireAdmin(request, "properties.update");
    await connectDb();
    const { propertyId } = await context.params;
    const property = await Property.findById(propertyId);
    if (!property) throw new HttpError(404, "NOT_FOUND", "Property not found.");
    const body = await readJson<{ listingKind?: string; name?: string; currentStep?: string; completedSteps?: string[]; sections?: Record<string, unknown> }>(request);
    if (body.listingKind && !["rental-property", "construction-project"].includes(body.listingKind)) throw new HttpError(400, "INVALID_PROPERTY_TYPE", "Invalid property type.");
    if (body.listingKind) property.metadata.listingKind = body.listingKind;
    if (body.currentStep) property.metadata.currentStep = body.currentStep;
    if (body.completedSteps) property.metadata.completedSteps = [...new Set(body.completedSteps)];
    if (body.sections) property.metadata.sections = { ...(property.metadata.sections || {}), ...body.sections };
    if (body.name) property.name = body.name.trim();
    property.markModified("metadata.sections");
    derivePropertyFields(property);
    await property.save();
    await recordActivity({ request, admin, action: "Updated property draft", operation: "update", resourceType: "property", resourceId: propertyId, resourceName: property.name });
    const integrationDetailsChanged = Boolean(body.sections && ("legalOwnership" in body.sections || "legalDocumentation" in body.sections));
    if (integrationDetailsChanged) await beginPropertyProvisioning(propertyId);
    const current = integrationDetailsChanged ? await Property.findById(propertyId) : property;
    return ok(propertyDetail(current));
  } catch (error) { return handleRouteError(error); }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ propertyId: string }> }) {
  return PUT(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ propertyId: string }> }) {
  try {
    const { admin } = await requireAdmin(request, "properties.delete");
    await connectDb();
    const { propertyId } = await context.params;
    const property = await Property.findById(propertyId);
    if (!property) throw new HttpError(404, "NOT_FOUND", "Property not found.");
    await property.deleteOne();
    await recordActivity({ request, admin, action: "Deleted property", operation: "delete", resourceType: "property", resourceId: propertyId, resourceName: property.name });
    return noContent();
  } catch (error) { return handleRouteError(error); }
}
