"use client";

import { useRouter } from "nextjs-toploader/app";
import { useEffect } from "react";

import { PropertyDetailPageContent } from "@/app/(app)/property-management/property-detail-page-content";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { PropertyWizardScopeProvider } from "@/contexts/property-wizard-scope";
import { canViewPropertyDetail } from "@/lib/admin-permissions";
import { useScopedProperty } from "@/lib/property-wizard/use-scoped-property-api";

type PropertyDetailPageClientProps = {
  propertyId: string;
  scope: "admin" | "organization";
};

function PropertyDetailPageClientInner({
  propertyId,
  scope,
}: PropertyDetailPageClientProps) {
  const router = useRouter();
  const { admin } = useAdminAuth();
  const { data: property, isLoading, isError } = useScopedProperty(propertyId);

  useEffect(() => {
    if (scope === "admin" && admin && !canViewPropertyDetail(admin.roles, admin.permissions)) {
      router.replace("/property-management");
    }
  }, [admin, router, scope]);

  if (isLoading) {
    return (
      <p className="py-10 text-center text-[12px] text-[#919191]">
        Loading property…
      </p>
    );
  }

  if (isError || !property) {
    return (
      <p className="py-10 text-center text-[12px] text-[#B3261E]">
        Property not found or you do not have permission to view it.
      </p>
    );
  }

  return <PropertyDetailPageContent property={property} />;
}

export function PropertyDetailPageClient({
  propertyId,
  scope,
}: PropertyDetailPageClientProps) {
  return (
    <PropertyWizardScopeProvider scope={scope}>
      <PropertyDetailPageClientInner propertyId={propertyId} scope={scope} />
    </PropertyWizardScopeProvider>
  );
}
