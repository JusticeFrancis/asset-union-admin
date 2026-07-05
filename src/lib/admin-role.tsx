"use client";

import { createContext, useContext, type ReactNode } from "react";

import { useAdminAuth } from "@/contexts/admin-auth-provider";
import type { AdminRole } from "@/lib/api/admin-auth.types";

const AdminRoleContext = createContext<AdminRole>("super_admin");

function readRoleFromEnv(): AdminRole {
  if (typeof process.env.NEXT_PUBLIC_ADMIN_ROLE === "string") {
    const v = process.env.NEXT_PUBLIC_ADMIN_ROLE.toLowerCase();
    if (v === "property_manager" || v === "property-manager") {
      return "property_manager";
    }
  }
  return "super_admin";
}

function resolveAdminRole(roles: AdminRole[] | undefined): AdminRole {
  if (!roles?.length) return readRoleFromEnv();
  if (roles.includes("super_admin")) return "super_admin";
  if (roles.includes("property_manager")) return "property_manager";
  return roles[0] ?? readRoleFromEnv();
}

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const { admin } = useAdminAuth();
  const role = resolveAdminRole(admin?.roles);

  return (
    <AdminRoleContext.Provider value={role}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole(): AdminRole {
  return useContext(AdminRoleContext);
}
