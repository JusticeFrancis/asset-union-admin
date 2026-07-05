import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  CreateWizardDraftRequest,
  PropertyDocumentUploadRequest,
  SaveWizardDraftRequest,
} from "@/lib/api/admin-property.types";
import { organizationPropertyKeys } from "@/lib/api/query-keys/organization-property";
import {
  addOrganizationPropertyDocument,
  createOrganizationPropertyDraft,
  removeOrganizationPropertyDocument,
  saveOrganizationPropertyDraft,
  submitOrganizationPropertyForReview,
} from "@/lib/api/requests/organization-property";

function invalidatePropertyQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  propertyId?: string,
) {
  void queryClient.invalidateQueries({
    queryKey: organizationPropertyKeys.lists(),
  });
  if (propertyId) {
    void queryClient.invalidateQueries({
      queryKey: organizationPropertyKeys.detail(propertyId),
    });
  }
}

export function useCreateOrganizationPropertyDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateWizardDraftRequest) =>
      createOrganizationPropertyDraft(body),
    onSuccess: (property) => {
      queryClient.setQueryData(
        organizationPropertyKeys.detail(property.id),
        property,
      );
      invalidatePropertyQueries(queryClient);
    },
  });
}

export function useSaveOrganizationPropertyDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SaveWizardDraftRequest }) =>
      saveOrganizationPropertyDraft(id, body),
    onSuccess: (property) => {
      queryClient.setQueryData(
        organizationPropertyKeys.detail(property.id),
        property,
      );
      invalidatePropertyQueries(queryClient, property.id);
    },
  });
}

export function useAddOrganizationPropertyDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      body,
    }: {
      propertyId: string;
      body: PropertyDocumentUploadRequest;
    }) => addOrganizationPropertyDocument(propertyId, body),
    onSuccess: (_, { propertyId }) => {
      invalidatePropertyQueries(queryClient, propertyId);
    },
  });
}

export function useRemoveOrganizationPropertyDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      documentId,
    }: {
      propertyId: string;
      documentId: string;
    }) => removeOrganizationPropertyDocument(propertyId, documentId),
    onSuccess: (_, { propertyId }) => {
      invalidatePropertyQueries(queryClient, propertyId);
    },
  });
}

export function useSubmitOrganizationPropertyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) =>
      submitOrganizationPropertyForReview(propertyId),
    onSuccess: (_, propertyId) => {
      invalidatePropertyQueries(queryClient, propertyId);
    },
  });
}
