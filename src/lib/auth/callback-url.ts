const AUTH_FLOW_PREFIXES = [
  "/sign-in",
  "/organizations/login",
  "/organizations/register",
  "/organizations/forgot-password",
  "/organizations/reset-password",
  "/organizations/accept-invite",
];

export function sanitizeCallbackUrl(
  callbackUrl: string | null | undefined,
): string | null {
  if (
    !callbackUrl ||
    !callbackUrl.startsWith("/") ||
    callbackUrl.startsWith("//")
  ) {
    return null;
  }

  const pathname = callbackUrl.split("?")[0] ?? callbackUrl;

  if (
    AUTH_FLOW_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    return null;
  }

  return callbackUrl;
}

export function getPostAuthRedirectPath(callbackUrl?: string | null) {
  const safeCallback = sanitizeCallbackUrl(callbackUrl);
  return safeCallback ?? "/dashboard";
}

export function signInPathWithCallback(callbackUrl?: string | null) {
  const safeCallback = sanitizeCallbackUrl(callbackUrl);
  if (!safeCallback) return "/sign-in";
  return `/sign-in?callbackUrl=${encodeURIComponent(safeCallback)}`;
}

export function orgLoginPathWithCallback(callbackUrl?: string | null) {
  const safeCallback = sanitizeCallbackUrl(callbackUrl);
  if (!safeCallback) return "/organizations/login";
  return `/organizations/login?callbackUrl=${encodeURIComponent(safeCallback)}`;
}

export function getPostOrgAuthRedirectPath(callbackUrl?: string | null) {
  const safeCallback = sanitizeCallbackUrl(callbackUrl);
  if (safeCallback?.startsWith("/organizations")) {
    return safeCallback;
  }
  return "/organizations/dashboard";
}
