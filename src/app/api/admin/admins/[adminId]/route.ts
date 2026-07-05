import { NextRequest } from "next/server";
import { Admin, AdminInvite, AdminSession } from "@/models";
import { requireAdmin, serializeAdmin } from "@/lib/server/auth";
import { connectDb } from "@/lib/server/db";
import {
  ADMIN_ROLES,
  PERMISSIONS,
  permissionsFor,
  type AdminRoleName,
} from "@/lib/server/constants";
import { handleRouteError, HttpError, noContent, ok, readJson } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

function assertCanDelegate(actor: any, actorPermissions: string[], role: AdminRoleName, customPermissions: string[]) {
  if (role === "super_admin" && actor.role !== "super_admin") {
    throw new HttpError(403, "FORBIDDEN", "Only a super admin can assign the Super Admin role.");
  }
  const delegated = permissionsFor(role, customPermissions);
  if (actor.role !== "super_admin" && delegated.some((permission) => !actorPermissions.includes(permission))) {
    throw new HttpError(403, "FORBIDDEN", "You cannot grant permissions that you do not have.");
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ adminId: string }> }) {
  try {
    await requireAdmin(request, "admins.view");
    await connectDb();
    const { adminId } = await context.params;
    const admin = await Admin.findById(adminId).lean();
    if (!admin) throw new HttpError(404, "NOT_FOUND", "Admin not found.");
    const invite = await AdminInvite.findOne({ adminId }).sort({ createdAt: -1 }).lean();
    return ok({
      admin: {
        ...serializeAdmin(admin),
        createdAt: (admin as any).createdAt,
        inviteAccepted: Boolean((admin as any).inviteAcceptedAt),
        inviteExpiresAt: invite?.expiresAt || null,
      },
      permissions: PERMISSIONS,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ adminId: string }> }) {
  try {
    const { admin: actor, permissions: actorPermissions } = await requireAdmin(request, "admins.update");
    await connectDb();
    const { adminId } = await context.params;
    const target = await Admin.findById(adminId);
    if (!target) throw new HttpError(404, "NOT_FOUND", "Admin not found.");
    if (target.role === "super_admin" && actor.role !== "super_admin") {
      throw new HttpError(403, "FORBIDDEN", "Only a super admin can modify another super admin.");
    }

    const body = await readJson<{
      fullName?: string;
      email?: string;
      role?: string;
      customRoleName?: string;
      customPermissions?: string[];
      status?: string;
    }>(request);

    const isSelf = String(target._id) === String(actor._id);
    if (isSelf && body.role !== undefined && body.role !== target.role) {
      throw new HttpError(400, "SELF_ROLE_CHANGE", "You cannot change your own admin role.");
    }
    if (isSelf && body.status !== undefined && body.status !== "active") {
      throw new HttpError(400, "SELF_SUSPEND", "You cannot suspend your own account.");
    }

    if (body.fullName !== undefined) {
      const fullName = body.fullName.trim();
      if (!fullName) throw new HttpError(400, "VALIDATION_ERROR", "Admin name is required.");
      target.fullName = fullName;
    }
    if (body.email !== undefined) {
      const email = body.email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "VALIDATION_ERROR", "Enter a valid email address.");
      target.email = email;
    }

    const nextRole = body.role !== undefined ? body.role as AdminRoleName : target.role as AdminRoleName;
    if (!ADMIN_ROLES.includes(nextRole)) throw new HttpError(400, "INVALID_ROLE", "Select a valid role.");
    const nextCustomRoleName = body.customRoleName !== undefined ? body.customRoleName.trim() : target.customRoleName;
    const nextCustomPermissions = (body.customPermissions !== undefined ? body.customPermissions : target.customPermissions || [])
      .filter((item: string) => PERMISSIONS.includes(item as any));
    if (nextRole === "custom" && !nextCustomRoleName) {
      throw new HttpError(400, "VALIDATION_ERROR", "Custom role name is required.");
    }
    assertCanDelegate(actor, actorPermissions, nextRole, nextCustomPermissions);

    const removingActiveSuperRole =
      target.role === "super_admin" &&
      target.status === "active" &&
      nextRole !== "super_admin";
    const suspendingActiveSuper =
      target.role === "super_admin" &&
      target.status === "active" &&
      body.status === "suspended";
    if ((removingActiveSuperRole || suspendingActiveSuper) && await Admin.countDocuments({ role: "super_admin", status: "active" }) <= 1) {
      throw new HttpError(400, "LAST_SUPER_ADMIN", "The last active super admin cannot be downgraded or suspended.");
    }

    if (body.status !== undefined) {
      if (!['active', 'suspended', 'invited'].includes(body.status)) {
        throw new HttpError(400, "INVALID_STATUS", "Select a valid status.");
      }
      const accepted = Boolean(target.inviteAcceptedAt);
      if (!accepted && body.status !== "invited") {
        throw new HttpError(409, "INVITE_NOT_ACCEPTED", "This admin must accept the invitation before the account can be activated.");
      }
      if (accepted && body.status === "invited") {
        throw new HttpError(400, "INVALID_STATUS", "An accepted admin cannot be returned to invited status.");
      }
      target.status = body.status;
    }

    target.role = nextRole;
    target.customRoleName = nextRole === "custom" ? nextCustomRoleName : "";
    target.customPermissions = nextRole === "custom" ? nextCustomPermissions : [];
    await target.save();

    if (target.status !== "active") {
      await AdminSession.updateMany(
        { adminId: target._id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
    }
    await recordActivity({
      request,
      admin: actor,
      action: "Updated admin",
      operation: "update",
      resourceType: "admin",
      resourceId: String(target._id),
      resourceName: target.email,
      metadata: { role: target.role, status: target.status },
    });
    return ok({ admin: serializeAdmin(target) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ adminId: string }> }) {
  try {
    const { admin: actor } = await requireAdmin(request, "admins.delete");
    await connectDb();
    const { adminId } = await context.params;
    if (String(actor._id) === adminId) throw new HttpError(400, "SELF_DELETE", "You cannot remove your own admin account.");
    const target = await Admin.findById(adminId);
    if (!target) throw new HttpError(404, "NOT_FOUND", "Admin not found.");
    if (target.role === "super_admin" && actor.role !== "super_admin") {
      throw new HttpError(403, "FORBIDDEN", "Only a super admin can remove another super admin.");
    }
    if (target.role === "super_admin" && target.status === "active" && await Admin.countDocuments({ role: "super_admin", status: "active" }) <= 1) {
      throw new HttpError(400, "LAST_SUPER_ADMIN", "The last active super admin cannot be removed.");
    }
    await Promise.all([
      AdminInvite.deleteMany({ adminId }),
      AdminSession.deleteMany({ adminId }),
      target.deleteOne(),
    ]);
    await recordActivity({
      request,
      admin: actor,
      action: "Removed admin",
      operation: "delete",
      resourceType: "admin",
      resourceId: adminId,
      resourceName: target.email,
    });
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
