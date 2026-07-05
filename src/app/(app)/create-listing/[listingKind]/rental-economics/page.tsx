import { notFound } from "next/navigation";

import { CreateListingWizardShell } from "@/app/(app)/create-listing/create-listing-wizard-shell";
import { assertRentalListingKind } from "@/app/(app)/create-listing/create-listing-wizard-guards";
import { isListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { RentalEconomicsForm } from "@/app/(app)/create-listing/rental-economics/rental-economics-form";

type PageProps = {
  params: Promise<{ listingKind: string }>;
};

export default async function RentalEconomicsPage({ params }: PageProps) {
  const { listingKind: raw } = await params;
  if (!isListingKind(raw)) notFound();
  assertRentalListingKind(raw);

  return (
    <CreateListingWizardShell
      activeSegment="rental-economics"
      listingKind={raw}
    >
      <RentalEconomicsForm listingKind={raw} />
    </CreateListingWizardShell>
  );
}
