import { useMutation, useQueryClient } from "@tanstack/react-query";

import type {
  CreateWizardDraftRequest,
  PropertyDocumentUploadRequest,
  PropertyPauseRequest,
  PropertyRejectRequest,
  SaveWizardDraftRequest,
} from "@/lib/api/admin-property.types";
import { adminPropertyKeys } from "@/lib/api/query-keys/admin-property";
import {
  addPropertyDocument,
  createPropertyDraft,
  pauseProperty,
  publishProperty,
  rejectProperty,
  removePropertyDocument,
  resumeProperty,
  savePropertyDraft,
  submitPropertyForReview,
} from "@/lib/api/requests/admin-property";

function invalidatePropertyQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  propertyId?: string,
) {
  void queryClient.invalidateQueries({ queryKey: adminPropertyKeys.lists() });
  if (propertyId) {
    void queryClient.invalidateQueries({
      queryKey: adminPropertyKeys.detail(propertyId),
    });
  }
}

export function useCreatePropertyDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateWizardDraftRequest) => createPropertyDraft(body),
    onSuccess: (property) => {
      queryClient.setQueryData(adminPropertyKeys.detail(property.id), property);
      invalidatePropertyQueries(queryClient);
    },
  });
}

export function useSavePropertyDraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: SaveWizardDraftRequest }) =>
      savePropertyDraft(id, body),
    onSuccess: (property) => {
      queryClient.setQueryData(adminPropertyKeys.detail(property.id), property);
      invalidatePropertyQueries(queryClient, property.id);
    },
  });
}

export function useAddPropertyDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      body,
    }: {
      propertyId: string;
      body: PropertyDocumentUploadRequest;
    }) => addPropertyDocument(propertyId, body),
    onSuccess: (_, { propertyId }) => {
      invalidatePropertyQueries(queryClient, propertyId);
    },
  });
}

export function useRemovePropertyDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      documentId,
    }: {
      propertyId: string;
      documentId: string;
    }) => removePropertyDocument(propertyId, documentId),
    onSuccess: (_, { propertyId }) => {
      invalidatePropertyQueries(queryClient, propertyId);
    },
  });
}

export function useSubmitPropertyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => submitPropertyForReview(propertyId),
    onSuccess: (_, propertyId) => {
      invalidatePropertyQueries(queryClient, propertyId);
    },
  });
}

export function usePublishPropertyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => publishProperty(propertyId),
    onSuccess: (_, propertyId) => {
      invalidatePropertyQueries(queryClient, propertyId);
    },
  });
}

export function useRejectPropertyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      body,
    }: {
      propertyId: string;
      body: PropertyRejectRequest;
    }) => rejectProperty(propertyId, body),
    onSuccess: (_, { propertyId }) => {
      invalidatePropertyQueries(queryClient, propertyId);
    },
  });
}

export function usePausePropertyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      propertyId,
      body,
    }: {
      propertyId: string;
      body?: PropertyPauseRequest;
    }) => pauseProperty(propertyId, body),
    onSuccess: (_, { propertyId }) => {
      invalidatePropertyQueries(queryClient, propertyId);
    },
  });
}

export function useResumePropertyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (propertyId: string) => resumeProperty(propertyId),
    onSuccess: (_, propertyId) => {
      invalidatePropertyQueries(queryClient, propertyId);
    },
  });
}
