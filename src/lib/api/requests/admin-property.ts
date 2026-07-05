import { apiRequest } from "@/lib/api/client";
import type {
  AdminPropertyDetail,
  AdminPropertyListParams,
  AdminPropertyListResponse,
  CreateWizardDraftRequest,
  PropertyDocument,
  PropertyDocumentUploadRequest,
  PropertyPauseRequest,
  PropertyRejectRequest,
  PropertyStatusTransitionResponse,
  SaveWizardDraftRequest,
} from "@/lib/api/admin-property.types";

function buildListQuery(params: AdminPropertyListParams = {}) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.limit != null) search.set("limit", String(params.limit));
  if (params.offset != null) search.set("offset", String(params.offset));
  const qs = search.toString();
  return qs ? `admin/properties?${qs}` : "admin/properties";
}

export async function listAdminProperties(params?: AdminPropertyListParams) {
  return apiRequest<AdminPropertyListResponse>(buildListQuery(params), {
    auth: true,
  });
}

export async function getAdminProperty(id: string) {
  return apiRequest<AdminPropertyDetail>(`admin/properties/${id}`, {
    auth: true,
  });
}

export async function createPropertyDraft(body: CreateWizardDraftRequest) {
  return apiRequest<AdminPropertyDetail>("admin/properties", {
    method: "POST",
    auth: true,
    json: body,
  });
}

export async function savePropertyDraft(
  id: string,
  body: SaveWizardDraftRequest,
) {
  return apiRequest<AdminPropertyDetail>(`admin/properties/${id}`, {
    method: "PUT",
    auth: true,
    json: body,
  });
}

export async function addPropertyDocument(
  propertyId: string,
  body: PropertyDocumentUploadRequest,
) {
  return apiRequest<PropertyDocument>(
    `admin/properties/${propertyId}/documents`,
    {
      method: "POST",
      auth: true,
      json: body,
    },
  );
}

export async function removePropertyDocument(
  propertyId: string,
  documentId: string,
) {
  return apiRequest<void>(
    `admin/properties/${propertyId}/documents/${documentId}`,
    {
      method: "DELETE",
      auth: true,
    },
  );
}

export async function submitPropertyForReview(propertyId: string) {
  return apiRequest<PropertyStatusTransitionResponse>(
    `admin/properties/${propertyId}/submit`,
    {
      method: "POST",
      auth: true,
    },
  );
}

export async function publishProperty(propertyId: string) {
  return apiRequest<PropertyStatusTransitionResponse>(
    `admin/properties/${propertyId}/publish`,
    {
      method: "POST",
      auth: true,
    },
  );
}

export async function rejectProperty(
  propertyId: string,
  body: PropertyRejectRequest,
) {
  return apiRequest<PropertyStatusTransitionResponse>(
    `admin/properties/${propertyId}/reject`,
    {
      method: "POST",
      auth: true,
      json: body,
    },
  );
}

export async function pauseProperty(
  propertyId: string,
  body: PropertyPauseRequest = {},
) {
  return apiRequest<PropertyStatusTransitionResponse>(
    `admin/properties/${propertyId}/pause`,
    {
      method: "POST",
      auth: true,
      json: body,
    },
  );
}

export async function resumeProperty(propertyId: string) {
  return apiRequest<PropertyStatusTransitionResponse>(
    `admin/properties/${propertyId}/resume`,
    {
      method: "POST",
      auth: true,
    },
  );
}
