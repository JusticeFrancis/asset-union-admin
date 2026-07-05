import { NextRequest } from "next/server";
import { Property } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { connectDb } from "@/lib/server/db";
import { handleRouteError, HttpError, ok, positiveInt, readJson } from "@/lib/server/http";
import { derivePropertyFields, propertyDetail, propertyListItem } from "@/lib/server/property-serializers";
import { recordActivity } from "@/lib/server/activity";
import { beginPropertyProvisioning } from "@/lib/server/integrations";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request, "properties.view");
    await connectDb();
    const limit = Math.max(1, positiveInt(request.nextUrl.searchParams.get("limit"), 50, 100));
    const offset = positiveInt(request.nextUrl.searchParams.get("offset"), 0, 1000000);
    const status = request.nextUrl.searchParams.get("status");
    const search = request.nextUrl.searchParams.get("search")?.trim();
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) filter.$or = [{ name: { $regex: search, $options: "i" } }, { location: { $regex: search, $options: "i" } }];
    const [properties, total] = await Promise.all([
      Property.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
      Property.countDocuments(filter),
    ]);
    return ok({ items: properties.map(propertyListItem), total });
  } catch (error) { return handleRouteError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request, "properties.create");
    await connectDb();
    const body = await readJson<{ listingKind?: string; name?: string; currentStep?: string; sections?: Record<string, unknown> }>(request);
    if (!["rental-property", "construction-project"].includes(body.listingKind || "")) throw new HttpError(400, "INVALID_PROPERTY_TYPE", "Property must be a rental property or construction project.");
    const property = await Property.create({
      name: body.name || "Untitled property",
      type: body.listingKind === "construction-project" ? "construction" : "rental",
      status: "draft",
      metadata: { wizardVersion: 1, listingKind: body.listingKind, currentStep: body.currentStep || "basicPropertyInformation", completedSteps: [], sections: body.sections || {} },
      createdBy: admin._id,
    });
    derivePropertyFields(property);
    await property.save();
    await recordActivity({ request, admin, action: "Created property draft", operation: "create", resourceType: "property", resourceId: String(property._id), resourceName: property.name });
    await beginPropertyProvisioning(String(property._id));
    const provisioned = await Property.findById(property._id);
    return ok(propertyDetail(provisioned), 201);
  } catch (error) { return handleRouteError(error); }
}
