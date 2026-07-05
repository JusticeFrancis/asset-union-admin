import { getUserFacingErrorMessage } from "@/lib/api/user-facing-error";

const ORG_AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Invalid email or password.",
  ACCOUNT_SUSPENDED: "This account has been suspended. Contact support.",
  ACCOUNT_LOCKED:
    "Account is temporarily locked. Try again in about 15 minutes.",
  EMAIL_ALREADY_REGISTERED:
    "An account with this email already exists. Sign in or accept your invite.",
  OTP_INVALID: "Invalid verification code.",
  OTP_SESSION_NOT_FOUND: "Verification code expired. Start again.",
  INVITE_INVALID: "This invite link has expired. Ask your admin to resend it.",
  INVITE_EMAIL_MISMATCH: "This invite could not be applied. Contact support.",
  ORGANIZATION_ALREADY_EXISTS:
    "You already have an organization. Go to your dashboard.",
  ORGANIZATION_NOT_ACTIVE:
    "Your organization must be approved before using this feature.",
  ORGANIZATION_MEMBER_LIMIT:
    "This organization has reached the maximum of 10 members.",
  MEMBER_ALREADY_EXISTS: "This person is already on your team.",
  CANNOT_CHANGE_OWNER: "The organization owner's role cannot be changed.",
  CANNOT_REMOVE_OWNER: "The organization owner cannot be removed.",
};

export function getOrgAuthErrorMessage(error: unknown, fallback: string) {
  return getUserFacingErrorMessage(error, {
    codeMessages: ORG_AUTH_ERROR_MESSAGES,
    fallback,
  });
}

/** Organization portal screens beyond auth (members, profile, etc.). */
export function getOrgErrorMessage(error: unknown, fallback: string) {
  return getUserFacingErrorMessage(error, {
    codeMessages: ORG_AUTH_ERROR_MESSAGES,
    fallback,
  });
}
