export const adminAuthKeys = {
  all: ["admin-auth"] as const,
  me: () => [...adminAuthKeys.all, "me"] as const,
};
