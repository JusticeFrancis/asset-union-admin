import { notFound } from "next/navigation";

import { isListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { CreateListingWizardShell } from "@/app/(app)/create-listing/create-listing-wizard-shell";
import { ReviewCheckForm } from "@/app/(app)/create-listing/review-check/review-check-form";

type PageProps = {
  params: Promise<{ listingKind: string }>;
};

export default async function ReviewCheckPage({ params }: PageProps) {
  const { listingKind: raw } = await params;
  if (!isListingKind(raw)) notFound();

  return (
    <CreateListingWizardShell activeSegment="review-check" listingKind={raw}>
      <ReviewCheckForm listingKind={raw} />
    </CreateListingWizardShell>
  );
}
