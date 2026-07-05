import { notFound } from "next/navigation";

import { BasicPropertyForm } from "@/app/(app)/create-listing/basic-property-information/basic-property-form";
import { isListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { CreateListingWizardShell } from "@/app/(app)/create-listing/create-listing-wizard-shell";

type PageProps = {
  params: Promise<{ listingKind: string }>;
};

export default async function BasicPropertyInformationPage({
  params,
}: PageProps) {
  const { listingKind: raw } = await params;
  if (!isListingKind(raw)) notFound();

  return (
    <CreateListingWizardShell
      activeSegment="basic-property-information"
      listingKind={raw}
    >
      <BasicPropertyForm listingKind={raw} />
    </CreateListingWizardShell>
  );
}
