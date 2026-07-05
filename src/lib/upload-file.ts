import { apiRequest } from "@/lib/api/client";
export async function uploadAdminFile(file: File, folder = "asset-union/uploads") {
  const form = new FormData();
  form.set("file", file);
  form.set("folder", folder);
  return apiRequest<{ url: string; publicId: string; resourceType: string; filename: string; size: number }>("admin/uploads", { method: "POST", body: form, auth: true });
}
