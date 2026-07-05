"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";

import type { PropertyType } from "@/app/(app)/property-management/property-management-data";
import { PropertyRowActionsMenu } from "@/app/components/property-row-actions-menu";
import { AdminDataTablePagination } from "@/app/components/admin-table-pagination";
import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { ScrollableTabRail } from "@/app/components/scrollable-tab-rail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { usePropertyWizardPaths } from "@/contexts/property-wizard-scope";
import {
  mapListItemToRow,
  tabToApiStatus,
  type PropertyTableRow,
} from "@/lib/property-wizard/mappers";
import { useScopedProperties } from "@/lib/property-wizard/use-scoped-property-api";
import { canEditOrgProperties } from "@/lib/organization-permissions";
import { useOrganizationAuth } from "@/contexts/organization-auth-provider";
import { canUpdateProperties } from "@/lib/admin-permissions";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { cn } from "@/lib/utils";

const statusClassMap: Record<PropertyTableRow["status"], string> = {
  Active: "border-0 bg-[#AFF4C6] text-[#009951] hover:bg-[#AFF4C6]",
  Rejected: "border-0 bg-[#F9DEDC] text-[#B3261E] hover:bg-[#F9DEDC]",
  Paused: "border-0 bg-[#FFE8A3] text-[#975102] hover:bg-[#FFE8A3]",
  Submitted: "border-0 bg-[#E4F0F7] text-[#6FB2D3] hover:bg-[#E4F0F7]",
  Draft: "border-0 bg-[#F5F7F8] text-[#575757] hover:bg-[#F5F7F8]",
};

const tabs = ["All", "Active", "Submitted", "Paused", "Rejected"] as const;
type StatusTab = (typeof tabs)[number];

const PAGE_SIZE = 6;

function buildPropertyColumns(
  propertyThumb: string,
  paths: ReturnType<typeof usePropertyWizardPaths>,
  canEdit: boolean,
): ColumnDef<PropertyTableRow>[] {
  return [
    {
      id: "property",
      accessorFn: (r) => r.propertyName,
      header: "property name",
      cell: ({ row }) => (
        <div className="flex min-w-0 items-start gap-2">
          <img
            alt=""
            className="size-[30.883px] shrink-0 rounded-[2.745px] object-cover"
            src={propertyThumb}
          />
          <div className="min-w-0 leading-snug">
            <p className="break-words text-[12px] font-normal text-[#050A0E]">
              {row.original.propertyName}
            </p>
            <p className="mt-1 break-words text-[12px] font-normal text-[#919191]">
              {row.original.location}
            </p>
          </div>
        </div>
      ),
      meta: {
        headerClassName: "min-w-[12rem] max-w-[20rem]",
        cellClassName: "min-w-[12rem] max-w-[20rem]",
      },
    },
    {
      accessorKey: "currentStage",
      header: "Current Stage",
      cell: ({ row }) => (
        <p className="break-words text-[12px] font-normal text-[#050A0E]">
          {row.original.currentStage}
        </p>
      ),
    },
    {
      id: "manager",
      accessorFn: (r) => r.manager,
      header: "manager",
      cell: ({ row }) => (
        <div className="min-w-0 leading-snug">
          <p className="break-words text-[12px] font-normal text-[#050A0E]">
            {row.original.manager}
          </p>
          <p className="mt-1 break-words text-[12px] font-light text-[#919191]">
            {row.original.role}
          </p>
        </div>
      ),
    },
    {
      id: "funding",
      accessorFn: (r) => r.funding,
      header: "Funding",
      cell: ({ row }) => (
        <div className="min-w-0 leading-snug">
          <p className="break-words text-[12px] font-normal text-[#050A0E]">
            {row.original.funding}
          </p>
          <p className="mt-1 break-words text-[12px] font-normal text-[#919191]">
            {row.original.fundingPercent}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "type",
      cell: ({ row }) => (
        <p className="break-words text-[12px] font-normal text-[#050A0E]">
          {row.original.type}
        </p>
      ),
    },
    {
      accessorKey: "date",
      header: "DATE",
      cell: ({ row }) => (
        <p className="break-words text-[12px] font-normal text-[#050A0E]">
          {row.original.date}
        </p>
      ),
    },
    {
      accessorKey: "status",
      header: () => (
        <div className="flex justify-center">
          <span>STATUS</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Badge
            className={cn(
              "rounded-full px-2 py-px text-[10px] font-normal",
              statusClassMap[row.original.status],
            )}
          >
            {row.original.status}
          </Badge>
        </div>
      ),
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="flex justify-center">
          <span>ACTIONs</span>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center">
          <PropertyRowActionsMenu
            row={row.original}
            paths={paths}
            canEdit={canEdit}
          />
        </div>
      ),
      meta: {
        headerClassName: "text-center",
        cellClassName: "text-center",
      },
    },
  ];
}

