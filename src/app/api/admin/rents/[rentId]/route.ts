import { NextRequest } from "next/server";
import { Rent } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import { handleRouteError, HttpError, noContent, ok, readJson } from "@/lib/server/http";
import { rentJson } from "@/lib/server/common-serializers";
import { recordActivity } from "@/lib/server/activity";

export async function GET(request: NextRequest, context: { params: Promise<{ rentId: string }> }) { try { await requireAdmin(request, "rents.view"); const { rentId } = await context.params; const rent = await Rent.findById(rentId).populate("propertyId", "name location"); if (!rent) throw new HttpError(404, "NOT_FOUND", "Rent submission not found."); return ok(rentJson(rent)); } catch (error) { return handleRouteError(error); } }
export async function PATCH(request: NextRequest, context: { params: Promise<{ rentId: string }> }) {
  try { const { admin, permissions } = await requireAdmin(request, "rents.update"); const { rentId } = await context.params; const rent = await Rent.findById(rentId); if (!rent) throw new HttpError(404, "NOT_FOUND", "Rent submission not found."); const body = await readJson<any>(request);
    if (body.status && ["approved","rejected","distributed"].includes(body.status) && !permissions.includes("rents.approve")) throw new HttpError(403, "FORBIDDEN", "You cannot approve or reject rent submissions.");
    for (const key of ["propertyId","periodStart","periodEnd","grossRent","expenses","managementFee","netDistributable","distributionDate","status","notes"] as const) if (body[key] !== undefined) (rent as any)[key] = body[key];
    if (body.status === "approved") rent.approvedBy = admin._id; await rent.save(); await rent.populate("propertyId", "name location"); await recordActivity({ request, admin, action: `Updated rent submission${body.status ? ` to ${body.status}` : ""}`, operation: "update", resourceType: "rent", resourceId: rentId, resourceName: (rent.propertyId as any)?.name || "" }); return ok(rentJson(rent));
  } catch (error) { return handleRouteError(error); }
}
export async function DELETE(request: NextRequest, context: { params: Promise<{ rentId: string }> }) { try { const { admin } = await requireAdmin(request, "rents.delete"); const { rentId } = await context.params; const rent = await Rent.findById(rentId).populate("propertyId", "name"); if (!rent) throw new HttpError(404, "NOT_FOUND", "Rent submission not found."); await rent.deleteOne(); await recordActivity({ request, admin, action: "Deleted rent submission", operation: "delete", resourceType: "rent", resourceId: rentId, resourceName: (rent.propertyId as any)?.name || "" }); return noContent(); } catch (error) { return handleRouteError(error); } }
