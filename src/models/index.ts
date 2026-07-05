import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { ADMIN_ROLES, PERMISSIONS } from "@/lib/server/constants";

const timestamps = { timestamps: true } as const;

const adminSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, default: null, select: false },
    role: { type: String, enum: ADMIN_ROLES, required: true, default: "custom" },
    customRoleName: { type: String, default: "" },
    customPermissions: [{ type: String, enum: PERMISSIONS }],
    status: { type: String, enum: ["active", "suspended", "invited"], default: "invited", index: true },
    avatarUrl: { type: String, default: "" },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null, select: false },
    inviteAcceptedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  timestamps,
);

const adminInviteSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    acceptedAt: { type: Date, default: null },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  timestamps,
);

const adminSessionSchema = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    refreshTokenHash: { type: String, required: true, unique: true, index: true },
    userAgent: { type: String, default: "" },
    browser: { type: String, default: "Unknown browser" },
    os: { type: String, default: "Unknown OS" },
    deviceType: { type: String, default: "Desktop" },
    ip: { type: String, default: "Unknown" },
    location: { type: String, default: "Unknown location" },
    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    revokedAt: { type: Date, default: null },
  },
  timestamps,
);

const propertyDocumentSchema = new Schema(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    storageKey: { type: String, default: "" },
    externalUrl: { type: String, default: "" },
    subtitle: { type: String, default: "" },
    action: { type: String, enum: ["chevron", "open", "download"], default: "open" },
  },
  { timestamps: true },
);

const propertySchema = new Schema(
  {
    name: { type: String, default: "Untitled property", trim: true, index: true },
    slug: { type: String, default: "", index: true },
    type: { type: String, enum: ["rental", "construction"], required: true },
    status: { type: String, enum: ["draft", "submitted", "active", "rejected", "paused", "closed"], default: "draft", index: true },
    location: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    gallery: [{ type: String }],
    managerName: { type: String, default: "" },
    managerRole: { type: String, default: "Property Manager" },
    fundingTarget: { type: Number, default: 0 },
    fundingRaised: { type: Number, default: 0 },
    currentStage: { type: String, default: "Draft" },
    metadata: {
      wizardVersion: { type: Number, default: 1 },
      listingKind: { type: String, enum: ["rental-property", "construction-project"], required: true },
      currentStep: { type: String, default: "basicPropertyInformation" },
      completedSteps: [{ type: String }],
      sections: { type: Schema.Types.Mixed, default: {} },
    },
    documents: [propertyDocumentSchema],
    legalEntity: {
      provider: { type: String, default: "doola" },
      customerId: { type: String, default: "" },
      companyId: { type: String, default: "" },
      entityName: { type: String, default: "" },
      state: { type: String, default: "" },
      status: { type: String, default: "not_started" },
      formationSubmissionStatus: { type: String, default: "" },
      ein: { type: String, default: "" },
      filingDate: { type: Date, default: null },
      signatureUrl: { type: String, default: "" },
      signatureRequirements: [{ documentType: String, status: String }],
      lastError: { type: String, default: "" },
      documents: [{ title: String, type: String, url: String, providerDocumentId: String }],
    },
    bankAccount: {
      provider: { type: String, default: "bridge" },
      bridgeCustomerId: { type: String, default: "" },
      kycLinkId: { type: String, default: "" },
      kycLinkUrl: { type: String, default: "" },
      tosLinkUrl: { type: String, default: "" },
      kycStatus: { type: String, default: "not_started" },
      tosStatus: { type: String, default: "pending" },
      virtualAccountId: { type: String, default: "" },
      status: { type: String, default: "not_started" },
      bankName: { type: String, default: "" },
      accountNumberLast4: { type: String, default: "" },
      routingNumberLast4: { type: String, default: "" },
      beneficiaryName: { type: String, default: "" },
      paymentRails: [{ type: String }],
      destinationCurrency: { type: String, default: "usdc" },
      lastError: { type: String, default: "" },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    submittedAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },
    pauseReason: { type: String, default: "" },
  },
  timestamps,
);

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    country: { type: String, default: "" },
    status: { type: String, enum: ["active", "suspended", "pending"], default: "active", index: true },
    kycStatus: { type: String, enum: ["not_started", "pending", "verified", "rejected"], default: "not_started" },
    accountType: { type: String, enum: ["investor", "tenant", "property_owner"], default: "investor" },
    acceptedTermsAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  timestamps,
);

