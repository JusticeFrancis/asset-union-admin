"use client";

import { useState, type ReactNode } from "react";

import {
  PropertyManagerEditSection,
  PropertyStatusActions,
} from "@/app/(app)/property-management/property-management-panels";
import { usePropertyWizardPaths } from "@/contexts/property-wizard-scope";
import { wizardStepsForKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/api/client";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import type { AdminPropertyDetail } from "@/lib/api/admin-property.types";
import {
  getWizardResumeHref,
  isPropertyEditable,
  mapApiStatusToUi,
  mapApiTypeToUi,
  mapTypeToListingKind,
} from "@/lib/property-wizard/mappers";
import { CreateListingWizardStepCheckIcon } from "@/components/icons/create-listing-wizard-step-icons";

type PropertyDetailPageContentProps = {
  property: AdminPropertyDetail;
};

type BasicInfoSection = {
  propertyName?: string;
  propertyType?: string;
  shortSummary?: string;
  constructionType?: string;
  country?: string;
  region?: string;
  city?: string;
  zipcode?: string;
  coverImageUrl?: string;
  galleryUrls?: string[];
};

function readSection<T>(
  property: AdminPropertyDetail,
  key: string,
): T | undefined {
  return property.metadata?.sections?.[key] as T | undefined;
}

export function PropertyDetailPageContent({
  property,
}: PropertyDetailPageContentProps) {
  const paths = usePropertyWizardPaths();
  const { admin } = useAdminAuth();
  const [integration, setIntegration] = useState(property);
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [signingDocumentType, setSigningDocumentType] = useState("");
  const [provisionMessage, setProvisionMessage] = useState("");
  const pm = ADMIN_ASSETS.propertyManagement;
  const listingKind =
    property.metadata?.listingKind ?? mapTypeToListingKind(property.type);
  const steps = wizardStepsForKind(listingKind);
  const basic = readSection<BasicInfoSection>(
    property,
    "basicPropertyInformation",
  );
  const uiStatus = mapApiStatusToUi(property.status);
  const uiType = mapApiTypeToUi(property.type);
  const gallery = basic?.galleryUrls?.length
    ? basic.galleryUrls
    : pm.detailGallery;
  const resumeHref = getWizardResumeHref(property, paths.createListingBase);
  const canEdit = isPropertyEditable(property.status);
  const canManageIntegrations = admin?.permissions?.includes("integrations.manage") ?? false;

  async function retryProvisioning() {
    setIsProvisioning(true);
    setProvisionMessage("");
    try {
      const updated = await apiRequest<AdminPropertyDetail>(`admin/properties/${property.id}/provision`, { method: "POST", auth: true });
      setIntegration(updated);
      setProvisionMessage("Provisioning request completed. Review the provider statuses below.");
    } catch (error) {
      setProvisionMessage(error instanceof Error ? error.message : "Unable to run provisioning.");
    } finally {
      setIsProvisioning(false);
    }
  }

  async function startLegalSignature(documentType: "SS4" | "FORM8821") {
    const signingWindow = window.open("about:blank", "_blank");
    if (signingWindow) signingWindow.opener = null;
    setSigningDocumentType(documentType);
    setProvisionMessage("");
    try {
      const session = await apiRequest<{ url: string }>(
        `admin/properties/${property.id}/legal-signature`,
        {
          method: "POST",
          auth: true,
          json: { documentType },
        },
      );
      if (signingWindow) signingWindow.location.href = session.url;
      else window.open(session.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      signingWindow?.close();
      setProvisionMessage(
        error instanceof Error ? error.message : "Unable to start the legal signature session.",
      );
    } finally {
      setSigningDocumentType("");
    }
  }

  const submissionTitle =
    property.status === "rejected"
      ? "Rejected Submission"
      : "Property submission";

  return (
    <div className="flex flex-col gap-4">
      <Card className="w-full rounded-[20px] border-0 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[19px] font-medium text-[#050A0E]">
              {property.name || basic?.propertyName || "Untitled property"}
            </h2>
            <p className="mt-1 text-[12px] font-light text-[#919191]">
              {property.location ?? "—"} · {uiStatus}
            </p>
          </div>
          {paths.scope === "admin" ? (
            <PropertyStatusActions
              propertyId={property.id}
              apiStatus={property.status}
            />
          ) : null}
        </div>
      </Card>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <Card className="w-full shrink-0 rounded-[20px] border-0 p-6 shadow-sm lg:w-[269px]">
          <ul className="flex flex-col gap-6">
            {steps.map((step) => (
              <li key={step.title} className="flex gap-2">
                <CreateListingWizardStepCheckIcon className="shrink-0" />
                <div className="min-w-0 pt-0.5">
                  <p className="text-[12px] font-normal text-[#050A0E]">
                    {step.title}
                  </p>
                  <p className="mt-1 text-[12px] font-light text-[#919191]">
                    {step.subtitle}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="min-w-0 flex-1 rounded-[20px] border-0 p-6 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[19px] font-medium text-[#050A0E]">
                {submissionTitle}
              </h2>
              <PropertyManagerEditSection
                resumeHref={resumeHref}
                canEdit={canEdit}
              />
            </div>
            <div className="h-px w-full bg-[#CFE2EC]" />

            <div className="flex items-center justify-between text-[12px]">
              <span className="font-light text-[#919191]">Listing Type</span>
              <span className="font-medium text-[#050A0E]">{uiType}</span>
            </div>

            <BorderedBlock title="Basic Property Information">
              <div className="grid gap-6 sm:grid-cols-2">
                <FieldRead
                  label="Property Name"
                  value={basic?.propertyName ?? property.name ?? "—"}
                />
                <FieldRead
                  label="Property Type"
                  value={basic?.propertyType ?? "—"}
                />
                <FieldRead
                  label="Short Summary"
                  value={basic?.shortSummary ?? "—"}
                />
                <FieldRead
                  label="Construction Type"
                  value={basic?.constructionType ?? "—"}
                />
                <FieldRead label="Country" value={basic?.country ?? "—"} />
                <FieldRead
                  label="Region / State"
                  value={basic?.region ?? "—"}
                />
                <FieldRead label="City" value={basic?.city ?? "—"} />
                <FieldRead label="Zipcode" value={basic?.zipcode ?? "—"} />
              </div>
              <p className="mb-2 mt-6 text-[12px] font-medium text-[#050A0E]">
                Gallery
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {gallery.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[6.5px] bg-[#F5F7F8] sm:h-[88px] sm:w-[88px]"
                  >
                    <img alt="" className="size-full object-cover" src={src} />
                  </div>
                ))}
              </div>
            </BorderedBlock>

            <Section title="Property Legal Entity & US Bank Account">
              <div className="grid gap-4 md:grid-cols-2">
                <IntegrationCard
                  title="LLC / Legal Documents"
                  provider={integration.legalEntity?.provider || "doola"}
                  status={integration.legalEntity?.status || "not_started"}
                  rows={[
                    ["Entity", integration.legalEntity?.entityName || "—"],
                    ["Formation state", integration.legalEntity?.state || "—"],
                    ["Company ID", integration.legalEntity?.companyId || "—"],
                    ["EIN", integration.legalEntity?.ein || "Pending"],
                  ]}
                  error={integration.legalEntity?.lastError}
                />
                <IntegrationCard
                  title="US Virtual Bank Account"
                  provider={integration.bankAccount?.provider || "bridge"}
                  status={integration.bankAccount?.status || "not_started"}
                  rows={[
                    ["Bank", integration.bankAccount?.bankName || "—"],
                    ["Account", integration.bankAccount?.accountNumberLast4 ? `•••• ${integration.bankAccount.accountNumberLast4}` : "—"],
                    ["Routing", integration.bankAccount?.routingNumberLast4 ? `•••• ${integration.bankAccount.routingNumberLast4}` : "—"],
                    ["Beneficiary", integration.bankAccount?.beneficiaryName || "—"],
                    ["KYB", integration.bankAccount?.kycStatus || "not started"],
                    ["Terms", integration.bankAccount?.tosStatus || "pending"],
                  ]}
                  links={[
                    ...(integration.bankAccount?.tosLinkUrl ? [{ label: "Accept Bridge Terms", href: integration.bankAccount.tosLinkUrl }] : []),
                    ...(integration.bankAccount?.kycLinkUrl ? [{ label: "Complete Business KYB", href: integration.bankAccount.kycLinkUrl }] : []),
                  ]}
                  error={integration.bankAccount?.lastError}
                />
              </div>
              {integration.legalEntity?.signatureRequirements?.length ? (
                <div className="mt-4 rounded-[12px] border border-[#CFE2EC] p-3">
                  <p className="text-[11px] font-medium text-[#050A0E]">Required legal signatures</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {integration.legalEntity.signatureRequirements.map((requirement) => {
                      const documentType = requirement.documentType === "FORM8821" ? "FORM8821" : "SS4";
                      const complete = /complete|signed|approved/i.test(requirement.status || "");
                      return (
                        <button
                          key={`${documentType}-${requirement.status || "pending"}`}
                          type="button"
                          disabled={!canManageIntegrations || complete || Boolean(signingDocumentType)}
                          onClick={() => void startLegalSignature(documentType)}
                          className="rounded-[8px] border border-[#5c60cc] px-3 py-2 text-[10px] font-medium text-[#5c60cc] disabled:cursor-not-allowed disabled:border-[#CFE2EC] disabled:text-[#919191]"
                        >
                          {complete
                            ? `${documentType} signed`
                            : signingDocumentType === documentType
                              ? "Opening…"
                              : `Sign ${documentType}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
              {integration.legalEntity?.documents?.length ? (
                <div className="mt-4">
                  <p className="mb-2 text-[11px] font-medium text-[#050A0E]">Provider legal documents</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {integration.legalEntity.documents.map((document) =>
                      document.providerDocumentId ? (
                        <a
                          key={document.providerDocumentId}
                          href={`/api/admin/properties/${property.id}/legal-documents/${encodeURIComponent(document.providerDocumentId)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-3 rounded-[10px] border border-[#CFE2EC] p-3 text-[11px] text-[#050A0E]"
                        >
                          <span className="min-w-0 truncate font-medium">{document.title || "Legal document"}</span>
                          <span className="shrink-0 text-[10px] text-[#5c60cc]">Open</span>
                        </a>
                      ) : null,
                    )}
                  </div>
                </div>
              ) : null}
              {provisionMessage ? <p className="mt-3 rounded-[10px] bg-[#edf4f8] px-3 py-2 text-[11px] text-[#050A0E]">{provisionMessage}</p> : null}
              {paths.scope === "admin" && canManageIntegrations ? <button type="button" onClick={() => void retryProvisioning()} disabled={isProvisioning} className="mt-4 h-10 rounded-[12px] bg-[#5c60cc] px-5 text-[12px] font-medium text-white disabled:opacity-60">{isProvisioning ? "Provisioning…" : "Create / Retry LLC and Bank Account"}</button> : null}
            </Section>

            {property.documents?.length ? (
              <Section title="Legal & Documentation">
                <div className="grid gap-4 sm:grid-cols-3">
                  {property.documents.map((doc) => (
                    <LegalDocCard
                      key={doc.id}
                      name={doc.title}
                      size={doc.subtitle ?? doc.type}
                    />
                  ))}
                </div>
              </Section>
            ) : null}

            {Object.entries(property.metadata?.sections ?? {})
              .filter(([key]) => key !== "basicPropertyInformation")
              .map(([key, value]) => (
                <Section key={key} title={formatSectionTitle(key)}>
                  <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[11px] font-light text-[#919191]">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </Section>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function formatSectionTitle(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

function BorderedBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <p className="mb-1 text-[12px] font-normal text-[#050A0E]">{title}</p>
      <div className="rounded-[16px] border border-[#CFE2EC] p-3 sm:p-4">
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="w-full">
      <p className="mb-1 text-[12px] font-normal text-[#050A0E]">{title}</p>
      <div className="rounded-[16px] border border-[#CFE2EC] p-3 sm:p-4">
        {children}
      </div>
    </div>
  );
}

function FieldRead({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-[12px] font-medium text-[#050A0E]">{label}</p>
      <div className="flex min-h-10 items-center text-[12px] font-medium text-[#919191]">
        <span className="break-words">{value}</span>
      </div>
    </div>
  );
}

function LegalDocCard({ name, size }: { name: string; size: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[12px] border border-[#CFE2EC] p-2">
      <img
        alt=""
        width={20}
        height={20}
        className="size-5 shrink-0"
        src={ADMIN_ASSETS.propertyManagement.detailPdfIcon}
      />
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-[#050A0E]">{name}</p>
        <p className="text-[9px] font-light text-[#919191]">{size}</p>
      </div>
    </div>
  );
}

function IntegrationCard({ title, provider, status, rows, links = [], error }: { title: string; provider: string; status: string; rows: Array<[string, string]>; links?: Array<{ label: string; href: string }>; error?: string }) {
  return <div className="rounded-[12px] border border-[#CFE2EC] p-4"><div className="mb-3 flex items-start justify-between gap-3"><div><p className="text-[12px] font-medium text-[#050A0E]">{title}</p><p className="mt-1 text-[10px] uppercase text-[#919191]">Provider: {provider}</p></div><span className="rounded-full bg-[#F5F7F8] px-2 py-1 text-[10px] font-medium text-[#575757]">{status.replaceAll("_", " ")}</span></div><div className="space-y-2">{rows.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-3 text-[11px]"><span className="text-[#919191]">{label}</span><span className="max-w-[65%] break-all text-right font-medium text-[#050A0E]">{value}</span></div>)}</div>{links.length ? <div className="mt-3 flex flex-wrap gap-2">{links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className="rounded-[8px] border border-[#5c60cc] px-2 py-1.5 text-[10px] font-medium text-[#5c60cc]">{link.label}</a>)}</div> : null}{error ? <p className="mt-3 rounded-[8px] bg-[#fff1f0] px-2 py-2 text-[10px] text-[#b3261e]">{error}</p> : null}</div>;
}
