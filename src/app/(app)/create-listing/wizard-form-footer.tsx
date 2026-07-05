"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

type WizardFormFooterProps = {
  nextStepLine1: string;
  nextStepLine2: string;
  backHref: string;
  continueHref?: string;
  continueLabel?: string;
  continueDisabled?: boolean;
  isSubmitting?: boolean;
  onContinue?: () => void | Promise<void>;
};

export function WizardFormFooter({
  nextStepLine1,
  nextStepLine2,
  backHref,
  continueHref,
  continueLabel = "Continue",
  continueDisabled,
  isSubmitting,
  onContinue,
}: WizardFormFooterProps) {
  const handleContinue = () => {
    if (!onContinue) return;
    void onContinue();
  };

  const continueButtonDisabled =
    continueDisabled || isSubmitting || (!continueHref && !onContinue);

  return (
    <div className="flex flex-col gap-6 border-t border-[#cfe2ec] pt-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div className="flex flex-col gap-1 text-[12px] leading-normal">
          <p className="font-light text-[#919191]">{nextStepLine1}</p>
          <p className="font-normal text-[#050a0e]">{nextStepLine2}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-md lg:flex-1">
          <Button
            variant="outline"
            className="h-10 min-h-10 w-full shrink-0 sm:flex-1"
            asChild
          >
            <Link href={backHref}>Back</Link>
          </Button>
          {continueHref && !onContinue && !continueButtonDisabled ? (
            <Button className="h-10 min-h-10 w-full shrink-0 sm:flex-1" asChild>
              <Link href={continueHref}>{continueLabel}</Link>
            </Button>
          ) : onContinue ? (
            <Button
              className="h-10 min-h-10 w-full shrink-0 sm:flex-1"
              type="button"
              disabled={continueButtonDisabled}
              onClick={handleContinue}
            >
              {isSubmitting ? "Saving…" : continueLabel}
            </Button>
          ) : continueHref ? (
            <Button className="h-10 min-h-10 w-full shrink-0 sm:flex-1" asChild>
              <Link href={continueHref}>{continueLabel}</Link>
            </Button>
          ) : (
            <Button
              className="h-10 min-h-10 w-full shrink-0 sm:flex-1"
              type="button"
              disabled
            >
              {continueLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
