import { getUserFacingErrorMessage } from "@/lib/api/user-facing-error";

const ADMIN_AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Invalid email or password.",
  ACCOUNT_SUSPENDED: "This account has been suspended.",
  ACCOUNT_LOCKED:
    "Account is temporarily locked due to too many failed attempts.",
  OTP_NOT_ENABLED: "Admin OTP login is not enabled. Contact the platform team.",
};

export function getAdminAuthErrorMessage(error: unknown, fallback: string) {
  return getUserFacingErrorMessage(error, {
    codeMessages: ADMIN_AUTH_ERROR_MESSAGES,
    fallback,
  });
}

/** General admin / app surfaces (property management, wizard, etc.). */
export function getAdminErrorMessage(error: unknown, fallback: string) {
  return getUserFacingErrorMessage(error, { fallback });
}
