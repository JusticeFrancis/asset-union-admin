import type { OrganizationMemberRole } from "@/lib/api/organization-auth.types";

export type OrganizationType =
  | "developer"
  | "agency"
  | "broker"
  | "partner"
  | "other";

export type OrganizationStatus =
  | "pending_verification"
  | "active"
  | "suspended";

export type OrganizationProfile = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  profileImageUrl: string | null;
  heroImageUrl: string | null;
  country: string;
  type: OrganizationType;
  status: OrganizationStatus;
  onboardingCompletedAt: number | null;
  legalName: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  registrationNumber: string | null;
  createdAt: number;
  updatedAt: number;
};

export type CreateOrganizationRequest = {
  name: string;
  shortDescription: string;
  country: string;
  type: OrganizationType;
  profileImageUrl?: string;
  profileImageStorageKey?: string;
  heroImageUrl?: string;
  heroImageStorageKey?: string;
  legalName?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  registrationNumber?: string;
};

export type UpdateOrganizationRequest = {
  name?: string;
  shortDescription?: string;
  country?: string;
  type?: OrganizationType;
  profileImageUrl?: string | null;
  profileImageStorageKey?: string | null;
  heroImageUrl?: string | null;
  heroImageStorageKey?: string | null;
  legalName?: string | null;
  website?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  registrationNumber?: string | null;
};

export type OrganizationMember = {
  id: string;
  organizationUserId: string;
  email: string;
  fullName: string;
  role: OrganizationMemberRole;
  joinedAt: number;
};

export type OrganizationMembersResponse = {
  items: OrganizationMember[];
};

export const ACCEPTED_ORGANIZATION_COUNTRIES = [
  "US",
  "CA",
  "GB",
  "AU",
  "DE",
  "FR",
  "ES",
  "IT",
  "NL",
  "CH",
  "AE",
  "SG",
  "IN",
  "NG",
  "ZA",
  "BR",
  "MX",
  "JP",
  "KR",
  "SA",
] as const;

export type AcceptedOrganizationCountry =
  (typeof ACCEPTED_ORGANIZATION_COUNTRIES)[number];
