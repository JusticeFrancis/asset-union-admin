"use client";

import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import { Pencil } from "lucide-react";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PropertyWizardPaths } from "@/lib/property-wizard/paths";
import {
  createListingWizardHref,
  propertyManagementDetailHref,
} from "@/lib/property-wizard/paths";
import {
  getWizardResumeHref,
  type PropertyTableRow,
} from "@/lib/property-wizard/mappers";

type PropertyRowActionsMenuProps = {
  row: PropertyTableRow;
  paths: PropertyWizardPaths;
  canEdit: boolean;
};

export function PropertyRowActionsMenu({
  row,
  paths,
  canEdit,
}: PropertyRowActionsMenuProps) {
  const router = useRouter();
  const pm = ADMIN_ASSETS.propertyManagement;

  const handleEdit = () => {
    if (row.apiStatus === "draft" || row.apiStatus === "submitted") {
      const listingKind =
        row.type === "Rental" ? "rental-property" : "construction-project";
      router.push(
        createListingWizardHref(
          paths,
          listingKind,
          "basic-property-information",
          row.id,
        ),
      );
      return;
    }
    router.push(propertyManagementDetailHref(paths, row.id));
  };

  const handleView = () => {
    router.push(propertyManagementDetailHref(paths, row.id));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-md text-[#050A0E] outline-none hover:bg-[#F5F7F8] focus-visible:ring-2 focus-visible:ring-[#5C60CC]/30"
          aria-label={`More actions for ${row.propertyName}`}
        >
          <Image
            alt=""
            width={12}
            height={12}
            className="size-3 object-contain"
            src={pm.rowMore}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[220px] p-3">
        {canEdit ? (
          <DropdownMenuItem
            className="flex cursor-pointer flex-row items-center gap-2 rounded-lg px-3 py-3 text-[12px] font-light text-[#050A0E] focus:bg-[#F5F7F8]"
            onSelect={handleEdit}
          >
            <Pencil className="size-4 shrink-0" strokeWidth={1.5} />
            {row.apiStatus === "draft" ? "Continue draft" : "Edit"}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="flex cursor-pointer flex-row items-center gap-2 rounded-lg px-3 py-3 text-[12px] font-light text-[#050A0E] focus:bg-[#F5F7F8]"
            onSelect={handleView}
          >
            <Pencil className="size-4 shrink-0" strokeWidth={1.5} />
            View
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getPropertyEditHref(
  row: PropertyTableRow,
  paths: PropertyWizardPaths,
) {
  if (row.apiStatus === "draft" || row.apiStatus === "submitted") {
    const listingKind =
      row.type === "Rental" ? "rental-property" : "construction-project";
    return createListingWizardHref(
      paths,
      listingKind,
      "basic-property-information",
      row.id,
    );
  }
  return propertyManagementDetailHref(paths, row.id);
}
