"use client";

import { useEffect, useState } from "react";

import { OrganizationProfileDetails } from "@/app/organizations/components/organization-profile-details";
import {
  orgAuthErrorClassName,
  orgAuthInputClassName,
} from "@/app/organizations/components/org-auth-styles";
import { Button } from "@/components/ui/button";
import { useOrganizationAuth } from "@/contexts/organization-auth-provider";
import { updateOrganizationProfile } from "@/lib/api/requests/organization";
import { canManageOrgProfile } from "@/lib/organization-permissions";
import { getOrgAuthErrorMessage } from "@/lib/auth/org-errors";

export default function OrganizationProfileOnboardingPage() {
  const { organization, activeMembership, refreshBootstrap } =
    useOrganizationAuth();
  const canEdit = canManageOrgProfile(activeMembership?.role);

  const [legalName, setLegalName] = useState("");
  const [website, setWebsite] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!organization) return;
    setLegalName(organization.legalName ?? "");
    setWebsite(organization.website ?? "");
    setContactEmail(organization.contactEmail ?? "");
    setContactPhone(organization.contactPhone ?? "");
    setAddress(organization.address ?? "");
    setRegistrationNumber(organization.registrationNumber ?? "");
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await updateOrganizationProfile({
        legalName: legalName.trim() || null,
        website: website.trim() || null,
        contactEmail: contactEmail.trim() || null,
        contactPhone: contactPhone.trim() || null,
        address: address.trim() || null,
        registrationNumber: registrationNumber.trim() || null,
      });
      await refreshBootstrap();
      setSuccessMessage("Profile saved.");
    } catch (error) {
      setErrorMessage(getOrgAuthErrorMessage(error, "Unable to save profile."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canEdit) {
    return organization ? (
      <div className="mx-auto max-w-3xl">
        <OrganizationProfileDetails organization={organization} />
      </div>
    ) : (
      <p className="text-[12px] text-[#919191]">
        You do not have permission to edit the organization profile.
      </p>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {organization ? (
        <OrganizationProfileDetails organization={organization} />
      ) : null}

      <div className="rounded-[16px] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]">
        <h2 className="text-[16px] font-medium text-[#050a0e]">
          Organization profile
        </h2>
        <p className="mt-1 text-[12px] text-[#919191]">
          Legal and contact details for{" "}
          {organization?.name ?? "your organization"}.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          {errorMessage ? (
            <p className={orgAuthErrorClassName} role="alert">
              {errorMessage}
            </p>
          ) : null}
          {successMessage ? (
            <p className="rounded-[12px] border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[12px] text-[#166534]">
              {successMessage}
            </p>
          ) : null}

          {(
            [
              ["Legal name", legalName, setLegalName],
              ["Website", website, setWebsite],
              ["Contact email", contactEmail, setContactEmail],
              ["Contact phone", contactPhone, setContactPhone],
              ["Address", address, setAddress],
              [
                "Registration number",
                registrationNumber,
                setRegistrationNumber,
              ],
            ] as const
          ).map(([label, value, setter]) => (
            <label key={label} className="flex flex-col gap-1 text-[12px]">
              <span className="text-[#050a0e]">{label}</span>
              <input
                value={value}
                onChange={(e) => setter(e.target.value)}
                className={orgAuthInputClassName}
              />
            </label>
          ))}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </div>
    </div>
  );
}
