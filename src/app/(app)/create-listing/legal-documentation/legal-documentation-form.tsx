"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "nextjs-toploader/app";

import { type ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { WizardFormFooter } from "@/app/(app)/create-listing/wizard-form-footer";
import { FieldLabel, inputClass } from "@/app/(app)/create-listing/wizard-form-primitives";
import { usePropertyWizard } from "@/contexts/property-wizard-provider";
import { useScopedAddPropertyDocumentMutation, useScopedRemovePropertyDocumentMutation } from "@/lib/property-wizard/use-scoped-property-api";
import { useListingWizardHref } from "@/lib/property-wizard/use-listing-wizard-href";
import { uploadAdminFile } from "@/lib/upload-file";
import { cn } from "@/lib/utils";

const EMPTY = { ownerFullName: "", ownerEmail: "", ownerPhone: "", ownerCountry: "US", formationState: "WY", ownerAddressLine1: "", ownerAddressLine2: "", ownerCity: "", ownerState: "", ownerPostalCode: "", ownerAddressCountry: "US" };
type FormState = typeof EMPTY;
type LegalDocumentationFormProps = { listingKind: ListingKind };

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="flex flex-col gap-1"><FieldLabel>{label}</FieldLabel><input className={inputClass()} type={type} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1"><FieldLabel>{label}</FieldLabel><select className={cn(inputClass(true), "appearance-none")} value={value} onChange={(event) => onChange(event.target.value)}>{children}</select></label>;
}

export function LegalDocumentationForm({ listingKind }: LegalDocumentationFormProps) {
  const router = useRouter();
  const listingWizardHref = useListingWizardHref();
  const { propertyId, property, getSectionData, saveStep, isSaving, isEditable } = usePropertyWizard();
  const addDocument = useScopedAddPropertyDocumentMutation();
  const removeDocument = useScopedRemovePropertyDocumentMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const saved = getSectionData<Partial<FormState>>("legalDocumentation");
  const [form, setForm] = useState<FormState>({ ...EMPTY, ...saved });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { if (saved) setForm({ ...EMPTY, ...saved }); }, [saved]);
  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function upload(files: FileList | null) {
    if (!files?.length || !propertyId) return;
    setUploading(true); setMessage("");
    try {
      for (const file of Array.from(files)) {
        const uploaded = await uploadAdminFile(file, `asset-union/properties/${propertyId}/legal`);
        await addDocument.mutateAsync({ propertyId, body: { type: "construction_legal_document", title: file.name.replace(/\.[^.]+$/, ""), url: uploaded.url, storageKey: uploaded.publicId, action: "download" } });
      }
      setMessage("Legal document upload completed.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to upload documents."); }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  async function remove(documentId: string) {
    if (!propertyId) return;
    try { await removeDocument.mutateAsync({ propertyId, documentId }); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to remove document."); }
  }

  async function continueNext() {
    if (propertyId && isEditable) await saveStep("legal-documentation", { legalDocumentation: form }, listingKind);
    router.push(listingWizardHref(listingKind, "funding-structure"));
  }

  const documents = (property?.documents ?? []).filter((item) => item.type === "construction_legal_document" || ["proof_of_ownership", "permit", "llc"].includes(item.type));
  return <div className="flex flex-col gap-6">
    <div className="rounded-2xl border border-[#cfe2ec] p-4">
      <p className="mb-4 text-[12px] font-medium text-[#050a0e]">LLC Responsible Party & Formation Details</p>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Legal Owner Full Name" value={form.ownerFullName} onChange={(value) => update("ownerFullName", value)} />
        <Field label="Legal Owner Email" value={form.ownerEmail} type="email" onChange={(value) => update("ownerEmail", value)} />
        <Field label="Phone Number" value={form.ownerPhone} type="tel" onChange={(value) => update("ownerPhone", value)} />
        <Select label="Country of Residence" value={form.ownerCountry} onChange={(value) => update("ownerCountry", value)}><option value="US">United States</option><option value="NG">Nigeria</option><option value="GB">United Kingdom</option><option value="CA">Canada</option></Select>
        <Select label="LLC Formation State" value={form.formationState} onChange={(value) => update("formationState", value)}><option value="WY">Wyoming</option><option value="DE">Delaware</option><option value="FL">Florida</option><option value="TX">Texas</option><option value="CA">California</option></Select>
        <Field label="Address Line 1" value={form.ownerAddressLine1} onChange={(value) => update("ownerAddressLine1", value)} />
        <Field label="Address Line 2" value={form.ownerAddressLine2} onChange={(value) => update("ownerAddressLine2", value)} />
        <Field label="City" value={form.ownerCity} onChange={(value) => update("ownerCity", value)} />
        <Field label="State / Region" value={form.ownerState} onChange={(value) => update("ownerState", value)} />
        <Field label="Postal Code" value={form.ownerPostalCode} onChange={(value) => update("ownerPostalCode", value)} />
        <Select label="Address Country" value={form.ownerAddressCountry} onChange={(value) => update("ownerAddressCountry", value)}><option value="US">United States</option><option value="NG">Nigeria</option><option value="GB">United Kingdom</option><option value="CA">Canada</option></Select>
      </div>
    </div>

    <input ref={inputRef} hidden type="file" accept="application/pdf,.pdf,image/*" multiple onChange={(event) => void upload(event.target.files)} />
    <button type="button" disabled={!isEditable || uploading} onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-1 rounded-[12px] border border-dashed border-[#cfe2ec] px-4 py-8 transition-colors hover:bg-[#f5f7f8]/50 disabled:opacity-50"><div className="flex size-12 items-center justify-center rounded-full bg-[#f5f7f8]"><Plus className="size-6 text-[#5c60cc]" strokeWidth={2} aria-hidden /></div><span className="text-[12px] font-medium text-[#050a0e]">{uploading ? "Uploading…" : "Drop your files here, or browse"}</span><span className="text-[12px] font-light text-[#919191]">PDF or image files, up to 20MB each</span></button>

    <div className="grid gap-4 md:grid-cols-2">{documents.map((document) => <div key={document.id} className="flex items-center justify-between gap-3 rounded-[12px] border border-[#cfe2ec] p-3"><a href={document.url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-[12px] font-medium text-[#5c60cc]">{document.title}</a><button type="button" onClick={() => void remove(document.id)} disabled={!isEditable || removeDocument.isPending} className="text-[11px] font-medium text-[#b3261e] disabled:opacity-50">Remove</button></div>)}</div>
    {message ? <p className="rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px] text-[#050a0e]">{message}</p> : null}
    <WizardFormFooter nextStepLine1="Proceed to the next step" nextStepLine2="Funding Structure" backHref={listingWizardHref(listingKind, "basic-property-information")} continueLabel="Continue" isSubmitting={isSaving} onContinue={continueNext} />
  </div>;
}
