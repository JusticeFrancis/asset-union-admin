"use client";

import type { Table } from "@tanstack/react-table";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { cn } from "@/lib/utils";

const rentPaginationIcons = ADMIN_ASSETS.rentSubmission.icons;

/** 0-based page indices for compact pagination (matches `/rent-submission`). */
export function adminTablePageIndices(
  pageIndex: number,
  pageCount: number,
): (number | "ellipsis")[] {
  if (pageCount <= 1) {
    return [0];
  }
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i);
  }
  const items = new Set<number>();
  items.add(0);
  items.add(pageCount - 1);
  if (pageIndex <= 2) {
    items.add(1);
    items.add(2);
  } else if (pageIndex >= pageCount - 3) {
    items.add(pageCount - 3);
    items.add(pageCount - 2);
  } else {
    items.add(pageIndex - 1);
    items.add(pageIndex);
    items.add(pageIndex + 1);
  }
  const sorted = [...items].sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push("ellipsis");
    }
    result.push(sorted[i]);
  }
  return result;
}

export type AdminTablePaginationBarProps = {
  /** 0-based current page */
  pageIndex: number;
  /** Total pages (at least 1) */
  pageCount: number;
  onPageChange: (pageIndex: number) => void;
  prevIconSrc?: string;
  nextIconSrc?: string;
};

/**
 * Footer pagination bar aligned with `/rent-submission` (layout, chevrons, page pills).
 */
export function AdminTablePaginationBar({
  pageIndex,
  pageCount,
  onPageChange,
  prevIconSrc = rentPaginationIcons.paginationPrev,
  nextIconSrc = rentPaginationIcons.paginationNext,
}: AdminTablePaginationBarProps) {
  const safeCount = Math.max(1, pageCount);
  const clampedIndex = Math.min(Math.max(0, pageIndex), safeCount - 1);
  const canPrev = clampedIndex > 0;
  const canNext = clampedIndex < safeCount - 1;
  const items = adminTablePageIndices(clampedIndex, safeCount);

  return (
    <div className="flex w-full flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-[12px] font-medium text-[#919191] sm:text-left">
        Page {clampedIndex + 1} of {safeCount}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-0.5 sm:justify-end">
        <button
          type="button"
          aria-label="Previous page"
          disabled={!canPrev}
          onClick={() => onPageChange(clampedIndex - 1)}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md hover:bg-[#f5f7f8]",
            !canPrev && "cursor-not-allowed opacity-40",
          )}
        >
          <img
            src={prevIconSrc}
            alt=""
            width={12}
            height={12}
            className="size-3 object-contain"
          />
        </button>
        {items.map((item, i) =>
          item === "ellipsis" ? (
            <span
              key={`e-${i}`}
              className="px-2 py-0.5 text-[12px] font-medium uppercase text-[#919191]"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              className={cn(
                "min-w-6 rounded px-2 py-0.5 text-[12px] font-medium uppercase",
                item === clampedIndex
                  ? "bg-[#5C60CC] text-white"
                  : "bg-transparent text-[#919191]",
              )}
              aria-label={`Page ${item + 1}`}
              aria-current={item === clampedIndex ? "page" : undefined}
            >
              {item + 1}
            </button>
          ),
        )}
        <button
          type="button"
          aria-label="Next page"
          disabled={!canNext}
          onClick={() => onPageChange(clampedIndex + 1)}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md hover:bg-[#f5f7f8]",
            !canNext && "cursor-not-allowed opacity-40",
          )}
        >
          <img
            src={nextIconSrc}
            alt=""
            width={12}
            height={12}
            className="size-3 object-contain"
          />
        </button>
      </div>
    </div>
  );
}

type AdminDataTablePaginationProps<T> = {
  table: Table<T>;
  prevIconSrc?: string;
  nextIconSrc?: string;
};

/** TanStack Table footer — same behavior as rent submission `renderFooter`. */
export function AdminDataTablePagination<T>({
  table,
  prevIconSrc,
  nextIconSrc,
}: AdminDataTablePaginationProps<T>) {
  const pageCount = Math.max(1, table.getPageCount());
  const pageIndex = table.getState().pagination.pageIndex;

  return (
    <AdminTablePaginationBar
      pageCount={pageCount}
      pageIndex={pageIndex}
      onPageChange={(i) => table.setPageIndex(i)}
      prevIconSrc={prevIconSrc}
      nextIconSrc={nextIconSrc}
    />
  );
}
