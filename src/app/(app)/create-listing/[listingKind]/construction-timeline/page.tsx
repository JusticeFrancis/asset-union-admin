import { notFound } from "next/navigation";

import { isListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { assertConstructionListingKind } from "@/app/(app)/create-listing/create-listing-wizard-guards";
import { CreateListingWizardShell } from "@/app/(app)/create-listing/create-listing-wizard-shell";
import { TimelineStagesForm } from "@/app/(app)/create-listing/timeline-stages-form";

type PageProps = {
  params: Promise<{ listingKind: string }>;
};

export default async function ConstructionTimelinePage({ params }: PageProps) {
  const { listingKind: raw } = await params;
  if (!isListingKind(raw)) notFound();
  assertConstructionListingKind(raw);

  return (
    <CreateListingWizardShell
      activeSegment="construction-timeline"
      listingKind={raw}
    >
      <TimelineStagesForm
        listingKind={raw}
        backSegment="funding-structure"
        continueSegment="project-timeline"
        footerNextTitle="Project Timeline"
      />
    </CreateListingWizardShell>
  );
}
