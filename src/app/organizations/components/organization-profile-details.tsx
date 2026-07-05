"use client";

import type { ReactNode } from "react";

import type { OrganizationProfile } from "@/lib/api/organization.types";
import {
  formatOrganizationCountry,
  formatOrganizationLocation,
  formatOrganizationStatus,
  formatOrganizationType,
  getOrganizationStatusTone,
  ORGANIZATION_STATUS_TONE_CLASSES,
} from "@/lib/organization-display";
import { cn } from "@/lib/utils";

type OrganizationProfileDetailsProps = {
  organization: OrganizationProfile;
};

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[#919191]">{label}</dt>
      <dd className="mt-0.5 font-medium text-[#050a0e]">{value}</dd>
    </div>
  );
}

function displayValue(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "—";
}

export function OrganizationProfileDetails({
  organization,
}: OrganizationProfileDetailsProps) {
  return (
    <section className="rounded-[16px] border border-[#eef2f6] bg-[#fafbfc] p-5">
      <h3 className="text-[14px] font-medium text-[#050a0e]">
        Organization details
      </h3>
      <p className="mt-1 text-[12px] text-[#919191]">
        Saved profile information for your organization.
      </p>

      <dl className="mt-5 grid gap-4 text-[12px] sm:grid-cols-2">
        <DetailItem label="Organization name" value={organization.name} />
        <DetailItem
          label="Status"
          value={
            <span
              className={cn(
                "inline-flex rounded-[40px] px-2 py-0.5 text-[11px] font-medium",
                ORGANIZATION_STATUS_TONE_CLASSES[
                  getOrganizationStatusTone(organization.status)
                ],
              )}
            >
              {formatOrganizationStatus(organization.status)}
            </span>
          }
        />
        <DetailItem
          label="Short description"
          value={displayValue(organization.shortDescription)}
        />
        <DetailItem
          label="Type"
          value={formatOrganizationType(organization.type)}
        />
        <DetailItem
          label="Country"
          value={formatOrganizationCountry(organization.country)}
        />
        <DetailItem
          label="Location"
          value={formatOrganizationLocation(
            organization.country,
            organization.address,
          )}
        />
        <DetailItem
          label="Legal name"
          value={displayValue(organization.legalName)}
        />
        <DetailItem
          label="Registration number"
          value={displayValue(organization.registrationNumber)}
        />
        <DetailItem
          label="Website"
          value={
            organization.website?.trim() ? (
              <a
                href={organization.website}
                target="_blank"
                rel="noreferrer"
                className="text-[#5c60cc] hover:underline"
              >
                {organization.website}
              </a>
            ) : (
              "—"
            )
          }
        />
        <DetailItem
          label="Contact email"
          value={displayValue(organization.contactEmail)}
        />
        <DetailItem
          label="Contact phone"
          value={displayValue(organization.contactPhone)}
        />
        <DetailItem
          label="Address"
          value={displayValue(organization.address)}
        />
      </dl>
    </section>
  );
}
