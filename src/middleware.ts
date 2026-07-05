import { NextResponse, type NextRequest } from "next/server";

import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";
import { ADMIN_AUTH_COOKIE_NAMES } from "@/lib/auth/tokens";
import { ORG_AUTH_COOKIE_NAMES } from "@/lib/auth/org-tokens";

const PUBLIC_ADMIN_AUTH_PATHS = ["/sign-in"];

const PUBLIC_ORG_AUTH_PATHS = [
  "/organizations/login",
  "/organizations/register",
  "/organizations/forgot-password",
  "/organizations/reset-password",
  "/organizations/accept-invite",
];

function redirectWithCallback(
  request: NextRequest,
  pathname: string,
  searchParams?: Record<string, string>,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  return NextResponse.redirect(url);
}

function isPublicAdminAuthPath(pathname: string) {
  return PUBLIC_ADMIN_AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isPublicOrgAuthPath(pathname: string) {
  return PUBLIC_ORG_AUTH_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function isOrgPath(pathname: string) {
  return (
    pathname === "/organizations" || pathname.startsWith("/organizations/")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isOrgPath(pathname)) {
    const orgAccessToken = request.cookies.get(
      ORG_AUTH_COOKIE_NAMES.accessToken,
    )?.value;
    const isOrgPublic = isPublicOrgAuthPath(pathname);

    if (!orgAccessToken && !isOrgPublic) {
      const rawCallback = `${pathname}${request.nextUrl.search}`;
      const callbackUrl = sanitizeCallbackUrl(rawCallback);
      return redirectWithCallback(
        request,
        "/organizations/login",
        callbackUrl ? { callbackUrl } : undefined,
      );
    }

    if (orgAccessToken && isOrgPublic) {
      const callbackUrl = sanitizeCallbackUrl(
        request.nextUrl.searchParams.get("callbackUrl"),
      );
      return redirectWithCallback(
        request,
        callbackUrl?.startsWith("/organizations")
          ? callbackUrl
          : "/organizations/dashboard",
      );
    }

    return NextResponse.next();
  }

  const accessToken = request.cookies.get(
    ADMIN_AUTH_COOKIE_NAMES.accessToken,
  )?.value;

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(accessToken ? "/dashboard" : "/sign-in", request.url),
    );
  }

  const isSignInRoute = isPublicAdminAuthPath(pathname);
  const isProtectedRoute = !isSignInRoute;

  if (!accessToken) {
    if (isProtectedRoute) {
      const rawCallback = `${pathname}${request.nextUrl.search}`;
      const callbackUrl = sanitizeCallbackUrl(rawCallback);
      return redirectWithCallback(
        request,
        "/sign-in",
        callbackUrl ? { callbackUrl } : undefined,
      );
    }
    return NextResponse.next();
  }

  if (isSignInRoute) {
    const callbackUrl = sanitizeCallbackUrl(
      request.nextUrl.searchParams.get("callbackUrl"),
    );
    return redirectWithCallback(request, callbackUrl ?? "/dashboard");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/sign-in",
    "/sign-in/:path*",
    "/organizations",
    "/organizations/:path*",
    "/dashboard/:path*",
    "/assets/:path*",
    "/compliance-logs/:path*",
    "/create-listing/:path*",
    "/governance/:path*",
    "/notifications/:path*",
    "/property-management/:path*",
    "/rent-submission/:path*",
    "/roles-and-permissions/:path*",
    "/settings/:path*",
    "/user-management/:path*",
  ],
};
