import { Admin, AdminInvite } from "@/models";
import { hashToken, randomToken } from "@/lib/server/crypto";
import { ROLE_LABELS, type AdminRoleName } from "@/lib/server/constants";
import { sendAdminInviteEmail } from "@/lib/server/mailer";

export async function createAndSendAdminInvite(input: { admin: any; invitedBy: any }) {
  const token = randomToken(36);
  await AdminInvite.updateMany({ adminId: input.admin._id, acceptedAt: null }, { $set: { expiresAt: new Date(0) } });
  const invite = await AdminInvite.create({
    adminId: input.admin._id,
    email: input.admin.email,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    createdBy: input.invitedBy._id,
  });
  await sendAdminInviteEmail({
    to: input.admin.email,
    fullName: input.admin.fullName,
    invitedBy: input.invitedBy.fullName,
    roleLabel: input.admin.role === "custom" ? input.admin.customRoleName || "Custom Role" : ROLE_LABELS[input.admin.role as AdminRoleName],
    token,
  });
  return invite;
}

export async function findValidInvite(token: string) {
  const invite = await AdminInvite.findOne({ tokenHash: hashToken(token), acceptedAt: null, expiresAt: { $gt: new Date() } });
  if (!invite) return null;
  const admin = await Admin.findById(invite.adminId);
  if (!admin || admin.status !== "invited") return null;
  return { invite, admin };
}
