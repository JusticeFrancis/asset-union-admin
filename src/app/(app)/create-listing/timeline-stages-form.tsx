"use client";

import { useEffect, useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { Plus, Trash2 } from "lucide-react";

import { type ListingKind, type WizardStepSegment } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { DateField, FieldLabel, SelectField, inputClass } from "@/app/(app)/create-listing/wizard-form-primitives";
import { WizardFormFooter } from "@/app/(app)/create-listing/wizard-form-footer";
import { usePropertyWizard } from "@/contexts/property-wizard-provider";
import { useListingWizardHref } from "@/lib/property-wizard/use-listing-wizard-href";

type TimelineStagesFormProps = { listingKind: ListingKind; backSegment: WizardStepSegment; continueSegment: WizardStepSegment; footerNextTitle: string; variant?: "construction" | "project" };
type Stage = { id: string; name: string; description: string; date: string; status: string };
const firstStage = (id = "stage-1"): Stage => ({ id, name: "", description: "", date: "", status: "locked" });
export function TimelineStagesForm({ listingKind, backSegment, continueSegment, footerNextTitle, variant = "construction" }: TimelineStagesFormProps) {
  const router = useRouter(); const listingWizardHref = useListingWizardHref();
  const { getSectionData, saveStep, isSaving, propertyId, isEditable } = usePropertyWizard();
  const segment: WizardStepSegment = variant === "construction" ? "construction-timeline" : "project-timeline";
  const sectionKey = variant === "construction" ? "constructionTimeline" : "projectTimeline";
  const saved = getSectionData<{ stages?: Stage[] }>(sectionKey);
  const [stages, setStages] = useState<Stage[]>(saved?.stages?.length ? saved.stages : [firstStage()]);
  useEffect(() => { if (saved?.stages?.length) setStages(saved.stages); }, [saved]);
  function updateStage(id: string, key: keyof Omit<Stage, "id">, value: string) { setStages((current) => current.map((stage) => stage.id === id ? { ...stage, [key]: value } : stage)); }
  async function continueNext() { if (propertyId && isEditable) await saveStep(segment, { [sectionKey]: { stages } }, listingKind); router.push(listingWizardHref(listingKind, continueSegment)); }
  const intro = variant === "construction" ? "Define the construction stages investors will see on the timeline. This represents the current truth of the project." : "Define the project phases investors will see on the timeline. Keep this aligned with your published roadmap.";
  return <div className="flex flex-col gap-6"><div className="flex flex-col gap-4"><div><p className="text-[12px] font-medium text-[#050a0e]">Timeline Structure</p><p className="mt-1 text-[12px] font-light leading-normal text-[#919191]">{intro}</p></div>
    {stages.map((stage, index) => <div key={stage.id} className="flex flex-col gap-4 rounded-2xl border border-[#cfe2ec] p-3"><div className="flex items-center justify-between"><p className="text-[12px] font-medium text-[#050a0e]">Stage {index + 1}</p>{stages.length > 1 ? <button type="button" onClick={() => setStages((current) => current.filter((item) => item.id !== stage.id))} disabled={!isEditable} className="rounded-md p-1 text-[#b3261e] hover:bg-[#fff1f0] disabled:opacity-50" aria-label={`Remove stage ${index + 1}`}><Trash2 className="size-4" /></button> : null}</div><div className="grid gap-4 md:grid-cols-2"><label className="flex flex-col gap-1"><FieldLabel>Stage Name</FieldLabel><input value={stage.name} onChange={(event) => updateStage(stage.id, "name", event.target.value)} disabled={!isEditable} className={inputClass()} /></label><label className="flex flex-col gap-1"><FieldLabel>Stage Description</FieldLabel><input value={stage.description} onChange={(event) => updateStage(stage.id, "description", event.target.value)} disabled={!isEditable} className={inputClass()} /></label></div><div className="grid gap-4 md:grid-cols-2"><DateField label="Stage Date" value={stage.date} onChange={(event) => updateStage(stage.id, "date", event.target.value)} disabled={!isEditable} /><SelectField label="Stage Status" value={stage.status} onChange={(event) => updateStage(stage.id, "status", event.target.value)} disabled={!isEditable}><option value="locked">Locked</option><option value="upcoming">Upcoming</option><option value="in-progress">In progress</option><option value="completed">Completed</option></SelectField></div></div>)}
    <button type="button" onClick={() => setStages((current) => [...current, firstStage(`stage-${Date.now()}-${current.length + 1}`)])} disabled={!isEditable} className="flex w-full items-center justify-center gap-1 rounded-[12px] border border-dashed border-[#cfe2ec] py-2 text-[12px] font-medium text-[#919191] transition-colors hover:bg-[#f5f7f8]/50 disabled:opacity-50"><Plus className="size-5" strokeWidth={1.5} />Add more timeline</button></div>
    <WizardFormFooter nextStepLine1="Proceed to the next step" nextStepLine2={footerNextTitle} backHref={listingWizardHref(listingKind, backSegment)} continueLabel="Continue" isSubmitting={isSaving} onContinue={continueNext} />
  </div>;
}
