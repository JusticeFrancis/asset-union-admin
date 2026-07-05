const ACCESS_TOKEN_COOKIE = "au_org_access_token";
const REFRESH_TOKEN_COOKIE = "au_org_refresh_token";

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function cookieOptions(maxAgeSeconds: number) {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  return `path=/; SameSite=Lax; max-age=${maxAgeSeconds}${secure}`;
}

export function setOrgAuthTokens(
  accessToken: string,
  refreshToken: string,
  expiresAt?: number,
) {
  if (typeof document === "undefined") return;

  const nowSeconds = Math.floor(Date.now() / 1000);
  const accessMaxAge = expiresAt
    ? Math.max(expiresAt - nowSeconds, 60)
    : DEFAULT_MAX_AGE_SECONDS;

  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(accessToken)}; ${cookieOptions(accessMaxAge)}`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(refreshToken)}; ${cookieOptions(DEFAULT_MAX_AGE_SECONDS)}`;
}

export function getOrgAccessToken(): string | null {
  if (typeof document === "undefined") return null;
  return readCookie(ACCESS_TOKEN_COOKIE);
}

export function getOrgRefreshToken(): string | null {
  if (typeof document === "undefined") return null;
  return readCookie(REFRESH_TOKEN_COOKIE);
}

export function clearOrgAuthTokens() {
  if (typeof document === "undefined") return;
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; path=/; max-age=0`;
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(prefix));
  if (!match) return null;
  return decodeURIComponent(match.slice(prefix.length));
}

export const ORG_AUTH_COOKIE_NAMES = {
  accessToken: ACCESS_TOKEN_COOKIE,
  refreshToken: REFRESH_TOKEN_COOKIE,
} as const;