export function PropertyManagementPageContent() {
  const paths = usePropertyWizardPaths();
  const { admin } = useAdminAuth();
  const { activeMembership } = useOrganizationAuth();
  const canEdit =
    paths.scope === "admin"
      ? canUpdateProperties(admin?.roles, admin?.permissions)
      : canEditOrgProperties(activeMembership?.role);

  const [activeTab, setActiveTab] = useState<StatusTab>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | PropertyType>("all");

  const apiStatus = tabToApiStatus(activeTab);
  const { data, isLoading, isError } = useScopedProperties({
    params: {
      status: apiStatus,
      limit: 100,
      offset: 0,
    },
  });

  const filteredRows = useMemo(() => {
    const rows = (data?.items ?? []).map(mapListItemToRow);
    const q = searchQuery.trim().toLowerCase();

    return rows.filter((row) => {
      if (activeTab !== "All" && row.status !== activeTab) return false;
      if (typeFilter !== "all" && row.type !== typeFilter) return false;
      if (q) {
        const hay = `${row.propertyName} ${row.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [activeTab, data?.items, searchQuery, typeFilter]);

  const pm = ADMIN_ASSETS.propertyManagement;

  const columns = useMemo(
    () => buildPropertyColumns(pm.propertyThumb, paths, canEdit),
    [canEdit, paths, pm.propertyThumb],
  );

  return (
    <Card className="w-full min-w-0 rounded-[20px] border-0 p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex flex-col gap-3 pb-3 md:flex-row md:items-center md:justify-between">
        <ScrollableTabRail className="md:max-w-[min(100%,389px)]">
          <div
            className="inline-flex h-10 shrink-0 items-center gap-1 rounded-[12px] bg-[#F5F7F8] p-1"
            role="tablist"
            aria-label="Property status"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={cn(
                    "flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-[8px] px-2.5 text-[12px] font-medium transition-colors sm:px-3",
                    isActive
                      ? "bg-white text-[#050A0E] shadow-sm"
                      : "text-[#919191] hover:text-[#050A0E]",
                  )}
                  onClick={() => {
                    setActiveTab(tab);
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </ScrollableTabRail>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit ? (
            <Button className="h-10 shrink-0" asChild>
              <Link href={paths.createListingBase}>Create listing</Link>
            </Button>
          ) : null}

          <label className="relative block h-10 w-full min-w-[200px] max-w-[230px] sm:w-[230px]">
            <span className="sr-only">Search for properties</span>
            <img
              alt=""
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 object-contain"
              src={pm.searchIcon}
            />
            <input
              className="h-10 w-full rounded-[12px] border border-[#CFE2EC] bg-white pl-9 pr-3 text-[12px] text-[#050A0E] outline-none placeholder:text-[#919191] focus-visible:ring-2 focus-visible:ring-[#5C60CC]/30"
              placeholder="Search for properties"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
          </label>

          <div className="relative h-10 min-w-[120px]">
            <select
              className="h-full w-full cursor-pointer appearance-none rounded-[12px] border border-[#CFE2EC] bg-white pl-3 pr-9 text-[12px] font-medium text-[#919191] outline-none focus-visible:ring-2 focus-visible:ring-[#5C60CC]/30"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as "all" | PropertyType);
              }}
              aria-label="Filter by property type"
            >
              <option value="all">All Type</option>
              <option value="Rental">Rental</option>
              <option value="Construction">Construction</option>
            </select>
            <img
              alt=""
              aria-hidden
              className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 object-contain"
              src={pm.chevronDown}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-[12px] text-[#919191]">
          Loading properties…
        </p>
      ) : isError ? (
        <p className="py-10 text-center text-[12px] text-[#B3261E]">
          Failed to load properties. Check your connection and try again.
        </p>
      ) : filteredRows.length === 0 ? (
        <p className="py-10 text-center text-[12px] text-[#919191]">
          No properties match your filters.
        </p>
      ) : (
        <DataTable
          columns={columns}
          data={filteredRows}
          initialPageSize={PAGE_SIZE}
          paginationResetKey={`${activeTab}-${typeFilter}-${searchQuery.trim()}`}
          className="[&_tbody_td]:text-[12px] [&_tbody_td]:font-normal [&_tbody_td]:text-[#050A0E]"
          headerCellClassName="text-[12px] font-medium uppercase tracking-wide text-[#919191]"
          renderFooter={(table) => (
            <AdminDataTablePagination
              table={table}
              prevIconSrc={pm.paginationPrev}
              nextIconSrc={pm.paginationNext}
            />
          )}
        />
      )}
    </Card>
  );
}
