"use client";

import Link from "next/link";

import { OrganizationProfileDetails } from "@/app/organizations/components/organization-profile-details";
import { useOrganizationAuth } from "@/contexts/organization-auth-provider";
import {
  formatOrganizationMemberRole,
  formatOrganizationStatus,
  getOrganizationStatusTone,
  ORGANIZATION_STATUS_TONE_CLASSES,
} from "@/lib/organization-display";
import { cn } from "@/lib/utils";

export default function OrganizationDashboardPage() {
  const { organization, activeMembership, memberships } = useOrganizationAuth();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[16px] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]">
        <div>
          <h2 className="text-[16px] font-medium text-[#050a0e]">Dashboard</h2>
          <p className="mt-1 text-[12px] text-[#919191]">
            {organization?.shortDescription ??
              "Complete onboarding to submit your organization for review."}
          </p>
        </div>

        <dl className="mt-6 grid gap-3 text-[12px] sm:grid-cols-2">
          <div>
            <dt className="text-[#919191]">Your role</dt>
            <dd className="font-medium text-[#050a0e]">
              {formatOrganizationMemberRole(activeMembership?.role)}
            </dd>
          </div>
          <div>
            <dt className="text-[#919191]">Organization status</dt>
            <dd>
              {organization?.status ? (
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
              ) : (
                <span className="font-medium text-[#050a0e]">Not created</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-[#919191]">Memberships</dt>
            <dd className="font-medium text-[#050a0e]">{memberships.length}</dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          {organization ? null : (
            <Link
              href="/organizations/onboarding/create-org"
              className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#5c60cc] px-4 text-[12px] font-medium text-white hover:bg-[#4a4eb8]"
            >
              Create organization
            </Link>
          )}
          <Link
            href="/organizations/onboarding/profile"
            className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#cfe2ec] bg-white px-4 text-[12px] font-medium text-[#050a0e] hover:bg-[#f8fbfd]"
          >
            Organization profile
          </Link>
          <Link
            href="/organizations/properties"
            className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#cfe2ec] bg-white px-4 text-[12px] font-medium text-[#050a0e] hover:bg-[#f8fbfd]"
          >
            Properties
          </Link>
          <Link
            href="/organizations/members"
            className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#cfe2ec] bg-white px-4 text-[12px] font-medium text-[#050a0e] hover:bg-[#f8fbfd]"
          >
            Team
          </Link>
          <Link
            href="/organizations/compliance"
            className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#cfe2ec] bg-white px-4 text-[12px] font-medium text-[#050a0e] hover:bg-[#f8fbfd]"
          >
            Compliance log
          </Link>
        </div>
      </div>

      {organization ? (
        <OrganizationProfileDetails organization={organization} />
      ) : null}
    </div>
  );
}
