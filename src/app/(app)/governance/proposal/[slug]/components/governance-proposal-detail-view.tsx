"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { GovernanceVoteConfirmModal } from "@/app/(app)/governance/components/governance-vote-confirm-modal";
import type {
  GovernanceProposalRecord,
  GovernanceVoteChoice,
} from "@/app/(app)/governance/data/governance-records";
import { cn } from "@/lib/utils";

const voteRadioIcons = ADMIN_ASSETS.createListing.icons;

type GovernanceProposalDetailViewProps = {
  proposal: GovernanceProposalRecord;
};

function proposalTitleForModal(title: string): string {
  const parts = title.split("—");
  return parts[0]?.trim() ?? title;
}

function VoteBar({
  label,
  count,
  pct,
  colorClass,
  dotClass,
}: {
  label: string;
  count: number;
  pct: number;
  colorClass: string;
  dotClass: string;
}) {
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex w-full items-center justify-between text-[12px] leading-normal">
        <div className="flex items-center gap-1">
          <span className={cn("size-2 shrink-0 rounded-full", dotClass)} />
          <span className="font-normal text-[#050a0e]">{label}</span>
        </div>
        <div className="flex items-center gap-1 font-normal">
          <span className="text-[#050a0e]">{count.toLocaleString()}</span>
          <span className="text-[#919191]">{pct}%</span>
        </div>
      </div>
      <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#f5f7f8]">
        <div
          className={cn("h-full rounded-full", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function GovernanceProposalDetailView({
  proposal,
}: GovernanceProposalDetailViewProps) {
  const [choice, setChoice] = useState<GovernanceVoteChoice>("for");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [hasVoted, setHasVoted] = useState(!!proposal.seedHasVoted);
  const [voteSummary, setVoteSummary] = useState(
    proposal.userVoteSummary ?? null,
  );

  const votingWeightLabel = useMemo(
    () => `${proposal.userVotingPower.toLocaleString()} votes`,
    [proposal.userVotingPower],
  );

  const showVotePanel = proposal.status === "active" && !hasVoted;
  const showAfterVoteCard = proposal.status === "active" && hasVoted;

  const onConfirmVote = () => {
    const dateLabel = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    setVoteSummary({
      choice,
      votes: proposal.userVotingPower,
      dateLabel,
    });
    setHasVoted(true);
  };

  const choiceLabel = (c: GovernanceVoteChoice) => {
    if (c === "for") return "For";
    if (c === "against") return "Against";
    return "Abstain";
  };

  const voteOption = (value: GovernanceVoteChoice) => {
    const checked = choice === value;
    return (
      <label
        className={cn(
          "flex w-full cursor-pointer items-start gap-3 rounded-[16px] border p-4 text-left transition-colors",
          checked
            ? "border-[#5c60cc] bg-[rgba(92,96,204,0.15)]"
            : "border-[#cfe2ec] bg-white",
        )}
      >
        <input
          checked={checked}
          className="sr-only"
          name="governance-vote"
          onChange={() => setChoice(value)}
          type="radio"
          value={value}
        />
        <img
          alt=""
          className="mt-0.5 size-[14px] shrink-0"
          height={14}
          src={
            checked
              ? voteRadioIcons.radioSelected
              : voteRadioIcons.radioUnselected
          }
          width={14}
        />
        <span className="flex min-w-0 flex-col gap-1 text-[12px] leading-normal">
          <span className="font-normal text-[#050a0e]">
            {choiceLabel(value)}
          </span>
          <span className="font-light text-[#919191]">
            {proposal.voteBlurbs[value]}
          </span>
        </span>
      </label>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-[1118px] flex-col gap-5 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div className="rounded-[20px] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-[24px] bg-[#aff4c6] px-2 py-1 text-[12px] font-normal text-[#009951]">
                  {proposal.categoryLabel}
                </span>
                <span className="flex items-center gap-2 rounded-[24px] bg-[#aff4c6] px-2 py-1 text-[12px] font-normal text-[#009951]">
                  <span className="size-2 shrink-0 rounded-full bg-[#009951]" />
                  {proposal.status === "active" ? "Active" : "Closed"}
                </span>
              </div>
              <h1 className="text-[19px] font-medium leading-normal text-[#050a0e]">
                {proposal.title}
              </h1>
              <p className="text-[12px] font-normal text-[#919191]">
                {proposal.locationDetail}
              </p>
            </div>
            <p className="text-[12px] font-normal leading-normal text-[#919191]">
              {proposal.description}
            </p>
            <div className="h-px w-full bg-[#cfe2ec]" />
            <dl className="flex flex-col gap-3 text-[12px] leading-normal">
              <div className="flex items-center justify-between gap-4">
                <dt className="font-light text-[#919191]">Proposed by</dt>
                <dd className="font-normal text-[#050a0e]">
                  {proposal.proposedBy}
                </dd>
              </div>
              <div className="h-px w-full bg-[#cfe2ec]" />
              <div className="flex items-center justify-between gap-4">
                <dt className="font-light text-[#919191]">Date submitted</dt>
                <dd className="font-normal text-[#050a0e]">
                  {proposal.dateSubmitted}
                </dd>
              </div>
              <div className="h-px w-full bg-[#cfe2ec]" />
              <div className="flex items-center justify-between gap-4">
                <dt className="font-light text-[#919191]">Voting closes</dt>
                <dd className="font-normal text-[#bf6a02]">
                  {proposal.votingCloses}
                </dd>
              </div>
              <div className="h-px w-full bg-[#cfe2ec]" />
              <div className="flex items-center justify-between gap-4">
                <dt className="font-light text-[#919191]">Cost</dt>
                <dd className="font-normal text-[#050a0e]">{proposal.cost}</dd>
              </div>
              <div className="h-px w-full bg-[#cfe2ec]" />
              <div className="flex items-center justify-between gap-4">
                <dt className="font-light text-[#919191]">Quorum required</dt>
                <dd className="font-normal text-[#050a0e]">
                  {proposal.quorumRequired}
                </dd>
              </div>
              {voteSummary ? (
                <>
                  <div className="h-px w-full bg-[#cfe2ec]" />
                  <div className="flex items-center justify-between gap-4">
                    <dt className="font-light text-[#919191]">Your vote</dt>
                    <dd className="font-normal text-[#050a0e]">
                      {choiceLabel(voteSummary.choice)} (
                      {voteSummary.votes.toLocaleString()} votes)
                    </dd>
                  </div>
                </>
              ) : null}
            </dl>
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]">
          <div className="mb-4 flex flex-col gap-1">
            <h2 className="text-[14px] font-normal text-[#050a0e]">
              Current vote count
            </h2>
            <p className="text-[14px] font-light text-[#919191]">
              {proposal.castSummary}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <VoteBar
              colorClass="bg-[#14ae5c]"
              count={proposal.voteTally.for.count}
              dotClass="bg-[#14ae5c]"
              label="For"
              pct={proposal.voteTally.for.pct}
            />
            <VoteBar
              colorClass="bg-[#bf6a02]"
              count={proposal.voteTally.against.count}
              dotClass="bg-[#bf6a02]"
              label="Against"
              pct={proposal.voteTally.against.pct}
            />
            <VoteBar
              colorClass="bg-[#919191]"
              count={proposal.voteTally.abstain.count}
              dotClass="bg-[#919191]"
              label="Abstain"
              pct={proposal.voteTally.abstain.pct}
            />
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#cff7d3] px-6 py-2">
            <Check
              aria-hidden
              className="size-4 shrink-0 text-[#14ae5c]"
              strokeWidth={2}
            />
            <p className="text-[12px] font-normal text-[#14ae5c]">
              {proposal.quorumMessage}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full shrink-0 lg:w-[359px]">
        {proposal.status === "closed" ? (
          <div className="rounded-[20px] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]">
            <h2 className="text-[14px] font-normal text-[#050a0e]">
              Voting closed
            </h2>
            <p className="mt-1 text-[14px] font-light text-[#919191]">
              This proposal is no longer accepting votes.
            </p>
            {voteSummary ? (
              <div className="mt-4 rounded-[16px] bg-[rgba(92,96,204,0.15)] p-4">
                <p className="text-[10px] font-light uppercase tracking-wide text-[#919191]">
                  You voted
                </p>
                <p className="mt-1 text-[16px] font-normal text-[#5c60cc]">
                  {choiceLabel(voteSummary.choice)}
                </p>
                <p className="mt-1 text-[10px] font-light text-[#919191]">
                  {voteSummary.votes.toLocaleString()} votes ·{" "}
                  {voteSummary.dateLabel}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {showAfterVoteCard && voteSummary ? (
          <div className="rounded-[20px] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]">
            <div className="flex flex-col gap-1">
              <h2 className="text-[14px] font-normal text-[#050a0e]">
                Your vote
              </h2>
              <p className="text-[14px] font-light text-[#919191]">
                Voting is still ongoing
              </p>
            </div>
            <div className="mt-4 rounded-[16px] bg-[rgba(92,96,204,0.15)] p-4">
              <p className="text-[10px] font-light uppercase tracking-wide text-[#919191]">
                You voted
              </p>
              <p className="mt-1 text-[16px] font-normal text-[#5c60cc]">
                {choiceLabel(voteSummary.choice)}
              </p>
              <p className="mt-1 text-[10px] font-light text-[#919191]">
                {voteSummary.votes.toLocaleString()} votes ·{" "}
                {voteSummary.dateLabel}
              </p>
            </div>
          </div>
        ) : null}

        {showVotePanel ? (
          <div className="rounded-[20px] bg-white p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]">
            <div className="flex flex-col gap-1">
              <h2 className="text-[14px] font-normal text-[#050a0e]">
                Cast your vote
              </h2>
              <p className="text-[14px] font-light text-[#919191]">
                You have {votingWeightLabel} on this proposal
              </p>
            </div>
            <div className="mt-4 rounded-[16px] bg-[#f5f7f8] px-4 py-3">
              <p className="text-[12px] font-light text-[#919191]">
                Your voting weight
              </p>
              <p className="mt-1 text-[14px] font-normal text-[#050a0e]">
                {votingWeightLabel}
              </p>
              <p className="mt-1 text-[12px] font-light text-[#919191]">
                Based on {proposal.userVotingPower.toLocaleString()} tokens held
              </p>
            </div>
            <div
              aria-label="Your vote"
              className="mt-2 flex flex-col gap-2"
              role="radiogroup"
            >
              {voteOption("for")}
              {voteOption("against")}
              {voteOption("abstain")}
            </div>
            <div className="mt-3 flex flex-col gap-3">
              <button
                className="flex h-10 w-full items-center justify-center gap-1 rounded-[12px] bg-[#5c60cc] text-[12px] font-medium text-[#f5f7f8] transition-opacity hover:opacity-95"
                type="button"
                onClick={() => setConfirmOpen(true)}
              >
                <Check aria-hidden className="size-5" strokeWidth={2} />
                Cast Vote
              </button>
              <p className="text-center text-[10px] font-light text-[#919191]">
                Votes are final. Once cast, your vote cannot be changed.
                Recorded on-chain.
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <GovernanceVoteConfirmModal
        choice={choice}
        onConfirm={onConfirmVote}
        onOpenChange={setConfirmOpen}
        open={confirmOpen}
        propertyLabel={proposal.propertyShort}
        proposalTitleShort={proposalTitleForModal(proposal.title)}
        votingWeightLabel={votingWeightLabel}
      />
    </div>
  );
}
