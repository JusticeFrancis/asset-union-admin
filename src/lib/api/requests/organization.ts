import { orgApiRequest } from "@/lib/api/org-client";
import type {
  CreateOrganizationRequest,
  OrganizationMembersResponse,
  OrganizationProfile,
  UpdateOrganizationRequest,
} from "@/lib/api/organization.types";
import type { OrganizationMemberRole } from "@/lib/api/organization-auth.types";

export async function createOrganization(payload: CreateOrganizationRequest) {
  return orgApiRequest<OrganizationProfile>("organizations", {
    method: "POST",
    auth: true,
    json: payload,
  });
}

export async function getOrganizationProfile() {
  return orgApiRequest<OrganizationProfile>("organizations/me", {
    auth: true,
  });
}

export async function updateOrganizationProfile(
  payload: UpdateOrganizationRequest,
) {
  return orgApiRequest<OrganizationProfile>("organizations/me", {
    method: "PATCH",
    auth: true,
    json: payload,
  });
}

export async function listOrganizationMembers() {
  return orgApiRequest<OrganizationMembersResponse>("organizations/members", {
    auth: true,
  });
}

export async function inviteOrganizationMember(payload: {
  email: string;
  fullName: string;
  role: OrganizationMemberRole;
}) {
  return orgApiRequest<{ id: string }>("organizations/members", {
    method: "POST",
    auth: true,
    json: payload,
  });
}

export async function updateOrganizationMemberRole(
  memberId: string,
  role: OrganizationMemberRole,
) {
  return orgApiRequest<void>(`organizations/members/${memberId}`, {
    method: "PATCH",
    auth: true,
    json: { role },
  });
}

export async function removeOrganizationMember(memberId: string) {
  return orgApiRequest<void>(`organizations/members/${memberId}`, {
    method: "DELETE",
    auth: true,
  });
}
