import crypto from "crypto";
import { Property } from "@/models";

function firstNonEmpty(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || "Asset",
    lastName: parts.slice(1).join(" ") || "Union",
  };
}

function section(property: any, key: string) {
  return property.metadata?.sections?.[key] || {};
}

function doolaBaseUrl() {
  return (process.env.DOOLA_BASE_URL || "https://api.test.doola.com").replace(/\/$/, "");
}

async function doolaRequest<T>(path: string, options: RequestInit & { idempotencyKey?: string } = {}) {
  const apiKey = process.env.DOOLA_API_KEY;
  if (!apiKey) throw new Error("DOOLA_API_KEY is not configured");
  const response = await fetch(`${doolaBaseUrl()}${path}`, {
    ...options,
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
      ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.error?.code) {
    throw new Error(body?.error?.message || body?.message || `doola request failed (${response.status})`);
  }
  return (body?.payload ?? body) as T;
}

export async function submitDoolaFormation(property: any) {
  if (!process.env.DOOLA_API_KEY) {
    property.legalEntity.status = "configuration_required";
    property.legalEntity.lastError = "DOOLA_API_KEY is not configured";
    await property.save();
    return property;
  }

  const basic = section(property, "basicPropertyInformation");
  const legal = { ...section(property, "legalDocumentation"), ...section(property, "legalOwnership") };
  const ownerName = firstNonEmpty(
    legal.ownerFullName,
    process.env.DOOLA_OWNER_FULL_NAME,
    process.env.SUPER_ADMIN_NAME,
    "Asset Union Owner",
  );
  const { firstName, lastName } = splitName(ownerName);
  const email = firstNonEmpty(legal.ownerEmail, process.env.DOOLA_OWNER_EMAIL, process.env.SUPER_ADMIN_EMAIL);
  const phone = firstNonEmpty(legal.ownerPhone, process.env.DOOLA_OWNER_PHONE);
  const country = firstNonEmpty(legal.ownerCountry, process.env.DOOLA_OWNER_COUNTRY, "USA").toUpperCase();
  if (!email) {
    property.legalEntity.status = "information_required";
    property.legalEntity.lastError = "A legal owner email is required for doola formation";
    await property.save();
    return property;
  }

  const entityBase = firstNonEmpty(property.name, basic.propertyName, "Asset Union Property").replace(/\bLLC\b/gi, "").trim();
  const state = firstNonEmpty(legal.formationState, basic.region, process.env.DOOLA_FORMATION_STATE, "WY").toUpperCase();
  const line1 = firstNonEmpty(legal.ownerAddressLine1, process.env.DOOLA_OWNER_ADDRESS_LINE1);
  const city = firstNonEmpty(legal.ownerCity, process.env.DOOLA_OWNER_CITY);
  const ownerState = firstNonEmpty(legal.ownerState, process.env.DOOLA_OWNER_STATE);
  const postalCode = firstNonEmpty(legal.ownerPostalCode, process.env.DOOLA_OWNER_POSTAL_CODE);
  const addressCountry = firstNonEmpty(legal.ownerAddressCountry, process.env.DOOLA_OWNER_ADDRESS_COUNTRY, country).toUpperCase();
  if (!line1 || !city || !postalCode) {
    property.legalEntity.status = "information_required";
    property.legalEntity.lastError = "Legal owner address fields are required for doola formation";
    await property.save();
    return property;
  }

  const address = {
    line1,
    ...(firstNonEmpty(legal.ownerAddressLine2, process.env.DOOLA_OWNER_ADDRESS_LINE2)
      ? { line2: firstNonEmpty(legal.ownerAddressLine2, process.env.DOOLA_OWNER_ADDRESS_LINE2) }
      : {}),
    city,
    ...(ownerState ? { state: ownerState } : {}),
    postalCode,
    country: addressCountry,
    ...(phone ? { phone } : {}),
  };

  property.legalEntity.status = "submitting";
  property.legalEntity.lastError = "";
  await property.save();

  try {
    let customerId = property.legalEntity.customerId;
    if (!customerId) {
      const customer = await doolaRequest<any>("/v1/partner/customers", {
        method: "POST",
        idempotencyKey: `property-${property._id}-customer`,
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          countryOfResidence: country,
          ...(phone ? { phoneNumber: phone } : {}),
        }),
      });
      customerId = firstNonEmpty(customer.doolaCustomerId, customer.id);
      if (!customerId) throw new Error("doola did not return a customer ID");
      property.legalEntity.customerId = customerId;
      await property.save();
    }

    const company = await doolaRequest<any>("/v1/partner/companies", {
      method: "POST",
      idempotencyKey: `property-${property._id}-company`,
      body: JSON.stringify({
        doolaCustomerId: customerId,
        entityType: "LLC",
        state,
        nameOptions: [
          { name: entityBase, entityTypeEnding: "LLC", position: 1 },
          { name: `${entityBase} Holdings`, entityTypeEnding: "LLC", position: 2 },
          { name: `${entityBase} Property`, entityTypeEnding: "LLC", position: 3 },
        ],
        industry: process.env.DOOLA_INDUSTRY || "Lessors of Residential Buildings and Dwellings",
        description: firstNonEmpty(basic.shortSummary, `Property holding entity for ${property.name}`),
        responsibleParty: {
          legalFirstName: firstName,
          legalLastName: lastName,
          email,
          address,
        },
        members: [
          {
            legalFirstName: firstName,
            legalLastName: lastName,
            isNaturalPerson: true,
            address,
            ownershipPercent: 100,
          },
        ],
      }),
    });

    const companyId = firstNonEmpty(company.doolaCompanyId, company.id);
    if (!companyId) throw new Error("doola did not return a company ID");
    property.legalEntity.companyId = companyId;
    property.legalEntity.entityName = company.name || `${entityBase} LLC`;
    property.legalEntity.state = company.state || state;
    property.legalEntity.status = "pending";
    property.legalEntity.formationSubmissionStatus = company.formationSubmissionStatus || "PENDING";
    property.legalEntity.signatureRequirements = Array.isArray(company.signatureRequirements)
      ? company.signatureRequirements.map((requirement: any) => ({
          documentType: requirement.documentType || requirement.type || "",
          status: requirement.status || "pending",
        })).filter((requirement: any) => requirement.documentType)
      : property.legalEntity.signatureRequirements || [];
    property.legalEntity.lastError = "";
    await property.save();
    return property;
  } catch (error) {
    property.legalEntity.status = "failed";
    property.legalEntity.lastError = error instanceof Error ? error.message : "Formation submission failed";
    await property.save();
    throw error;
  }
}

