"use client";

import Link from "next/link";
import { Fragment } from "react";
import { Geologica } from "next/font/google";
import { ChevronLeft, Menu } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import {
  AdminTopNavBellIcon,
  AdminTopNavUsFlagIcon,
} from "@/app/components/admin-top-nav-icons";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { cn } from "@/lib/utils";

const geologica = Geologica({
  subsets: ["latin"],
  weight: "600",
});

export type BreadcrumbSegment = {
  label: string;
  href?: string;
};

type AdminTopNavProps = {
  title: string;
  breadcrumb?: BreadcrumbSegment[] | null;
  onOpenMobileNav?: () => void;
};

export function AdminTopNav({
  title,
  breadcrumb,
  onOpenMobileNav,
}: AdminTopNavProps) {
  const router = useRouter();
  const { admin } = useAdminAuth();
  const roleLabel = admin?.roleLabel || admin?.role?.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") || "Admin";
  const showBreadcrumb = breadcrumb && breadcrumb.length > 0;
  const backCrumb = breadcrumb?.find((segment) => Boolean(segment.href));
  const leafLabel = breadcrumb?.[breadcrumb.length - 1]?.label ?? title ?? "";

  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex h-[67px] shrink-0 items-center justify-between gap-2 border-b border-[#CFE2EC] bg-[#EDF4F8] px-4 md:left-[282px] md:px-5">
      {backCrumb?.href ? (
        <Link
          aria-label={`Back to ${backCrumb.label}`}
          className="flex min-w-0 items-center gap-2 md:hidden"
          href={backCrumb.href}
        >
          <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-white">
            <ChevronLeft className="size-[18px] text-[#050a0e]" aria-hidden />
          </span>
          {leafLabel ? (
            <span className="min-w-0 truncate text-[14px] font-medium text-[#050a0e]">
              {leafLabel}
            </span>
          ) : null}
        </Link>
      ) : (
        <Link
          className="flex items-center gap-px md:hidden"
          href="/dashboard"
          aria-label="Dashboard home"
        >
          <img
            alt=""
            aria-hidden
            className="h-7 w-auto shrink-0 object-contain"
            src={ADMIN_ASSETS.branding.logoFull}
          />
          <span
            className={cn(
              geologica.className,
              "text-[12px] font-semibold uppercase leading-none tracking-[-0.24px] text-[#5651b5]",
            )}
          >
            Asset Union
          </span>
        </Link>
      )}

      <div className="hidden min-w-0 md:block">
        {showBreadcrumb ? (
          <nav
            aria-label="Breadcrumb"
            className="flex min-w-0 flex-wrap items-center gap-2 text-[16px] font-light leading-normal text-[#050a0e]"
          >
            {breadcrumb!.map((segment, i) => (
              <Fragment key={`${segment.label}-${i}`}>
                {i > 0 ? (
                  <span className="shrink-0 text-[#919191]" aria-hidden>
                    /
                  </span>
                ) : null}
                {segment.href ? (
                  <Link
                    className="shrink-0 text-[#919191] transition-colors hover:text-[#050a0e]"
                    href={segment.href}
                  >
                    {segment.label}
                  </Link>
                ) : (
                  <span className="min-w-0 truncate text-[#050a0e]">
                    {segment.label}
                  </span>
                )}
              </Fragment>
            ))}
          </nav>
        ) : (
          <h1 className="text-[19px] font-medium leading-none text-[#050a0e]">
            {title}
          </h1>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden items-center gap-1 rounded-full bg-white px-2 py-2 md:flex">
          <AdminTopNavUsFlagIcon
            aria-hidden
            className="shrink-0"
            height={7.967}
            width={11.154}
          />
          <span className="text-[10px] font-light text-[#050a0e]">EN</span>
        </div>
        <button
          className="flex size-[34px] items-center justify-center rounded-full bg-white"
          type="button"
          onClick={() => {
            router.push("/notifications");
          }}
          aria-label="Notifications"
        >
          <AdminTopNavBellIcon className="size-[18px] text-[#050a0e]" />
        </button>
        <Link
          className="hidden shrink-0 items-center gap-2 rounded-[40px] bg-white px-2 py-[5px] transition-opacity hover:opacity-90 md:flex"
          href="/settings/account-information"
          aria-label="Account settings"
        >
          <div className="text-right leading-none">
            <p className="max-w-[150px] truncate text-[12px] font-light text-[#050a0e]">
              {admin?.fullName || "Admin"}
            </p>
            <p className="mt-[2px] max-w-[150px] truncate text-[8px] font-light text-[#919191]">
              {roleLabel}
            </p>
          </div>
          <img
            alt={admin?.fullName || "Admin profile"}
            className="size-6 shrink-0 rounded-full object-cover"
            src={admin?.avatarUrl || ADMIN_ASSETS.topNav.avatar}
          />
        </Link>

        {onOpenMobileNav ? (
          <button
            type="button"
            aria-label="Open navigation"
            onClick={onOpenMobileNav}
            className="flex size-[34px] items-center justify-center rounded-full bg-white md:hidden"
          >
            <Menu className="size-[18px] text-[#050a0e]" aria-hidden />
          </button>
        ) : null}
      </div>
    </header>
  );
}
