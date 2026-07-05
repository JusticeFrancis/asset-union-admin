"use client";

import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";

import { type ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { FieldLabel, inputClass } from "@/app/(app)/create-listing/wizard-form-primitives";
import { WizardFormFooter } from "@/app/(app)/create-listing/wizard-form-footer";
import { usePropertyWizard } from "@/contexts/property-wizard-provider";
import { useListingWizardHref } from "@/lib/property-wizard/use-listing-wizard-href";
import { cn } from "@/lib/utils";

type PropertyDescriptionFormProps = { listingKind: ListingKind };
const EMPTY = { overview: "", rentalDemandRationale: "", tenantProfile: "", locationAdvantage: "" };
type FormState = typeof EMPTY;
function DescField({ label, value, placeholder, onChange, disabled }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; disabled?: boolean }) { return <label className="flex min-w-0 flex-1 flex-col gap-1"><FieldLabel>{label}</FieldLabel><textarea rows={5} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={cn(inputClass(), "h-[135px] resize-none py-3 leading-normal")} /></label>; }
export function PropertyDescriptionForm({ listingKind }: PropertyDescriptionFormProps) {
  const router = useRouter(); const listingWizardHref = useListingWizardHref();
  const { getSectionData, saveStep, isSaving, propertyId, isEditable } = usePropertyWizard();
  const saved = getSectionData<Partial<FormState>>("propertyDescription");
  const [form, setForm] = useState<FormState>({ ...EMPTY, ...saved });
  useEffect(() => { if (saved) setForm({ ...EMPTY, ...saved }); }, [saved]);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function continueNext() { if (propertyId && isEditable) await saveStep("property-description", { propertyDescription: form }, listingKind); router.push(listingWizardHref(listingKind, "review-check")); }
  return <div className="flex flex-col gap-6">
    <div className="grid gap-6 md:grid-cols-2"><DescField label="Overview" value={form.overview} onChange={(value) => update("overview", value)} disabled={!isEditable} placeholder="Describe what the property is, where it is located, and why it exists on the platform." /><DescField label="Rental Demand Rationale" value={form.rentalDemandRationale} onChange={(value) => update("rentalDemandRationale", value)} disabled={!isEditable} placeholder="Describe why this property is expected to attract consistent tenants." /></div>
    <div className="grid gap-6 md:grid-cols-2"><DescField label="Tenant Profile" value={form.tenantProfile} onChange={(value) => update("tenantProfile", value)} disabled={!isEditable} placeholder="Describe the typical tenant this property is designed for." /><DescField label="Location Advantage" value={form.locationAdvantage} onChange={(value) => update("locationAdvantage", value)} disabled={!isEditable} placeholder="Highlight location-specific factors that support rental performance." /></div>
    <WizardFormFooter nextStepLine1="Proceed to the next step" nextStepLine2="Review Check" backHref={listingWizardHref(listingKind, "legal-ownership")} continueLabel="Continue" isSubmitting={isSaving} onContinue={continueNext} />
  </div>;
}
