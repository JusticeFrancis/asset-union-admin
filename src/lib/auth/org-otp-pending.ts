export type OrgOtpFlow = "login" | "register" | "password-reset";

export type OrgPendingOtpSession = {
  flow: OrgOtpFlow;
  otpSessionId: string;
  expiresAt: number;
  maskedEmail: string;
};

const STORAGE_KEY = "au_org_pending_otp";

export function setPendingOrgOtp(session: OrgPendingOtpSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getPendingOrgOtp(): OrgPendingOtpSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OrgPendingOtpSession;
  } catch {
    return null;
  }
}

export function clearPendingOrgOtp() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
