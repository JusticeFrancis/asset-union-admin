import { NextRequest } from "next/server";
import { connectDb } from "@/lib/server/db";
import { handleRouteError, HttpError, ok } from "@/lib/server/http";
import {
  getDoolaDocument,
  verifyDoolaSignature,
} from "@/lib/server/integrations";
import { recordActivity } from "@/lib/server/activity";
import { Property } from "@/models";

function first(...values: unknown[]) {
  return values.find((value) => typeof value === "string" && value.trim()) as
    | string
    | undefined;
}

function normalizedRequirements(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((requirement: any) => ({
      documentType: first(requirement?.documentType, requirement?.type) || "",
      status: first(requirement?.status, "pending") || "pending",
    }))
    .filter((requirement) => requirement.documentType);
}

function upsertLegalDocument(property: any, input: any) {
  const providerDocumentId = first(
    input?.providerDocumentId,
    input?.documentId,
    input?.id,
  );
  if (!providerDocumentId) return;

  const existing = (property.legalEntity.documents || []).find(
    (document: any) => document.providerDocumentId === providerDocumentId,
  );
  const next = {
    title: first(input?.title, input?.name, input?.documentType, input?.type, "Legal document"),
    type: first(input?.documentType, input?.type, "legal"),
    // Provider download links are short-lived. The authenticated download endpoint
    // requests a fresh URL when an administrator opens the document.
    url: "",
    providerDocumentId,
  };

  if (existing) {
    existing.title = next.title;
    existing.type = next.type;
    existing.url = "";
  } else {
    property.legalEntity.documents.push(next);
  }
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    const signature =
      request.headers.get("x-doola-signature") ||
      request.headers.get("doola-signature");
    if (!verifyDoolaSignature(raw, signature)) {
      throw new HttpError(401, "INVALID_SIGNATURE", "Invalid doola webhook signature.");
    }

    const event = JSON.parse(raw);
    const eventType = String(event.type || "");
    const data = event.data?.object || event.data || event.payload || event;
    let companyId = first(
      data.doolaCompanyId,
      data.companyId,
      data.company?.doolaCompanyId,
      data.company?.id,
      event.companyId,
      event.data?.companyId,
      event.data?.doolaCompanyId,
      event.payload?.companyId,
    );
    if (!companyId && eventType.startsWith("company_")) {
      companyId = first(data.id);
    }
    if (!companyId) return ok({ received: true, matched: false });

    await connectDb();
    const property = await Property.findOne({ "legalEntity.companyId": companyId });
    if (!property) return ok({ received: true, matched: false });

    const status = first(data.status, data.formationSubmissionStatus, eventType)?.toLowerCase();
    if (data.name) property.legalEntity.entityName = data.name;
    if (data.state) property.legalEntity.state = data.state;
    if (data.ein) property.legalEntity.ein = data.ein;
    if (data.filingDate) property.legalEntity.filingDate = new Date(data.filingDate);
    if (data.formationSubmissionStatus) {
      property.legalEntity.formationSubmissionStatus = data.formationSubmissionStatus;
    }

    const requirements = normalizedRequirements(
      data.signatureRequirements || data.company?.signatureRequirements,
    );
    if (requirements) property.legalEntity.signatureRequirements = requirements;

    if (status) {
      property.legalEntity.status = /complete|formed|approved|success/.test(status)
        ? "completed"
        : /fail|reject|cancel/.test(status)
          ? "failed"
          : "pending";
    }

    if (Array.isArray(data.documents)) {
      for (const document of data.documents) upsertLegalDocument(property, document);
    }

    const singleDocument = data.document ||
      (eventType.startsWith("document_") ? data : undefined);
    if (singleDocument) {
      const documentId = first(
        singleDocument.documentId,
        singleDocument.id,
        data.documentId,
      );
      let documentDetails = singleDocument;
      if (documentId) {
        try {
          documentDetails = {
            ...singleDocument,
            ...(await getDoolaDocument(companyId, documentId)),
            id: documentId,
          };
        } catch {
          // The event still identifies the document; its fresh download URL is
          // requested only when an authenticated admin opens it.
        }
      }
      upsertLegalDocument(property, documentDetails);
    }

    property.legalEntity.lastError =
      property.legalEntity.status === "failed"
        ? first(
            data.error?.message,
            data.message,
            "Formation provider reported a failure",
          )
        : "";
    await property.save();

    await recordActivity({
      action: `Received doola formation update: ${eventType || property.legalEntity.status}`,
      operation: "system",
      resourceType: "property_legal_entity",
      resourceId: String(property._id),
      resourceName: property.name,
      metadata: { companyId, eventType: eventType || "unknown" },
    });
    return ok({ received: true, matched: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
