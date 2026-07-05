"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AdminLoginRequest, AdminUser } from "@/lib/api/admin-auth.types";
import { adminLogin, adminLogout, getCurrentAdmin, getPostAuthRedirectPath, refreshAdminSession } from "@/lib/api/admin-auth";
import { ApiError } from "@/lib/api/types";

type AdminAuthContextValue = { admin: AdminUser | null; isLoading: boolean; login: (credentials: AdminLoginRequest, callbackUrl?: string | null) => Promise<void>; logout: () => Promise<void>; refreshSession: () => Promise<void>; setAdmin: (admin: AdminUser | null) => void };
const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionEpochRef = useRef(0);

  const bootstrapSession = useCallback(async () => {
    const epoch = sessionEpochRef.current;
    try {
      const currentAdmin = await getCurrentAdmin();
      if (epoch === sessionEpochRef.current) setAdmin(currentAdmin);
    } catch (error) {
      if (epoch !== sessionEpochRef.current) return;
      if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
        try {
          await refreshAdminSession();
          const currentAdmin = await getCurrentAdmin();
          if (epoch === sessionEpochRef.current) setAdmin(currentAdmin);
          return;
        } catch { /* no persisted session */ }
      }
      setAdmin(null);
    }
  }, []);

  useEffect(() => { void bootstrapSession().finally(() => setIsLoading(false)); }, [bootstrapSession]);

  const login = useCallback(async (credentials: AdminLoginRequest, callbackUrl?: string | null) => {
    const response = await adminLogin(credentials);
    setAdmin(response.admin);
    router.replace(getPostAuthRedirectPath(callbackUrl));
  }, [router]);

  const logout = useCallback(async () => {
    sessionEpochRef.current += 1;
    setAdmin(null);
    try { await adminLogout(); } finally { router.replace("/sign-in"); }
  }, [router]);

  const refreshSessionHandler = useCallback(async () => { await refreshAdminSession(); setAdmin(await getCurrentAdmin()); }, []);
  const value = useMemo(() => ({ admin, isLoading, login, logout, refreshSession: refreshSessionHandler, setAdmin }), [admin, isLoading, login, logout, refreshSessionHandler]);
  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() { const context = useContext(AdminAuthContext); if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider"); return context; }
