import { NextRequest } from "next/server";
import { Property } from "@/models";
import { requireAdmin } from "@/lib/server/auth";
import {
  createDoolaSignatureSession,
  type DoolaSignatureDocumentType,
} from "@/lib/server/integrations";
import { handleRouteError, HttpError, ok, readJson } from "@/lib/server/http";
import { recordActivity } from "@/lib/server/activity";

const ALLOWED_DOCUMENT_TYPES = new Set<DoolaSignatureDocumentType>(["SS4", "FORM8821"]);

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ propertyId: string }> },
) {
  try {
    const { admin } = await requireAdmin(request, "integrations.manage");
    const { propertyId } = await context.params;
    const body = await readJson<{ documentType?: DoolaSignatureDocumentType }>(request);
    if (!body.documentType || !ALLOWED_DOCUMENT_TYPES.has(body.documentType)) {
      throw new HttpError(400, "INVALID_DOCUMENT_TYPE", "Document type must be SS4 or FORM8821.");
    }

    const property = await Property.findById(propertyId);
    if (!property) throw new HttpError(404, "NOT_FOUND", "Property not found.");
    if (!property.legalEntity?.companyId) {
      throw new HttpError(409, "LEGAL_ENTITY_NOT_READY", "Create the property legal entity before starting a signature session.");
    }

    const session = await createDoolaSignatureSession(
      property.legalEntity.companyId,
      body.documentType,
    );
    const url = session.url || session.signatureUrl || session.signingUrl || "";
    if (!url) {
      throw new HttpError(502, "SIGNATURE_URL_MISSING", "The legal provider did not return a signing URL.");
    }

    await recordActivity({
      request,
      admin,
      action: `Created ${body.documentType} legal signature session`,
      operation: "create",
      resourceType: "property_legal_signature",
      resourceId: propertyId,
      resourceName: property.name,
      metadata: { companyId: property.legalEntity.companyId, documentType: body.documentType },
    });

    return ok({
      url,
      documentType: body.documentType,
      expiresAt: session.expiresAt || session.expiration || null,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
