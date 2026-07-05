"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "nextjs-toploader/app";

import { type ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { FieldLabel, SelectField, inputClass } from "@/app/(app)/create-listing/wizard-form-primitives";
import { WizardFormFooter } from "@/app/(app)/create-listing/wizard-form-footer";
import { usePropertyWizard } from "@/contexts/property-wizard-provider";
import { useListingWizardHref } from "@/lib/property-wizard/use-listing-wizard-href";
import { cn } from "@/lib/utils";

type InvestmentStructureFormProps = { listingKind: ListingKind };
const EMPTY = { propertyValuation: "", sharePrice: "", minimumShares: "", maximumSharesPerUser: "", fundingStatus: "open" };
type FormState = typeof EMPTY;

function NumberField({ label, value, suffix, onChange, disabled }: { label: string; value: string; suffix?: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="flex min-w-0 flex-1 flex-col gap-1"><FieldLabel>{label}</FieldLabel><div className="relative"><input type="number" min="0" step="any" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={cn(inputClass(), suffix ? "pr-10" : "")} />{suffix ? <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#5c60cc]">{suffix}</span> : null}</div></label>;
}

export function InvestmentStructureForm({ listingKind }: InvestmentStructureFormProps) {
  const router = useRouter();
  const listingWizardHref = useListingWizardHref();
  const { getSectionData, saveStep, isSaving, propertyId, isEditable } = usePropertyWizard();
  const saved = getSectionData<Partial<FormState>>("investmentStructure");
  const [form, setForm] = useState<FormState>({ ...EMPTY, ...saved });
  useEffect(() => { if (saved) setForm({ ...EMPTY, ...saved }); }, [saved]);
  const totalShares = useMemo(() => {
    const valuation = Number(form.propertyValuation);
    const price = Number(form.sharePrice);
    return valuation > 0 && price > 0 ? String(Math.floor(valuation / price)) : "0";
  }, [form.propertyValuation, form.sharePrice]);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function continueNext() {
    if (propertyId && isEditable) await saveStep("investment-structure", { investmentStructure: { ...form, totalShares } }, listingKind);
    router.push(listingWizardHref(listingKind, "rental-economics"));
  }
  return <div className="flex flex-col gap-6">
    <div className="grid gap-6 md:grid-cols-2"><NumberField label="Property Price / Valuation" value={form.propertyValuation} suffix="$" onChange={(value) => update("propertyValuation", value)} disabled={!isEditable} /><NumberField label="Share Price" value={form.sharePrice} suffix="$" onChange={(value) => update("sharePrice", value)} disabled={!isEditable} /></div>
    <div className="grid gap-6 md:grid-cols-2"><label className="flex min-w-0 flex-1 flex-col gap-1"><FieldLabel>Total Shares</FieldLabel><input value={totalShares} readOnly className={inputClass(true)} /></label><NumberField label="Minimal Purchase (shares)" value={form.minimumShares} onChange={(value) => update("minimumShares", value)} disabled={!isEditable} /></div>
    <div className="grid gap-6 md:grid-cols-2"><NumberField label="Maximum Purchase Per User" value={form.maximumSharesPerUser} onChange={(value) => update("maximumSharesPerUser", value)} disabled={!isEditable} /><SelectField label="Funding Status" value={form.fundingStatus} onChange={(event) => update("fundingStatus", event.target.value)} disabled={!isEditable}><option value="open">Funding open</option><option value="closed">Funding closed</option><option value="paused">Funding paused</option></SelectField></div>
    <WizardFormFooter nextStepLine1="Proceed to the next step" nextStepLine2="Rental Economics" backHref={listingWizardHref(listingKind, "basic-property-information")} continueLabel="Continue" isSubmitting={isSaving} onContinue={continueNext} />
  </div>;
}
