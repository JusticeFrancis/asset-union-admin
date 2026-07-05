"use client";

import { useRouter } from "nextjs-toploader/app";
import { useEffect, useRef, useState } from "react";

import { type ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { WizardFormFooter } from "@/app/(app)/create-listing/wizard-form-footer";
import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { usePropertyWizardPaths } from "@/contexts/property-wizard-scope";
import { usePropertyWizard } from "@/contexts/property-wizard-provider";
import { useListingWizardHref } from "@/lib/property-wizard/use-listing-wizard-href";
import { cn } from "@/lib/utils";
import { uploadAdminFile } from "@/lib/upload-file";

const constructionChevronSrc = ADMIN_ASSETS.complianceLogs.icons.chevronDown;

type BasicPropertyFormProps = {
  listingKind: ListingKind;
};

type BasicInfoFormState = {
  propertyName: string;
  propertyType: string;
  shortSummary: string;
  rentalCategory: string;
  constructionType: string;
  country: string;
  region: string;
  city: string;
  zipcode: string;
  coverImageUrl: string;
  galleryUrls: string[];
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12px] font-medium text-[#050a0e]">{children}</span>
  );
}

function inputClass(optional?: boolean) {
  return cn(
    "flex h-10 w-full rounded-[12px] border border-[#cfe2ec] bg-white px-4 text-[12px] font-medium outline-none transition-colors placeholder:text-[#919191] focus-visible:ring-2 focus-visible:ring-[#5c60cc]/25",
    optional ? "text-[#919191]" : "text-[#050a0e]",
  );
}

