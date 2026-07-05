import { NextRequest } from "next/server";
import { requireAdmin, serializeAdmin } from "@/lib/server/auth";
import { uploadBuffer } from "@/lib/server/cloudinary";
import { handleRouteError, HttpError, ok } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

export async function PATCH(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request, "settings.update");
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const fullName = String(form.get("fullName") || "").trim();
      const email = String(form.get("email") || "").trim().toLowerCase();
      const avatar = form.get("avatar");
      if (!fullName || !/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "VALIDATION_ERROR", "A valid name and email are required.");
      admin.fullName = fullName;
      admin.email = email;
      if (avatar instanceof File && avatar.size > 0) {
        if (avatar.size > 5 * 1024 * 1024) throw new HttpError(400, "FILE_TOO_LARGE", "Avatar must be 5MB or smaller.");
        const uploaded = await uploadBuffer(avatar, `asset-union/admins/${admin._id}`);
        admin.avatarUrl = uploaded.url;
      }
    } else {
      const body = await request.json();
      const fullName = body.fullName !== undefined ? String(body.fullName).trim() : admin.fullName;
      const email = body.email !== undefined ? String(body.email).trim().toLowerCase() : admin.email;
      if (!fullName || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new HttpError(400, "VALIDATION_ERROR", "A valid name and email are required.");
      }
      admin.fullName = fullName;
      admin.email = email;
    }
    await admin.save();
    await recordActivity({ request, admin, action: "Updated account information", operation: "update", resourceType: "admin_profile", resourceId: String(admin._id), resourceName: admin.email });
    return ok({ admin: serializeAdmin(admin) });
  } catch (error) { return handleRouteError(error); }
}
