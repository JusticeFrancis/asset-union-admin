"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type Proposal = {
  id: string;
  slug: string;
  title: string;
  propertyName: string;
  category: string;
  estimatedCost: number;
  closesAt: string;
  status: string;
  voteStats: { for: number; against: number; abstain: number; total: number };
  currentVote?: string;
};

export default function GovernancePage() {
  const { admin } = useAdminAuth();
  const [items, setItems] = useState<Proposal[]>([]);
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");

  const canCreate = Boolean(admin?.permissions.includes("governance.create"));
  const canVote = Boolean(admin?.permissions.includes("governance.vote"));

  async function load() {
    try {
      const response = await apiRequest<{ items: Proposal[] }>(
        `admin/governance?limit=100${status !== "all" ? `&status=${status}` : ""}`,
        { auth: true },
      );
      setItems(response.items);
      setMessage("");
    } catch (error: any) {
      setMessage(error.message || "Unable to load governance proposals.");
    }
  }

  useEffect(() => {
    void load();
  }, [status]);

  async function vote(id: string, choice: string) {
    try {
      await apiRequest(`admin/governance/${id}/vote`, {
        method: "POST",
        json: { choice },
        auth: true,
      });
      setMessage(`Vote recorded: ${choice}.`);
      await load();
    } catch (error: any) {
      setMessage(error.message || "Unable to record vote.");
    }
  }

  const active = items.filter((item) => item.status === "active").length;
  const totalVotes = items.reduce((sum, item) => sum + item.voteStats.total, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Total Proposals", items.length],
          ["Active Votes", active],
          ["Votes Recorded", totalVotes],
        ].map(([label, value]) => (
          <Card key={label as string} className="rounded-[16px] border-0 p-4">
            <p className="text-[11px] text-[#919191]">{label}</p>
            <p className="mt-2 text-[22px] font-medium">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="rounded-[20px] border-0 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px]"
          >
            <option value="all">All Proposals</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="closed">Closed</option>
          </select>
          {canCreate ? (
            <Link
              href="/governance/create"
              className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#5c60cc] px-4 text-[12px] font-medium text-white"
            >
              Create Proposal
            </Link>
          ) : null}
        </div>

        {message ? (
          <p className="mt-3 rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px]">
            {message}
          </p>
        ) : null}

        <div className="mt-4 space-y-3">
          {items.length ? (
            items.map((proposal) => (
              <div
                key={proposal.id}
                className="rounded-[16px] border border-[#edf4f8] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <Link
                      href={`/governance/proposal/${proposal.slug}`}
                      className="text-[15px] font-medium text-[#050a0e] hover:text-[#5c60cc]"
                    >
                      {proposal.title}
                    </Link>
                    <p className="mt-1 text-[12px] text-[#919191]">
                      {proposal.propertyName} · {proposal.category} · closes{" "}
                      {new Date(proposal.closesAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "w-fit rounded-full px-2 py-1 text-[10px] capitalize",
                      proposal.status === "active"
                        ? "bg-[#AFF4C6] text-[#009951]"
                        : "bg-[#F5F7F8] text-[#575757]",
                    )}
                  >
                    {proposal.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex justify-between text-[10px] text-[#919191]">
                      <span>For {proposal.voteStats.for}</span>
                      <span>Against {proposal.voteStats.against}</span>
                      <span>Abstain {proposal.voteStats.abstain}</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf4f8]">
                      <div
                        className="h-full bg-[#5c60cc]"
                        style={{
                          width: `${
                            proposal.voteStats.total
                              ? Math.round(
                                  (proposal.voteStats.for /
                                    proposal.voteStats.total) *
                                    100,
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                  {proposal.status === "active" && canVote ? (
                    <div className="flex gap-2">
                      {["for", "against", "abstain"].map((choice) => (
                        <button
                          key={choice}
                          onClick={() => vote(proposal.id, choice)}
                          className={cn(
                            "rounded-lg px-3 py-2 text-[11px] capitalize",
                            proposal.currentVote === choice
                              ? "bg-[#5c60cc] text-white"
                              : "bg-[#edf4f8]",
                          )}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-[12px] text-[#919191]">
              No governance proposals found.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
