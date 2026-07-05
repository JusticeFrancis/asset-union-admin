"use client";

import { useOrganizationAuth } from "@/contexts/organization-auth-provider";
import type { OrganizationStatus } from "@/lib/api/organization.types";

type OrgStatusBannerProps = {
  status?: OrganizationStatus;
};

export function OrgStatusBanner({ status: statusProp }: OrgStatusBannerProps) {
  const { organization } = useOrganizationAuth();
  const status = statusProp ?? organization?.status;
  if (!status || status === "active") {
    return null;
  }

  if (status === "pending_verification") {
    return (
      <div
        className="rounded-[12px] border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-[12px] text-[#92400e]"
        role="status"
      >
        Your organization is awaiting platform approval. You can update your
        profile; team and property features unlock once approved.
      </div>
    );
  }

  return (
    <div
      className="rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[12px] text-[#b91c1c]"
      role="alert"
    >
      This organization has been suspended. Contact Asset Union support for
      help.
    </div>
  );
}
