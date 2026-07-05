import { orgApiRequest } from "@/lib/api/org-client";
import type {
  AdminPropertyDetail,
  AdminPropertyListParams,
  AdminPropertyListResponse,
  CreateWizardDraftRequest,
  PropertyDocument,
  PropertyDocumentUploadRequest,
  PropertyStatusTransitionResponse,
  SaveWizardDraftRequest,
} from "@/lib/api/admin-property.types";

function buildListQuery(params: AdminPropertyListParams = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  return qs ? `organizations/properties?${qs}` : "organizations/properties";
}

export async function listOrganizationProperties(
  params?: AdminPropertyListParams,
) {
  return orgApiRequest<AdminPropertyListResponse>(buildListQuery(params), {
    auth: true,
  });
}

export async function getOrganizationProperty(id: string) {
  return orgApiRequest<AdminPropertyDetail>(`organizations/properties/${id}`, {
    auth: true,
  });
}

export async function createOrganizationPropertyDraft(
  body: CreateWizardDraftRequest,
) {
  return orgApiRequest<AdminPropertyDetail>("organizations/properties", {
    method: "POST",
    auth: true,
    json: body,
  });
}

export async function saveOrganizationPropertyDraft(
  id: string,
  body: SaveWizardDraftRequest,
) {
  return orgApiRequest<AdminPropertyDetail>(`organizations/properties/${id}`, {
    method: "PUT",
    auth: true,
    json: body,
  });
}

export async function addOrganizationPropertyDocument(
  propertyId: string,
  body: PropertyDocumentUploadRequest,
) {
  return orgApiRequest<PropertyDocument>(
    `organizations/properties/${propertyId}/documents`,
    {
      method: "POST",
      auth: true,
      json: body,
    },
  );
}

export async function removeOrganizationPropertyDocument(
  propertyId: string,
  documentId: string,
) {
  return orgApiRequest<void>(
    `organizations/properties/${propertyId}/documents/${documentId}`,
    {
      method: "DELETE",
      auth: true,
    },
  );
}

export async function submitOrganizationPropertyForReview(propertyId: string) {
  return orgApiRequest<PropertyStatusTransitionResponse>(
    `organizations/properties/${propertyId}/submit`,
    {
      method: "POST",
      auth: true,
    },
  );
}
