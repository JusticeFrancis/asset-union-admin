import { CreateListingWizardProvider } from "@/app/(app)/create-listing/create-listing-wizard-provider";
import { PropertyWizardScopeProvider } from "@/contexts/property-wizard-scope";

type CreateListingLayoutProps = {
  children: React.ReactNode;
};

export default function CreateListingLayout({
  children,
}: CreateListingLayoutProps) {
  return (
    <PropertyWizardScopeProvider scope="admin">
      <CreateListingWizardProvider>{children}</CreateListingWizardProvider>
    </PropertyWizardScopeProvider>
  );
}
