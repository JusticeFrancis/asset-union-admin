import type { OrganizationMemberRole } from "@/lib/api/organization-auth.types";
import type {
  OrganizationStatus,
  OrganizationType,
} from "@/lib/api/organization.types";

const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = {
  developer: "Developer",
  agency: "Agency",
  broker: "Broker",
  partner: "Partner",
  other: "Other",
};

const ORGANIZATION_MEMBER_ROLE_LABELS: Record<OrganizationMemberRole, string> =
  {
    organization_owner: "Organization Owner",
    organization_admin: "Organization Admin",
    asset_manager: "Asset Manager",
    viewer: "Viewer",
  };

const ORGANIZATION_STATUS_LABELS: Record<OrganizationStatus, string> = {
  pending_verification: "Pending Verification",
  active: "Active",
  suspended: "Suspended",
};

export type OrganizationStatusTone = "warning" | "success" | "danger";

export const ORGANIZATION_STATUS_TONE_CLASSES: Record<
  OrganizationStatusTone,
  string
> = {
  warning: "border border-[#fde68a] bg-[#fffbeb] text-[#92400e]",
  success: "border border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]",
  danger: "border border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]",
};

export function formatOrganizationMemberRole(
  role: OrganizationMemberRole | undefined | null,
): string {
  if (!role) return "—";
  return ORGANIZATION_MEMBER_ROLE_LABELS[role] ?? role;
}

export function formatOrganizationStatus(
  status: OrganizationStatus | undefined | null,
): string {
  if (!status) return "Not created";
  return ORGANIZATION_STATUS_LABELS[status] ?? status;
}

export function getOrganizationStatusTone(
  status: OrganizationStatus,
): OrganizationStatusTone {
  switch (status) {
    case "pending_verification":
      return "warning";
    case "active":
      return "success";
    case "suspended":
      return "danger";
  }
}

export function formatOrganizationType(
  type: OrganizationType | undefined | null,
): string {
  if (!type) return "—";
  return ORGANIZATION_TYPE_LABELS[type] ?? type;
}

export function formatOrganizationCountry(
  countryCode: string | undefined | null,
): string {
  if (!countryCode) return "—";

  try {
    return (
      new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ??
      countryCode
    );
  } catch {
    return countryCode;
  }
}

export function formatOrganizationLocation(
  country: string | undefined | null,
  address: string | undefined | null,
): string {
  const countryLabel = formatOrganizationCountry(country);
  const trimmedAddress = address?.trim();

  if (trimmedAddress && countryLabel !== "—") {
    return `${trimmedAddress}, ${countryLabel}`;
  }

  return trimmedAddress || countryLabel;
}
