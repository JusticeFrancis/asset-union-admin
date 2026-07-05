import { NextRequest } from "next/server";
import { authenticator } from "otplib";
import { requireAdmin } from "@/lib/server/auth";
import { decryptSecret } from "@/lib/server/crypto";
import { handleRouteError, HttpError, ok, readJson } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

export async function POST(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request, "settings.update");
    const body = await readJson<{ code?: string }>(request);
    const configured = await (admin.constructor as any).findById(admin._id).select("+twoFactorSecret");
    if (!configured?.twoFactorSecret || !body.code || !authenticator.check(body.code.replace(/\s/g, ""), decryptSecret(configured.twoFactorSecret))) {
      throw new HttpError(400, "INVALID_TWO_FACTOR_CODE", "Enter a valid authenticator code to disable 2FA.");
    }
    configured.twoFactorEnabled = false;
    configured.twoFactorSecret = null;
    await configured.save();
    await recordActivity({ request, admin: configured, action: "Disabled two-factor authentication", operation: "update", resourceType: "security", resourceId: String(admin._id) });
    return ok({ success: true, twoFactorEnabled: false });
  } catch (error) { return handleRouteError(error); }
}
