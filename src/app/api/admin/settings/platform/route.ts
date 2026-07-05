import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/server/auth";
import { recordActivity } from "@/lib/server/activity";
import { handleRouteError, HttpError, ok } from "@/lib/server/http";
import { PlatformSetting } from "@/models";

const KEY = "platform_financial_settings";
const DEFAULTS = { transactionFee: 100, minimumInvestmentAmount: 100 };

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request, "platform_settings.view");
    const setting = await PlatformSetting.findOne({ key: KEY }).lean();
    return ok({ settings: { ...DEFAULTS, ...((setting as any)?.value || {}) } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request, "platform_settings.update");
    const body = await request.json();
    const transactionFee = Number(body.transactionFee);
    const minimumInvestmentAmount = Number(body.minimumInvestmentAmount);
    if (!Number.isFinite(transactionFee) || transactionFee < 0 || !Number.isFinite(minimumInvestmentAmount) || minimumInvestmentAmount < 0) {
      throw new HttpError(400, "VALIDATION_ERROR", "Transaction fee and minimum investment must be valid non-negative amounts.");
    }
    const value = { transactionFee, minimumInvestmentAmount };
    await PlatformSetting.findOneAndUpdate({ key: KEY }, { $set: { value, updatedBy: admin._id } }, { upsert: true, new: true });
    await recordActivity({ request, admin, action: "Updated platform financial settings", operation: "update", resourceType: "platform_setting", resourceId: KEY, resourceName: "Platform fees", metadata: value });
    return ok({ settings: value });
  } catch (error) {
    return handleRouteError(error);
  }
}
