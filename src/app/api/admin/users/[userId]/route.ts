import { NextRequest } from "next/server";
import { User } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { handleRouteError, HttpError, noContent, ok, readJson } from "@/lib/server/http";
import { userJson } from "@/lib/server/common-serializers";
import { recordActivity } from "@/lib/server/activity";

export async function GET(request: NextRequest, context: { params: Promise<{ userId: string }> }) { try { await requireAdmin(request, "users.view"); const { userId } = await context.params; const user = await User.findById(userId); if (!user) throw new HttpError(404, "NOT_FOUND", "User not found."); return ok(userJson(user)); } catch (error) { return handleRouteError(error); } }
export async function PATCH(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try { const { admin } = await requireAdmin(request, "users.update"); const { userId } = await context.params; const user = await User.findById(userId); if (!user) throw new HttpError(404, "NOT_FOUND", "User not found."); const body = await readJson<any>(request);
    for (const key of ["fullName", "email", "phone", "country", "status", "kycStatus", "accountType", "avatarUrl"] as const) if (body[key] !== undefined) (user as any)[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
    if (body.metadata !== undefined) user.metadata = body.metadata; await user.save(); await recordActivity({ request, admin, action: "Updated user", operation: "update", resourceType: "user", resourceId: userId, resourceName: user.email }); return ok(userJson(user));
  } catch (error) { return handleRouteError(error); }
}
export async function DELETE(request: NextRequest, context: { params: Promise<{ userId: string }> }) { try { const { admin } = await requireAdmin(request, "users.delete"); const { userId } = await context.params; const user = await User.findById(userId); if (!user) throw new HttpError(404, "NOT_FOUND", "User not found."); await user.deleteOne(); await recordActivity({ request, admin, action: "Deleted user", operation: "delete", resourceType: "user", resourceId: userId, resourceName: user.email }); return noContent(); } catch (error) { return handleRouteError(error); } }
