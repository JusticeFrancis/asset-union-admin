import { notFound } from "next/navigation";

import { isListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { assertConstructionListingKind } from "@/app/(app)/create-listing/create-listing-wizard-guards";
import { CreateListingWizardShell } from "@/app/(app)/create-listing/create-listing-wizard-shell";
import { LegalDocumentationForm } from "@/app/(app)/create-listing/legal-documentation/legal-documentation-form";

type PageProps = {
  params: Promise<{ listingKind: string }>;
};

export default async function LegalDocumentationPage({ params }: PageProps) {
  const { listingKind: raw } = await params;
  if (!isListingKind(raw)) notFound();
  assertConstructionListingKind(raw);

  return (
    <CreateListingWizardShell
      activeSegment="legal-documentation"
      listingKind={raw}
    >
      <LegalDocumentationForm listingKind={raw} />
    </CreateListingWizardShell>
  );
}
