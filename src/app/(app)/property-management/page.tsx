"use client";

import { PropertyManagementPageContent } from "@/app/components/property-management-page-content";
import { PropertyWizardScopeProvider } from "@/contexts/property-wizard-scope";

export default function PropertyManagementPage() {
  return (
    <PropertyWizardScopeProvider scope="admin">
      <PropertyManagementPageContent />
    </PropertyWizardScopeProvider>
  );
}
