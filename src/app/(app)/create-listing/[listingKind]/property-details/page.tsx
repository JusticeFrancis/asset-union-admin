import { notFound } from "next/navigation";

import { isListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { assertConstructionListingKind } from "@/app/(app)/create-listing/create-listing-wizard-guards";
import { CreateListingWizardShell } from "@/app/(app)/create-listing/create-listing-wizard-shell";
import { PropertyDetailsForm } from "@/app/(app)/create-listing/property-details/property-details-form";

type PageProps = {
  params: Promise<{ listingKind: string }>;
};

export default async function PropertyDetailsPage({ params }: PageProps) {
  const { listingKind: raw } = await params;
  if (!isListingKind(raw)) notFound();
  assertConstructionListingKind(raw);

  return (
    <CreateListingWizardShell
      activeSegment="property-details"
      listingKind={raw}
    >
      <PropertyDetailsForm listingKind={raw} />
    </CreateListingWizardShell>
  );
}
