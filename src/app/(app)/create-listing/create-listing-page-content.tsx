"use client";

import { useRouter } from "nextjs-toploader/app";
import { useState } from "react";

import { type ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { Button } from "@/components/ui/button";
import { CreateListingRadioIcon } from "@/components/create-listing-radio-icon";
import { Card } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { useOrganizationAuth } from "@/contexts/organization-auth-provider";
import { usePropertyWizardPaths } from "@/contexts/property-wizard-scope";
import { canCreateProperties } from "@/lib/admin-permissions";
import { getAdminErrorMessage } from "@/lib/auth/errors";
import { getOrgErrorMessage } from "@/lib/auth/org-errors";
import { canEditOrgProperties } from "@/lib/organization-permissions";
import { createListingWizardHref } from "@/lib/property-wizard/paths";
import { useScopedCreatePropertyDraftMutation } from "@/lib/property-wizard/use-scoped-property-api";

const options: {
  value: ListingKind;
  title: string;
  description: string;
}[] = [
  {
    value: "construction-project",
    title: "Construction Project",
    description:
      "Capital is raised to develop or complete a property. Returns are realized after completion through sale or conversion to rental.",
  },
  {
    value: "rental-property",
    title: "Rental Property",
    description:
      "An existing property that generates rental income distributed to investors on a recurring basis.",
  },
];

export function CreateListingPageContent() {
  const router = useRouter();
  const paths = usePropertyWizardPaths();
  const { admin } = useAdminAuth();
  const { activeMembership } = useOrganizationAuth();
  const createDraftMutation = useScopedCreatePropertyDraftMutation();
  const [listingKind, setListingKind] = useState<ListingKind>(
    "construction-project",
  );
  const [error, setError] = useState<string | null>(null);

  const canCreate =
    paths.scope === "organization"
      ? canEditOrgProperties(activeMembership?.role)
      : canCreateProperties(admin?.roles, admin?.permissions);

  const formatError =
    paths.scope === "organization" ? getOrgErrorMessage : getAdminErrorMessage;

  const handleStart = async () => {
    if (!canCreate) {
      setError("You do not have permission to create listings.");
      return;
    }

    setError(null);

    try {
      const created = await createDraftMutation.mutateAsync({
        listingKind,
        currentStep: "basicPropertyInformation",
        sections: {
          basicPropertyInformation: {},
        },
      });

      router.push(
        createListingWizardHref(
          paths,
          listingKind,
          "basic-property-information",
          created.id,
        ),
      );
    } catch (err) {
      setError(formatError(err, "Failed to create draft."));
    }
  };

  if (!canCreate) {
    return (
      <Card className="rounded-[20px] border-0 p-6 shadow-sm">
        <p className="text-center text-[12px] text-[#919191]">
          You do not have permission to create property listings.
        </p>
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            onClick={() => router.push(paths.propertyManagementBase)}
          >
            Back to properties
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex min-h-[438px] w-full min-w-0 flex-col justify-between gap-8 rounded-[20px] border-0 p-4 shadow-sm sm:p-6">
      <div className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-8">
          <h2 className="text-center text-[19px] font-medium leading-none text-[#050a0e]">
            Listing Type
          </h2>
          <div className="h-px w-full bg-[#cfe2ec]" aria-hidden />
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-center text-[16px] font-light leading-normal text-[#050a0e]">
            Select your preferred listing type to proceed with
          </p>
          <div
            className="flex w-full flex-col gap-6 md:flex-row"
            role="radiogroup"
            aria-label="Listing type"
          >
            {options.map((opt) => {
              const checked = listingKind === opt.value;
              return (
                <label
                  key={opt.value}
                  className="flex min-h-0 flex-1 cursor-pointer gap-2 rounded-2xl bg-[#f9fafb] p-6 text-left"
                >
                  <input
                    type="radio"
                    name="listing-type"
                    value={opt.value}
                    checked={checked}
                    onChange={() => setListingKind(opt.value)}
                    className="sr-only"
                  />
                  <CreateListingRadioIcon selected={checked} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1 leading-normal">
                    <span className="text-[12px] font-normal text-[#050a0e]">
                      {opt.title}
                    </span>
                    <span className="text-[12px] font-light text-[#919191]">
                      {opt.description}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-8">
        <div className="h-px w-full bg-[#cfe2ec]" aria-hidden />
        {error ? (
          <p className="text-center text-[12px] text-[#B3261E]">{error}</p>
        ) : null}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 text-[12px] leading-normal">
            <p className="font-light text-[#919191]">
              Proceed to the next step
            </p>
            <p className="font-normal text-[#050a0e]">
              Basic Property Information
            </p>
          </div>
          <Button
            type="button"
            className="h-10 w-full max-w-[382px] shrink-0 sm:w-auto sm:min-w-[200px]"
            disabled={createDraftMutation.isPending}
            onClick={() => void handleStart()}
          >
            {createDraftMutation.isPending ? "Creating draft…" : "Start"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