function SelectField({
  label,
  chevronSrc,
  value,
  onChange,
  children,
}: {
  label: string;
  chevronSrc: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          className={cn(inputClass(true), "appearance-none pr-10")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {children}
        </select>
        <img
          alt=""
          className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 opacity-70"
          height={20}
          src={chevronSrc}
          width={20}
        />
      </div>
    </div>
  );
}

const EMPTY_FORM: BasicInfoFormState = {
  propertyName: "",
  propertyType: "",
  shortSummary: "",
  rentalCategory: "",
  constructionType: "",
  country: "",
  region: "",
  city: "",
  zipcode: "",
  coverImageUrl: "",
  galleryUrls: [],
};

export function BasicPropertyForm({ listingKind }: BasicPropertyFormProps) {
  const router = useRouter();
  const paths = usePropertyWizardPaths();
  const listingWizardHref = useListingWizardHref();
  const { getSectionData, saveStep, isSaving, propertyId, isEditable } =
    usePropertyWizard();
  const isRental = listingKind === "rental-property";
  const rentalIcons = ADMIN_ASSETS.createListing.rentalWizard;
  const chevronSrc = constructionChevronSrc;

  const saved = getSectionData<BasicInfoFormState>("basicPropertyInformation");
  const [form, setForm] = useState<BasicInfoFormState>({
    ...EMPTY_FORM,
    ...saved,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (saved) {
      setForm({ ...EMPTY_FORM, ...saved });
    }
  }, [saved]);

  const gallerySlots = isRental ? 10 : 8;
  const galleryCols = isRental ? "grid-cols-5" : "grid-cols-4";

  const continueSegment = isRental
    ? "investment-structure"
    : "legal-documentation";
  const nextTitle = isRental ? "Investment Structure" : "Legal & Documentation";

  const buildSectionPayload = () => ({
    basicPropertyInformation: {
      propertyName: form.propertyName,
      propertyType: form.propertyType || undefined,
      shortSummary: form.shortSummary || undefined,
      rentalCategory: isRental ? form.rentalCategory || undefined : undefined,
      constructionType: !isRental
        ? form.constructionType || undefined
        : undefined,
      country: form.country || undefined,
      region: form.region || undefined,
      city: form.city || undefined,
      zipcode: form.zipcode || undefined,
      coverImageUrl: form.coverImageUrl || undefined,
      galleryUrls: form.galleryUrls.filter(Boolean),
    },
  });

  const handleContinue = async () => {
    if (!propertyId || !isEditable) {
      router.push(listingWizardHref(listingKind, continueSegment));
      return;
    }

    await saveStep(
      "basic-property-information",
      buildSectionPayload(),
      listingKind,
    );
    router.push(listingWizardHref(listingKind, continueSegment));
  };

  const updateField = <K extends keyof BasicInfoFormState>(
    key: K,
    value: BasicInfoFormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };


  const uploadCover = async (file: File | undefined) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError("");
    try {
      const uploaded = await uploadAdminFile(file, `asset-union/properties/${propertyId || "draft"}/images`);
      updateField("coverImageUrl", uploaded.url);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload cover image.");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadGallery = async (files: FileList | null) => {
    if (!files?.length) return;
    setIsUploading(true);
    setUploadError("");
    try {
      const remaining = Math.max(0, gallerySlots - form.galleryUrls.length);
      const selected = Array.from(files).slice(0, remaining);
      const uploaded = await Promise.all(selected.map((file) => uploadAdminFile(file, `asset-union/properties/${propertyId || "draft"}/gallery`)));
      updateField("galleryUrls", [...form.galleryUrls, ...uploaded.map((item) => item.url)].slice(0, gallerySlots));
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Unable to upload gallery images.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <FieldLabel>Property Name</FieldLabel>
            <input
              className={inputClass()}
              placeholder="La Casa Espanola Villa 9"
              type="text"
              value={form.propertyName}
              onChange={(e) => updateField("propertyName", e.target.value)}
              disabled={!isEditable}
            />
          </div>
          <SelectField
            label="Property Type"
            chevronSrc={chevronSrc}
            value={form.propertyType}
            onChange={(value) => updateField("propertyType", value)}
          >
            {isRental ? (
              <>
                <option value="">Select type</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
              </>
            ) : (
              <>
                <option value="">-</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </>
            )}
          </SelectField>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-1">
            <FieldLabel>Short Summary</FieldLabel>
            <input
              className={inputClass()}
              placeholder={
                isRental
                  ? "Fully operational luxury villa with consistent rental income"
                  : "Luxury ocean-view villa development in Uluwatu"
              }
              type="text"
              value={form.shortSummary}
              onChange={(e) => updateField("shortSummary", e.target.value)}
              disabled={!isEditable}
            />
          </div>
          {isRental ? (
            <SelectField
              label="Rental Category"
              chevronSrc={chevronSrc}
              value={form.rentalCategory}
              onChange={(value) => updateField("rentalCategory", value)}
            >
              <option value="">Select category</option>
              <option value="short">Short-term rental</option>
              <option value="long">Long-term rental</option>
            </SelectField>
          ) : (
            <SelectField
              label="Construction Type"
              chevronSrc={chevronSrc}
              value={form.constructionType}
              onChange={(value) => updateField("constructionType", value)}
            >
              <option value="">-</option>
              <option value="new">New build</option>
              <option value="renovation">Renovation</option>
            </SelectField>
          )}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <SelectField
            label="Country"
            chevronSrc={chevronSrc}
            value={form.country}
            onChange={(value) => updateField("country", value)}
          >
            <option value="">-</option>
            <option value="US">United States</option>
            <option value="ID">Indonesia</option>
          </SelectField>
          <SelectField
            label="Region / State"
            chevronSrc={chevronSrc}
            value={form.region}
            onChange={(value) => updateField("region", value)}
          >
            <option value="">-</option>
            <option value="FL">Florida</option>
            <option value="BA">Bali</option>
            <option value="CA">California</option>
          </SelectField>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <SelectField
            label="City / Area"
            chevronSrc={chevronSrc}
            value={form.city}
            onChange={(value) => updateField("city", value)}
          >
            <option value="">-</option>
            <option value="Miami">Miami</option>
            <option value="Uluwatu">Uluwatu</option>
          </SelectField>
          <div className="flex flex-col gap-1">
            <FieldLabel>Zipcode</FieldLabel>
            <input
              className={inputClass()}
              placeholder="-"
              type="text"
              value={form.zipcode}
              onChange={(e) => updateField("zipcode", e.target.value)}
              disabled={!isEditable}
            />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-1">
            <FieldLabel>Cover Image URL</FieldLabel>
            <input
              className={inputClass(true)}
              placeholder="https://example.com/hero.jpg"
              type="url"
              value={form.coverImageUrl}
              onChange={(e) => updateField("coverImageUrl", e.target.value)}
              disabled={!isEditable}
            />
            <input ref={coverInputRef} hidden type="file" accept="image/*" onChange={(event) => void uploadCover(event.target.files?.[0])} />
            {form.coverImageUrl ? (
              <img
                alt=""
                src={form.coverImageUrl}
                className="mt-2 h-[140px] w-full rounded-[12px] object-cover"
              />
            ) : (
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={!isEditable || isUploading}
                className="flex min-h-[140px] w-full flex-col items-center justify-center gap-1 rounded-[12px] border border-dashed border-[#cfe2ec] px-4 py-6 transition-colors hover:bg-[#f5f7f8]/50 disabled:opacity-60"
              >
                <img alt="" src={rentalIcons.coverImageUpload} width={48} height={48} className="size-12 shrink-0" />
                <span className="text-[12px] font-medium text-[#050a0e]">{isUploading ? "Uploading…" : "Upload cover image"}</span>
                <span className="text-[12px] font-light text-[#919191]">Cloudinary storage · image files up to 30MB</span>
              </button>
            )}
          </div>
          <div className="flex min-h-0 flex-col gap-1">
            <div className="flex flex-col gap-1">
              <FieldLabel>Gallery Image URLs</FieldLabel>
              <span className="text-[12px] font-light text-[#919191]">
                {isRental
                  ? "Add public URLs for exterior, interior, and amenities."
                  : "Add public image URLs"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={!isEditable || isUploading || form.galleryUrls.length >= gallerySlots} className="rounded-[10px] border border-[#cfe2ec] px-3 py-2 text-[11px] font-medium text-[#5c60cc] disabled:opacity-50">Upload gallery images</button>
              <span className="text-[10px] text-[#919191]">{form.galleryUrls.length}/{gallerySlots}</span>
              <input ref={galleryInputRef} hidden type="file" accept="image/*" multiple onChange={(event) => void uploadGallery(event.target.files)} />
            </div>
            <div className={cn("grid w-full flex-1 gap-2", galleryCols)}>
              {Array.from({ length: gallerySlots }).map((_, i) => (
                <div key={i} className="relative aspect-square overflow-hidden rounded-[10px] border border-[#cfe2ec] bg-[#f5f7f8]">
                  {form.galleryUrls[i] ? (
                    <>
                      <img src={form.galleryUrls[i]} alt={`Gallery ${i + 1}`} className="size-full object-cover" />
                      {isEditable ? <button type="button" onClick={() => updateField("galleryUrls", form.galleryUrls.filter((_, index) => index !== i))} className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-[9px] text-white">Remove</button> : null}
                    </>
                  ) : <button type="button" onClick={() => galleryInputRef.current?.click()} disabled={!isEditable || isUploading} className="flex size-full items-center justify-center text-[10px] text-[#919191]">Upload</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {uploadError ? <p className="rounded-[12px] bg-[#fff1f0] px-3 py-2 text-[12px] text-[#b3261e]">{uploadError}</p> : null}

      <WizardFormFooter
        nextStepLine1="Proceed to the next step"
        nextStepLine2={nextTitle}
        backHref={paths.createListingBase}
        continueLabel="Continue"
        isSubmitting={isSaving}
        onContinue={handleContinue}
      />
    </div>
  );
}
