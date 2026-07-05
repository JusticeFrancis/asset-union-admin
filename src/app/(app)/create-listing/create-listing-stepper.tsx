"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  type ListingKind,
  type WizardStepSegment,
  wizardStepIndex,
  wizardStepsForKind,
} from "@/app/(app)/create-listing/create-listing-wizard-data";
import { usePropertyWizardPaths } from "@/contexts/property-wizard-scope";
import { createListingWizardHref } from "@/lib/property-wizard/paths";
import {
  CreateListingWizardStepCheckIcon,
  CreateListingWizardStepNumberBadge,
} from "@/components/icons/create-listing-wizard-step-icons";
import { Card } from "@/components/ui/card";

type CreateListingStepperProps = {
  activeSegment: WizardStepSegment;
  listingKind: ListingKind;
};

export function CreateListingStepper({
  activeSegment,
  listingKind,
}: CreateListingStepperProps) {
  const paths = usePropertyWizardPaths();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId");
  const steps = wizardStepsForKind(listingKind);
  const activeIndex = wizardStepIndex(listingKind, activeSegment);

  return (
    <Card className="h-fit w-full min-w-0 shrink-0 rounded-[20px] border-0 p-4 shadow-sm sm:p-6 md:w-[269px]">
      <div className="flex flex-col gap-6">
        {steps.map((step, index) => {
          const done = index < activeIndex;
          const current = index === activeIndex;

          const badge = done ? (
            <CreateListingWizardStepCheckIcon className="shrink-0" />
          ) : (
            <CreateListingWizardStepNumberBadge
              stepNum={step.num}
              active={current}
            />
          );

          const text = (
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-normal text-[#050a0e]">
                {step.title}
              </p>
              <p className="text-[12px] font-light text-[#919191]">
                {step.subtitle}
              </p>
            </div>
          );

          const rowClass =
            "flex gap-2 rounded-lg transition-colors hover:bg-[#f5f7f8]/80";

          return (
            <Link
              key={step.id}
              href={createListingWizardHref(
                paths,
                listingKind,
                step.segment,
                propertyId,
              )}
              className={rowClass}
            >
              {badge}
              {text}
            </Link>
          );
        })}
      </div>
    </Card>
  );
}
