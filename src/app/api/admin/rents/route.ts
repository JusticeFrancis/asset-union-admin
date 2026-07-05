import { NextRequest } from "next/server";
import { Property, Rent } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { connectDb } from "@/lib/server/db";
import { handleRouteError, HttpError, ok, positiveInt, readJson } from "@/lib/server/http";
import { rentJson } from "@/lib/server/common-serializers";
import { recordActivity } from "@/lib/server/activity";

export async function GET(request: NextRequest) {
  try { await requireAdmin(request, "rents.view"); await connectDb();
    const page = Math.max(1, positiveInt(request.nextUrl.searchParams.get("page"), 1, 100000)); const limit = Math.max(1, positiveInt(request.nextUrl.searchParams.get("limit"), 20, 100)); const status = request.nextUrl.searchParams.get("status"); const propertyId = request.nextUrl.searchParams.get("propertyId"); const filter: any = {};
    if (status && status !== "all") filter.status = status; if (propertyId) filter.propertyId = propertyId;
    const [items,total] = await Promise.all([Rent.find(filter).populate("propertyId", "name location").sort({ periodStart: -1 }).skip((page-1)*limit).limit(limit).lean(), Rent.countDocuments(filter)]);
    return ok({ items: items.map(rentJson), pagination: { page, limit, total, pages: Math.ceil(total/limit) } });
  } catch (error) { return handleRouteError(error); }
}
export async function POST(request: NextRequest) {
  try { const { admin } = await requireAdmin(request, "rents.create"); await connectDb(); const body = await readJson<any>(request);
    if (!body.propertyId || !body.periodStart || !body.periodEnd || body.grossRent === undefined) throw new HttpError(400, "VALIDATION_ERROR", "Property, period and gross rent are required.");
    if (!(await Property.exists({ _id: body.propertyId }))) throw new HttpError(404, "PROPERTY_NOT_FOUND", "Property not found.");
    const grossRent = Number(body.grossRent); const expenses = Number(body.expenses || 0); const managementFee = Number(body.managementFee || 0); const netDistributable = body.netDistributable === undefined ? Math.max(0, grossRent - expenses - managementFee) : Number(body.netDistributable);
    const rent = await Rent.create({ propertyId: body.propertyId, periodStart: body.periodStart, periodEnd: body.periodEnd, grossRent, expenses, managementFee, netDistributable, distributionDate: body.distributionDate || null, status: body.status || "draft", notes: body.notes || "", submittedBy: admin._id });
    await rent.populate("propertyId", "name location"); await recordActivity({ request, admin, action: "Created rent submission", operation: "create", resourceType: "rent", resourceId: String(rent._id), resourceName: (rent.propertyId as any)?.name || "" }); return ok(rentJson(rent), 201);
  } catch (error) { return handleRouteError(error); }
}