export async function getDoolaCompany(companyId: string) {
  return doolaRequest<any>(`/v1/partner/companies/${encodeURIComponent(companyId)}`, { method: "GET" });
}

export type DoolaSignatureDocumentType = "SS4" | "FORM8821";

export async function createDoolaSignatureSession(
  companyId: string,
  documentType: DoolaSignatureDocumentType,
) {
  return doolaRequest<any>(`/v1/partner/companies/${encodeURIComponent(companyId)}/signatures`, {
    method: "POST",
    body: JSON.stringify({ documentType }),
  });
}

export async function getDoolaDocument(companyId: string, documentId: string) {
  return doolaRequest<any>(
    `/v1/partner/companies/${encodeURIComponent(companyId)}/documents/${encodeURIComponent(documentId)}`,
    { method: "GET" },
  );
}

async function bridgeRequest<T>(path: string, options: RequestInit & { idempotencyKey?: string } = {}) {
  const apiKey = process.env.BRIDGE_API_KEY;
  if (!apiKey) throw new Error("BRIDGE_API_KEY is not configured");
  const baseUrl = (process.env.BRIDGE_BASE_URL || "https://api.bridge.xyz/v0").replace(/\/$/, "");
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "Api-Key": apiKey,
      "Content-Type": "application/json",
      ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body?.message || body?.error || `Bridge request failed (${response.status})`);
  return body as T;
}

