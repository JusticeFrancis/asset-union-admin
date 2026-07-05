"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import { AdminAuthProvider } from "@/contexts/admin-auth-provider";
import { OrganizationAuthProvider } from "@/contexts/organization-auth-provider";
import { createQueryClient } from "@/lib/api/query-client";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AdminAuthProvider>
        <OrganizationAuthProvider>{children}</OrganizationAuthProvider>
      </AdminAuthProvider>
    </QueryClientProvider>
  );
}
