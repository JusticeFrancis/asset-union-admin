import { NextRequest } from "next/server";
import { connectDb } from "@/lib/server/db";
import { dispatchDueNotifications } from "@/lib/server/notifications";
import { HttpError, handleRouteError, ok } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

export async function GET(request: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    const authorization = request.headers.get("authorization");
    if (!secret || authorization !== `Bearer ${secret}`) throw new HttpError(401, "UNAUTHORIZED", "Invalid cron authorization.");
    await connectDb();
    const sent = await dispatchDueNotifications();
    if (sent.length) await recordActivity({ action: `Dispatched ${sent.length} scheduled notification${sent.length === 1 ? "" : "s"}`, operation: "system", resourceType: "notification_dispatch", metadata: { count: sent.length } });
    return ok({ success: true, count: sent.length });
  } catch (error) { return handleRouteError(error); }
}
