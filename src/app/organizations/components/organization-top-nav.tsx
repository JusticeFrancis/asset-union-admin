"use client";

import Link from "next/link";
import { Geologica } from "next/font/google";
import { Menu } from "lucide-react";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import {
  AdminTopNavBellIcon,
  AdminTopNavUsFlagIcon,
} from "@/app/components/admin-top-nav-icons";
import { useOrganizationAuth } from "@/contexts/organization-auth-provider";
import { formatOrganizationMemberRole } from "@/lib/organization-display";
import { cn } from "@/lib/utils";

const geologica = Geologica({
  subsets: ["latin"],
  weight: "600",
});

type OrganizationTopNavProps = {
  title: string;
  onOpenMobileNav?: () => void;
};

export function OrganizationTopNav({
  title,
  onOpenMobileNav,
}: OrganizationTopNavProps) {
  const { user, activeMembership } = useOrganizationAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex h-[67px] shrink-0 items-center justify-between gap-2 border-b border-[#CFE2EC] bg-[#EDF4F8] px-4 md:left-[282px] md:px-5">
      <Link
        className="flex items-center gap-px md:hidden"
        href="/organizations/dashboard"
        aria-label="Organization dashboard"
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

      <div className="hidden min-w-0 md:block">
        <h1 className="text-[19px] font-medium leading-none text-[#050a0e]">
          {title}
        </h1>
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
          aria-label="Notifications"
        >
          <AdminTopNavBellIcon className="size-[18px] text-[#050a0e]" />
        </button>
        <div
          className="hidden shrink-0 items-center gap-2 rounded-[40px] bg-white px-2 py-[5px] md:flex"
          aria-label="Signed in user"
        >
          <div className="text-right leading-none">
            <p className="text-[12px] font-light text-[#050a0e]">
              {user?.fullName ?? "Member"}
            </p>
            <p className="mt-[2px] text-[8px] font-light text-[#919191]">
              {activeMembership?.role
                ? formatOrganizationMemberRole(activeMembership.role)
                : "Member"}
            </p>
          </div>
          <img
            alt=""
            className="size-6 shrink-0 rounded-full object-cover"
            src={ADMIN_ASSETS.topNav.avatar}
          />
        </div>

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
