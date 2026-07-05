"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";

import type { GovernanceVoteChoice } from "@/app/(app)/governance/data/governance-records";

type GovernanceVoteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposalTitleShort: string;
  propertyLabel: string;
  choice: GovernanceVoteChoice;
  votingWeightLabel: string;
  onConfirm: () => void;
};

function voteChoiceLabel(choice: GovernanceVoteChoice): string {
  if (choice === "for") return "For";
  if (choice === "against") return "Against";
  return "Abstain";
}

function voteChoiceColorClass(choice: GovernanceVoteChoice): string {
  if (choice === "for") return "text-[#14ae5c]";
  if (choice === "against") return "text-[#bf6a02]";
  return "text-[#919191]";
}

export function GovernanceVoteConfirmModal({
  open,
  onOpenChange,
  proposalTitleShort,
  propertyLabel,
  choice,
  votingWeightLabel,
  onConfirm,
}: GovernanceVoteConfirmModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      panelRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!mounted || !open) return null;

  const rowClass =
    "flex w-full items-center justify-between gap-4 text-[12px] leading-normal whitespace-nowrap";
  const labelClass = "font-light text-[#919191]";
  const valueClass = "font-normal text-[#050a0e] text-right";

  const content = (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="dialog"
    >
      <button
        aria-label="Close dialog"
        className="absolute inset-0 backdrop-blur-[7.5px] bg-[rgba(5,10,14,0.4)]"
        type="button"
        onClick={close}
      />
      <div
        className="relative z-10 w-full max-w-[434px] rounded-[20px] bg-white px-6 pt-12 pb-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)] outline-none"
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="absolute right-6 top-6 flex justify-end">
          <button
            aria-label="Close"
            className="flex size-6 items-center justify-center rounded-full transition-opacity hover:opacity-80"
            type="button"
            onClick={close}
          >
            <img
              alt=""
              aria-hidden
              className="size-6"
              src={ADMIN_ASSETS.governance.modalClose}
            />
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="relative size-[71px] shrink-0">
            <img
              alt=""
              aria-hidden
              className="size-full max-w-none"
              src={ADMIN_ASSETS.governance.voteConfirmHeader}
            />
          </div>

          <div className="flex w-full flex-col items-center gap-1 px-3 text-center">
            <h2
              className="text-[16px] font-medium leading-normal text-[#050a0e]"
              id={titleId}
            >
              Confirm Your Vote
            </h2>
            <p className="text-[12px] font-medium leading-normal text-[#919191]">
              This vote will be recorded on-chain immediately after
              confirmation.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 rounded-[16px] bg-[#f5f7f8] p-4">
            <div className={rowClass}>
              <span className={labelClass}>Proposal</span>
              <span className={`${valueClass} max-w-[55%] truncate`}>
                {proposalTitleShort}
              </span>
            </div>
            <div className="h-px w-full bg-[#cfe2ec]" />
            <div className={rowClass}>
              <span className={labelClass}>Property</span>
              <span className={`${valueClass} max-w-[55%] truncate`}>
                {propertyLabel}
              </span>
            </div>
            <div className="h-px w-full bg-[#cfe2ec]" />
            <div className={rowClass}>
              <span className={labelClass}>Your vote</span>
              <span
                className={`font-normal text-right ${voteChoiceColorClass(choice)}`}
              >
                {voteChoiceLabel(choice)}
              </span>
            </div>
            <div className="h-px w-full bg-[#cfe2ec]" />
            <div className={rowClass}>
              <span className={labelClass}>Voting weight</span>
              <span className={valueClass}>{votingWeightLabel}</span>
            </div>
          </div>

          <div className="flex w-full items-center gap-2 rounded-lg bg-[#fffbeb] px-6 py-2">
            <span
              aria-hidden
              className="text-[14px] font-medium text-[#bf6a02]"
            >
              !
            </span>
            <p className="text-left text-[12px] font-normal text-[#050a0e]">
              Votes are final and irreversible.
            </p>
          </div>

          <div className="flex w-full gap-2">
            <button
              className="flex h-10 min-h-10 flex-1 cursor-pointer items-center justify-center rounded-[12px] border border-[#cfe2ec] bg-white px-4 text-[12px] font-medium leading-none text-[#050a0e] transition-opacity hover:opacity-95"
              type="button"
              onClick={close}
            >
              Cancel
            </button>
            <button
              className="flex h-10 min-h-10 flex-1 cursor-pointer items-center justify-center rounded-[12px] bg-[#5c60cc] px-4 text-[12px] font-medium leading-none text-[#f5f7f8] transition-opacity hover:opacity-95"
              type="button"
              onClick={() => {
                onConfirm();
                close();
              }}
            >
              Confirm Vote
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
