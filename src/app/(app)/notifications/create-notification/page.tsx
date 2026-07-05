"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const defaultAudiences = [
  "All",
  "Investors",
  "Property Managers",
  "Super Admin",
  "User Manager",
  "Rent Managers",
];

type AdminListResponse = {
  items: Array<{ role: string; roleLabel?: string }>;
};

export default function CreateNotificationPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(false);
  const [audience, setAudience] = useState("All");
  const [customAudiences, setCustomAudiences] = useState<string[]>([]);
  const [sendOption, setSendOption] = useState<"now" | "schedule">("now");
  const [scheduledFor, setScheduledFor] = useState("");
  const [type, setType] = useState("manual");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void apiRequest<AdminListResponse>("admin/admins?limit=100", { auth: true })
      .then((response) => {
        const names = response.items
          .filter((admin) => admin.role === "custom" && admin.roleLabel)
          .map((admin) => admin.roleLabel as string);
        setCustomAudiences([...new Set(names)]);
      })
      .catch(() => undefined);
  }, []);

  const audiences = useMemo(
    () => [...defaultAudiences, ...customAudiences.filter((item) => !defaultAudiences.includes(item))],
    [customAudiences],
  );

  async function submit() {
    setSaving(true);
    setFeedback("");
    try {
      await apiRequest("admin/notifications", {
        method: "POST",
        json: {
          title,
          message,
          audience,
          channels: [...(inApp ? ["in_app"] : []), ...(email ? ["email"] : [])],
          sendOption,
          scheduledFor: sendOption === "schedule" ? scheduledFor : null,
          type,
        },
        auth: true,
      });
      router.push("/notifications");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to create notification.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mx-auto max-w-[866px] rounded-[20px] border border-[#edf4f8]">
      <CardContent className="space-y-6 p-4 sm:p-6">
        <div>
          <h2 className="text-[18px] font-medium">Create Notification</h2>
          <p className="mt-1 text-[12px] text-[#919191]">Send in-app activity or Gmail notifications to a selected audience.</p>
        </div>

        {feedback ? <p className="rounded-[12px] bg-[#fff1f0] px-3 py-2 text-[12px] text-[#b3261e]">{feedback}</p> : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Notification Title"><input required value={title} onChange={(event) => setTitle(event.target.value)} /></Field>
          <Field label="Notification Type"><input required value={type} onChange={(event) => setType(event.target.value)} placeholder="manual, compliance, payout..." /></Field>
          <label className="space-y-1 md:col-span-2">
            <span className="text-[12px] font-medium">Message</span>
            <textarea required value={message} onChange={(event) => setMessage(event.target.value)} className="min-h-28 w-full rounded-[12px] border border-[#cfe2ec] p-3 text-[12px]" />
          </label>
        </div>

        <section className="space-y-3">
          <h3 className="text-[15px] font-medium">Delivery Channel</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <ToggleChoice label="In-App" selected={inApp} onClick={() => setInApp((value) => !value)} />
            <ToggleChoice label="Email" selected={email} onClick={() => setEmail((value) => !value)} />
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[15px] font-medium">Audience</h3>
          <div className="flex flex-wrap gap-2">
            {audiences.map((item) => (
              <button key={item} type="button" onClick={() => setAudience(item)} className={cn("rounded-[10px] border px-3 py-2 text-[11px]", audience === item ? "border-[#5c60cc] bg-[#f2f2ff] text-[#5c60cc]" : "border-[#cfe2ec]")}>{item}</button>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-[15px] font-medium">Send Option</h3>
          <div className="flex gap-2">
            {([ ["now", "Publish Now"], ["schedule", "Schedule"] ] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setSendOption(value)} className={cn("rounded-[10px] border px-3 py-2 text-[11px]", sendOption === value ? "border-[#5c60cc] bg-[#f2f2ff]" : "border-[#cfe2ec]")}>{label}</button>
            ))}
          </div>
          {sendOption === "schedule" ? <Field label="Scheduled Date & Time"><input required type="datetime-local" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} /></Field> : null}
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/notifications" className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#cfe2ec] text-[12px]">Cancel</Link>
          <button type="button" onClick={() => void submit()} disabled={saving || !title.trim() || !message.trim() || (!inApp && !email) || (sendOption === "schedule" && !scheduledFor)} className="h-10 rounded-[12px] bg-[#5c60cc] text-[12px] font-medium text-white disabled:opacity-60">{saving ? "Creating…" : "Create Notification"}</button>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleChoice({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cn("flex h-12 items-center justify-between rounded-[12px] border px-4 text-[12px]", selected ? "border-[#5c60cc] bg-[#f2f2ff]" : "border-[#cfe2ec]")}><span>{label}</span><span className={cn("size-4 rounded-full border", selected ? "border-[5px] border-[#5c60cc]" : "border-[#919191]")} /></button>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="space-y-1"><span className="text-[12px] font-medium">{label}</span><div className="[&>input]:h-10 [&>input]:w-full [&>input]:rounded-[12px] [&>input]:border [&>input]:border-[#cfe2ec] [&>input]:px-3 [&>input]:text-[12px]">{children}</div></label>;
}
