import { NextRequest } from "next/server";
import { connectDb } from "@/lib/server/db";
import { findValidInvite } from "@/lib/server/admin-invites";
import { handleRouteError, HttpError, ok } from "@/lib/server/http";
import { ROLE_LABELS, type AdminRoleName } from "@/lib/server/constants";

export async function GET(request: NextRequest) {
  try {
    await connectDb();
    const token = request.nextUrl.searchParams.get("token") || "";
    const result = token ? await findValidInvite(token) : null;
    if (!result) throw new HttpError(410, "INVITE_INVALID", "This invitation is invalid, expired, or has already been used.");
    const { admin, invite } = result;
    return ok({
      valid: true,
      invite: {
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
        roleLabel: admin.role === "custom" ? admin.customRoleName : ROLE_LABELS[admin.role as AdminRoleName],
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
