"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/api/client";

type DashboardCard = {
  key: string;
  label: string;
  value: number;
  format?: "currency";
};

type DashboardData = {
  cards: DashboardCard[];
  monthlyRent: Array<{ _id: { year: number; month: number }; gross: number; net: number }>;
  recentActivity: Array<{
    id: string;
    actorName: string;
    action: string;
    resourceName?: string;
    createdAt: string;
  }>;
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void apiRequest<DashboardData>("admin/dashboard", { auth: true })
      .then(setData)
      .catch((requestError: Error) => setError(requestError.message));
  }, []);

  if (!data) {
    return <p className="py-10 text-center text-[12px] text-[#919191]">{error || "Loading dashboard…"}</p>;
  }

  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data.cards.map((card) => (
          <Card key={card.key} className="rounded-[16px] border-0 p-4 shadow-sm">
            <p className="text-[11px] font-medium text-[#919191]">{card.label}</p>
            <p className="mt-3 text-[24px] font-medium text-[#050a0e]">
              {card.format === "currency"
                ? `$${Number(card.value).toLocaleString()}`
                : Number(card.value).toLocaleString()}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_.75fr]">
        {data.monthlyRent.length ? (
          <Card className="rounded-[20px] border-0 p-5">
            <h2 className="text-[15px] font-medium">Rent Performance</h2>
            <div className="mt-5 flex h-52 items-end gap-3">
              {data.monthlyRent.map((month) => {
                const max = Math.max(...data.monthlyRent.map((item) => item.gross), 1);
                return (
                  <div key={`${month._id.year}-${month._id.month}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                    <div className="flex h-40 w-full items-end rounded-t-lg bg-[#edf4f8]">
                      <div
                        className="w-full rounded-t-lg bg-[#5c60cc]"
                        style={{ height: `${Math.max(4, Math.round((month.gross / max) * 100))}%` }}
                        title={`Gross $${month.gross}`}
                      />
                    </div>
                    <span className="text-[10px] text-[#919191]">{month._id.month}/{String(month._id.year).slice(-2)}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        ) : null}

        <Card className={`rounded-[20px] border-0 p-5 ${data.monthlyRent.length ? "" : "lg:col-span-2"}`}>
          <h2 className="text-[15px] font-medium">Recent Activity</h2>
          <div className="mt-4 space-y-4">
            {data.recentActivity.length ? data.recentActivity.map((activity) => (
              <div key={activity.id} className="border-b border-[#edf4f8] pb-3 last:border-0">
                <p className="text-[12px] font-medium">{activity.action}</p>
                <p className="mt-1 text-[11px] text-[#919191]">
                  {activity.actorName}{activity.resourceName ? ` · ${activity.resourceName}` : ""}
                </p>
                <p className="mt-1 text-[10px] text-[#919191]">{new Date(activity.createdAt).toLocaleString()}</p>
              </div>
            )) : <p className="text-[12px] text-[#919191]">No activity yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
