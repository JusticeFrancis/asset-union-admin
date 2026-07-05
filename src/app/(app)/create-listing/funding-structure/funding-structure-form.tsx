"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "nextjs-toploader/app";

import { type ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { DateField, FieldLabel, inputClass } from "@/app/(app)/create-listing/wizard-form-primitives";
import { WizardFormFooter } from "@/app/(app)/create-listing/wizard-form-footer";
import { usePropertyWizard } from "@/contexts/property-wizard-provider";
import { useListingWizardHref } from "@/lib/property-wizard/use-listing-wizard-href";
import { cn } from "@/lib/utils";

type FundingStructureFormProps = { listingKind: ListingKind };
const EMPTY = { totalFundingGoal: "", fundingStartDate: "", sharePrice: "", minimumShares: "", maximumSharesPerUser: "" };
type FormState = typeof EMPTY;
function NumberField({ label, value, suffix, onChange, disabled }: { label: string; value: string; suffix?: string; onChange: (value: string) => void; disabled?: boolean }) { return <label className="flex min-w-0 flex-1 flex-col gap-1"><FieldLabel>{label}</FieldLabel><div className="relative"><input type="number" min="0" step="any" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={cn(inputClass(), suffix ? "pr-10" : "")} />{suffix ? <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#5c60cc]">{suffix}</span> : null}</div></label>; }
export function FundingStructureForm({ listingKind }: FundingStructureFormProps) {
  const router = useRouter(); const listingWizardHref = useListingWizardHref();
  const { getSectionData, saveStep, isSaving, propertyId, isEditable } = usePropertyWizard();
  const saved = getSectionData<Partial<FormState>>("fundingStructure");
  const [form, setForm] = useState<FormState>({ ...EMPTY, ...saved });
  useEffect(() => { if (saved) setForm({ ...EMPTY, ...saved }); }, [saved]);
  const totalShares = useMemo(() => { const total = Number(form.totalFundingGoal); const price = Number(form.sharePrice); return total > 0 && price > 0 ? String(Math.floor(total / price)) : "0"; }, [form.totalFundingGoal, form.sharePrice]);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function continueNext() { if (propertyId && isEditable) await saveStep("funding-structure", { fundingStructure: { ...form, totalShares } }, listingKind); router.push(listingWizardHref(listingKind, "construction-timeline")); }
  return <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-4"><div><p className="text-[12px] font-medium text-[#050a0e]">Funding Setup</p><p className="mt-1 text-[12px] font-light text-[#919191]">This controls when investors can start participating.</p></div><div className="grid gap-6 md:grid-cols-2"><NumberField label="Total Funding Goal" value={form.totalFundingGoal} suffix="$" onChange={(value) => update("totalFundingGoal", value)} disabled={!isEditable} /><DateField label="Funding Start Date" value={form.fundingStartDate} onChange={(event) => update("fundingStartDate", event.target.value)} disabled={!isEditable} /></div></div>
    <div className="flex flex-col gap-4"><div><p className="text-[12px] font-medium text-[#050a0e]">Share Configuration</p><p className="mt-1 text-[12px] font-light text-[#919191]">These values power the investment widget shown to users.</p></div><div className="grid gap-6 md:grid-cols-2"><NumberField label="Share Price" value={form.sharePrice} suffix="$" onChange={(value) => update("sharePrice", value)} disabled={!isEditable} /><label className="flex flex-col gap-1"><FieldLabel>Total Shares</FieldLabel><input value={totalShares} readOnly className={inputClass(true)} /></label></div><div className="grid gap-6 md:grid-cols-2"><NumberField label="Minimum Purchase (shares)" value={form.minimumShares} onChange={(value) => update("minimumShares", value)} disabled={!isEditable} /><NumberField label="Maximum Purchase per user" value={form.maximumSharesPerUser} onChange={(value) => update("maximumSharesPerUser", value)} disabled={!isEditable} /></div></div>
    <WizardFormFooter nextStepLine1="Proceed to the next step" nextStepLine2="Construction Timeline" backHref={listingWizardHref(listingKind, "legal-documentation")} continueLabel="Continue" isSubmitting={isSaving} onContinue={continueNext} />
  </div>;
}
