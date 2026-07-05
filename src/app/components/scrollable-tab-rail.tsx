import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Horizontal scroll for pill/tab rows that would otherwise overflow narrow viewports.
 * Hides scrollbars while keeping touch/trackpad scroll (same idea as marketing tab rows).
 */
export function ScrollableTabRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 max-w-full overflow-x-auto overscroll-x-contain pb-1",
        "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
