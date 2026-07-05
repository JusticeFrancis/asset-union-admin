"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

import type {
  OrganizationMembership,
  OrganizationTokenResponse,
  OrganizationUser,
} from "@/lib/api/organization-auth.types";
import type { OrganizationProfile } from "@/lib/api/organization.types";
import {
  getCurrentOrganizationUser,
  getPostOrgAuthRedirectPath as getMembershipRedirect,
  orgLogout,
  persistOrgAuthSession,
  refreshOrgSession,
} from "@/lib/api/requests/organization-auth";
import { getOrganizationProfile } from "@/lib/api/requests/organization";
import { ApiError } from "@/lib/api/types";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";
import {
  getActiveOrganizationId,
  getOrgMemberships,
  getOrgSessionUser,
  setActiveOrganizationId,
  persistOrgSessionMeta,
} from "@/lib/auth/org-session";
import { clearOrgAuthTokens, getOrgAccessToken } from "@/lib/auth/org-tokens";
import { isOrgActive } from "@/lib/organization-permissions";

type OrganizationAuthContextValue = {
  user: OrganizationUser | null;
  memberships: OrganizationMembership[];
  activeOrganizationId: string | null;
  activeMembership: OrganizationMembership | null;
  organization: OrganizationProfile | null;
  isOrganizationActive: boolean;
  isLoading: boolean;
  setActiveOrganization: (organizationId: string) => void;
  applyTokenResponse: (
    response: OrganizationTokenResponse,
    callbackUrl?: string | null,
  ) => void;
  refreshBootstrap: () => Promise<void>;
  logout: () => Promise<void>;
};

const OrganizationAuthContext =
  createContext<OrganizationAuthContextValue | null>(null);

export function OrganizationAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<OrganizationUser | null>(null);
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [activeOrganizationId, setActiveOrganizationIdState] = useState<
    string | null
  >(null);
  const [organization, setOrganization] = useState<OrganizationProfile | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const sessionEpochRef = useRef(0);

  const invalidateSession = useCallback(() => {
    sessionEpochRef.current += 1;
    clearOrgAuthTokens();
    setUser(null);
    setMemberships([]);
    setActiveOrganizationIdState(null);
    setOrganization(null);
  }, []);

  const loadOrganizationProfile = useCallback(
    async (epoch: number) => {
      if (!getOrgAccessToken() || memberships.length === 0) {
        setOrganization(null);
        return;
      }

      try {
        const profile = await getOrganizationProfile();
        if (epoch !== sessionEpochRef.current) return;
        setOrganization(profile);
      } catch (error) {
        if (epoch !== sessionEpochRef.current) return;
        if (
          error instanceof ApiError &&
          (error.code === "NO_ORGANIZATION_CONTEXT" ||
            error.code === "UNAUTHORIZED")
        ) {
          setOrganization(null);
          return;
        }
        setOrganization(null);
      }
    },
    [memberships.length],
  );

  const bootstrapSession = useCallback(async () => {
    const epoch = sessionEpochRef.current;

    if (!getOrgAccessToken()) {
      setUser(getOrgSessionUser());
      setMemberships(getOrgMemberships());
      setActiveOrganizationIdState(getActiveOrganizationId());
      setOrganization(null);
      return;
    }

    try {
      const session = await getCurrentOrganizationUser();
      if (epoch !== sessionEpochRef.current) return;

      const storedActiveId = getActiveOrganizationId();
      const activeId =
        storedActiveId &&
        session.memberships.some((m) => m.organizationId === storedActiveId)
          ? storedActiveId
          : (session.memberships[0]?.organizationId ?? null);

      persistOrgSessionMeta(session.user, session.memberships, activeId);
      setUser(session.user);
      setMemberships(session.memberships);
      setActiveOrganizationIdState(activeId);

      if (activeId && session.memberships.length > 0) {
        const profile = await getOrganizationProfile();
        if (epoch !== sessionEpochRef.current) return;
        setOrganization(profile);
      } else {
        setOrganization(null);
      }
    } catch (error) {
      if (epoch !== sessionEpochRef.current) return;

      if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
        try {
          await refreshOrgSession();
          if (epoch !== sessionEpochRef.current) return;
          await bootstrapSession();
          return;
        } catch {
          invalidateSession();
          return;
        }
      }
      invalidateSession();
    }
  }, [invalidateSession]);

  useEffect(() => {
    void bootstrapSession().finally(() => {
      setIsLoading(false);
    });
  }, [bootstrapSession]);

  const setActiveOrganization = useCallback(
    (organizationId: string) => {
      setActiveOrganizationId(organizationId);
      setActiveOrganizationIdState(organizationId);
      if (user) {
        persistOrgSessionMeta(user, memberships, organizationId);
      }
      void loadOrganizationProfile(sessionEpochRef.current);
    },
    [loadOrganizationProfile, memberships, user],
  );

  const applyTokenResponse = useCallback(
    (response: OrganizationTokenResponse, callbackUrl?: string | null) => {
      persistOrgAuthSession(response);
      setUser(response.user);
      setMemberships(response.memberships);
      const activeId = response.memberships[0]?.organizationId ?? null;
      setActiveOrganizationIdState(activeId);

      const safeCallback = sanitizeCallbackUrl(callbackUrl);
      const destination = safeCallback?.startsWith("/organizations")
        ? safeCallback
        : getMembershipRedirect(response.memberships);

      router.replace(destination);
      void bootstrapSession();
    },
    [bootstrapSession, router],
  );

  const refreshBootstrap = useCallback(async () => {
    await bootstrapSession();
  }, [bootstrapSession]);

  const logout = useCallback(async () => {
    sessionEpochRef.current += 1;
    setUser(null);
    setMemberships([]);
    setOrganization(null);

    try {
      await orgLogout();
    } finally {
      clearOrgAuthTokens();
      router.replace("/organizations/login");
    }
  }, [router]);

  const activeMembership = useMemo(
    () =>
      memberships.find((m) => m.organizationId === activeOrganizationId) ??
      null,
    [activeOrganizationId, memberships],
  );

  const value = useMemo<OrganizationAuthContextValue>(
    () => ({
      user,
      memberships,
      activeOrganizationId,
      activeMembership,
      organization,
      isOrganizationActive: isOrgActive(organization?.status),
      isLoading,
      setActiveOrganization,
      applyTokenResponse,
      refreshBootstrap,
      logout,
    }),
    [
      user,
      memberships,
      activeOrganizationId,
      activeMembership,
      organization,
      isLoading,
      setActiveOrganization,
      applyTokenResponse,
      refreshBootstrap,
      logout,
    ],
  );

  return (
    <OrganizationAuthContext.Provider value={value}>
      {children}
    </OrganizationAuthContext.Provider>
  );
}

export function useOrganizationAuth() {
  const context = useContext(OrganizationAuthContext);
  if (!context) {
    throw new Error(
      "useOrganizationAuth must be used within OrganizationAuthProvider",
    );
  }
  return context;
}
