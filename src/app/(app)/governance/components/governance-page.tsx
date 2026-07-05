"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { GovernanceProposalRow } from "@/app/(app)/governance/components/governance-proposal-row";
import { GovernanceStatsBanner } from "@/app/(app)/governance/components/governance-stats-banner";
import { getGovernanceProposals } from "@/app/(app)/governance/data/governance-records";
import { ScrollableTabRail } from "@/app/components/scrollable-tab-rail";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "closed";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "closed", label: "Closed" },
];

export default function GovernancePage() {
  const proposals = useMemo(() => getGovernanceProposals(), []);
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return proposals;
    return proposals.filter((p) => p.status === filter);
  }, [filter, proposals]);

  return (
    <div className="mx-auto flex w-full max-w-[1118px] flex-col gap-8">
      <GovernanceStatsBanner
        activeCount={3}
        passedCount={9}
        votedCount={11}
        votingPower={478}
      />

      <div className="flex flex-col gap-4 rounded-[32px] bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[19px] font-medium text-[#050a0e]">Proposals</h2>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
            <ScrollableTabRail className="max-w-full sm:max-w-none">
              <div className="inline-flex w-max max-w-full items-center gap-1 rounded-[40px] bg-[#f5f7f8] p-1 sm:gap-2">
                {FILTERS.map(({ id, label }) => (
                  <button
                    className={cn(
                      "shrink-0 whitespace-nowrap rounded-[40px] px-3 py-2 text-[13px] transition-colors sm:px-4 sm:text-[14px]",
                      filter === id
                        ? "bg-white font-normal text-[#050a0e] shadow-sm"
                        : "font-medium text-[#919191]",
                    )}
                    key={id}
                    type="button"
                    onClick={() => setFilter(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </ScrollableTabRail>
            <Link
              className="flex h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-[#5c60cc] px-3 text-[12px] font-medium text-[#f5f7f8] transition-opacity hover:opacity-95 "
              href="/governance/create"
            >
              <Plus
                aria-hidden
                className="size-3.5 text-[#f5f7f8]"
                strokeWidth={1.75}
              />
              <span className="hidden sm:inline text-[#f5f7f8]">
                Create Proposal
              </span>
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((p) => (
            <GovernanceProposalRow key={p.slug} proposal={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
