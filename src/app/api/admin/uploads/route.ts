import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { uploadBuffer } from "@/lib/server/cloudinary";
import { handleRouteError, HttpError, ok } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

export async function POST(request: NextRequest) {
  try {
    const { admin, permissions } = await requireAdmin(request);
    if (!permissions.some((p) => ["properties.create", "properties.update", "settings.update"].includes(p))) {
      throw new HttpError(403, "FORBIDDEN", "You do not have permission to upload files.");
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) throw new HttpError(400, "FILE_REQUIRED", "Select a file to upload.");
    if (file.size > 30 * 1024 * 1024) throw new HttpError(400, "FILE_TOO_LARGE", "File must be 30MB or smaller.");
    const folder = String(form.get("folder") || "asset-union/uploads").replace(/[^a-zA-Z0-9/_-]/g, "-");
    const uploaded = await uploadBuffer(file, folder);
    await recordActivity({ request, admin, action: "Uploaded file", operation: "create", resourceType: "file", resourceId: uploaded.publicId, resourceName: file.name, metadata: { size: file.size, type: file.type } });
    return ok({ url: uploaded.url, publicId: uploaded.publicId, resourceType: uploaded.resourceType, filename: file.name, size: file.size }, 201);
  } catch (error) { return handleRouteError(error); }
}
