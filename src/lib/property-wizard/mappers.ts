import type { ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import type {
  PropertyStatus,
  PropertyType,
} from "@/app/(app)/property-management/property-management-data";
import type {
  AdminPropertyDetail,
  AdminPropertyListItem,
  PropertyApiStatus,
  PropertyApiType,
} from "@/lib/api/admin-property.types";
import { sectionKeyToSegment } from "@/lib/property-wizard/section-keys";

export type PropertyTableRow = {
  id: string;
  propertyName: string;
  location: string;
  currentStage: string;
  manager: string;
  role: string;
  funding: string;
  fundingPercent: string;
  type: PropertyType;
  date: string;
  status: PropertyStatus;
  apiStatus: PropertyApiStatus;
};

const STATUS_LABEL: Record<PropertyApiStatus, PropertyStatus> = {
  active: "Active",
  rejected: "Rejected",
  paused: "Paused",
  submitted: "Submitted",
  draft: "Draft",
  closed: "Draft",
};

const TAB_TO_API_STATUS: Record<string, PropertyApiStatus | undefined> = {
  All: undefined,
  Active: "active",
  Submitted: "submitted",
  Paused: "paused",
  Rejected: "rejected",
};

export function tabToApiStatus(tab: string): PropertyApiStatus | undefined {
  return TAB_TO_API_STATUS[tab];
}

export function mapApiTypeToUi(type: PropertyApiType): PropertyType {
  return type === "rental" ? "Rental" : "Construction";
}

export function mapUiTypeToApi(type: PropertyType): PropertyApiType {
  return type === "Rental" ? "rental" : "construction";
}

export function mapApiStatusToUi(status: PropertyApiStatus): PropertyStatus {
  return STATUS_LABEL[status] ?? "Draft";
}

export function mapTypeToListingKind(type: PropertyApiType): ListingKind {
  return type === "rental" ? "rental-property" : "construction-project";
}

export function formatPropertyDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
}

export function formatFunding(
  funding: string,
  fundingPercent: number,
): { funding: string; fundingPercent: string } {
  const amount = Number.parseFloat(funding);
  const formatted =
    Number.isFinite(amount) && amount > 0
      ? `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
      : funding || "—";

  return {
    funding: formatted,
    fundingPercent: `${fundingPercent}%`,
  };
}

export function mapListItemToRow(
  item: AdminPropertyListItem,
): PropertyTableRow {
  const { funding, fundingPercent } = formatFunding(
    item.funding,
    item.fundingPercent,
  );

  return {
    id: item.id,
    propertyName: item.propertyName,
    location: item.location,
    currentStage: item.currentStage,
    manager: item.manager,
    role: item.role,
    funding,
    fundingPercent,
    type: mapApiTypeToUi(item.type),
    date: formatPropertyDate(item.date),
    status: mapApiStatusToUi(item.status),
    apiStatus: item.status,
  };
}

export function getWizardResumeHref(
  property: AdminPropertyDetail,
  createListingBase = "/create-listing",
): string {
  const listingKind =
    property.metadata?.listingKind ?? mapTypeToListingKind(property.type);
  const step = property.metadata?.currentStep ?? "basicPropertyInformation";
  const segment = sectionKeyToSegment(step) ?? "basic-property-information";

  return `${createListingBase}/${listingKind}/${segment}?propertyId=${encodeURIComponent(property.id)}`;
}

export function isPropertyEditable(status: PropertyApiStatus): boolean {
  return status === "draft" || status === "submitted";
}
