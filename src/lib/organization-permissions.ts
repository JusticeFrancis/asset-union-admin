import type { OrganizationMemberRole } from "@/lib/api/organization-auth.types";
import type { OrganizationStatus } from "@/lib/api/organization.types";

export function isOrgActive(status: OrganizationStatus | undefined) {
  return status === "active";
}

export function canManageOrgProfile(role: OrganizationMemberRole | undefined) {
  return role === "organization_owner" || role === "organization_admin";
}

export function canManageMembers(role: OrganizationMemberRole | undefined) {
  return canManageOrgProfile(role);
}

export function canEditOrgProperties(role: OrganizationMemberRole | undefined) {
  return role !== "viewer" && role !== undefined;
}

export function canSubmitOrgProperties(
  role: OrganizationMemberRole | undefined,
) {
  return canEditOrgProperties(role);
}
