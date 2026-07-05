import { orgApiRequest } from "@/lib/api/org-client";
import type {
  OrgAcceptInviteRequest,
  OrgLoginRequest,
  OrgOtpVerifyRequest,
  OrgRegisterRequest,
  OrganizationTokenResponse,
  OrganizationUser,
  OtpSendResponse,
  PasswordResetConfirmRequest,
  PasswordResetGenericResponse,
} from "@/lib/api/organization-auth.types";
import { ApiError } from "@/lib/api/types";
import {
  clearOrgSessionMeta,
  persistOrgSessionMeta,
} from "@/lib/auth/org-session";
import {
  clearOrgAuthTokens,
  getOrgRefreshToken,
  setOrgAuthTokens,
} from "@/lib/auth/org-tokens";

function isTokenResponse(body: unknown): body is OrganizationTokenResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "accessToken" in body &&
    "memberships" in body
  );
}

function isOtpSession(body: unknown): body is OtpSendResponse {
  return (
    typeof body === "object" &&
    body !== null &&
    "otpSessionId" in body &&
    "maskedEmail" in body
  );
}

export async function orgRegister(payload: OrgRegisterRequest) {
  return orgApiRequest<OtpSendResponse>("organizations/auth/register", {
    method: "POST",
    json: payload,
  });
}

export async function orgRegisterOtpVerify(payload: OrgOtpVerifyRequest) {
  const response = await orgApiRequest<OrganizationTokenResponse>(
    "organizations/auth/register/otp/verify",
    { method: "POST", json: payload },
  );
  persistOrgAuthSession(response);
  return response;
}

export async function orgLogin(payload: OrgLoginRequest) {
  const response = await orgApiRequest<
    OtpSendResponse | OrganizationTokenResponse
  >("organizations/auth/login", { method: "POST", json: payload });

  if (isOtpSession(response)) {
    return response;
  }

  if (isTokenResponse(response)) {
    persistOrgAuthSession(response);
    return response;
  }

  throw new ApiError("UNKNOWN_ERROR", "Unexpected login response");
}

export async function orgLoginOtpVerify(payload: OrgOtpVerifyRequest) {
  const response = await orgApiRequest<OrganizationTokenResponse>(
    "organizations/auth/login/otp/verify",
    { method: "POST", json: payload },
  );
  persistOrgAuthSession(response);
  return response;
}

export async function orgAcceptInvite(payload: OrgAcceptInviteRequest) {
  const response = await orgApiRequest<OrganizationTokenResponse>(
    "organizations/auth/accept-invite",
    { method: "POST", json: payload },
  );
  persistOrgAuthSession(response);
  return response;
}

export async function orgPasswordResetRequest(email: string) {
  return orgApiRequest<OtpSendResponse | PasswordResetGenericResponse>(
    "organizations/auth/password-reset/request",
    { method: "POST", json: { email } },
  );
}

export async function orgPasswordResetConfirm(
  payload: PasswordResetConfirmRequest,
) {
  return orgApiRequest<{ success: boolean }>(
    "organizations/auth/password-reset/confirm",
    { method: "POST", json: payload },
  );
}

export async function getCurrentOrganizationUser() {
  return orgApiRequest<{
    user: OrganizationUser;
    memberships: OrganizationTokenResponse["memberships"];
  }>("organizations/auth/me", { auth: true });
}

export async function refreshOrgSession() {
  const refreshToken = getOrgRefreshToken();
  if (!refreshToken) {
    throw new ApiError("UNAUTHORIZED", "No refresh token available");
  }

  const response = await orgApiRequest<OrganizationTokenResponse>(
    "organizations/auth/refresh",
    { method: "POST", json: { refreshToken } },
  );

  persistOrgAuthSession(response);
  return response;
}

export async function orgLogout() {
  const refreshToken = getOrgRefreshToken();

  try {
    await orgApiRequest<void>("organizations/auth/logout", {
      method: "POST",
      auth: true,
      json: refreshToken ? { refreshToken } : {},
    });
  } finally {
    clearOrgAuthTokens();
    clearOrgSessionMeta();
  }
}

export function persistOrgAuthSession(response: OrganizationTokenResponse) {
  setOrgAuthTokens(
    response.accessToken,
    response.refreshToken,
    response.expiresAt,
  );
  persistOrgSessionMeta(response.user, response.memberships);
}

export function getPostOrgAuthRedirectPath(
  memberships: OrganizationTokenResponse["memberships"],
) {
  if (memberships.length === 0) {
    return "/organizations/onboarding/create-org";
  }
  return "/organizations/dashboard";
}
