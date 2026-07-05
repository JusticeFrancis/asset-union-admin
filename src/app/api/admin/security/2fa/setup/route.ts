import { NextRequest } from "next/server";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/server/auth";
import { encryptSecret } from "@/lib/server/crypto";
import { handleRouteError, ok } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

export async function POST(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request, "settings.update");
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(admin.email, "Asset Union Admin", secret);
    admin.twoFactorSecret = encryptSecret(secret);
    admin.twoFactorEnabled = false;
    await admin.save();
    await recordActivity({ request, admin, action: "Started two-factor authentication setup", operation: "update", resourceType: "security", resourceId: String(admin._id) });
    return ok({ secret, qrCodeDataUrl: await QRCode.toDataURL(uri), otpauthUrl: uri });
  } catch (error) { return handleRouteError(error); }
}
