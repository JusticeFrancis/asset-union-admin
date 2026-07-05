"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

import type {
  ListingKind,
  WizardCompletionSegment,
  WizardStepSegment,
} from "@/app/(app)/create-listing/create-listing-wizard-data";
import { usePropertyWizardPaths } from "@/contexts/property-wizard-scope";
import { createListingWizardHref } from "@/lib/property-wizard/paths";

export function useListingWizardHref() {
  const paths = usePropertyWizardPaths();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");

  return useCallback(
    (
      listingKind: ListingKind,
      segment: WizardStepSegment | WizardCompletionSegment,
    ) => createListingWizardHref(paths, listingKind, segment, propertyId),
    [paths, propertyId],
  );
}
