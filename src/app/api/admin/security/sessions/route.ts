import { NextRequest } from "next/server";
import { AdminSession } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { handleRouteError, ok } from "@/lib/server/http";
import { hashToken } from "@/lib/server/crypto";
import { recordActivity } from "@/lib/server/activity";

export async function GET(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request, "settings.view");
    const currentHash = request.cookies.get("au_admin_refresh_token")?.value ? hashToken(request.cookies.get("au_admin_refresh_token")!.value) : "";
    const sessions = await AdminSession.find({ adminId: admin._id, revokedAt: null, expiresAt: { $gt: new Date() } }).sort({ lastActiveAt: -1 }).lean();
    return ok({ sessions: sessions.map((item: any) => ({ id: String(item._id), browser: item.browser, os: item.os, deviceType: item.deviceType, ip: item.ip, location: item.location, lastActiveAt: item.lastActiveAt, createdAt: item.createdAt, current: item.refreshTokenHash === currentHash })) });
  } catch (error) { return handleRouteError(error); }
}

export async function DELETE(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request, "settings.update");
    const currentHash = request.cookies.get("au_admin_refresh_token")?.value ? hashToken(request.cookies.get("au_admin_refresh_token")!.value) : "";
    const result = await AdminSession.updateMany({ adminId: admin._id, revokedAt: null, refreshTokenHash: { $ne: currentHash } }, { $set: { revokedAt: new Date() } });
    await recordActivity({ request, admin, action: "Revoked other logged-in devices", operation: "delete", resourceType: "admin_session", resourceId: String(admin._id), metadata: { revokedCount: result.modifiedCount } });
    return ok({ success: true, revokedCount: result.modifiedCount });
  } catch (error) { return handleRouteError(error); }
}
