import { NextRequest } from "next/server";
import { Property } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { uploadBuffer } from "@/lib/server/cloudinary";
import { handleRouteError, HttpError, ok } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

export async function POST(request: NextRequest, context: { params: Promise<{ propertyId: string }> }) {
  try {
    const { admin } = await requireAdmin(request, "properties.update");
    const { propertyId } = await context.params;
    const property = await Property.findById(propertyId);
    if (!property) throw new HttpError(404, "NOT_FOUND", "Property not found.");
    const contentType = request.headers.get("content-type") || "";
    let payload: any;
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) throw new HttpError(400, "FILE_REQUIRED", "Select a file to upload.");
      if (file.size > 20 * 1024 * 1024) throw new HttpError(400, "FILE_TOO_LARGE", "File must be 20MB or smaller.");
      const uploaded = await uploadBuffer(file, `asset-union/properties/${propertyId}`);
      payload = { type: String(form.get("type") || "document"), title: String(form.get("title") || file.name), url: uploaded.url, storageKey: uploaded.publicId, subtitle: String(form.get("subtitle") || ""), action: String(form.get("action") || "open") };
    } else {
      payload = await request.json();
    }
    if (!payload.type || !payload.title || !payload.url) throw new HttpError(400, "VALIDATION_ERROR", "Document type, title and URL are required.");
    property.documents.push(payload);
    await property.save();
    const document = property.documents[property.documents.length - 1] as any;
    await recordActivity({ request, admin, action: "Added property document", operation: "create", resourceType: "property_document", resourceId: String(document._id), resourceName: payload.title, metadata: { propertyId } });
    return ok({ id: String(document._id), type: document.type, title: document.title, url: document.url, storageKey: document.storageKey, externalUrl: document.externalUrl, subtitle: document.subtitle, action: document.action, createdAt: new Date(document.createdAt).getTime() }, 201);
  } catch (error) { return handleRouteError(error); }
}
