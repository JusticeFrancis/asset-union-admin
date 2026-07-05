"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useOrganizationAuth } from "@/contexts/organization-auth-provider";
import { getOrgAccessToken } from "@/lib/auth/org-tokens";

const ONBOARDING_PREFIX = "/organizations/onboarding";

type OrganizationBootstrapGuardProps = {
  children: ReactNode;
};

export function OrganizationBootstrapGuard({
  children,
}: OrganizationBootstrapGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, memberships } = useOrganizationAuth();

  useEffect(() => {
    if (isLoading || !getOrgAccessToken()) return;

    if (memberships.length === 0 && !pathname.startsWith(ONBOARDING_PREFIX)) {
      router.replace("/organizations/onboarding/create-org");
    }
  }, [isLoading, memberships.length, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-[13px] text-[#919191]">
        Loading…
      </div>
    );
  }

  return children;
}
