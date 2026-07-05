"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";

import { type ListingKind, type WizardStepSegment, wizardStepsForKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { inputClass } from "@/app/(app)/create-listing/wizard-form-primitives";
import { WizardFormFooter } from "@/app/(app)/create-listing/wizard-form-footer";
import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { usePropertyWizard } from "@/contexts/property-wizard-provider";
import { usePropertyWizardPaths } from "@/contexts/property-wizard-scope";
import { getAdminErrorMessage } from "@/lib/auth/errors";
import { getOrgErrorMessage } from "@/lib/auth/org-errors";
import { useListingWizardHref } from "@/lib/property-wizard/use-listing-wizard-href";
import { segmentToSectionKey } from "@/lib/property-wizard/section-keys";
import { useScopedSubmitPropertyMutation } from "@/lib/property-wizard/use-scoped-property-api";
import { cn } from "@/lib/utils";

type ReviewCheckFormProps = { listingKind: ListingKind };
const LISTING_TYPE_LABEL: Record<ListingKind, string> = { "construction-project": "Construction", "rental-property": "Rental property" };
const LABELS: Record<string, string> = {
  propertyName: "Property Name", propertyType: "Property Type", shortSummary: "Short Summary", rentalCategory: "Rental Category", constructionType: "Construction Type", country: "Country", region: "Region / State", city: "City / Area", zipcode: "Zipcode", coverImageUrl: "Cover Image", galleryUrls: "Gallery",
  propertyValuation: "Property Price / Valuation", sharePrice: "Share Price", totalShares: "Total Shares", minimumShares: "Minimum Purchase (shares)", maximumSharesPerUser: "Maximum Purchase Per User", fundingStatus: "Funding Status",
  expectedAnnualRentalIncome: "Expected Annual Rental Income", expectedApr: "Expected APR", occupancyRate: "Occupancy Rate", distributionFrequency: "Rent Distribution Frequency", rentStartDate: "Rent Start Date", payoutCurrency: "Payout Currency",
  bedrooms: "Bedrooms", bathrooms: "Bathrooms", kitchens: "Kitchens", livingRooms: "Living Rooms", builtArea: "Built Area (sqm/sqft)", landSize: "Land Size (sqm/sqft)", yearBuiltOrRenovated: "Year Built / Renovated", furnishingStatus: "Furnishing Status", amenities: "Amenities", existingPartner: "Existing Partner", managerCompanyName: "Property Manager / Company Name", managementType: "Management Type", operationalNotes: "Operational Notes",
  ownershipType: "Ownership Type", legalRightType: "Legal Right Type", ownerFullName: "Legal Owner Full Name", ownerEmail: "Legal Owner Email", ownerPhone: "Phone Number", ownerCountry: "Country of Residence", formationState: "LLC Formation State", ownerAddressLine1: "Address Line 1", ownerAddressLine2: "Address Line 2", ownerCity: "Owner City", ownerState: "Owner State / Region", ownerPostalCode: "Postal Code", ownerAddressCountry: "Address Country",
  overview: "Overview", rentalDemandRationale: "Rental Demand Rationale", tenantProfile: "Tenant Profile", locationAdvantage: "Location Advantage",
  totalFundingGoal: "Total Funding Goal", fundingStartDate: "Funding Start Date", builderContractor: "Builder / Contractor", permitStatus: "Permit Status", estimatedCompletionValue: "Estimated Completion Value", propagationRightTerms: "Propagation Right Terms", tradingLock: "Trading Lock Until",
};
const MONEY_KEYS = new Set(["propertyValuation", "sharePrice", "expectedAnnualRentalIncome", "totalFundingGoal", "estimatedCompletionValue"]);
const PERCENT_KEYS = new Set(["expectedApr", "occupancyRate"]);
const HIDDEN_KEYS = new Set(["coverImageUrl", "galleryUrls", "stages"]);

function humanize(value: string) { return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function labelFor(key: string) { return LABELS[key] || key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase()); }
function displayValue(key: string, value: unknown) {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.map((item) => humanize(String(item))).join(", ") : "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number" || /^\d+(\.\d+)?$/.test(String(value))) {
    const number = Number(value);
    if (MONEY_KEYS.has(key)) return `$${number.toLocaleString()}`;
    if (PERCENT_KEYS.has(key)) return `${number}%`;
    return number.toLocaleString();
  }
  return humanize(String(value));
}