async function ensureBridgeBusinessCustomer(property: any) {
  const sharedCustomerId = process.env.BRIDGE_CUSTOMER_ID;
  if (property.bankAccount.bridgeCustomerId || sharedCustomerId) {
    property.bankAccount.bridgeCustomerId = property.bankAccount.bridgeCustomerId || sharedCustomerId;
    property.bankAccount.kycStatus = property.bankAccount.kycStatus === "not_started" ? "approved_or_managed_externally" : property.bankAccount.kycStatus;
    await property.save();
    return property.bankAccount.bridgeCustomerId;
  }

  const legal = { ...section(property, "legalDocumentation"), ...section(property, "legalOwnership") };
  const ownerEmail = firstNonEmpty(legal.ownerEmail, process.env.BRIDGE_BUSINESS_EMAIL, process.env.SUPER_ADMIN_EMAIL);
  const entityName = firstNonEmpty(property.legalEntity?.entityName, property.name, "Asset Union Property LLC");
  if (!ownerEmail || !entityName || entityName === "Untitled property") {
    property.bankAccount.status = "information_required";
    property.bankAccount.lastError = "A property legal name and responsible-party email are required before Bridge business onboarding can start";
    await property.save();
    return "";
  }

  if (!property.bankAccount.kycLinkId) {
    const link = await bridgeRequest<any>("/kyc_links", {
      method: "POST",
      idempotencyKey: `property-${property._id}-business-kyb`,
      body: JSON.stringify({ full_name: entityName, email: ownerEmail, type: "business" }),
    });
    if (!link.id && !link.customer_id) throw new Error("Bridge did not return a KYB link or customer ID");
    property.bankAccount.kycLinkId = link.id || "";
    property.bankAccount.kycLinkUrl = link.kyc_link || "";
    property.bankAccount.tosLinkUrl = link.tos_link || "";
    property.bankAccount.kycStatus = link.kyc_status || "not_started";
    property.bankAccount.tosStatus = link.tos_status || "pending";
    property.bankAccount.bridgeCustomerId = link.customer_id || "";
    property.bankAccount.status = link.kyc_status === "approved" && link.tos_status === "approved" ? "ready" : "kyb_required";
    property.bankAccount.lastError = property.bankAccount.status === "kyb_required" ? "Complete the Bridge Terms of Service and business KYB links before creating the USD virtual account" : "";
    await property.save();
    return property.bankAccount.status === "ready" ? property.bankAccount.bridgeCustomerId : "";
  }

  const link = await bridgeRequest<any>(`/kyc_links/${encodeURIComponent(property.bankAccount.kycLinkId)}`, { method: "GET" });
  property.bankAccount.kycLinkUrl = link.kyc_link || property.bankAccount.kycLinkUrl || "";
  property.bankAccount.tosLinkUrl = link.tos_link || property.bankAccount.tosLinkUrl || "";
  property.bankAccount.kycStatus = link.kyc_status || property.bankAccount.kycStatus || "not_started";
  property.bankAccount.tosStatus = link.tos_status || property.bankAccount.tosStatus || "pending";
  property.bankAccount.bridgeCustomerId = link.customer_id || property.bankAccount.bridgeCustomerId || "";
  const approved = property.bankAccount.kycStatus === "approved" && property.bankAccount.tosStatus === "approved" && property.bankAccount.bridgeCustomerId;
  property.bankAccount.status = approved ? "ready" : property.bankAccount.kycStatus === "rejected" ? "failed" : "kyb_required";
  property.bankAccount.lastError = approved ? "" : property.bankAccount.kycStatus === "rejected" ? "Bridge business KYB was rejected. Review the Bridge dashboard or create a new onboarding link." : "Complete the Bridge Terms of Service and business KYB links before creating the USD virtual account";
  await property.save();
  return approved ? property.bankAccount.bridgeCustomerId : "";
}

