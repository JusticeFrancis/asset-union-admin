import { NextRequest } from "next/server";
import { Admin, AdminInvite } from "@/models";
import { requireAdmin, serializeAdmin } from "@/lib/server/auth";
import { connectDb } from "@/lib/server/db";
import { ADMIN_ROLES, PERMISSIONS, permissionsFor, type AdminRoleName } from "@/lib/server/constants";
import { handleRouteError, HttpError, ok, positiveInt, readJson } from "@/lib/server/http";
import { createAndSendAdminInvite } from "@/lib/server/admin-invites";
import { recordActivity } from "@/lib/server/activity";

function parseRole(value: unknown): AdminRoleName {
  if (typeof value !== "string" || !ADMIN_ROLES.includes(value as AdminRoleName)) throw new HttpError(400, "INVALID_ROLE", "Select a valid admin role.");
  return value as AdminRoleName;
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request, "admins.view");
    await connectDb();
    const page = Math.max(1, positiveInt(request.nextUrl.searchParams.get("page"), 1, 100000));
    const limit = Math.max(1, positiveInt(request.nextUrl.searchParams.get("limit"), 20, 100));
    const search = request.nextUrl.searchParams.get("search")?.trim();
    const role = request.nextUrl.searchParams.get("role");
    const status = request.nextUrl.searchParams.get("status");
    const filter: Record<string, unknown> = {};
    if (search) filter.$or = [{ fullName: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }];
    if (role && role !== "all") filter.role = role;
    if (status && status !== "all") filter.status = status;
    const [items, total] = await Promise.all([
      Admin.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Admin.countDocuments(filter),
    ]);
    const ids = items.map((item: any) => item._id);
    const invites = await AdminInvite.find({ adminId: { $in: ids } }).sort({ createdAt: -1 }).lean();
    const latestInvite = new Map<string, any>();
    invites.forEach((invite: any) => { if (!latestInvite.has(String(invite.adminId))) latestInvite.set(String(invite.adminId), invite); });
    return ok({
      items: items.map((item: any) => ({ ...serializeAdmin(item), createdAt: item.createdAt, inviteAccepted: Boolean(item.inviteAcceptedAt), inviteExpiresAt: latestInvite.get(String(item._id))?.expiresAt || null })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      roles: ADMIN_ROLES,
      permissions: PERMISSIONS,
    });
  } catch (error) { return handleRouteError(error); }
}

export async function POST(request: NextRequest) {
  try {
    const { admin: actor, permissions: actorPermissions } = await requireAdmin(request, "admins.create");
    await connectDb();
    const body = await readJson<{ fullName?: string; email?: string; role?: string; customRoleName?: string; customPermissions?: string[] }>(request);
    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const role = parseRole(body.role);
    if (!fullName || !email || !/^\S+@\S+\.\S+$/.test(email)) throw new HttpError(400, "VALIDATION_ERROR", "A valid name and email are required.");
    if (role === "custom" && !body.customRoleName?.trim()) throw new HttpError(400, "VALIDATION_ERROR", "Custom role name is required.");
    const customPermissions = (body.customPermissions || []).filter((permission) => PERMISSIONS.includes(permission as any));
    if (role === "super_admin" && actor.role !== "super_admin") throw new HttpError(403, "FORBIDDEN", "Only a super admin can assign the Super Admin role.");
    const delegatedPermissions = permissionsFor(role, customPermissions);
    if (actor.role !== "super_admin" && delegatedPermissions.some((permission) => !actorPermissions.includes(permission))) {
      throw new HttpError(403, "FORBIDDEN", "You cannot grant permissions that you do not have.");
    }
    const created = await Admin.create({ fullName, email, role, customRoleName: role === "custom" ? body.customRoleName?.trim() : "", customPermissions: role === "custom" ? customPermissions : [], status: "invited", createdBy: actor._id });
    let emailDelivery = "sent";
    try { await createAndSendAdminInvite({ admin: created, invitedBy: actor }); } catch (error) { emailDelivery = error instanceof Error ? error.message : "failed"; }
    await recordActivity({ request, admin: actor, action: "Created admin invitation", operation: "create", resourceType: "admin", resourceId: String(created._id), resourceName: created.email, metadata: { role } });
    return ok({ admin: serializeAdmin(created), emailDelivery }, 201);
  } catch (error) { return handleRouteError(error); }
}