function ReviewField({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return <div className="flex min-w-0 flex-1 flex-col gap-1"><span className="text-[12px] font-medium text-[#050a0e]">{label}</span><div className={cn(inputClass(true), "h-auto min-h-10 justify-between", multiline ? "items-start whitespace-normal py-2.5 leading-snug" : "items-center")}>{value}</div></div>;
}

function ReviewSection({ title, editSegment, listingKind, children }: { title: string; editSegment: WizardStepSegment; listingKind: ListingKind; children: React.ReactNode }) {
  const wizardHref = useListingWizardHref();
  return <div className="flex flex-col gap-1"><div className="flex items-start justify-between gap-3 text-[12px]"><p className="min-w-0 text-[#050a0e]">{title}</p><Link href={wizardHref(listingKind, editSegment)} className="shrink-0 font-medium text-[#5c60cc] underline">Edit</Link></div><div className="flex flex-col gap-4 rounded-2xl border border-[#cfe2ec] p-3">{children}</div></div>;
}

function SectionFields({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([key, value]) => !HIDDEN_KEYS.has(key) && value !== undefined && value !== null);
  if (!entries.length) return <p className="text-[12px] text-[#919191]">No details have been entered for this section.</p>;
  return <div className="grid gap-4 md:grid-cols-2 md:gap-6">{entries.map(([key, value]) => <ReviewField key={key} label={labelFor(key)} value={displayValue(key, value)} multiline={["shortSummary", "operationalNotes", "overview", "rentalDemandRationale", "tenantProfile", "locationAdvantage"].includes(key)} />)}</div>;
}

function TimelineFields({ stages }: { stages: Array<Record<string, unknown>> }) {
  if (!stages.length) return <p className="text-[12px] text-[#919191]">No timeline stages added.</p>;
  return <div className="flex flex-col gap-4">{stages.map((stage, index) => <div key={String(stage.id || index)} className="rounded-[12px] border border-[#edf4f8] p-3"><p className="mb-3 text-[11px] font-medium text-[#919191]">Stage {index + 1}</p><SectionFields data={stage} /></div>)}</div>;
}

function ReviewDocuments({ documents }: { documents: Array<{ id: string; title: string; url: string; type: string }> }) {
  const pdf = ADMIN_ASSETS.createListing.legalDocumentation.pdfRowIcon;
  if (!documents.length) return <p className="text-[12px] text-[#919191]">No documents uploaded.</p>;
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{documents.map((document) => <a key={document.id} href={document.url} target="_blank" rel="noreferrer" className="rounded-xl border border-[#cfe2ec] p-2 transition-colors hover:bg-[#f5f7f8]"><div className="flex items-center gap-2"><Image src={pdf} alt="" width={20} height={20} /><div className="min-w-0"><p className="truncate text-[12px] font-medium text-[#050a0e]">{document.title}</p><p className="text-[9px] font-light text-[#919191]">{humanize(document.type)}</p></div></div></a>)}</div>;
}

function ReviewGallery({ urls }: { urls: string[] }) {
  if (!urls.length) return <p className="text-[12px] text-[#919191]">No gallery images uploaded.</p>;
  return <div className="flex flex-wrap gap-1.5">{urls.map((src, index) => <div key={`${src}-${index}`} className="relative size-[73px] overflow-hidden rounded-[6.5px] border border-[#cfe2ec]"><Image src={src} alt="" fill className="object-cover" sizes="73px" unoptimized /></div>)}</div>;
}

function ReviewSubmitFooter({ listingKind, backSegment }: { listingKind: ListingKind; backSegment: WizardStepSegment }) {
  const router = useRouter(); const { propertyId, isEditable } = usePropertyWizard(); const { scope } = usePropertyWizardPaths(); const wizardHref = useListingWizardHref(); const submitMutation = useScopedSubmitPropertyMutation(); const [error, setError] = useState<string | null>(null); const formatError = scope === "organization" ? getOrgErrorMessage : getAdminErrorMessage;
  async function handleSubmit() { if (!propertyId) { setError("Property draft not found. Start from the listing type page."); return; } if (!isEditable) { router.push(wizardHref(listingKind, "form-completed")); return; } setError(null); try { await submitMutation.mutateAsync(propertyId); router.push(wizardHref(listingKind, "form-completed")); } catch (err) { setError(formatError(err, "Failed to submit property.")); } }
  return <>{error ? <p className="text-[12px] text-[#B3261E]">{error}</p> : null}<WizardFormFooter nextStepLine1="There are no more steps" nextStepLine2="Completed" backHref={wizardHref(listingKind, backSegment)} continueLabel={scope === "organization" ? "Submit for review" : "Submit for Approval"} isSubmitting={submitMutation.isPending} onContinue={handleSubmit} /></>;
}

export function ReviewCheckForm({ listingKind }: ReviewCheckFormProps) {
  const { property } = usePropertyWizard();
  const sections = (property?.metadata?.sections || {}) as Record<string, Record<string, unknown>>;
  const steps = wizardStepsForKind(listingKind).filter((step) => step.segment !== "review-check");
  const documents = (property?.documents || []) as Array<{ id: string; title: string; url: string; type: string }>;
  const basic = sections.basicPropertyInformation || {};
  const gallery = Array.isArray(basic.galleryUrls) ? basic.galleryUrls.map(String) : property?.gallery || [];
  const lastStep = steps.at(-1)?.segment || "basic-property-information";
  return <div className="flex flex-col gap-6"><div className="flex items-center justify-between gap-4 text-[12px]"><span className="font-light text-[#919191]">Listing Type</span><span className="shrink-0 font-medium text-[#050a0e]">{LISTING_TYPE_LABEL[listingKind]}</span></div>
    {steps.map((step) => { const sectionKey = segmentToSectionKey(step.segment); const data = sections[sectionKey] || {}; const stages = Array.isArray(data.stages) ? data.stages as Array<Record<string, unknown>> : []; const isLegal = ["legal-documentation", "legal-ownership"].includes(step.segment); return <ReviewSection key={step.segment} title={step.title} editSegment={step.segment} listingKind={listingKind}><SectionFields data={data} />{step.segment === "basic-property-information" ? <div><p className="mb-1 text-[12px] font-medium text-[#050a0e]">Gallery</p><ReviewGallery urls={gallery} /></div> : null}{stages.length || ["construction-timeline", "project-timeline"].includes(step.segment) ? <TimelineFields stages={stages} /> : null}{isLegal ? <ReviewDocuments documents={documents.filter((document) => step.segment === "legal-documentation" ? document.type === "construction_legal_document" : document.type !== "construction_legal_document" && document.type !== "management_agreement")} /> : null}{step.segment === "property-management" ? <ReviewDocuments documents={documents.filter((document) => document.type === "management_agreement")} /> : null}</ReviewSection>; })}
    <ReviewSubmitFooter listingKind={listingKind} backSegment={lastStep} />
  </div>;
}
