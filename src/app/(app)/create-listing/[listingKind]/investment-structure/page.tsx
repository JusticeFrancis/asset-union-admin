import { notFound } from "next/navigation";

import { CreateListingWizardShell } from "@/app/(app)/create-listing/create-listing-wizard-shell";
import { assertRentalListingKind } from "@/app/(app)/create-listing/create-listing-wizard-guards";
import { isListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { InvestmentStructureForm } from "@/app/(app)/create-listing/investment-structure/investment-structure-form";

type PageProps = {
  params: Promise<{ listingKind: string }>;
};

export default async function InvestmentStructurePage({ params }: PageProps) {
  const { listingKind: raw } = await params;
  if (!isListingKind(raw)) notFound();
  assertRentalListingKind(raw);

  return (
    <CreateListingWizardShell
      activeSegment="investment-structure"
      listingKind={raw}
    >
      <InvestmentStructureForm listingKind={raw} />
    </CreateListingWizardShell>
  );
}
