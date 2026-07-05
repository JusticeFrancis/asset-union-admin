import { useQuery } from "@tanstack/react-query";

import type { AdminPropertyListParams } from "@/lib/api/admin-property.types";
import {
  getOrganizationProperty,
  listOrganizationProperties,
} from "@/lib/api/requests/organization-property";
import { organizationPropertyKeys } from "@/lib/api/query-keys/organization-property";
import { getOrgAccessToken } from "@/lib/auth/org-tokens";

type UseOrganizationPropertiesOptions = {
  params?: AdminPropertyListParams;
  enabled?: boolean;
};

export function useOrganizationProperties(
  options: UseOrganizationPropertiesOptions = {},
) {
  const { params = {}, enabled = true } = options;

  return useQuery({
    queryKey: organizationPropertyKeys.list(params),
    queryFn: () => listOrganizationProperties(params),
    enabled: enabled && Boolean(getOrgAccessToken()),
  });
}

type UseOrganizationPropertyOptions = {
  enabled?: boolean;
};

export function useOrganizationProperty(
  id: string | undefined,
  options: UseOrganizationPropertyOptions = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: organizationPropertyKeys.detail(id ?? ""),
    queryFn: () => getOrganizationProperty(id!),
    enabled: enabled && Boolean(id) && Boolean(getOrgAccessToken()),
  });
}