const rentSchema = new Schema(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    grossRent: { type: Number, required: true, min: 0 },
    expenses: { type: Number, default: 0, min: 0 },
    netDistributable: { type: Number, default: 0, min: 0 },
    managementFee: { type: Number, default: 0, min: 0 },
    distributionDate: { type: Date, default: null },
    status: { type: String, enum: ["draft", "submitted", "approved", "distributed", "rejected"], default: "draft", index: true },
    notes: { type: String, default: "" },
    documents: [propertyDocumentSchema],
    submittedBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  timestamps,
);

const governanceProposalSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    estimatedCost: { type: Number, default: 0 },
    closesAt: { type: Date, required: true },
    status: { type: String, enum: ["active", "closed", "draft"], default: "active", index: true },
    quorumPercent: { type: Number, default: 51 },
    eligibleVotes: { type: Number, default: 0 },
    proposedBy: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  },
  timestamps,
);

const governanceVoteSchema = new Schema(
  {
    proposalId: { type: Schema.Types.ObjectId, ref: "GovernanceProposal", required: true, index: true },
    voterAdminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true, index: true },
    choice: { type: String, enum: ["for", "against", "abstain"], required: true },
    votingPower: { type: Number, default: 1 },
  },
  timestamps,
);
governanceVoteSchema.index({ proposalId: 1, voterAdminId: 1 }, { unique: true });

const notificationSchema = new Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    audience: { type: String, required: true, default: "All" },
    channels: [{ type: String, enum: ["in_app", "email"] }],
    sendOption: { type: String, enum: ["now", "schedule"], default: "now" },
    scheduledFor: { type: Date, default: null, index: true },
    sentAt: { type: Date, default: null },
    status: { type: String, enum: ["draft", "scheduled", "sent", "failed"], default: "draft", index: true },
    type: { type: String, default: "manual", index: true },
    origin: { type: String, enum: ["manual", "activity", "system"], default: "manual" },
    entityType: { type: String, default: "" },
    entityId: { type: String, default: "" },
    createdBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
    recipientsCount: { type: Number, default: 0 },
    emailSentCount: { type: Number, default: 0 },
    readBy: [{ type: Schema.Types.ObjectId, ref: "Admin" }],
    error: { type: String, default: "" },
  },
  timestamps,
);

const complianceLogSchema = new Schema(
  {
    actorAdminId: { type: Schema.Types.ObjectId, ref: "Admin", default: null, index: true },
    actorName: { type: String, default: "System" },
    action: { type: String, required: true },
    operation: { type: String, enum: ["create", "read", "update", "delete", "auth", "system"], required: true, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String, default: "" },
    resourceName: { type: String, default: "" },
    status: { type: String, enum: ["success", "failed"], default: "success" },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  timestamps,
);

const platformSettingSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
  },
  timestamps,
);

export type AdminDocument = InferSchemaType<typeof adminSchema> & { _id: mongoose.Types.ObjectId };

function appModel(name: string, schema: Schema): Model<any> {
  return (mongoose.models[name] as Model<any>) || mongoose.model(name, schema);
}

export const Admin = appModel("Admin", adminSchema);
export const AdminInvite = appModel("AdminInvite", adminInviteSchema);
export const AdminSession = appModel("AdminSession", adminSessionSchema);
export const Property = appModel("Property", propertySchema);
export const User = appModel("User", userSchema);
export const Rent = appModel("Rent", rentSchema);
export const GovernanceProposal = appModel("GovernanceProposal", governanceProposalSchema);
export const GovernanceVote = appModel("GovernanceVote", governanceVoteSchema);
export const Notification = appModel("Notification", notificationSchema);
export const ComplianceLog = appModel("ComplianceLog", complianceLogSchema);
export const PlatformSetting = appModel("PlatformSetting", platformSettingSchema);
