export type AdminRole =
  | "super_admin"
  | "property_manager"
  | "user_manager"
  | "rent_manager"
  | "custom";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  roles: AdminRole[];
  role: AdminRole;
  roleLabel?: string;
  permissions: string[];
  status: "active" | "suspended" | "invited";
  avatarUrl?: string;
  twoFactorEnabled: boolean;
  lastLoginAt?: number | null;
};

export type AdminLoginRequest = {
  email: string;
  password: string;
  twoFactorCode?: string;
};

export type AdminTokenResponse = {
  accessToken?: string;
  expiresAt: number;
  admin: AdminUser;
};

export type OtpSendResponse = {
  otpSessionId: string;
  expiresAt: number;
  maskedEmail: string;
  isExistingUser: boolean;
};
