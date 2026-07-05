"use client";

import { useRouter } from "nextjs-toploader/app";
import { useId, useState } from "react";

import { OrgCenteredCard } from "@/app/organizations/components/org-centered-card";
import {
  orgAuthErrorClassName,
  orgAuthInputClassName,
} from "@/app/organizations/components/org-auth-styles";
import { Button } from "@/components/ui/button";
import { useOrganizationAuth } from "@/contexts/organization-auth-provider";
import { createOrganization } from "@/lib/api/requests/organization";
import {
  ACCEPTED_ORGANIZATION_COUNTRIES,
  type OrganizationType,
} from "@/lib/api/organization.types";
import { getOrgAuthErrorMessage } from "@/lib/auth/org-errors";

const ORG_TYPES: { value: OrganizationType; label: string }[] = [
  { value: "developer", label: "Developer" },
  { value: "agency", label: "Agency" },
  { value: "broker", label: "Broker" },
  { value: "partner", label: "Partner" },
  { value: "other", label: "Other" },
];

export default function OrganizationCreateOrgPage() {
  const router = useRouter();
  const { refreshBootstrap } = useOrganizationAuth();
  const formId = useId();

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [country, setCountry] = useState("AE");
  const [type, setType] = useState<OrganizationType>("developer");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await createOrganization({
        name: name.trim(),
        shortDescription: shortDescription.trim(),
        country,
        type,
      });
      await refreshBootstrap();
      router.replace("/organizations/onboarding/profile");
    } catch (error) {
      setErrorMessage(
        getOrgAuthErrorMessage(error, "Unable to create organization."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrgCenteredCard
      size="auth"
      title="Create your organization"
      description="Add the basics now. You can upload profile and cover images on the next step."
    >
      <form id={formId} className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {errorMessage ? (
          <p className={orgAuthErrorClassName} role="alert">
            {errorMessage}
          </p>
        ) : null}

        <label className="flex flex-col gap-1 text-[12px]">
          <span className="text-[#050a0e]">Organization name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={orgAuthInputClassName}
            placeholder="Acme Development"
          />
        </label>

        <label className="flex flex-col gap-1 text-[12px]">
          <span className="text-[#050a0e]">Short description</span>
          <textarea
            required
            rows={3}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            className={orgAuthInputClassName}
            placeholder="What does your organization do?"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-[12px]">
            <span className="text-[#050a0e]">Country</span>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={orgAuthInputClassName}
            >
              {ACCEPTED_ORGANIZATION_COUNTRIES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[12px]">
            <span className="text-[#050a0e]">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OrganizationType)}
              className={orgAuthInputClassName}
            >
              {ORG_TYPES.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating…" : "Continue"}
        </Button>
      </form>
    </OrgCenteredCard>
  );
}
