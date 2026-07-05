import type { AdminRole } from "@/lib/api/admin-auth.types";

const MANAGE_PROPERTY_ROLES: AdminRole[] = ["super_admin", "property_manager"];

function hasPermission(permissions: string[] | undefined, permission: string) {
  return Boolean(permissions?.includes(permission));
}

function hasLegacyManagerRole(roles: AdminRole[] | undefined) {
  return Boolean(roles?.some((role) => MANAGE_PROPERTY_ROLES.includes(role)));
}

export function canCreateProperties(
  roles: AdminRole[] | undefined,
  permissions?: string[],
): boolean {
  if (permissions) return hasPermission(permissions, "properties.create");
  return hasLegacyManagerRole(roles);
}

export function canUpdateProperties(
  roles: AdminRole[] | undefined,
  permissions?: string[],
): boolean {
  if (permissions) return hasPermission(permissions, "properties.update");
  return hasLegacyManagerRole(roles);
}

export function canApproveProperties(
  roles: AdminRole[] | undefined,
  permissions?: string[],
): boolean {
  if (permissions) return hasPermission(permissions, "properties.approve");
  return hasLegacyManagerRole(roles);
}

/** Legacy aggregate used only where either creation or editing is acceptable. */
export function canManageProperties(
  roles: AdminRole[] | undefined,
  permissions?: string[],
): boolean {
  if (permissions) {
    return (
      hasPermission(permissions, "properties.create") ||
      hasPermission(permissions, "properties.update")
    );
  }
  return hasLegacyManagerRole(roles);
}

export function canViewPropertyDetail(
  roles: AdminRole[] | undefined,
  permissions?: string[],
): boolean {
  if (permissions) return hasPermission(permissions, "properties.view");
  return hasLegacyManagerRole(roles);
}
