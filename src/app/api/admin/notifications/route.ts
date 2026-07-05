import { NextRequest } from "next/server";
import { Notification } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import {
  handleRouteError,
  HttpError,
  ok,
  positiveInt,
  readJson,
} from "@/lib/server/http";
import { notificationJson } from "@/lib/server/common-serializers";
import { deliverNotification } from "@/lib/server/notifications";
import { recordActivity } from "@/lib/server/activity";

function visibleAudienceFilter(admin: any) {
  if (admin.role === "super_admin") return {};
  const audienceByRole: Record<string, string> = {
    property_manager: "Property Managers",
    user_manager: "User Manager",
    rent_manager: "Rent Managers",
  };
  const audiences = [
    "All",
    audienceByRole[admin.role],
    admin.role === "custom" ? admin.customRoleName : undefined,
  ].filter(Boolean);
  return { audience: { $in: audiences } };
}

export async function GET(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request, "notifications.view");
    const page = Math.max(
      1,
      positiveInt(request.nextUrl.searchParams.get("page"), 1, 100000),
    );
    const limit = Math.max(
      1,
      positiveInt(request.nextUrl.searchParams.get("limit"), 20, 100),
    );
    const status = request.nextUrl.searchParams.get("status");
    const type = request.nextUrl.searchParams.get("type");
    const filter: any = visibleAudienceFilter(admin);
    if (status && status !== "all") filter.status = status;
    if (type && type !== "all") filter.type = type;
    const unreadFilter = {
      ...filter,
      channels: "in_app",
      readBy: { $ne: admin._id },
    };
    const [items, total, unread] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
      Notification.countDocuments(unreadFilter),
    ]);
    return ok({
      items: items.map((item: any) => ({
        ...notificationJson(item),
        read: (item.readBy || []).some(
          (id: any) => String(id) === String(admin._id),
        ),
      })),
      unread,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request, "notifications.create");
    const body = await readJson<any>(request);
    if (!body.title?.trim() || !body.message?.trim() || !body.audience) {
      throw new HttpError(
        400,
        "VALIDATION_ERROR",
        "Title, message and audience are required.",
      );
    }
    const channels = (body.channels || []).filter((channel: string) =>
      ["in_app", "email"].includes(channel),
    );
    if (!channels.length) {
      throw new HttpError(
        400,
        "CHANNEL_REQUIRED",
        "Select in-app, email, or both.",
      );
    }
    const sendOption = body.sendOption === "schedule" ? "schedule" : "now";
    if (sendOption === "schedule" && !body.scheduledFor) {
      throw new HttpError(
        400,
        "SCHEDULE_REQUIRED",
        "Choose a scheduled date and time.",
      );
    }
    const notification = await Notification.create({
      title: body.title.trim(),
      message: body.message.trim(),
      audience: body.audience,
      channels,
      sendOption,
      scheduledFor:
        sendOption === "schedule" ? new Date(body.scheduledFor) : null,
      status: sendOption === "schedule" ? "scheduled" : "draft",
      type: body.type || "manual",
      origin: "manual",
      createdBy: admin._id,
    });
    if (sendOption === "now") await deliverNotification(notification);
    await recordActivity({
      request,
      admin,
      action: "Created notification",
      operation: "create",
      resourceType: "notification",
      resourceId: String(notification._id),
      resourceName: notification.title,
      metadata: { audience: notification.audience, channels },
    });
    return ok(notificationJson(notification), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
