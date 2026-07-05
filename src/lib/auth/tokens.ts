const ACCESS_TOKEN_COOKIE = "au_admin_access_token";
const REFRESH_TOKEN_COOKIE = "au_admin_refresh_token";

export function setAdminAuthTokens() {
  // Server-owned HTTP-only cookies cannot and should not be written from JavaScript.
}
export function getAdminAccessToken(): string | null { return null; }
export function getAdminRefreshToken(): string | null { return null; }
export function clearAdminAuthTokens() {
  // Logout clears the secure cookies on the server.
}
export function readCookie(): string | null { return null; }
export const ADMIN_AUTH_COOKIE_NAMES = { accessToken: ACCESS_TOKEN_COOKIE, refreshToken: REFRESH_TOKEN_COOKIE } as const;
