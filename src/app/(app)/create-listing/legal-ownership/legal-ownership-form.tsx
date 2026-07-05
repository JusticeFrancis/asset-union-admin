"use client";

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

const EMPTY = {
  ownershipType: "",
  legalRightType: "",
  ownerFullName: "",
  ownerEmail: "",
  ownerPhone: "",
  ownerCountry: "US",
  formationState: "WY",
  ownerAddressLine1: "",
  ownerAddressLine2: "",
  ownerCity: "",
  ownerState: "",
  ownerPostalCode: "",
  ownerAddressCountry: "US",
};

type LegalOwnershipState = typeof EMPTY;
type LegalOwnershipFormProps = { listingKind: ListingKind };

type UploadTarget = { type: string; title: string };
const REQUIRED_UPLOADS: UploadTarget[] = [
  { type: "proof_of_ownership", title: "Proof of Ownership / Control" },
  { type: "rental_permit", title: "Rental License / Permit" },
  { type: "disclosure", title: "Disclosure Document" },
  { type: "legal", title: "Legal Documents" },
];

function TextField({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (value: string) => void; type?: string; placeholder?: string }) {
  return <label className="flex min-w-0 flex-1 flex-col gap-1"><FieldLabel>{label}</FieldLabel><input className={inputClass()} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="flex min-w-0 flex-1 flex-col gap-1"><FieldLabel>{label}</FieldLabel><select className={cn(inputClass(true), "appearance-none")} value={value} onChange={(event) => onChange(event.target.value)}>{children}</select></label>;
}

