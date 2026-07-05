import type {
  ListingKind,
  WizardCompletionSegment,
  WizardStepSegment,
} from "@/app/(app)/create-listing/create-listing-wizard-data";

export type PropertyWizardScope = "admin" | "organization";

export type PropertyWizardPaths = {
  scope: PropertyWizardScope;
  createListingBase: string;
  propertyManagementBase: string;
};

export const ADMIN_PROPERTY_PATHS: PropertyWizardPaths = {
  scope: "admin",
  createListingBase: "/create-listing",
  propertyManagementBase: "/property-management",
};

export const ORGANIZATION_PROPERTY_PATHS: PropertyWizardPaths = {
  scope: "organization",
  createListingBase: "/organizations/create-listing",
  propertyManagementBase: "/organizations/properties",
};

export function getPropertyWizardPaths(
  scope: PropertyWizardScope,
): PropertyWizardPaths {
  return scope === "organization"
    ? ORGANIZATION_PROPERTY_PATHS
    : ADMIN_PROPERTY_PATHS;
}

export function createListingWizardHref(
  paths: PropertyWizardPaths,
  listingKind: ListingKind,
  segment: WizardStepSegment | WizardCompletionSegment,
  propertyId?: string | null,
): string {
  const base = `${paths.createListingBase}/${listingKind}/${segment}`;
  if (!propertyId) return base;
  return `${base}?propertyId=${encodeURIComponent(propertyId)}`;
}

export function propertyManagementDetailHref(
  paths: PropertyWizardPaths,
  propertyId: string,
): string {
  return `${paths.propertyManagementBase}/${propertyId}`;
}