export async function provisionBridgeVirtualAccount(property: any) {
  if (!process.env.BRIDGE_API_KEY) {
    property.bankAccount.status = "configuration_required";
    property.bankAccount.lastError = "BRIDGE_API_KEY is not configured";
    await property.save();
    return property;
  }
  if (property.bankAccount.virtualAccountId) return property;

  let customerId = "";
  try {
    customerId = await ensureBridgeBusinessCustomer(property);
  } catch (error) {
    property.bankAccount.status = "failed";
    property.bankAccount.lastError = error instanceof Error ? error.message : "Bridge business onboarding failed";
    await property.save();
    throw error;
  }
  if (!customerId) return property;

  const address = process.env.BRIDGE_DESTINATION_WALLET_ADDRESS;
  if (!address) {
    property.bankAccount.status = "configuration_required";
    property.bankAccount.lastError = "BRIDGE_DESTINATION_WALLET_ADDRESS is required";
    await property.save();
    return property;
  }

  property.bankAccount.status = "provisioning";
  property.bankAccount.bridgeCustomerId = customerId;
  property.bankAccount.lastError = "";
  await property.save();

  try {
    const body = await bridgeRequest<any>(`/customers/${encodeURIComponent(customerId)}/virtual_accounts`, {
      method: "POST",
      idempotencyKey: `property-${property._id}-virtual-account`,
      body: JSON.stringify({
        source: { currency: "usd" },
        destination: {
          currency: process.env.BRIDGE_DESTINATION_CURRENCY || "usdc",
          payment_rail: process.env.BRIDGE_DESTINATION_RAIL || "base",
          address,
        },
        ...(process.env.BRIDGE_DEVELOPER_FEE_PERCENT ? { developer_fee_percent: process.env.BRIDGE_DEVELOPER_FEE_PERCENT } : {}),
      }),
    });
    if (!body.id) throw new Error("Bridge did not return a virtual account ID");
    const instructions = body.source_deposit_instructions || {};
    property.bankAccount.virtualAccountId = body.id;
    property.bankAccount.status = body.status || "activated";
    property.bankAccount.bankName = instructions.bank_name || "";
    property.bankAccount.accountNumberLast4 = String(instructions.bank_account_number || "").slice(-4);
    property.bankAccount.routingNumberLast4 = String(instructions.bank_routing_number || "").slice(-4);
    property.bankAccount.beneficiaryName = instructions.bank_beneficiary_name || "";
    property.bankAccount.paymentRails = instructions.payment_rails || [];
    property.bankAccount.destinationCurrency = body.destination?.currency || "usdc";
    property.bankAccount.lastError = "";
    await property.save();
    return property;
  } catch (error) {
    property.bankAccount.status = "failed";
    property.bankAccount.lastError = error instanceof Error ? error.message : "Bridge account provisioning failed";
    await property.save();
    throw error;
  }
}

export async function beginPropertyProvisioning(propertyId: string) {
  const property = await Property.findById(propertyId);
  if (!property) return;
  try {
    await submitDoolaFormation(property);
  } catch {
    // Formation status/error is persisted. Continue so bank provisioning can be retried independently.
  }
  // Bridge virtual accounts can be provisioned immediately under an approved configured
  // Bridge customer. If a property-specific Bridge customer is used, set its ID first.
  const current = await Property.findById(propertyId);
  if (!current) return;
  try {
    await provisionBridgeVirtualAccount(current);
  } catch {
    // Status/error are persisted; the admin can retry from the property endpoint.
  }
}

export function verifyDoolaSignature(rawBody: string, signature: string | null) {
  const secret = process.env.DOOLA_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const normalizedSignature = signature.replace(/^sha256=/i, "").trim();
  const a = Buffer.from(expected);
  const b = Buffer.from(normalizedSignature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
