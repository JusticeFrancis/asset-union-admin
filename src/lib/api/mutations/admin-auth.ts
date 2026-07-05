import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AdminLoginRequest } from "@/lib/api/admin-auth.types";
import { adminAuthKeys } from "@/lib/api/query-keys/admin-auth";
import {
  adminLogin,
  adminLogout,
  getPostAuthRedirectPath,
  persistAdminAuthSession,
  refreshAdminSession,
} from "@/lib/api/requests/admin-auth";

type AdminLoginVariables = AdminLoginRequest & {
  callbackUrl?: string | null;
};

export function useAdminLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ email, password, twoFactorCode }: AdminLoginVariables) =>
      adminLogin({ email, password, twoFactorCode }),
    onSuccess: (response, variables) => {
      persistAdminAuthSession(response);
      queryClient.setQueryData(adminAuthKeys.me(), response.admin);

      return getPostAuthRedirectPath(variables.callbackUrl);
    },
  });
}

export function useRefreshAdminSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: refreshAdminSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminAuthKeys.me() });
    },
  });
}

export function useAdminLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminLogout,
    onSettled: () => {
      queryClient.removeQueries({ queryKey: adminAuthKeys.all });
    },
  });
}
