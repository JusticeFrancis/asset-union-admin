import { apiRequest } from "@/lib/api/client";
import type { AdminLoginRequest, AdminTokenResponse, AdminUser } from "@/lib/api/admin-auth.types";

export async function adminLogin(credentials: AdminLoginRequest) {
  return apiRequest<AdminTokenResponse>("admin/auth/login", { method: "POST", json: credentials });
}

export async function getCurrentAdmin() {
  const response = await apiRequest<{ admin: AdminUser }>("admin/auth/me", { auth: true });
  return response.admin;
}

export async function refreshAdminSession() {
  return apiRequest<AdminTokenResponse>("admin/auth/refresh", { method: "POST" });
}

export async function adminLogout() {
  await apiRequest<void>("admin/auth/logout", { method: "POST", auth: true });
}

export function persistAdminAuthSession(_response: AdminTokenResponse) {
  // Authentication tokens are intentionally stored only in secure HTTP-only cookies.
}

export { getPostAuthRedirectPath } from "@/lib/auth/callback-url";
