"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type AdminRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  roleLabel?: string;
  status: "active" | "suspended" | "invited";
  lastLoginAt?: number | null;
  createdAt: string;
  inviteAccepted: boolean;
  inviteExpiresAt?: string;
};

const statusStyle: Record<AdminRow["status"], string> = {
  active: "bg-[#AFF4C6] text-[#009951]",
  suspended: "bg-[#FFE8A3] text-[#975102]",
  invited: "bg-[#D0D2F0] text-[#8672CA]",
};

const roleLabel = (admin: AdminRow) =>
  admin.roleLabel ||
  admin.role
    .split("_")
    .map((value) => value[0]?.toUpperCase() + value.slice(1))
    .join(" ");

export default function RolesAndPermissionsPage() {
  const { admin } = useAdminAuth();
  const [tab, setTab] = useState<"active" | "invited">("active");
  const [items, setItems] = useState<AdminRow[]>([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const canCreate = Boolean(admin?.permissions.includes("admins.create"));
  const canUpdate = Boolean(admin?.permissions.includes("admins.update"));
  const canDelete = Boolean(admin?.permissions.includes("admins.delete"));

  async function load() {
    setLoading(true);
    try {
      const response = await apiRequest<{ items: AdminRow[] }>(
        `admin/admins?limit=100${search ? `&search=${encodeURIComponent(search)}` : ""}${role !== "all" ? `&role=${role}` : ""}`,
        { auth: true },
      );
      setItems(response.items);
      setMessage("");
    } catch (error: any) {
      setMessage(error.message || "Unable to load admins.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => void load(), 250);
    return () => clearTimeout(timer);
  }, [search, role]);

  const rows = useMemo(
    () =>
      items.filter((item) =>
        tab === "invited" ? item.status === "invited" : item.status !== "invited",
      ),
    [items, tab],
  );

  async function remove(id: string) {
    if (!confirm("Remove this admin account?")) return;
    try {
      await apiRequest(`admin/admins/${id}`, { method: "DELETE", auth: true });
      setMessage("Admin removed.");
      await load();
    } catch (error: any) {
      setMessage(error.message || "Unable to remove admin.");
    }
  }

  async function resend(id: string) {
    try {
      const response = await apiRequest<{ expiresAt: string }>(
        `admin/admins/${id}/resend-invite`,
        { method: "POST", auth: true },
      );
      setMessage(
        `Invitation resent. It expires ${new Date(response.expiresAt).toLocaleTimeString()}.`,
      );
      await load();
    } catch (error: any) {
      setMessage(error.message || "Unable to resend invitation.");
    }
  }

  return (
    <Card className="w-full min-w-0 rounded-[20px] border-0 bg-white shadow-sm">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex h-10 w-fit items-center gap-1 rounded-[12px] bg-[#f5f7f8] p-1">
            {[
              ["active", "Admin Users"],
              ["invited", "Pending Request"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value as "active" | "invited")}
                className={cn(
                  "rounded-[8px] px-3 py-2 text-[12px] font-medium",
                  tab === value
                    ? "bg-white text-[#050a0e] shadow-sm"
                    : "text-[#919191]",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {canCreate ? (
            <Link
              href="/roles-and-permissions/add-admin-user"
              className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#5c60cc] px-4 text-[12px] font-medium text-white"
            >
              Add Admin User
            </Link>
          ) : null}
        </div>

        {message ? (
          <p className="rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px]">
            {message}
          </p>
        ) : null}

        <div className="grid gap-3 md:grid-cols-[1fr_210px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name or email"
            className="h-10 rounded-[12px] border border-[#cfe2ec] px-3 text-[12px] outline-none focus:border-[#5c60cc]"
          />
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="h-10 rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px]"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="property_manager">Property Manager</option>
            <option value="user_manager">User Manager</option>
            <option value="rent_manager">Rent Manager</option>
            <option value="custom">Custom Role</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-[12px] border border-[#edf4f8]">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#f5f7f8] text-[11px] font-medium text-[#575757]">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">
                  {tab === "invited" ? "Invite expiry" : "Last login"}
                </th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-[12px] text-[#919191]"
                  >
                    Loading admins…
                  </td>
                </tr>
              ) : rows.length ? (
                rows.map((item) => {
                  const canManageTarget =
                    item.role !== "super_admin" || admin?.role === "super_admin";
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-[#edf4f8] text-[12px]"
                    >
                      <td className="px-4 py-3 font-medium">{item.fullName}</td>
                      <td className="px-4 py-3">{item.email}</td>
                      <td className="px-4 py-3">{roleLabel(item)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-[10px] capitalize",
                            statusStyle[item.status],
                          )}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#575757]">
                        {tab === "invited"
                          ? item.inviteExpiresAt
                            ? new Date(item.inviteExpiresAt).toLocaleString()
                            : "Expired"
                          : item.lastLoginAt
                            ? new Date(item.lastLoginAt).toLocaleString()
                            : "Never"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <Link
                            href={`/roles-and-permissions/view-admin-user?id=${item.id}`}
                            className="rounded-lg bg-[#edf4f8] px-3 py-2"
                          >
                            View
                          </Link>
                          {canUpdate && canManageTarget ? (
                            <Link
                              href={`/roles-and-permissions/edit-admin-user?id=${item.id}`}
                              className="rounded-lg bg-[#edf4f8] px-3 py-2"
                            >
                              Edit
                            </Link>
                          ) : null}
                          {item.status === "invited" && canUpdate && canManageTarget ? (
                            <button
                              onClick={() => resend(item.id)}
                              className="rounded-lg bg-[#D0D2F0] px-3 py-2 text-[#5651b5]"
                            >
                              Resend
                            </button>
                          ) : null}
                          {canDelete && canManageTarget && item.id !== admin?.id ? (
                            <button
                              onClick={() => remove(item.id)}
                              className="rounded-lg bg-[#fff1f0] px-3 py-2 text-[#b3261e]"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-[12px] text-[#919191]"
                  >
                    No admin users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
