"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "nextjs-toploader/app";

import { type ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { FieldLabel, SelectField, inputClass } from "@/app/(app)/create-listing/wizard-form-primitives";
import { WizardFormFooter } from "@/app/(app)/create-listing/wizard-form-footer";
import { usePropertyWizard } from "@/contexts/property-wizard-provider";
import { useListingWizardHref } from "@/lib/property-wizard/use-listing-wizard-href";
import { cn } from "@/lib/utils";

type PropertyDetailsFormProps = { listingKind: ListingKind };
const EMPTY = { bedrooms: "", bathrooms: "", kitchens: "", livingRooms: "", builtArea: "", landSize: "", builderContractor: "", permitStatus: "not-started", propertyType: "residential", ownershipType: "freehold", estimatedCompletionValue: "", propagationRightTerms: "20-40", tradingLock: "funding-complete" };
type FormState = typeof EMPTY;
function TextField({ label, value, onChange, type = "text", disabled }: { label: string; value: string; onChange: (value: string) => void; type?: string; disabled?: boolean }) { return <label className="flex min-w-0 flex-1 flex-col gap-1"><FieldLabel>{label}</FieldLabel><input type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "any" : undefined} value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={inputClass()} /></label>; }
export function PropertyDetailsForm({ listingKind }: PropertyDetailsFormProps) {
  const router = useRouter(); const listingWizardHref = useListingWizardHref(); const headingId = useId();
  const { getSectionData, saveStep, isSaving, propertyId, isEditable } = usePropertyWizard();
  const saved = getSectionData<Partial<FormState>>("propertyDetails");
  const [form, setForm] = useState<FormState>({ ...EMPTY, ...saved });
  useEffect(() => { if (saved) setForm({ ...EMPTY, ...saved }); }, [saved]);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function continueNext() { if (propertyId && isEditable) await saveStep("property-details", { propertyDetails: form }, listingKind); router.push(listingWizardHref(listingKind, "review-check")); }
  const pill = "flex min-w-0 flex-1 cursor-pointer items-start gap-2 rounded-2xl bg-[#f9fafb] p-4 transition-colors has-[:checked]:ring-2 has-[:checked]:ring-[#5c60cc]/30";
  return <div className="flex flex-col gap-6"><div className="flex flex-col gap-6">
    <div className="grid gap-6 md:grid-cols-2"><TextField label="Bedrooms" type="number" value={form.bedrooms} onChange={(value) => update("bedrooms", value)} disabled={!isEditable} /><TextField label="Bathrooms" type="number" value={form.bathrooms} onChange={(value) => update("bathrooms", value)} disabled={!isEditable} /></div>
    <div className="grid gap-6 md:grid-cols-2"><TextField label="Kitchens" type="number" value={form.kitchens} onChange={(value) => update("kitchens", value)} disabled={!isEditable} /><TextField label="Living rooms" type="number" value={form.livingRooms} onChange={(value) => update("livingRooms", value)} disabled={!isEditable} /></div>
    <div className="grid gap-6 md:grid-cols-2"><TextField label="Built Area (sqm/sqft)" type="number" value={form.builtArea} onChange={(value) => update("builtArea", value)} disabled={!isEditable} /><TextField label="Land Size (sqm/sqft)" type="number" value={form.landSize} onChange={(value) => update("landSize", value)} disabled={!isEditable} /></div>
    <div className="grid gap-6 md:grid-cols-2"><TextField label="Builder / Contractor" value={form.builderContractor} onChange={(value) => update("builderContractor", value)} disabled={!isEditable} /><SelectField label="Permit Status" value={form.permitStatus} onChange={(event) => update("permitStatus", event.target.value)} disabled={!isEditable}><option value="not-started">Not Started</option><option value="in-review">In review</option><option value="approved">Approved</option></SelectField></div>
    <div className="grid gap-6 md:grid-cols-2"><SelectField label="Property Type" value={form.propertyType} onChange={(event) => update("propertyType", event.target.value)} disabled={!isEditable}><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="mixed-use">Mixed use</option></SelectField><SelectField label="Ownership type" value={form.ownershipType} onChange={(event) => update("ownershipType", event.target.value)} disabled={!isEditable}><option value="leasehold">Leasehold</option><option value="freehold">Freehold</option><option value="other">Other</option></SelectField></div>
    <div className="grid gap-6 md:grid-cols-2"><TextField label="Estimated Property value at the end of construction" type="number" value={form.estimatedCompletionValue} onChange={(value) => update("estimatedCompletionValue", value)} disabled={!isEditable} /><SelectField label="Propagation right terms" value={form.propagationRightTerms} onChange={(event) => update("propagationRightTerms", event.target.value)} disabled={!isEditable}><option value="20-40">20 - 40 years</option><option value="40-60">40 - 60 years</option><option value="60-plus">60+ years</option></SelectField></div>
    <div className="flex flex-col gap-4"><div><FieldLabel>Exit Strategy</FieldLabel><p className="text-[12px] font-light text-[#919191]">Controls when shares can be traded.</p></div><div className="rounded-2xl border border-[#cfe2ec] p-3"><span id={headingId} className="text-[12px] font-medium text-[#050a0e]">Trading Lock Until</span><div className="mt-4 flex flex-col gap-1 sm:flex-row" role="radiogroup" aria-labelledby={headingId}>{[["funding-complete", "Funding complete"], ["construction-complete", "Construction complete"], ["admin-unlock", "Admin unlock"]].map(([value, label]) => <label key={value} className={pill}><input type="radio" name="trading-lock-until" value={value} checked={form.tradingLock === value} onChange={() => update("tradingLock", value)} disabled={!isEditable} className="mt-0.5 size-[14px] accent-[#5c60cc]" /><span className="text-[12px] text-[#050a0e]">{label}</span></label>)}</div></div></div>
  </div><WizardFormFooter nextStepLine1="Proceed to the next step" nextStepLine2="Review Check" backHref={listingWizardHref(listingKind, "project-timeline")} continueLabel="Continue" isSubmitting={isSaving} onContinue={continueNext} /></div>;
}
