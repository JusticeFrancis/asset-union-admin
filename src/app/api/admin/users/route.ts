import { NextRequest } from "next/server";
import { User } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { connectDb } from "@/lib/server/db";
import { handleRouteError, HttpError, ok, positiveInt, readJson } from "@/lib/server/http";
import { userJson } from "@/lib/server/common-serializers";
import { recordActivity } from "@/lib/server/activity";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request, "users.view"); await connectDb();
    const page = Math.max(1, positiveInt(request.nextUrl.searchParams.get("page"), 1, 100000));
    const limit = Math.max(1, positiveInt(request.nextUrl.searchParams.get("limit"), 20, 100));
    const search = request.nextUrl.searchParams.get("search")?.trim(); const status = request.nextUrl.searchParams.get("status"); const accountType = request.nextUrl.searchParams.get("accountType");
    const filter: any = {};
    if (search) filter.$or = [{ fullName: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { phone: { $regex: search, $options: "i" } }];
    if (status && status !== "all") filter.status = status; if (accountType && accountType !== "all") filter.accountType = accountType;
    const [items, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), User.countDocuments(filter)]);
    return ok({ items: items.map(userJson), pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { return handleRouteError(error); }
}
export async function POST(request: NextRequest) {
  try {
    const { admin } = await requireAdmin(request, "users.create"); await connectDb();
    const body = await readJson<any>(request);
    if (!body.fullName?.trim() || !/^\S+@\S+\.\S+$/.test(body.email || "")) throw new HttpError(400, "VALIDATION_ERROR", "A valid full name and email are required.");
    const user = await User.create({ fullName: body.fullName.trim(), email: body.email.trim().toLowerCase(), phone: body.phone || "", country: body.country || "", status: body.status || "active", kycStatus: body.kycStatus || "not_started", accountType: body.accountType || "investor", acceptedTermsAt: body.acceptedTermsAt || null, metadata: body.metadata || {} });
    await recordActivity({ request, admin, action: "Created user", operation: "create", resourceType: "user", resourceId: String(user._id), resourceName: user.email });
    return ok(userJson(user), 201);
  } catch (error) { return handleRouteError(error); }
}
