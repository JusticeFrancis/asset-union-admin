import {
  ADMIN_PROPERTY_PATHS,
  createListingWizardHref as buildListingWizardHref,
} from "@/lib/property-wizard/paths";

export const LISTING_KINDS = [
  "construction-project",
  "rental-property",
] as const;
export type ListingKind = (typeof LISTING_KINDS)[number];

export const LISTING_KIND_LABEL: Record<ListingKind, string> = {
  "construction-project": "Construction project",
  "rental-property": "Rental property",
};

export const CONSTRUCTION_WIZARD_STEP_SEGMENTS = [
  "basic-property-information",
  "legal-documentation",
  "funding-structure",
  "construction-timeline",
  "project-timeline",
  "property-details",
  "review-check",
] as const;

export const RENTAL_WIZARD_STEP_SEGMENTS = [
  "basic-property-information",
  "investment-structure",
  "rental-economics",
  "property-management",
  "legal-ownership",
  "property-description",
  "review-check",
] as const;

export type ConstructionWizardStepSegment =
  (typeof CONSTRUCTION_WIZARD_STEP_SEGMENTS)[number];
export type RentalWizardStepSegment =
  (typeof RENTAL_WIZARD_STEP_SEGMENTS)[number];
export type WizardStepSegment =
  | ConstructionWizardStepSegment
  | RentalWizardStepSegment;

export type WizardCompletionSegment = "form-completed";

export type WizardStepConfig = {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  segment: WizardStepSegment;
  tabLabel: string;
};

const CONSTRUCTION_WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: "basic",
    num: "01",
    title: "Basic Property Information",
    subtitle: "Enter basic details",
    segment: "basic-property-information",
    tabLabel: "Basic info",
  },
  {
    id: "legal",
    num: "02",
    title: "Legal & Documentation",
    subtitle: "Submit legal documents",
    segment: "legal-documentation",
    tabLabel: "Legal",
  },
  {
    id: "funding",
    num: "03",
    title: "Funding Structure",
    subtitle: "Set funding timeline",
    segment: "funding-structure",
    tabLabel: "Funding",
  },
  {
    id: "construction",
    num: "04",
    title: "Construction Timeline",
    subtitle: "Enter construction timeline",
    segment: "construction-timeline",
    tabLabel: "Constr. timeline",
  },
  {
    id: "project",
    num: "05",
    title: "Project Timeline",
    subtitle: "Enter project details",
    segment: "project-timeline",
    tabLabel: "Project timeline",
  },
  {
    id: "property",
    num: "06",
    title: "Property Details",
    subtitle: "Enter property details",
    segment: "property-details",
    tabLabel: "Property",
  },
  {
    id: "review",
    num: "07",
    title: "Review Check",
    subtitle: "Double check and submit",
    segment: "review-check",
    tabLabel: "Review",
  },
];

const RENTAL_WIZARD_STEPS: WizardStepConfig[] = [
  {
    id: "basic",
    num: "01",
    title: "Basic Property Information",
    subtitle: "Enter basic details",
    segment: "basic-property-information",
    tabLabel: "Basic info",
  },
  {
    id: "investment",
    num: "02",
    title: "Investment Structure",
    subtitle: "Configure shares and valuation",
    segment: "investment-structure",
    tabLabel: "Investment",
  },
  {
    id: "rental-econ",
    num: "03",
    title: "Rental Economics",
    subtitle: "Income and distribution",
    segment: "rental-economics",
    tabLabel: "Rental econ.",
  },
  {
    id: "mgmt",
    num: "04",
    title: "Property Management",
    subtitle: "Manager and operations",
    segment: "property-management",
    tabLabel: "Management",
  },
  {
    id: "legal-own",
    num: "05",
    title: "Legal & Ownership",
    subtitle: "Documents and rights",
    segment: "legal-ownership",
    tabLabel: "Legal",
  },
  {
    id: "desc",
    num: "06",
    title: "Property Description",
    subtitle: "Narrative for investors",
    segment: "property-description",
    tabLabel: "Description",
  },
  {
    id: "review",
    num: "07",
    title: "Review Check",
    subtitle: "Double check and submit",
    segment: "review-check",
    tabLabel: "Review",
  },
];

export function wizardStepsForKind(kind: ListingKind): WizardStepConfig[] {
  return kind === "rental-property"
    ? RENTAL_WIZARD_STEPS
    : CONSTRUCTION_WIZARD_STEPS;
}

export function wizardStepIndex(
  kind: ListingKind,
  segment: WizardStepSegment,
): number {
  return wizardStepsForKind(kind).findIndex((s) => s.segment === segment);
}

export function isListingKind(value: string): value is ListingKind {
  return (LISTING_KINDS as readonly string[]).includes(value);
}

const ALL_WIZARD_SEGMENTS = [
  ...CONSTRUCTION_WIZARD_STEP_SEGMENTS,
  ...RENTAL_WIZARD_STEP_SEGMENTS,
] as const;

export function isWizardStepSegment(value: string): value is WizardStepSegment {
  return (ALL_WIZARD_SEGMENTS as readonly string[]).includes(value);
}

export function isStepValidForListingKind(
  kind: ListingKind,
  segment: WizardStepSegment,
): boolean {
  return wizardStepsForKind(kind).some((s) => s.segment === segment);
}

export function createListingWizardHref(
  listingKind: ListingKind,
  segment: WizardStepSegment | WizardCompletionSegment,
  propertyId?: string | null,
): string {
  return buildListingWizardHref(
    ADMIN_PROPERTY_PATHS,
    listingKind,
    segment,
    propertyId,
  );
}

const PAGE_TITLE_ENTRIES: [
  WizardStepSegment | WizardCompletionSegment,
  string,
][] = [
  ["basic-property-information", "Basic Property Information"],
  ["legal-documentation", "Legal & Documentation"],
  ["funding-structure", "Funding Structure"],
  ["construction-timeline", "Construction Timeline"],
  ["project-timeline", "Project Timeline"],
  ["property-details", "Property Details"],
  ["investment-structure", "Investment Structure"],
  ["rental-economics", "Rental Economics"],
  ["property-management", "Property Management"],
  ["legal-ownership", "Legal & Ownership"],
  ["property-description", "Property Description"],
  ["review-check", "Review Check"],
  ["form-completed", "Form completed"],
];

export const WIZARD_SEGMENT_PAGE_TITLE: Record<
  WizardStepSegment | WizardCompletionSegment,
  string
> = Object.fromEntries(PAGE_TITLE_ENTRIES) as Record<
  WizardStepSegment | WizardCompletionSegment,
  string
>;

export const WIZARD_BREADCRUMB_STEP_LABEL: Record<
  WizardStepSegment | WizardCompletionSegment,
  string
> = { ...WIZARD_SEGMENT_PAGE_TITLE };
