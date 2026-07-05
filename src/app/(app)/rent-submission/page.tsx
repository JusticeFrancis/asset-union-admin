"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type RentRow = {
  id: string;
  propertyId: string;
  propertyName: string;
  periodStart: string;
  periodEnd: string;
  grossRent: number;
  expenses: number;
  netDistributable: number;
  status: string;
  createdAt: string;
};

type PropertyOption = { id: string; propertyName: string; name?: string };

type RentForm = {
  propertyId: string;
  periodStart: string;
  periodEnd: string;
  grossRent: string;
  expenses: string;
  managementFee: string;
  notes: string;
};

const emptyForm: RentForm = {
  propertyId: "",
  periodStart: "",
  periodEnd: "",
  grossRent: "",
  expenses: "",
  managementFee: "",
  notes: "",
};

export default function RentSubmissionPage() {
  const { admin } = useAdminAuth();
  const [items, setItems] = useState<RentRow[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<RentForm>(emptyForm);

  const canCreate = Boolean(admin?.permissions.includes("rents.create"));

  async function load() {
    try {
      const rentPromise = apiRequest<{ items: RentRow[] }>(
        `admin/rents?limit=100${status !== "all" ? `&status=${status}` : ""}`,
        { auth: true },
      );
      const propertyPromise = admin?.permissions.includes("properties.view")
        ? apiRequest<{ items: PropertyOption[] }>("admin/properties?limit=100", {
            auth: true,
          })
        : Promise.resolve({ items: [] as PropertyOption[] });
      const [rentResponse, propertyResponse] = await Promise.all([
        rentPromise,
        propertyPromise,
      ]);
      setItems(rentResponse.items);
      setProperties(propertyResponse.items);
      setMessage("");
    } catch (error: any) {
      setMessage(error.message || "Unable to load rent submissions.");
    }
  }

  useEffect(() => {
    void load();
  }, [status, admin?.permissions]);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    try {
      await apiRequest("admin/rents", {
        method: "POST",
        json: {
          ...form,
          grossRent: Number(form.grossRent),
          expenses: Number(form.expenses || 0),
          managementFee: Number(form.managementFee || 0),
        },
        auth: true,
      });
      setShowCreate(false);
      setForm(emptyForm);
      setMessage("Rent submission created.");
      await load();
    } catch (error: any) {
      setMessage(error.message || "Unable to create rent submission.");
    }
  }

  const badge = (value: string) =>
    value === "approved" || value === "distributed"
      ? "bg-[#AFF4C6] text-[#009951]"
      : value === "rejected"
        ? "bg-[#F9DEDC] text-[#B3261E]"
        : value === "submitted"
          ? "bg-[#D0E6F1] text-[#377d9f]"
          : "bg-[#F5F7F8] text-[#575757]";

  return (
    <div className="space-y-4">
      <Card className="w-full rounded-[20px] border-0 p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px]"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="distributed">Distributed</option>
            <option value="rejected">Rejected</option>
          </select>
          {canCreate ? (
            <button
              onClick={() => setShowCreate((value) => !value)}
              className="h-10 rounded-[12px] bg-[#5c60cc] px-4 text-[12px] font-medium text-white"
            >
              {showCreate ? "Close" : "Create Rent Submission"}
            </button>
          ) : null}
        </div>

        {message ? (
          <p className="mt-3 rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px]">
            {message}
          </p>
        ) : null}

        {showCreate && canCreate ? (
          <form
            onSubmit={create}
            className="mt-5 grid gap-3 rounded-[16px] border border-[#edf4f8] p-4 md:grid-cols-3"
          >
            <Field label="Property">
              <select
                required
                value={form.propertyId}
                onChange={(event) =>
                  setForm({ ...form, propertyId: event.target.value })
                }
              >
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.propertyName || property.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Period Start">
              <input
                required
                type="date"
                value={form.periodStart}
                onChange={(event) =>
                  setForm({ ...form, periodStart: event.target.value })
                }
              />
            </Field>
            <Field label="Period End">
              <input
                required
                type="date"
                value={form.periodEnd}
                onChange={(event) =>
                  setForm({ ...form, periodEnd: event.target.value })
                }
              />
            </Field>
            <Field label="Gross Rent">
              <input
                required
                type="number"
                min="0"
                value={form.grossRent}
                onChange={(event) =>
                  setForm({ ...form, grossRent: event.target.value })
                }
              />
            </Field>
            <Field label="Expenses">
              <input
                type="number"
                min="0"
                value={form.expenses}
                onChange={(event) =>
                  setForm({ ...form, expenses: event.target.value })
                }
              />
            </Field>
            <Field label="Management Fee">
              <input
                type="number"
                min="0"
                value={form.managementFee}
                onChange={(event) =>
                  setForm({ ...form, managementFee: event.target.value })
                }
              />
            </Field>
            <label className="space-y-1 md:col-span-3">
              <span className="text-[11px] font-medium">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                className="min-h-20 w-full rounded-[12px] border border-[#cfe2ec] p-3 text-[12px]"
              />
            </label>
            <button className="h-10 rounded-[12px] bg-[#5c60cc] px-4 text-[12px] font-medium text-white md:col-start-3">
              Save Submission
            </button>
          </form>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-[12px] border border-[#edf4f8]">
          <table className="w-full min-w-[850px]">
            <thead className="bg-[#f5f7f8] text-left text-[11px] uppercase text-[#919191]">
              <tr>
                <th className="px-4 py-3">Property</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Gross Rent</th>
                <th className="px-4 py-3">Expenses</th>
                <th className="px-4 py-3">Net Distributable</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? (
                items.map((rent) => (
                  <tr key={rent.id} className="border-t border-[#edf4f8] text-[12px]">
                    <td className="px-4 py-3 font-medium">{rent.propertyName}</td>
                    <td className="px-4 py-3">
                      {new Date(rent.periodStart).toLocaleDateString()} –{" "}
                      {new Date(rent.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">${rent.grossRent.toLocaleString()}</td>
                    <td className="px-4 py-3">${rent.expenses.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      ${rent.netDistributable.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-full px-2 py-1 text-[10px] capitalize", badge(rent.status))}>
                        {rent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/rent-submission/${rent.id}`}
                        className="rounded-lg bg-[#edf4f8] px-3 py-2"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[12px] text-[#919191]">
                    No rent submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1">
      <span className="text-[11px] font-medium">{label}</span>
      <div className="[&>input]:h-10 [&>input]:w-full [&>input]:rounded-[12px] [&>input]:border [&>input]:border-[#cfe2ec] [&>input]:px-3 [&>input]:text-[12px] [&>select]:h-10 [&>select]:w-full [&>select]:rounded-[12px] [&>select]:border [&>select]:border-[#cfe2ec] [&>select]:bg-white [&>select]:px-3 [&>select]:text-[12px]">
        {children}
      </div>
    </label>
  );
}
