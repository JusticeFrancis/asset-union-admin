import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { dispatchDueNotifications } from "@/lib/server/notifications";
import { handleRouteError, ok } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";
export async function POST(request:NextRequest){try{const { admin }=await requireAdmin(request,"notifications.create");const sent=await dispatchDueNotifications();await recordActivity({ request, admin, action: `Dispatched ${sent.length} scheduled notification${sent.length === 1 ? "" : "s"}`, operation: "update", resourceType: "notification_dispatch", metadata: { count: sent.length } });return ok({success:true,count:sent.length});}catch(error){return handleRouteError(error);}}
