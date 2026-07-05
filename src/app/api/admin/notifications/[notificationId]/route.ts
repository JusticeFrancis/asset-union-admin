import { NextRequest } from "next/server";
import { Notification } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { deliverNotification } from "@/lib/server/notifications";
import {
  handleRouteError,
  HttpError,
  noContent,
  ok,
  readJson,
} from "@/lib/server/http";
import { notificationJson } from "@/lib/server/common-serializers";
import { recordActivity } from "@/lib/server/activity";

function canAccessNotification(admin: any, notification: any) {
  if (admin.role === "super_admin") return true;
  const audienceByRole: Record<string, string> = {
    property_manager: "Property Managers",
    user_manager: "User Manager",
    rent_manager: "Rent Managers",
  };
  const allowed = [
    "All",
    audienceByRole[admin.role],
    admin.role === "custom" ? admin.customRoleName : undefined,
  ].filter(Boolean);
  return allowed.includes(notification.audience);
}

async function getVisibleNotification(admin: any, notificationId: string) {
  const notification = await Notification.findById(notificationId);
  if (!notification || !canAccessNotification(admin, notification)) {
    throw new HttpError(404, "NOT_FOUND", "Notification not found.");
  }
  return notification;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ notificationId: string }> },
) {
  try {
    const { admin } = await requireAdmin(request, "notifications.view");
    const { notificationId } = await context.params;
    const notification = await getVisibleNotification(admin, notificationId);
    return ok({
      ...notificationJson(notification),
      read: notification.readBy.some(
        (id: any) => String(id) === String(admin._id),
      ),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ notificationId: string }> },
) {
  try {
    const { admin } = await requireAdmin(request, "notifications.update");
    const { notificationId } = await context.params;
    const notification = await getVisibleNotification(admin, notificationId);
    const body = await readJson<any>(request);
    if (
      body.markRead === true &&
      !notification.readBy.some(
        (id: any) => String(id) === String(admin._id),
      )
    ) {
      notification.readBy.push(admin._id);
    }
    if (body.markRead === false) {
      notification.readBy = notification.readBy.filter(
        (id: any) => String(id) !== String(admin._id),
      );
    }
    if (notification.status !== "sent") {
      for (const key of [
        "title",
        "message",
        "audience",
        "channels",
        "sendOption",
        "scheduledFor",
        "type",
      ] as const) {
        if (body[key] !== undefined) (notification as any)[key] = body[key];
      }
      if (body.sendNow === true) await deliverNotification(notification);
      else await notification.save();
    } else {
      await notification.save();
    }
    await recordActivity({
      request,
      admin,
      action: "Updated notification",
      operation: "update",
      resourceType: "notification",
      resourceId: notificationId,
      resourceName: notification.title,
    });
    return ok(notificationJson(notification));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ notificationId: string }> },
) {
  try {
    const { admin } = await requireAdmin(request, "notifications.delete");
    const { notificationId } = await context.params;
    const notification = await getVisibleNotification(admin, notificationId);
    await notification.deleteOne();
    await recordActivity({
      request,
      admin,
      action: "Deleted notification",
      operation: "delete",
      resourceType: "notification",
      resourceId: notificationId,
      resourceName: notification.title,
    });
    return noContent();
  } catch (error) {
    return handleRouteError(error);
  }
}
