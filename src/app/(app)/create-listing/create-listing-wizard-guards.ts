import { notFound } from "next/navigation";

import type { ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";

export function assertRentalListingKind(kind: ListingKind): void {
  if (kind !== "rental-property") notFound();
}

export function assertConstructionListingKind(kind: ListingKind): void {
  if (kind !== "construction-project") notFound();
}
