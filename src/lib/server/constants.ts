export const ADMIN_ROLES = [
  "super_admin",
  "property_manager",
  "user_manager",
  "rent_manager",
  "custom",
] as const;
export type AdminRoleName = (typeof ADMIN_ROLES)[number];

export const PERMISSIONS = [
  "dashboard.view",
  "properties.view",
  "properties.create",
  "properties.update",
  "properties.delete",
  "properties.approve",
  "rents.view",
  "rents.create",
  "rents.update",
  "rents.delete",
  "rents.approve",
  "users.view",
  "users.create",
  "users.update",
  "users.delete",
  "governance.view",
  "governance.create",
  "governance.update",
  "governance.delete",
  "governance.vote",
  "compliance.view",
  "notifications.view",
  "notifications.create",
  "notifications.update",
  "notifications.delete",
  "admins.view",
  "admins.create",
  "admins.update",
  "admins.delete",
  "settings.view",
  "settings.update",
  "platform_settings.view",
  "platform_settings.update",
  "integrations.manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<AdminRoleName, Permission[]> = {
  super_admin: [...PERMISSIONS],
  property_manager: [
    "dashboard.view",
    "properties.view",
    "properties.create",
    "properties.update",
    "properties.delete",
    "properties.approve",
    "settings.view",
    "settings.update",
    "integrations.manage",
  ],
  user_manager: [
    "dashboard.view",
    "users.view",
    "users.create",
    "users.update",
    "users.delete",
    "settings.view",
    "settings.update",
  ],
  rent_manager: [
    "dashboard.view",
    "rents.view",
    "rents.create",
    "rents.update",
    "rents.delete",
    "rents.approve",
    // Rent submissions must reference a property, but this role cannot modify it.
    "properties.view",
    "settings.view",
    "settings.update",
  ],
  custom: [],
};

export const ROLE_LABELS: Record<AdminRoleName, string> = {
  super_admin: "Super Admin",
  property_manager: "Property Manager",
  user_manager: "User Manager",
  rent_manager: "Rent Manager",
  custom: "Custom Role",
};

export function permissionsFor(role: AdminRoleName, customPermissions: string[] = []) {
  return role === "custom"
    ? customPermissions.filter((item): item is Permission => PERMISSIONS.includes(item as Permission))
    : ROLE_PERMISSIONS[role] ?? [];
}
