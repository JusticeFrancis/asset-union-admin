import { NextRequest } from "next/server";
import { Admin } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { connectDb } from "@/lib/server/db";
import { createAndSendAdminInvite } from "@/lib/server/admin-invites";
import { handleRouteError, HttpError, ok } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

export async function POST(request: NextRequest, context: { params: Promise<{ adminId: string }> }) {
  try {
    const { admin: actor } = await requireAdmin(request, "admins.update");
    await connectDb();
    const { adminId } = await context.params;
    const target = await Admin.findById(adminId);
    if (!target || target.status !== "invited") throw new HttpError(404, "NOT_FOUND", "Pending admin invitation not found.");
    if (target.role === "super_admin" && actor.role !== "super_admin") {
      throw new HttpError(403, "FORBIDDEN", "Only a super admin can resend a super-admin invitation.");
    }
    const invite = await createAndSendAdminInvite({ admin: target, invitedBy: actor });
    await recordActivity({ request, admin: actor, action: "Resent admin invitation", operation: "update", resourceType: "admin", resourceId: adminId, resourceName: target.email });
    return ok({ success: true, expiresAt: invite.expiresAt });
  } catch (error) { return handleRouteError(error); }
}