export function LegalOwnershipForm({ listingKind }: LegalOwnershipFormProps) {
  const router = useRouter();
  const listingWizardHref = useListingWizardHref();
  const { propertyId, property, getSectionData, saveStep, isSaving, isEditable } = usePropertyWizard();
  const addDocument = useScopedAddPropertyDocumentMutation();
  const removeDocument = useScopedRemovePropertyDocumentMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const saved = getSectionData<Partial<LegalOwnershipState>>("legalOwnership");
  const [form, setForm] = useState<LegalOwnershipState>({ ...EMPTY, ...saved });

  useEffect(() => { if (saved) setForm({ ...EMPTY, ...saved }); }, [saved]);

  const update = (key: keyof LegalOwnershipState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const documents = property?.documents ?? [];

  async function upload(file: File | undefined) {
    if (!file || !propertyId || !uploadTarget) return;
    setUploading(true); setMessage("");
    try {
      const uploaded = await uploadAdminFile(file, `asset-union/properties/${propertyId}/legal`);
      await addDocument.mutateAsync({ propertyId, body: { type: uploadTarget.type, title: uploadTarget.title, url: uploaded.url, storageKey: uploaded.publicId, action: "download" } });
      setMessage(`${uploadTarget.title} uploaded.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to upload document."); }
    finally { setUploading(false); setUploadTarget(null); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }

  async function remove(documentId: string) {
    if (!propertyId) return;
    setMessage("");
    try { await removeDocument.mutateAsync({ propertyId, documentId }); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to remove document."); }
  }

  async function continueNext() {
    if (propertyId && isEditable) await saveStep("legal-ownership", { legalOwnership: form }, listingKind);
    router.push(listingWizardHref(listingKind, "property-description"));
  }

  return <div className="flex flex-col gap-6">
    <div className="grid gap-6 md:grid-cols-2">
      <Select label="Ownership type" value={form.ownershipType} onChange={(value) => update("ownershipType", value)}><option value="">Select ownership</option><option value="leasehold">Leasehold</option><option value="freehold">Freehold</option><option value="llc">LLC-owned</option></Select>
      <Select label="Legal Right Type" value={form.legalRightType} onChange={(value) => update("legalRightType", value)}><option value="">Select legal right</option><option value="title">Title Deed</option><option value="lease">Lease Agreement</option><option value="other">Other</option></Select>
    </div>

    <div className="rounded-2xl border border-[#cfe2ec] p-4">
      <p className="mb-4 text-[12px] font-medium text-[#050a0e]">LLC Responsible Party & Formation Details</p>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Legal Owner Full Name" value={form.ownerFullName} onChange={(value) => update("ownerFullName", value)} placeholder="Full legal name" />
        <TextField label="Legal Owner Email" type="email" value={form.ownerEmail} onChange={(value) => update("ownerEmail", value)} placeholder="owner@example.com" />
        <TextField label="Phone Number" type="tel" value={form.ownerPhone} onChange={(value) => update("ownerPhone", value)} placeholder="+1…" />
        <Select label="Country of Residence" value={form.ownerCountry} onChange={(value) => update("ownerCountry", value)}><option value="US">United States</option><option value="NG">Nigeria</option><option value="GB">United Kingdom</option><option value="CA">Canada</option><option value="OTHER">Other</option></Select>
        <Select label="LLC Formation State" value={form.formationState} onChange={(value) => update("formationState", value)}><option value="WY">Wyoming</option><option value="DE">Delaware</option><option value="FL">Florida</option><option value="TX">Texas</option><option value="CA">California</option></Select>
        <TextField label="Address Line 1" value={form.ownerAddressLine1} onChange={(value) => update("ownerAddressLine1", value)} placeholder="Street address" />
        <TextField label="Address Line 2" value={form.ownerAddressLine2} onChange={(value) => update("ownerAddressLine2", value)} placeholder="Suite or unit (optional)" />
        <TextField label="City" value={form.ownerCity} onChange={(value) => update("ownerCity", value)} />
        <TextField label="State / Region" value={form.ownerState} onChange={(value) => update("ownerState", value)} />
        <TextField label="Postal Code" value={form.ownerPostalCode} onChange={(value) => update("ownerPostalCode", value)} />
        <Select label="Address Country" value={form.ownerAddressCountry} onChange={(value) => update("ownerAddressCountry", value)}><option value="US">United States</option><option value="NG">Nigeria</option><option value="GB">United Kingdom</option><option value="CA">Canada</option></Select>
      </div>
    </div>

    <input ref={fileInputRef} hidden type="file" accept="application/pdf,.pdf,image/*" onChange={(event) => void upload(event.target.files?.[0])} />
    <div className="rounded-2xl border border-[#cfe2ec] p-3">
      <p className="mb-4 text-[12px] font-medium text-[#050a0e]">Required Documents</p>
      <div className="grid gap-4 md:grid-cols-2">
        {REQUIRED_UPLOADS.map((target) => {
          const document = documents.find((item) => item.type === target.type);
          return <div key={target.type} className="flex flex-col gap-1"><FieldLabel>{target.title}</FieldLabel>{document ? <div className="flex items-center justify-between gap-3 rounded-[12px] border border-[#cfe2ec] p-3"><a href={document.url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-[12px] font-medium text-[#5c60cc]">{document.title}</a><button type="button" onClick={() => void remove(document.id)} disabled={!isEditable || removeDocument.isPending} className="text-[11px] font-medium text-[#b3261e] disabled:opacity-50">Remove</button></div> : <button type="button" disabled={!isEditable || uploading} onClick={() => { setUploadTarget(target); fileInputRef.current?.click(); }} className="flex min-h-[92px] items-center justify-center rounded-[12px] border border-dashed border-[#cfe2ec] px-4 text-[12px] text-[#919191] transition-colors hover:bg-[#f5f7f8]/50 disabled:opacity-50">{uploading && uploadTarget?.type === target.type ? "Uploading…" : "Browse PDF or image (20MB max)"}</button>}</div>;
        })}
      </div>
    </div>

    {message ? <p className="rounded-[12px] bg-[#edf4f8] px-3 py-2 text-[12px] text-[#050a0e]">{message}</p> : null}
    <WizardFormFooter nextStepLine1="Proceed to the next step" nextStepLine2="Property Description" backHref={listingWizardHref(listingKind, "property-management")} continueLabel="Continue" isSubmitting={isSaving} onContinue={continueNext} />
  </div>;
}
