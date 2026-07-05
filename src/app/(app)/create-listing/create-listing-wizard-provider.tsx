"use client";

import { Suspense, type ReactNode } from "react";

import { PropertyWizardProvider } from "@/contexts/property-wizard-provider";

type CreateListingWizardProviderProps = {
  children: ReactNode;
};

function PropertyWizardProviderInner({
  children,
}: CreateListingWizardProviderProps) {
  return <PropertyWizardProvider>{children}</PropertyWizardProvider>;
}

export function CreateListingWizardProvider({
  children,
}: CreateListingWizardProviderProps) {
  return (
    <Suspense
      fallback={
        <p className="py-10 text-center text-[12px] text-[#919191]">
          Loading wizard…
        </p>
      }
    >
      <PropertyWizardProviderInner>{children}</PropertyWizardProviderInner>
    </Suspense>
  );
}
