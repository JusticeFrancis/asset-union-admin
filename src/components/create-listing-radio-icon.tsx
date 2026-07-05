import Image from "next/image";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { cn } from "@/lib/utils";

const radioIcons = ADMIN_ASSETS.createListing.icons;

export type CreateListingRadioIconProps = {
  selected: boolean;
  className?: string;
};

/**
 * Listing type step radio control (Figma 878:42121).
 * Uses `next/image` with `unoptimized` — Next.js does not optimize SVG assets.
 */
export function CreateListingRadioIcon({
  selected,
  className,
}: CreateListingRadioIconProps) {
  return (
    <Image
      alt=""
      aria-hidden
      className={cn("mt-0.5 size-[14px] shrink-0 object-contain", className)}
      height={14}
      src={selected ? radioIcons.radioSelected : radioIcons.radioUnselected}
      unoptimized
      width={14}
    />
  );
}
