function timestamp(value: unknown) {
  return value ? new Date(value as string).getTime() : undefined;
}

export function propertyDetail(property: any) {
  return {
    id: String(property._id),
    name: property.name,
    slug: property.slug,
    type: property.type,
    status: property.status,
    location: property.location,
    heroImage: property.heroImage,
    gallery: property.gallery || [],
    metadata: property.metadata,
    documents: (property.documents || []).map((doc: any) => ({
      id: String(doc._id), type: doc.type, title: doc.title, url: doc.url, storageKey: doc.storageKey,
      externalUrl: doc.externalUrl, subtitle: doc.subtitle, action: doc.action, createdAt: timestamp(doc.createdAt),
    })),
    legalEntity: property.legalEntity,
    bankAccount: property.bankAccount,
    createdAt: timestamp(property.createdAt),
    updatedAt: timestamp(property.updatedAt),
  };
}

export function propertyListItem(property: any) {
  const target = Number(property.fundingTarget || 0);
  const raised = Number(property.fundingRaised || 0);
  return {
    id: String(property._id),
    propertyName: property.name,
    location: property.location || "Not specified",
    currentStage: property.currentStage || property.status,
    manager: property.managerName || "Unassigned",
    role: property.managerRole || "Property Manager",
    funding: target ? `$${raised.toLocaleString()} / $${target.toLocaleString()}` : "Not configured",
    fundingPercent: target ? Math.min(100, Math.round((raised / target) * 100)) : 0,
    type: property.type,
    date: timestamp(property.createdAt) || Date.now(),
    status: property.status,
  };
}

export function derivePropertyFields(property: any) {
  const sections = property.metadata?.sections || {};

  const basic =
    sections.basicPropertyInformation || {};

  const management =
    sections.propertyManagement || {};

  const funding =
    sections.fundingStructure ||
    sections.investmentStructure ||
    sections.rentalEconomics ||
    {};

  property.name =
    String(
      basic.propertyName ||
        property.name ||
        "Untitled property",
    ).trim();

  const baseSlug = property.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const uniqueSuffix = property._id
    ? String(property._id).slice(-8)
    : Math.random().toString(36).slice(2, 10);

  /*
   * Preserve an existing published slug so public URLs do not change.
   * Draft properties can update their slug when the property name changes.
   */
  if (!property.slug || property.status === "draft") {
    property.slug = `${
      baseSlug || "property"
    }-${uniqueSuffix}`;
  }

  property.type =
    property.metadata?.listingKind ===
    "construction-project"
      ? "construction"
      : "rental";

  property.location = [
    basic.city,
    basic.region,
    basic.country,
  ]
    .filter(Boolean)
    .join(", ");

  property.heroImage =
    basic.coverImageUrl ||
    property.heroImage ||
    "";

  property.gallery = Array.isArray(
    basic.galleryUrls,
  )
    ? basic.galleryUrls
    : property.gallery || [];

  property.managerName =
    management.managerName ||
    management.propertyManagerName ||
    management.managerCompanyName ||
    property.managerName ||
    "";

  property.managerRole =
    management.managerRole ||
    property.managerRole ||
    "Property Manager";

  property.fundingTarget = Number(
    funding.fundingTarget ||
      funding.totalFundingTarget ||
      funding.totalFundingGoal ||
      funding.propertyValue ||
      funding.propertyValuation ||
      property.fundingTarget ||
      0,
  );

  const status = String(
    property.status || "draft",
  );

  property.currentStage =
    status === "draft"
      ? "Draft"
      : `${status.charAt(0).toUpperCase()}${status.slice(
          1,
        )}`;

  return property;
}