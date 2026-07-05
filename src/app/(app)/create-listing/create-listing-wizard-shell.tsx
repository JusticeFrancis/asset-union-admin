"use client";

import { useState } from "react";

import { CreateListingStepper } from "@/app/(app)/create-listing/create-listing-stepper";
import { SaveDraftDialog } from "@/app/(app)/create-listing/save-draft-dialog";
import {
  WIZARD_SEGMENT_PAGE_TITLE,
  type ListingKind,
  type WizardStepSegment,
} from "@/app/(app)/create-listing/create-listing-wizard-data";
import { Card } from "@/components/ui/card";
import { usePropertyWizard } from "@/contexts/property-wizard-provider";
import { useScopedSavePropertyDraftMutation } from "@/lib/property-wizard/use-scoped-property-api";
import { segmentToSectionKey } from "@/lib/property-wizard/section-keys";

type CreateListingWizardShellProps = {
  activeSegment: WizardStepSegment;
  listingKind: ListingKind;
  children: React.ReactNode;
};

export function CreateListingWizardShell({
  activeSegment,
  listingKind,
  children,
}: CreateListingWizardShellProps) {
  const [draftOpen, setDraftOpen] = useState(false);
  const { propertyId, isEditable } = usePropertyWizard();
  const saveDraftMutation = useScopedSavePropertyDraftMutation();

  const handleSaveDraft = async () => {
    if (!propertyId || !isEditable) {
      setDraftOpen(true);
      return;
    }

    await saveDraftMutation.mutateAsync({
      id: propertyId,
      body: {
        listingKind,
        currentStep: segmentToSectionKey(activeSegment),
      },
    });
    setDraftOpen(true);
  };

  return (
    <>
      <div className="flex w-full flex-col gap-6 md:flex-row md:items-start">
        <CreateListingStepper
          activeSegment={activeSegment}
          listingKind={listingKind}
        />
        <div className="min-w-0 flex-1">
          <Card className="rounded-[20px] border-0 p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <h2 className="min-w-0 text-[19px] font-medium leading-none text-[#050a0e]">
                {WIZARD_SEGMENT_PAGE_TITLE[activeSegment]}
              </h2>
              {isEditable ? (
                <button
                  type="button"
                  className="shrink-0 self-start text-left text-[12px] font-medium text-[#5c60cc] underline md:pt-1 disabled:opacity-50"
                  disabled={saveDraftMutation.isPending}
                  onClick={() => void handleSaveDraft()}
                >
                  {saveDraftMutation.isPending ? "Saving…" : "Save Draft"}
                </button>
              ) : null}
            </div>
            <div className="mb-6 h-px w-full bg-[#cfe2ec]" aria-hidden />
            {children}
          </Card>
        </div>
      </div>
      <SaveDraftDialog open={draftOpen} onOpenChange={setDraftOpen} />
    </>
  );
}
