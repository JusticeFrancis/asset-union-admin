export const organizationPropertyKeys = {
  all: ["organization", "properties"] as const,
  lists: () => [...organizationPropertyKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...organizationPropertyKeys.lists(), params] as const,
  details: () => [...organizationPropertyKeys.all, "detail"] as const,
  detail: (id: string) => [...organizationPropertyKeys.details(), id] as const,
};
