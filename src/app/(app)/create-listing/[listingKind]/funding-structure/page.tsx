import { notFound } from "next/navigation";

import { isListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { assertConstructionListingKind } from "@/app/(app)/create-listing/create-listing-wizard-guards";
import { CreateListingWizardShell } from "@/app/(app)/create-listing/create-listing-wizard-shell";
import { FundingStructureForm } from "@/app/(app)/create-listing/funding-structure/funding-structure-form";

type PageProps = {
  params: Promise<{ listingKind: string }>;
};

export default async function FundingStructurePage({ params }: PageProps) {
  const { listingKind: raw } = await params;
  if (!isListingKind(raw)) notFound();
  assertConstructionListingKind(raw);

  return (
    <CreateListingWizardShell
      activeSegment="funding-structure"
      listingKind={raw}
    >
      <FundingStructureForm listingKind={raw} />
    </CreateListingWizardShell>
  );
}
