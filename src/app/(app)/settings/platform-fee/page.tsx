"use client";

import { useEffect, useState } from "react";
import { SettingsTabs } from "@/app/components/settings-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/api/client";

export default function PlatformFeePage() {
  const [transactionFee, setTransactionFee] = useState("");
  const [minimumInvestmentAmount, setMinimumInvestmentAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void apiRequest<{ settings: { transactionFee: number; minimumInvestmentAmount: number } }>("admin/settings/platform", { auth: true })
      .then(({ settings }) => { setTransactionFee(String(settings.transactionFee)); setMinimumInvestmentAmount(String(settings.minimumInvestmentAmount)); })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load settings."));
  }, []);

  async function save() {
    setSaving(true); setMessage("");
    try {
      const { settings } = await apiRequest<{ settings: { transactionFee: number; minimumInvestmentAmount: number } }>("admin/settings/platform", { method: "PATCH", auth: true, json: { transactionFee: Number(transactionFee), minimumInvestmentAmount: Number(minimumInvestmentAmount) } });
      setTransactionFee(String(settings.transactionFee)); setMinimumInvestmentAmount(String(settings.minimumInvestmentAmount)); setMessage("Platform settings updated.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save settings."); }
    finally { setSaving(false); }
  }

  return <Card className="mx-auto w-full max-w-[604px] rounded-[20px] border border-[#edf4f8] bg-white"><CardContent className="space-y-5 p-4 sm:space-y-6 sm:p-6 md:p-10 lg:p-12"><div className="flex justify-center"><SettingsTabs /></div>{message ? <p className="rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px] text-[#050a0e]">{message}</p> : null}<div className="space-y-4 sm:space-y-5">
    <MoneyField label="Transaction Fee" value={transactionFee} onChange={setTransactionFee} />
    <MoneyField label="Minimum Investment Amount" value={minimumInvestmentAmount} onChange={setMinimumInvestmentAmount} />
  </div><div className="flex justify-stretch sm:justify-end"><button className="flex h-10 w-full items-center justify-center rounded-[12px] bg-[#5c60cc] px-5 text-[12px] font-medium text-white disabled:opacity-60 sm:w-auto" type="button" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save Changes"}</button></div></CardContent></Card>;
}

function MoneyField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="space-y-2"><p className="text-[12px] font-medium text-[#050a0e]">{label}</p><div className="flex h-10 items-center justify-between gap-2 rounded-[12px] border border-[#cfe2ec] px-4"><input type="number" min="0" step="0.01" className="min-w-0 flex-1 text-[12px] font-medium text-[#050a0e] outline-none" onChange={(event) => onChange(event.target.value)} value={value} /><span className="text-[12px] font-medium text-[#5c60cc]">$</span></div></div>;
}
