import { NextRequest } from "next/server";
import {
  ComplianceLog,
  GovernanceProposal,
  Notification,
  Property,
  Rent,
  User,
} from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import type { Permission } from "@/lib/server/constants";
import { handleRouteError, ok } from "@/lib/server/http";

export async function GET(request: NextRequest) {
  try {
    const { permissions } = await requireAdmin(request, "dashboard.view");
    const has = (permission: Permission) => permissions.includes(permission);
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cards: Array<{ key: string; label: string; value: number; format?: "currency" }> = [];

    if (has("properties.view")) {
      const [properties, activeProperties] = await Promise.all([
        Property.countDocuments(),
        Property.countDocuments({ status: "active" }),
      ]);
      cards.push(
        { key: "properties", label: "Total Properties", value: properties },
        { key: "activeProperties", label: "Active Properties", value: activeProperties },
      );
    }

    if (has("users.view")) {
      const [users, verifiedUsers] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ kycStatus: "verified" }),
      ]);
      cards.push(
        { key: "users", label: "Platform Users", value: users },
        { key: "verifiedUsers", label: "Verified KYC", value: verifiedUsers },
      );
    }

    let monthlyRent: any[] = [];
    if (has("rents.view")) {
      const [pendingRents, netRent, rentSeries] = await Promise.all([
        Rent.countDocuments({ status: { $in: ["draft", "submitted"] } }),
        Rent.aggregate([
          { $match: { status: { $in: ["approved", "distributed"] }, periodStart: { $gte: monthStart } } },
          { $group: { _id: null, total: { $sum: "$netDistributable" } } },
        ]),
        Rent.aggregate([
          { $match: { periodStart: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
          { $group: { _id: { year: { $year: "$periodStart" }, month: { $month: "$periodStart" } }, gross: { $sum: "$grossRent" }, net: { $sum: "$netDistributable" } } },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
      ]);
      monthlyRent = rentSeries;
      cards.push(
        { key: "pendingRents", label: "Pending Rent", value: pendingRents },
        { key: "netRentThisMonth", label: "Net Rent This Month", value: netRent[0]?.total || 0, format: "currency" },
      );
    }

    if (has("governance.view")) {
      const activeProposals = await GovernanceProposal.countDocuments({
        status: "active",
        closesAt: { $gt: now },
      });
      cards.push({ key: "activeProposals", label: "Active Proposals", value: activeProposals });
    }

    if (has("notifications.view")) {
      const notifications = await Notification.countDocuments({ channels: "in_app", status: "sent" });
      cards.push({ key: "notifications", label: "Notifications", value: notifications });
    }

    const resourceTypes: string[] = [];
    if (has("properties.view")) resourceTypes.push("property", "property_document", "property_integration", "property_legal_entity", "property_legal_signature");
    if (has("rents.view")) resourceTypes.push("rent", "rent_document");
    if (has("users.view")) resourceTypes.push("user");
    if (has("governance.view")) resourceTypes.push("governance_proposal", "governance_vote");
    if (has("admins.view")) resourceTypes.push("admin", "admin_invite", "admin_session");
    if (has("notifications.view")) resourceTypes.push("notification", "notification_dispatch");
    if (has("settings.view")) resourceTypes.push("admin_profile", "security", "file");
    if (has("platform_settings.view")) resourceTypes.push("platform_setting");

    const recentActivity = resourceTypes.length
      ? await ComplianceLog.find({ resourceType: { $in: resourceTypes } })
          .sort({ createdAt: -1 })
          .limit(8)
          .lean()
      : [];

    return ok({
      cards,
      monthlyRent,
      recentActivity: recentActivity.map((item: any) => ({
        id: String(item._id),
        actorName: item.actorName,
        action: item.action,
        resourceName: item.resourceName,
        operation: item.operation,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
