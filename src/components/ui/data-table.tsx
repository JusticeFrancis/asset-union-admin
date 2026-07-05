"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
  type Table,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";

type ColumnChromeMeta = {
  headerClassName?: string;
  cellClassName?: string;
};

function columnMeta(meta: unknown): ColumnChromeMeta {
  if (meta && typeof meta === "object") {
    return meta as ColumnChromeMeta;
  }
  return {};
}

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  initialPageSize?: number;
  className?: string;
  headerCellClassName?: string;
  renderFooter?: (table: Table<TData>) => ReactNode;
  /** When this value changes, the table resets to page 1 (e.g. filter churn). */
  paginationResetKey?: string | number;
};

export function DataTable<TData, TValue>({
  columns,
  data,
  initialPageSize = 10,
  className,
  headerCellClassName,
  renderFooter,
  paginationResetKey,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
  });

  const prevPaginationResetKey = useRef(paginationResetKey);
  useLayoutEffect(() => {
    if (paginationResetKey === undefined) {
      return;
    }
    if (prevPaginationResetKey.current === paginationResetKey) {
      return;
    }
    prevPaginationResetKey.current = paginationResetKey;
    table.setPageIndex(0);
  }, [paginationResetKey, table]);

  return (
    <div className={cn("w-full min-w-0 overflow-x-auto", className)}>
      <table className="min-w-full w-max caption-bottom border-collapse text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-[#cfe2ec]">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    "min-h-10 px-3 py-2.5 text-left align-top font-medium whitespace-normal text-[#050a0e]",
                    headerCellClassName,
                    columnMeta(header.column.columnDef.meta).headerClassName,
                  )}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b border-[#cfe2ec]">
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={cn(
                    "px-3 py-3 align-top whitespace-normal",
                    columnMeta(cell.column.columnDef.meta).cellClassName,
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {renderFooter?.(table)}
    </div>
  );
}
