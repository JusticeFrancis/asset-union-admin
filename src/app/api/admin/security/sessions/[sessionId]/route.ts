import { NextRequest } from "next/server";
import { AdminSession } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { handleRouteError, HttpError, ok } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

export async function DELETE(request: NextRequest, context: { params: Promise<{ sessionId: string }> }) {
  try {
    const { admin } = await requireAdmin(request, "settings.update");
    const { sessionId } = await context.params;
    const session = await AdminSession.findOne({ _id: sessionId, adminId: admin._id, revokedAt: null });
    if (!session) throw new HttpError(404, "NOT_FOUND", "Session not found.");
    session.revokedAt = new Date();
    await session.save();
    await recordActivity({ request, admin, action: "Revoked a logged-in device", operation: "delete", resourceType: "admin_session", resourceId: sessionId, metadata: { browser: session.browser, os: session.os, deviceType: session.deviceType } });
    return ok({ success: true });
  } catch (error) { return handleRouteError(error); }
}
