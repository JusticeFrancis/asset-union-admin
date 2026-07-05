import type { NextRequest } from "next/server";
import { Property } from "@/models";
import { HttpError } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

export async function transitionProperty(input: { request: NextRequest; admin: any; propertyId: string; to: string; allowedFrom: string[]; action: string; reason?: string }) {
  const property = await Property.findById(input.propertyId);
  if (!property) throw new HttpError(404, "NOT_FOUND", "Property not found.");
  if (!input.allowedFrom.includes(property.status)) throw new HttpError(409, "INVALID_TRANSITION", `Property cannot move from ${property.status} to ${input.to}.`);
  const previousStatus = property.status;
  property.status = input.to;
  property.currentStage = input.to[0].toUpperCase() + input.to.slice(1);
  if (input.to === "submitted") property.submittedAt = new Date();
  if (input.to === "active") { property.publishedAt = new Date(); property.rejectionReason = ""; property.pauseReason = ""; }
  if (input.to === "rejected") property.rejectionReason = input.reason || "";
  if (input.to === "paused") property.pauseReason = input.reason || "";
  await property.save();
  await recordActivity({ request: input.request, admin: input.admin, action: input.action, operation: "update", resourceType: "property", resourceId: input.propertyId, resourceName: property.name, metadata: { previousStatus, status: input.to, reason: input.reason || "" } });
  return { property, result: { id: input.propertyId, status: input.to, previousStatus, timestamp: Date.now(), ...(input.reason ? { reason: input.reason } : {}) } };
}
