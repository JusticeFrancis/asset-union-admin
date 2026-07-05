export type OrganizationMemberRole =
  | "organization_owner"
  | "organization_admin"
  | "asset_manager"
  | "viewer";

export type OrganizationUserStatus =
  | "active"
  | "suspended"
  | "pending_email_verification";

export type OrganizationUser = {
  id: string;
  email: string;
  fullName: string;
  status: OrganizationUserStatus;
};

export type OrganizationMembership = {
  organizationId: string;
  organizationName: string;
  role: OrganizationMemberRole;
};

export type OrganizationTokenResponse = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: OrganizationUser;
  memberships: OrganizationMembership[];
};

export type OtpSendResponse = {
  otpSessionId: string;
  expiresAt: number;
  maskedEmail: string;
  isExistingUser?: boolean;
};

export type OrgRegisterRequest = {
  email: string;
  password: string;
  fullName: string;
};

export type OrgLoginRequest = {
  email: string;
  password: string;
};

export type OrgOtpVerifyRequest = {
  otpSessionId: string;
  code: string;
};

export type OrgAcceptInviteRequest = {
  token: string;
  password: string;
};

export type PasswordResetConfirmRequest = {
  otpSessionId: string;
  code: string;
  password: string;
};

export type PasswordResetGenericResponse = {
  message: string;
};
