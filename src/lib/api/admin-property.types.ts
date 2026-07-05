import type { ListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";

export type PropertyApiStatus =
  | "draft"
  | "submitted"
  | "active"
  | "rejected"
  | "paused"
  | "closed";

export type PropertyApiType = "rental" | "construction";

export type PropertyWizardMetadata = {
  wizardVersion: 1;
  listingKind: ListingKind;
  currentStep?: string;
  completedSteps?: string[];
  sections: Record<string, unknown>;
};

export type CreateWizardDraftRequest = {
  listingKind: ListingKind;
  name?: string;
  currentStep?: string;
  sections?: Record<string, unknown>;
};

export type SaveWizardDraftRequest = CreateWizardDraftRequest;

export type PropertyDocumentUploadRequest = {
  type: string;
  title: string;
  url: string;
  storageKey?: string;
  externalUrl?: string;
  subtitle?: string;
  action?: "chevron" | "open" | "download";
};

export type PropertyDocument = {
  id: string;
  type: string;
  title: string;
  url: string;
  storageKey?: string;
  externalUrl?: string;
  subtitle?: string;
  action?: "chevron" | "open" | "download";
  createdAt?: number;
};

export type AdminPropertyListItem = {
  id: string;
  propertyName: string;
  location: string;
  currentStage: string;
  manager: string;
  role: string;
  funding: string;
  fundingPercent: number;
  type: PropertyApiType;
  date: number;
  status: PropertyApiStatus;
};

export type AdminPropertyListResponse = {
  items: AdminPropertyListItem[];
  total: number;
};

export type AdminPropertyListParams = {
  status?: PropertyApiStatus;
  limit?: number;
  offset?: number;
};

export type AdminPropertyDetail = {
  id: string;
  name: string;
  slug?: string;
  type: PropertyApiType;
  status: PropertyApiStatus;
  location?: string;
  heroImage?: string;
  gallery?: string[];
  metadata?: PropertyWizardMetadata;
  documents?: PropertyDocument[];
  legalEntity?: {
    provider?: string; customerId?: string; companyId?: string; entityName?: string; state?: string; status?: string; formationSubmissionStatus?: string; ein?: string; filingDate?: string | number | null; signatureUrl?: string; signatureRequirements?: Array<{ documentType?: string; status?: string }>; lastError?: string; documents?: Array<{ title?: string; type?: string; url?: string; providerDocumentId?: string }>;
  };
  bankAccount?: {
    provider?: string; bridgeCustomerId?: string; kycLinkId?: string; kycLinkUrl?: string; tosLinkUrl?: string; kycStatus?: string; tosStatus?: string; virtualAccountId?: string; status?: string; bankName?: string; accountNumberLast4?: string; routingNumberLast4?: string; beneficiaryName?: string; paymentRails?: string[]; destinationCurrency?: string; lastError?: string;
  };
  createdAt?: number;
  updatedAt?: number;
};

export type PropertyStatusTransitionResponse = {
  id: string;
  status: PropertyApiStatus;
  previousStatus: PropertyApiStatus;
  timestamp: number;
  reason?: string;
};

export type PropertyRejectRequest = {
  reason: string;
};

export type PropertyPauseRequest = {
  reason?: string;
};
