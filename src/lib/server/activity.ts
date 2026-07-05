import type { NextRequest } from "next/server";
import { ComplianceLog, Notification } from "@/models";
import { requestContext } from "@/lib/server/request-context";

type ActivityInput = {
  request?: NextRequest;
  admin?: any;
  action: string;
  operation: "create" | "read" | "update" | "delete" | "auth" | "system";
  resourceType: string;
  resourceId?: string;
  resourceName?: string;
  status?: "success" | "failed";
  metadata?: Record<string, unknown>;
  createNotification?: boolean;
};

export async function recordActivity(input: ActivityInput) {
  const context = input.request ? requestContext(input.request) : { ip: "", userAgent: "" };
  const actorName = input.admin?.fullName || "System";
  const log = await ComplianceLog.create({
    actorAdminId: input.admin?._id || null,
    actorName,
    action: input.action,
    operation: input.operation,
    resourceType: input.resourceType,
    resourceId: input.resourceId || "",
    resourceName: input.resourceName || "",
    status: input.status || "success",
    metadata: input.metadata || {},
    ip: context.ip,
    userAgent: context.userAgent,
  });

  if (input.createNotification !== false && input.operation !== "read") {
    await Notification.create({
      title: input.action,
      message: `${actorName} ${input.action.toLowerCase()}${input.resourceName ? `: ${input.resourceName}` : ""}.`,
      audience: "Super Admin",
      channels: ["in_app"],
      sendOption: "now",
      sentAt: new Date(),
      status: "sent",
      type: `${input.resourceType}.${input.operation}`,
      origin: "activity",
      entityType: input.resourceType,
      entityId: input.resourceId || "",
      createdBy: input.admin?._id || null,
    });
  }
  return log;
}
