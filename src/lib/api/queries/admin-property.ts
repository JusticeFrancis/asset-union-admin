import { useQuery } from "@tanstack/react-query";

import type { AdminPropertyListParams } from "@/lib/api/admin-property.types";
import {
  getAdminProperty,
  listAdminProperties,
} from "@/lib/api/requests/admin-property";
import { adminPropertyKeys } from "@/lib/api/query-keys/admin-property";

type UseAdminPropertiesOptions = {
  params?: AdminPropertyListParams;
  enabled?: boolean;
};

export function useAdminProperties(options: UseAdminPropertiesOptions = {}) {
  const { params = {}, enabled = true } = options;

  return useQuery({
    queryKey: adminPropertyKeys.list(params),
    queryFn: () => listAdminProperties(params),
    enabled,
  });
}

type UseAdminPropertyOptions = {
  enabled?: boolean;
};

export function useAdminProperty(
  id: string | undefined,
  options: UseAdminPropertyOptions = {},
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: adminPropertyKeys.detail(id ?? ""),
    queryFn: () => getAdminProperty(id!),
    enabled: enabled && Boolean(id),
  });
}
