"use client";

import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Card } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  kycStatus: string;
  accountType: string;
  createdAt: string;
};

const badge = (status: string) =>
  status === "active" || status === "verified"
    ? "bg-[#AFF4C6] text-[#009951]"
    : status === "suspended" || status === "rejected"
      ? "bg-[#F9DEDC] text-[#B3261E]"
      : "bg-[#FFE8A3] text-[#975102]";

export default function UserManagementPage() {
  const router = useRouter();
  const { admin } = useAdminAuth();
  const [items, setItems] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [kyc, setKyc] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const canUpdate = Boolean(admin?.permissions.includes("users.update"));

  async function load() {
    setLoading(true);
    try {
      const response = await apiRequest<{ items: UserRow[] }>(
        `admin/users?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}${status !== "all" ? `&status=${status}` : ""}`,
        { auth: true },
      );
      setItems(
        response.items.filter((user) => kyc === "all" || user.kycStatus === kyc),
      );
      setMessage("");
    } catch (error: any) {
      setMessage(error.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [search, status, kyc]);

  async function setUserStatus(id: string, nextStatus: string) {
    try {
      await apiRequest(`admin/users/${id}`, {
        method: "PATCH",
        json: { status: nextStatus },
        auth: true,
      });
      setMessage(`User ${nextStatus === "suspended" ? "suspended" : "reactivated"}.`);
      await load();
    } catch (error: any) {
      setMessage(error.message || "Unable to update user status.");
    }
  }

  return (
    <Card className="w-full min-w-0 rounded-[20px] border-0 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_170px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users"
            className="h-10 rounded-[12px] border border-[#cfe2ec] px-3 text-[12px] outline-none"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px]"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={kyc}
            onChange={(event) => setKyc(event.target.value)}
            className="h-10 rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px]"
          >
            <option value="all">All KYC Status</option>
            <option value="not_started">Not Started</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {message ? (
          <p className="rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px]">
            {message}
          </p>
        ) : null}

        <div className="overflow-x-auto rounded-[12px] border border-[#edf4f8]">
          <table className="w-full min-w-[800px]">
            <thead className="bg-[#f5f7f8] text-left text-[11px] uppercase text-[#919191]">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-center">Account Status</th>
                <th className="px-4 py-3 text-center">KYC Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[12px] text-[#919191]">
                    Loading users…
                  </td>
                </tr>
              ) : items.length ? (
                items.map((user) => (
                  <tr key={user.id} className="border-t border-[#edf4f8] text-[12px]">
                    <td className="px-4 py-3">
                      <p className="font-medium">{user.fullName}</p>
                      <p className="mt-1 text-[#919191]">{user.email}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">
                      {user.accountType.replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-full px-2 py-1 text-[10px] capitalize", badge(user.status))}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("rounded-full px-2 py-1 text-[10px] capitalize", badge(user.kycStatus))}>
                        {user.kycStatus.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => router.push(`/user-management/${user.id}`)}
                          className="rounded-lg bg-[#edf4f8] px-3 py-2"
                        >
                          View
                        </button>
                        {canUpdate ? (
                          <button
                            onClick={() =>
                              setUserStatus(
                                user.id,
                                user.status === "suspended" ? "active" : "suspended",
                              )
                            }
                            className="rounded-lg bg-[#FFE8A3] px-3 py-2 text-[#975102]"
                          >
                            {user.status === "suspended" ? "Reactivate" : "Suspend"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[12px] text-[#919191]">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
