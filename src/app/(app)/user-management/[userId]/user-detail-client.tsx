"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { apiRequest } from "@/lib/api/client";

export function UserDetailClient({ userId }: { userId: string }) {
  const { admin } = useAdminAuth();
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const canUpdate = Boolean(admin?.permissions.includes("users.update"));

  useEffect(() => {
    void apiRequest(`admin/users/${userId}`, { auth: true })
      .then(setUser)
      .catch((error: any) => setMessage(error.message));
  }, [userId]);

  async function save() {
    try {
      setUser(
        await apiRequest(`admin/users/${userId}`, {
          method: "PATCH",
          json: user,
          auth: true,
        }),
      );
      setEditing(false);
      setMessage("User updated.");
    } catch (error: any) {
      setMessage(error.message || "Unable to update user.");
    }
  }

  if (!user) {
    return (
      <p className="py-10 text-center text-[12px] text-[#919191]">
        {message || "Loading user…"}
      </p>
    );
  }

  return (
    <Card className="mx-auto max-w-[900px] rounded-[20px] border-0">
      <CardContent className="space-y-5 p-5 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-medium">{user.fullName}</h2>
            <p className="mt-1 text-[12px] text-[#919191]">{user.email}</p>
          </div>
          {canUpdate ? (
            <button
              onClick={() => (editing ? save() : setEditing(true))}
              className="h-10 rounded-[12px] bg-[#5c60cc] px-5 text-[12px] font-medium text-white"
            >
              {editing ? "Save Changes" : "Edit User"}
            </button>
          ) : null}
        </div>

        {message ? (
          <p className="rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px]">
            {message}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Full Name", "fullName"],
            ["Email", "email"],
            ["Phone", "phone"],
            ["Country", "country"],
          ].map(([label, key]) => (
            <label key={key} className="space-y-1.5">
              <span className="text-[12px] font-medium">{label}</span>
              <input
                disabled={!editing}
                value={user[key] || ""}
                onChange={(event) => setUser({ ...user, [key]: event.target.value })}
                className="h-10 w-full rounded-[12px] border border-[#cfe2ec] px-3 text-[12px] disabled:bg-[#f5f7f8]"
              />
            </label>
          ))}
          {[
            ["Account Type", "accountType", ["investor", "tenant", "property_owner"]],
            ["Account Status", "status", ["active", "pending", "suspended"]],
            ["KYC Status", "kycStatus", ["not_started", "pending", "verified", "rejected"]],
          ].map(([label, key, options]: any) => (
            <label key={key} className="space-y-1.5">
              <span className="text-[12px] font-medium">{label}</span>
              <select
                disabled={!editing}
                value={user[key]}
                onChange={(event) => setUser({ ...user, [key]: event.target.value })}
                className="h-10 w-full rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px] disabled:bg-[#f5f7f8]"
              >
                {options.map((option: string) => (
                  <option key={option} value={option}>
                    {option.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
