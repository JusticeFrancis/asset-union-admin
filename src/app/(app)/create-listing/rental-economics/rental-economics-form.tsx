"use client";

import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";

import { type ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { DateField, FieldLabel, SelectField, inputClass } from "@/app/(app)/create-listing/wizard-form-primitives";
import { WizardFormFooter } from "@/app/(app)/create-listing/wizard-form-footer";
import { usePropertyWizard } from "@/contexts/property-wizard-provider";
import { useListingWizardHref } from "@/lib/property-wizard/use-listing-wizard-href";
import { cn } from "@/lib/utils";

type RentalEconomicsFormProps = { listingKind: ListingKind };
const EMPTY = { expectedAnnualRentalIncome: "", expectedApr: "", occupancyRate: "", distributionFrequency: "monthly", rentStartDate: "", payoutCurrency: "usd" };
type FormState = typeof EMPTY;
function NumberField({ label, value, suffix, onChange, disabled }: { label: string; value: string; suffix: string; onChange: (value: string) => void; disabled?: boolean }) { return <label className="flex min-w-0 flex-1 flex-col gap-1"><FieldLabel>{label}</FieldLabel><div className="relative"><input type="number" min="0" step="any" value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={cn(inputClass(), "pr-10")} /><span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#5c60cc]">{suffix}</span></div></label>; }
export function RentalEconomicsForm({ listingKind }: RentalEconomicsFormProps) {
  const router = useRouter(); const listingWizardHref = useListingWizardHref();
  const { getSectionData, saveStep, isSaving, propertyId, isEditable } = usePropertyWizard();
  const saved = getSectionData<Partial<FormState>>("rentalEconomics");
  const [form, setForm] = useState<FormState>({ ...EMPTY, ...saved });
  useEffect(() => { if (saved) setForm({ ...EMPTY, ...saved }); }, [saved]);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function continueNext() { if (propertyId && isEditable) await saveStep("rental-economics", { rentalEconomics: form }, listingKind); router.push(listingWizardHref(listingKind, "property-management")); }
  return <div className="flex flex-col gap-6">
    <div className="grid gap-6 md:grid-cols-2"><NumberField label="Expected Annual Rental Income" value={form.expectedAnnualRentalIncome} suffix="$" onChange={(value) => update("expectedAnnualRentalIncome", value)} disabled={!isEditable} /><NumberField label="Expected APR" value={form.expectedApr} suffix="%" onChange={(value) => update("expectedApr", value)} disabled={!isEditable} /></div>
    <div className="grid gap-6 md:grid-cols-2"><NumberField label="Occupancy Rate" value={form.occupancyRate} suffix="%" onChange={(value) => update("occupancyRate", value)} disabled={!isEditable} /><SelectField label="Rent Distribution Frequency" value={form.distributionFrequency} onChange={(event) => update("distributionFrequency", event.target.value)} disabled={!isEditable}><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annually">Annually</option></SelectField></div>
    <div className="grid gap-6 md:grid-cols-2"><DateField label="Rent Start Date" value={form.rentStartDate} onChange={(event) => update("rentStartDate", event.target.value)} disabled={!isEditable} /><SelectField label="Payout Currency" value={form.payoutCurrency} onChange={(event) => update("payoutCurrency", event.target.value)} disabled={!isEditable}><option value="usd">USD</option><option value="usdt">USDT</option><option value="usdc">USDC</option></SelectField></div>
    <WizardFormFooter nextStepLine1="Proceed to the next step" nextStepLine2="Property Management" backHref={listingWizardHref(listingKind, "investment-structure")} continueLabel="Continue" isSubmitting={isSaving} onContinue={continueNext} />
  </div>;
}
