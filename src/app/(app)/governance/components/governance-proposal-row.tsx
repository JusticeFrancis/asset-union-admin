import Link from "next/link";
import { Clock, UserRound } from "lucide-react";

import type { GovernanceProposalRecord } from "@/app/(app)/governance/data/governance-records";
import { cn } from "@/lib/utils";

type GovernanceProposalRowProps = {
  proposal: GovernanceProposalRecord;
};

export function GovernanceProposalRow({
  proposal,
}: GovernanceProposalRowProps) {
  const forWidth = proposal.forPct;
  const againstWidth = proposal.againstPct;

  return (
    <Link
      className="flex w-full flex-col gap-3 rounded-[20px] border border-[#cfe2ec] p-4 transition-colors hover:bg-[#fafcfd] lg:flex-row lg:items-center lg:justify-between"
      href={`/governance/proposal/${proposal.slug}`}
    >
      <div className="flex min-w-0 flex-1 gap-6">
        <div className="flex min-w-0 gap-2">
          <div className="flex h-9 w-[41px] shrink-0 items-center justify-center rounded-lg bg-[#aff4c6] text-[14px] font-normal text-[#009951]">
            $
          </div>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[16px] font-normal text-[#050a0e]">
                {proposal.title}
              </span>
              {proposal.listUserVoteLabel ? (
                <span className="rounded-[40px] bg-[#e0e1f5] px-2 py-px text-[10px] font-normal text-[#8672ca]">
                  {proposal.listUserVoteLabel}
                </span>
              ) : null}
            </div>
            <p className="text-[14px] font-normal text-[#919191]">
              {proposal.propertyLine}
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[380px] lg:items-end">
        <div className="flex w-full flex-col gap-1">
          <div className="flex w-full items-center justify-between text-[12px]">
            <span>
              <span className="font-medium text-[#919191]">For:</span>{" "}
              <span className="font-normal text-[#14ae5c]">{forWidth}%</span>
            </span>
            <span>
              <span className="font-medium text-[#919191]">Against:</span>{" "}
              <span className="font-normal text-[#bf6a02]">
                {againstWidth}%
              </span>
            </span>
          </div>
          <div className="relative h-[6px] w-full overflow-hidden rounded-full bg-[#f5f7f8]">
            <div
              className="absolute left-0 top-0 h-full rounded-l-full bg-[#14ae5c]"
              style={{ width: `${forWidth}%` }}
            />
            <div
              className={cn(
                "absolute top-0 h-full rounded-r-full bg-[#bf6a02]",
              )}
              style={{
                left: `${forWidth}%`,
                width: `${againstWidth}%`,
              }}
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[12px] font-light text-[#919191]">
          <span
            className={cn(
              "rounded-[40px] px-2 py-1 text-[10px] font-normal",
              proposal.status === "active"
                ? "bg-[#aff4c6] text-[#009951]"
                : "bg-[#f5f7f8] text-[#919191]",
            )}
          >
            {proposal.status === "active" ? "Active" : "Closed"}
          </span>
          <span className="flex items-center gap-1">
            <UserRound
              aria-hidden
              className="size-3.5 shrink-0"
              strokeWidth={1.5}
            />
            {proposal.proposerNote}
          </span>
          <span aria-hidden className="hidden sm:inline">
            •
          </span>
          <span>{proposal.eligibleVotes.toLocaleString()} votes eligible</span>
          {proposal.daysLeft ? (
            <>
              <span aria-hidden className="hidden sm:inline">
                •
              </span>
              <span className="flex items-center gap-1">
                <Clock
                  aria-hidden
                  className="size-3.5 shrink-0"
                  strokeWidth={1.5}
                />
                {proposal.daysLeft}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
