"use client";

import { Archive } from "lucide-react";
import Link from "next/link";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePropertyWizardPaths } from "@/contexts/property-wizard-scope";

type SaveDraftDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SaveDraftDialog({ open, onOpenChange }: SaveDraftDialogProps) {
  const { propertyManagementBase } = usePropertyWizardPaths();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="left-1/2 top-1/2 w-[min(100vw-2rem,400px)] max-w-[calc(100vw-2rem)] translate-x-[-50%] translate-y-[-50%] rounded-[20px] border-[#cfe2ec] p-8"
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#5c60cc]/10">
            <Archive className="size-7 text-[#5c60cc]" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-center">Saved as Draft!</DialogTitle>
            <DialogDescription className="text-center text-[12px] leading-normal">
              You just saved your progress as a draft; you can always access it
              from drafts.
            </DialogDescription>
          </div>
          <Button className="h-10 w-full" asChild>
            <Link
              href={propertyManagementBase}
              onClick={() => onOpenChange(false)}
            >
              Go to Draft
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
