"use client";

import { usePropertyWizardPaths } from "@/contexts/property-wizard-scope";
import {
  useAddPropertyDocumentMutation,
  useCreatePropertyDraftMutation,
  useRemovePropertyDocumentMutation,
  useSavePropertyDraftMutation,
  useSubmitPropertyMutation,
} from "@/lib/api/mutations/admin-property";
import {
  useAddOrganizationPropertyDocumentMutation,
  useCreateOrganizationPropertyDraftMutation,
  useRemoveOrganizationPropertyDocumentMutation,
  useSaveOrganizationPropertyDraftMutation,
  useSubmitOrganizationPropertyMutation,
} from "@/lib/api/mutations/organization-property";
import {
  useAdminProperties,
  useAdminProperty,
} from "@/lib/api/queries/admin-property";
import {
  useOrganizationProperties,
  useOrganizationProperty,
} from "@/lib/api/queries/organization-property";

export function useScopedProperties(
  options: Parameters<typeof useAdminProperties>[0] = {},
) {
  const { scope } = usePropertyWizardPaths();
  const admin = useAdminProperties({
    ...options,
    enabled: options.enabled !== false && scope === "admin",
  });
  const org = useOrganizationProperties({
    ...options,
    enabled: options.enabled !== false && scope === "organization",
  });
  return scope === "organization" ? org : admin;
}

export function useScopedProperty(
  id: string | undefined,
  options: Parameters<typeof useAdminProperty>[1] = {},
) {
  const { scope } = usePropertyWizardPaths();
  const admin = useAdminProperty(id, {
    ...options,
    enabled: options.enabled !== false && scope === "admin",
  });
  const org = useOrganizationProperty(id, {
    ...options,
    enabled: options.enabled !== false && scope === "organization",
  });
  return scope === "organization" ? org : admin;
}

export function useScopedCreatePropertyDraftMutation() {
  const { scope } = usePropertyWizardPaths();
  const admin = useCreatePropertyDraftMutation();
  const org = useCreateOrganizationPropertyDraftMutation();
  return scope === "organization" ? org : admin;
}

export function useScopedSavePropertyDraftMutation() {
  const { scope } = usePropertyWizardPaths();
  const admin = useSavePropertyDraftMutation();
  const org = useSaveOrganizationPropertyDraftMutation();
  return scope === "organization" ? org : admin;
}

export function useScopedSubmitPropertyMutation() {
  const { scope } = usePropertyWizardPaths();
  const admin = useSubmitPropertyMutation();
  const org = useSubmitOrganizationPropertyMutation();
  return scope === "organization" ? org : admin;
}

export function useScopedAddPropertyDocumentMutation() {
  const { scope } = usePropertyWizardPaths();
  const admin = useAddPropertyDocumentMutation();
  const org = useAddOrganizationPropertyDocumentMutation();
  return scope === "organization" ? org : admin;
}

export function useScopedRemovePropertyDocumentMutation() {
  const { scope } = usePropertyWizardPaths();
  const admin = useRemovePropertyDocumentMutation();
  const org = useRemoveOrganizationPropertyDocumentMutation();
  return scope === "organization" ? org : admin;
}
