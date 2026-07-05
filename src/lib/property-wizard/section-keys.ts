import type { WizardStepSegment } from "@/app/(app)/create-listing/create-listing-wizard-data";

export type WizardSectionKey =
  | "basicPropertyInformation"
  | "investmentStructure"
  | "rentalEconomics"
  | "propertyManagement"
  | "legalOwnership"
  | "propertyDescription"
  | "legalDocumentation"
  | "fundingStructure"
  | "constructionTimeline"
  | "projectTimeline"
  | "propertyDetails";

const SEGMENT_TO_SECTION: Record<WizardStepSegment, WizardSectionKey> = {
  "basic-property-information": "basicPropertyInformation",
  "investment-structure": "investmentStructure",
  "rental-economics": "rentalEconomics",
  "property-management": "propertyManagement",
  "legal-ownership": "legalOwnership",
  "property-description": "propertyDescription",
  "legal-documentation": "legalDocumentation",
  "funding-structure": "fundingStructure",
  "construction-timeline": "constructionTimeline",
  "project-timeline": "projectTimeline",
  "property-details": "propertyDetails",
  "review-check": "basicPropertyInformation",
};

export function segmentToSectionKey(
  segment: WizardStepSegment,
): WizardSectionKey {
  return SEGMENT_TO_SECTION[segment];
}

export function sectionKeyToSegment(
  sectionKey: string,
): WizardStepSegment | undefined {
  const entry = Object.entries(SEGMENT_TO_SECTION).find(
    ([, key]) => key === sectionKey,
  );
  return entry?.[0] as WizardStepSegment | undefined;
}
