import { NextRequest } from "next/server";
import { handleRouteError, ok } from "@/lib/server/http";
import { requireAdmin, serializeAdmin } from "@/lib/server/auth";

export async function GET(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request);
    return ok({ admin: serializeAdmin(admin) });
  } catch (error) {
    return handleRouteError(error);
  }
}
