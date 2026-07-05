"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/utils";

type NotificationRow = {
  id: string;
  title: string;
  message: string;
  audience: string;
  channels: string[];
  status: string;
  type: string;
  origin: string;
  sentAt?: string;
  scheduledFor?: string;
  createdAt: string;
  error?: string;
};

export default function NotificationsPage() {
  const { admin } = useAdminAuth();
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");

  const canCreate = Boolean(admin?.permissions.includes("notifications.create"));
  const canDelete = Boolean(admin?.permissions.includes("notifications.delete"));

  async function load() {
    try {
      const response = await apiRequest<{ items: NotificationRow[] }>(
        `admin/notifications?limit=100${status !== "all" ? `&status=${status}` : ""}`,
        { auth: true },
      );
      setItems(response.items);
      setMessage("");
    } catch (error: any) {
      setMessage(error.message || "Unable to load notifications.");
    }
  }

  useEffect(() => {
    void load();
  }, [status]);

  async function remove(id: string) {
    if (!confirm("Delete this notification?")) return;
    try {
      await apiRequest(`admin/notifications/${id}`, {
        method: "DELETE",
        auth: true,
      });
      setMessage("Notification deleted.");
      await load();
    } catch (error: any) {
      setMessage(error.message || "Unable to delete notification.");
    }
  }

  const rows = items.filter(
    (notification) =>
      !search ||
      `${notification.title} ${notification.message} ${notification.audience}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <Card className="w-full min-w-0 rounded-[20px] border border-[#edf4f8] bg-white">
      <CardContent className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications"
              className="h-10 min-w-0 flex-1 rounded-[12px] border border-[#cfe2ec] px-3 text-[12px]"
            />
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="h-10 rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px]"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="scheduled">Scheduled</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          {canCreate ? (
            <Link
              href="/notifications/create-notification"
              className="inline-flex h-10 items-center justify-center rounded-[12px] bg-[#5c60cc] px-4 text-[12px] font-medium text-white"
            >
              Create Notification
            </Link>
          ) : null}
        </div>

        {message ? (
          <p className="rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px]">
            {message}
          </p>
        ) : null}

        <div className="overflow-x-auto rounded-[12px] border border-[#edf4f8]">
          <table className="w-full min-w-[850px]">
            <thead className="bg-[#f5f7f8] text-left text-[11px] uppercase text-[#919191]">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3">Channels</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
                {canDelete ? <th className="px-4 py-3">Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((notification) => (
                  <tr
                    key={notification.id}
                    className="border-t border-[#edf4f8] text-[12px]"
                  >
                    <td className="px-4 py-3 font-medium">
                      {notification.title}
                      <p className="mt-1 text-[10px] text-[#919191]">
                        {notification.type} · {notification.origin}
                      </p>
                    </td>
                    <td className="max-w-[260px] px-4 py-3 text-[#575757]">
                      {notification.message}
                    </td>
                    <td className="px-4 py-3">{notification.audience}</td>
                    <td className="px-4 py-3">
                      {notification.channels
                        .map((channel) => channel.replace("_", "-"))
                        .join(" + ")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-[10px] capitalize",
                          notification.status === "sent"
                            ? "bg-[#AFF4C6] text-[#009951]"
                            : notification.status === "failed"
                              ? "bg-[#F9DEDC] text-[#B3261E]"
                              : "bg-[#FFE8A3] text-[#975102]",
                        )}
                      >
                        {notification.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(
                        notification.sentAt ||
                          notification.scheduledFor ||
                          notification.createdAt,
                      ).toLocaleString()}
                    </td>
                    {canDelete ? (
                      <td className="px-4 py-3">
                        <button
                          onClick={() => remove(notification.id)}
                          className="rounded-lg bg-[#fff1f0] px-3 py-2 text-[#b3261e]"
                        >
                          Delete
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={canDelete ? 7 : 6}
                    className="p-8 text-center text-[12px] text-[#919191]"
                  >
                    No notifications found.
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
