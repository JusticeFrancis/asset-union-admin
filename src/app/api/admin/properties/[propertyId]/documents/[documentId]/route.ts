import { NextRequest } from "next/server";
import { Property } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { deleteCloudinaryAsset } from "@/lib/server/cloudinary";
import { handleRouteError, HttpError, noContent } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

export async function DELETE(request: NextRequest, context: { params: Promise<{ propertyId: string; documentId: string }> }) {
  try {
    const { admin } = await requireAdmin(request, "properties.update");
    const { propertyId, documentId } = await context.params;
    const property = await Property.findById(propertyId);
    if (!property) throw new HttpError(404, "NOT_FOUND", "Property not found.");
    const document = property.documents.id(documentId) as any;
    if (!document) throw new HttpError(404, "NOT_FOUND", "Document not found.");
    const title = document.title;
    if (document.storageKey) await deleteCloudinaryAsset(document.storageKey).catch(() => undefined);
    document.deleteOne();
    await property.save();
    await recordActivity({ request, admin, action: "Removed property document", operation: "delete", resourceType: "property_document", resourceId: documentId, resourceName: title, metadata: { propertyId } });
    return noContent();
  } catch (error) { return handleRouteError(error); }
}
