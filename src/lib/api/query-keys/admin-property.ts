export const adminPropertyKeys = {
  all: ["admin", "properties"] as const,
  lists: () => [...adminPropertyKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...adminPropertyKeys.lists(), params] as const,
  details: () => [...adminPropertyKeys.all, "detail"] as const,
  detail: (id: string) => [...adminPropertyKeys.details(), id] as const,
};
