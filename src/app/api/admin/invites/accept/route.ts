import { NextRequest } from "next/server";
import { connectDb } from "@/lib/server/db";
import { findValidInvite } from "@/lib/server/admin-invites";
import { handleRouteError, HttpError, ok, readJson } from "@/lib/server/http";
import { hashPassword } from "@/lib/server/auth";
import { recordActivity } from "@/lib/server/activity";
import { AdminInvite } from "@/models";

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const body = await readJson<{ token?: string; fullName?: string; password?: string }>(request);
    if (!body.token || !body.fullName?.trim() || !body.password || body.password.length < 8) {
      throw new HttpError(400, "VALIDATION_ERROR", "Name, token, and a password of at least 8 characters are required.");
    }
    const result = await findValidInvite(body.token);
    if (!result) throw new HttpError(410, "INVITE_INVALID", "This invitation is invalid, expired, or has already been used.");
    const { invite, admin } = result;
    const acceptedAt = new Date();
    const consumed = await AdminInvite.findOneAndUpdate(
      { _id: invite._id, acceptedAt: null, expiresAt: { $gt: acceptedAt } },
      { $set: { acceptedAt } },
      { new: true },
    );
    if (!consumed) {
      throw new HttpError(410, "INVITE_INVALID", "This invitation is invalid, expired, or has already been used.");
    }
    admin.fullName = body.fullName.trim();
    admin.passwordHash = await hashPassword(body.password);
    admin.status = "active";
    admin.inviteAcceptedAt = acceptedAt;
    await admin.save();
    await recordActivity({ request, admin, action: "Accepted admin invitation", operation: "auth", resourceType: "admin", resourceId: String(admin._id), resourceName: admin.email });
    return ok({ success: true, message: "Invitation accepted. You can now sign in." });
  } catch (error) {
    return handleRouteError(error);
  }
}
