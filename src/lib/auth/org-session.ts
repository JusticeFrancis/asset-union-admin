import type {
  OrganizationMembership,
  OrganizationUser,
} from "@/lib/api/organization-auth.types";

const USER_KEY = "au_org_user";
const MEMBERSHIPS_KEY = "au_org_memberships";
const ACTIVE_ORG_KEY = "au_org_active_id";

export function persistOrgSessionMeta(
  user: OrganizationUser,
  memberships: OrganizationMembership[],
  activeOrganizationId?: string | null,
) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(MEMBERSHIPS_KEY, JSON.stringify(memberships));

  const activeId =
    activeOrganizationId ?? memberships[0]?.organizationId ?? null;

  if (activeId) {
    window.localStorage.setItem(ACTIVE_ORG_KEY, activeId);
  } else {
    window.localStorage.removeItem(ACTIVE_ORG_KEY);
  }
}

export function getOrgSessionUser(): OrganizationUser | null {
  return readJson<OrganizationUser>(USER_KEY);
}

export function getOrgMemberships(): OrganizationMembership[] {
  return readJson<OrganizationMembership[]>(MEMBERSHIPS_KEY) ?? [];
}

export function getActiveOrganizationId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACTIVE_ORG_KEY);
}

export function setActiveOrganizationId(organizationId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACTIVE_ORG_KEY, organizationId);
}

export function clearOrgSessionMeta() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(MEMBERSHIPS_KEY);
  window.localStorage.removeItem(ACTIVE_ORG_KEY);
}

function readJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
