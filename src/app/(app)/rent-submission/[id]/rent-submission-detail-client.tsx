"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { apiRequest } from "@/lib/api/client";

export function RentSubmissionDetailClient({ id }: { id: string }) {
  const { admin } = useAdminAuth();
  const [rent, setRent] = useState<any>(null);
  const [message, setMessage] = useState("");
  const canUpdate = Boolean(admin?.permissions.includes("rents.update"));
  const canApprove = Boolean(admin?.permissions.includes("rents.approve"));

  useEffect(() => {
    void apiRequest(`admin/rents/${id}`, { auth: true })
      .then(setRent)
      .catch((error: any) => setMessage(error.message));
  }, [id]);

  async function update(status: string) {
    try {
      setRent(
        await apiRequest(`admin/rents/${id}`, {
          method: "PATCH",
          json: { status },
          auth: true,
        }),
      );
      setMessage(`Rent submission ${status}.`);
    } catch (error: any) {
      setMessage(error.message || "Unable to update rent submission.");
    }
  }

  if (!rent) {
    return (
      <p className="py-10 text-center text-[12px] text-[#919191]">
        {message || "Loading submission…"}
      </p>
    );
  }

  return (
    <Card className="mx-auto max-w-[900px] rounded-[20px] border-0">
      <CardContent className="space-y-5 p-5 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[18px] font-medium">{rent.propertyName}</h2>
            <p className="mt-1 text-[12px] text-[#919191]">
              {new Date(rent.periodStart).toLocaleDateString()} –{" "}
              {new Date(rent.periodEnd).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            {rent.status === "draft" && canUpdate ? (
              <button
                onClick={() => update("submitted")}
                className="h-10 rounded-[12px] bg-[#5c60cc] px-4 text-[12px] text-white"
              >
                Submit
              </button>
            ) : null}
            {rent.status === "submitted" && canApprove ? (
              <>
                <button
                  onClick={() => update("approved")}
                  className="h-10 rounded-[12px] bg-[#14ae5c] px-4 text-[12px] text-white"
                >
                  Approve
                </button>
                <button
                  onClick={() => update("rejected")}
                  className="h-10 rounded-[12px] bg-[#b3261e] px-4 text-[12px] text-white"
                >
                  Reject
                </button>
              </>
            ) : null}
            {rent.status === "approved" && canApprove ? (
              <button
                onClick={() => update("distributed")}
                className="h-10 rounded-[12px] bg-[#5c60cc] px-4 text-[12px] text-white"
              >
                Mark Distributed
              </button>
            ) : null}
          </div>
        </div>

        {message ? (
          <p className="rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px]">
            {message}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-4">
          {[
            ["Gross Rent", rent.grossRent],
            ["Expenses", rent.expenses],
            ["Management Fee", rent.managementFee],
            ["Net Distributable", rent.netDistributable],
          ].map(([label, value]) => (
            <div key={label as string} className="rounded-[12px] border border-[#cfe2ec] p-4">
              <p className="text-[11px] text-[#919191]">{label}</p>
              <p className="mt-2 text-[17px] font-medium">
                ${Number(value).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="rounded-[12px] border border-[#cfe2ec] p-4">
          <p className="text-[12px] font-medium">Status</p>
          <p className="mt-2 capitalize text-[13px]">{rent.status}</p>
          <p className="mt-4 text-[12px] font-medium">Notes</p>
          <p className="mt-2 text-[12px] text-[#575757]">
            {rent.notes || "No notes supplied."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
