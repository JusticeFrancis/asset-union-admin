import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDb } from "@/lib/server/db";
import { HttpError } from "@/lib/server/http";
import { hashToken, randomToken } from "@/lib/server/crypto";
import { permissionsFor, type AdminRoleName, type Permission } from "@/lib/server/constants";
import { Admin, AdminSession } from "@/models";

export const ACCESS_COOKIE = "au_admin_access_token";
export const REFRESH_COOKIE = "au_admin_refresh_token";
const ACCESS_TTL_SECONDS = 60 * 15;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;

type AccessPayload = {
  sub: string;
  type: "access";
  role: AdminRoleName;
  permissions: string[];
  sid: string;
};

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 24) {
    throw new Error("AUTH_SECRET must be configured with at least 24 characters");
  }
  return value;
}

export function serializeAdmin(admin: any) {
  const role = admin.role as AdminRoleName;
  const permissions = permissionsFor(role, admin.customPermissions || []);
  return {
    id: String(admin._id),
    email: admin.email,
    fullName: admin.fullName,
    roles: [role],
    role,
    roleLabel: role === "custom" ? admin.customRoleName || "Custom Role" : undefined,
    permissions,
    status: admin.status,
    avatarUrl: admin.avatarUrl || "",
    twoFactorEnabled: Boolean(admin.twoFactorEnabled),
    lastLoginAt: admin.lastLoginAt ? new Date(admin.lastLoginAt).getTime() : null,
  };
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signAccessToken(admin: any, sessionId: string) {
  const role = admin.role as AdminRoleName;
  const permissions = permissionsFor(role, admin.customPermissions || []);
  return jwt.sign(
    { sub: String(admin._id), type: "access", role, permissions, sid: sessionId } satisfies AccessPayload,
    secret(),
    { expiresIn: ACCESS_TTL_SECONDS, issuer: "asset-union-admin", audience: "asset-union-admin" },
  );
}

export function verifyAccessToken(token: string): AccessPayload {
  try {
    return jwt.verify(token, secret(), {
      issuer: "asset-union-admin",
      audience: "asset-union-admin",
    }) as AccessPayload;
  } catch {
    throw new HttpError(401, "UNAUTHORIZED", "Your session has expired. Please sign in again.");
  }
}

export async function createSession(admin: any, context: Record<string, string>) {
  await connectDb();
  const refreshToken = randomToken(48);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);
  const session = await AdminSession.create({
    adminId: admin._id,
    refreshTokenHash: hashToken(refreshToken),
    expiresAt,
    lastActiveAt: new Date(),
    ...context,
  });
  return {
    session,
    accessToken: signAccessToken(admin, String(session._id)),
    refreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS,
  };
}

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: ACCESS_TTL_SECONDS,
  });
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: REFRESH_TTL_SECONDS,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function getAccessToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7);
  return request.cookies.get(ACCESS_COOKIE)?.value || null;
}

export async function requireAdmin(request: NextRequest, permission?: Permission) {
  const token = getAccessToken(request);
  if (!token) throw new HttpError(401, "UNAUTHORIZED", "Authentication is required.");
  const payload = verifyAccessToken(token);
  await connectDb();
  if (!mongoose.isValidObjectId(payload.sub) || !mongoose.isValidObjectId(payload.sid)) throw new HttpError(401, "UNAUTHORIZED", "Invalid session.");
  const [admin, session] = await Promise.all([
    Admin.findById(payload.sub),
    AdminSession.findOne({ _id: payload.sid, adminId: payload.sub, revokedAt: null, expiresAt: { $gt: new Date() } }),
  ]);
  if (!session) throw new HttpError(401, "UNAUTHORIZED", "This device session has been revoked or expired.");
  if (Date.now() - new Date(session.lastActiveAt).getTime() > 5 * 60 * 1000) {
    session.lastActiveAt = new Date();
    await session.save();
  }
  if (!admin || admin.status !== "active") throw new HttpError(403, "ACCOUNT_SUSPENDED", "This admin account is not active.");
  const permissions = permissionsFor(admin.role as AdminRoleName, admin.customPermissions || []);
  if (permission && !permissions.includes(permission)) {
    throw new HttpError(403, "FORBIDDEN", "You do not have permission to perform this action.");
  }
  return { admin, permissions, payload };
}

export async function rotateRefreshToken(request: NextRequest, suppliedToken?: string) {
  const refreshToken = suppliedToken || request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) throw new HttpError(401, "UNAUTHORIZED", "Refresh token is missing.");
  await connectDb();
  const session = await AdminSession.findOne({
    refreshTokenHash: hashToken(refreshToken),
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!session) throw new HttpError(401, "UNAUTHORIZED", "Refresh token is invalid or expired.");
  const admin = await Admin.findById(session.adminId);
  if (!admin || admin.status !== "active") throw new HttpError(401, "UNAUTHORIZED", "Admin account is unavailable.");
  const newRefreshToken = randomToken(48);
  session.refreshTokenHash = hashToken(newRefreshToken);
  session.lastActiveAt = new Date();
  session.expiresAt = new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);
  await session.save();
  return {
    admin,
    session,
    accessToken: signAccessToken(admin, String(session._id)),
    refreshToken: newRefreshToken,
    expiresAt: Math.floor(Date.now() / 1000) + ACCESS_TTL_SECONDS,
  };
}

export async function revokeRefreshToken(token?: string | null) {
  if (!token) return;
  await connectDb();
  await AdminSession.updateOne(
    { refreshTokenHash: hashToken(token), revokedAt: null },
    { $set: { revokedAt: new Date() } },
  );
}

export async function ensureBootstrapSuperAdmin() {
  await connectDb();
  const count = await Admin.countDocuments();
  if (count > 0) return;
  const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SUPER_ADMIN_PASSWORD;
  if (!email || !password) return;
  await Admin.create({
    fullName: process.env.SUPER_ADMIN_NAME || "Super Admin",
    email,
    passwordHash: await hashPassword(password),
    role: "super_admin",
    status: "active",
    inviteAcceptedAt: new Date(),
  });
}
