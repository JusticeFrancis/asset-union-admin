"use client";

import Link from "next/link";
import { Geologica } from "next/font/google";
import { X } from "lucide-react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { useOrganizationAuth } from "@/contexts/organization-auth-provider";
import {
  canEditOrgProperties,
  canManageMembers,
  canManageOrgProfile,
} from "@/lib/organization-permissions";
import { cn } from "@/lib/utils";

const geologica = Geologica({
  subsets: ["latin"],
  weight: "600",
});

const activeIconFilter =
  "brightness(0) saturate(100%) invert(35%) sepia(30%) saturate(1597%) hue-rotate(209deg) brightness(91%) contrast(91%)";
const defaultIconFilter = "brightness(0) saturate(100%)";

export type OrganizationNavItem =
  | "Dashboard"
  | "Organization profile"
  | "Team"
  | "Properties"
  | "Create listing"
  | "Compliance log";

type NavEntry = {
  label: OrganizationNavItem;
  href: string;
  iconSrc: string;
  visible?: boolean;
};

type NavSection = {
  heading: string;
  items: NavEntry[];
};

type OrganizationSidebarProps = {
  activeItem?: OrganizationNavItem;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onNavigate?: () => void;
};

function NavLinkRow({
  activeItem,
  href,
  iconSrc,
  label,
  onClick,
}: {
  activeItem?: OrganizationNavItem;
  href: string;
  iconSrc: string;
  label: OrganizationNavItem;
  onClick?: () => void;
}) {
  const isActive = label === activeItem;

  return (
    <Link
      className={cn(
        "flex h-[34px] items-center gap-3 rounded-[8px] px-3 py-2 text-[14px] font-light leading-none",
        isActive ? "text-[#5c60cc]" : "text-[#050a0e]",
        isActive ? "bg-white shadow-[0_1px_4px_rgba(12,12,13,0.05)]" : "",
      )}
      href={href}
      onClick={onClick}
    >
      <img
        alt=""
        aria-hidden
        className="size-4 shrink-0"
        src={iconSrc}
        style={{
          filter: isActive ? activeIconFilter : defaultIconFilter,
        }}
      />
      <span className={cn(isActive ? "text-[#5c60cc]" : "text-[#050a0e]")}>
        {label}
      </span>
    </Link>
  );
}

export function OrganizationSidebar({
  activeItem,
  mobileOpen = false,
  onMobileClose,
  onNavigate,
}: OrganizationSidebarProps) {
  const pathname = usePathname();
  const {
    activeMembership,
    memberships,
    activeOrganizationId,
    setActiveOrganization,
    logout,
  } = useOrganizationAuth();

  const role = activeMembership?.role;
  const handleNavClick = onNavigate ?? undefined;

  const navSections: NavSection[] = [
    {
      heading: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/organizations/dashboard",
          iconSrc: ADMIN_ASSETS.sidebar.nav.dashboard,
        },
      ],
    },
    {
      heading: "Organization",
      items: [
        {
          label: "Organization profile",
          href: "/organizations/onboarding/profile",
          iconSrc: ADMIN_ASSETS.sidebar.utility.settings,
          visible: canManageOrgProfile(role),
        },
        {
          label: "Team",
          href: "/organizations/members",
          iconSrc: ADMIN_ASSETS.sidebar.nav.userManagement,
          visible: canManageMembers(role),
        },
      ],
    },
    {
      heading: "Properties",
      items: [
        {
          label: "Properties",
          href: "/organizations/properties",
          iconSrc: ADMIN_ASSETS.sidebar.nav.propertyManagement,
        },
        {
          label: "Create listing",
          href: "/organizations/create-listing",
          iconSrc: ADMIN_ASSETS.sidebar.nav.createListing,
          visible: canEditOrgProperties(role),
        },
        {
          label: "Compliance log",
          href: "/organizations/compliance",
          iconSrc: ADMIN_ASSETS.sidebar.nav.complianceLogs,
        },
      ],
    },
  ];

  useEffect(() => {
    if (!mobileOpen) return;

    document.body.dataset.scrollLocked = "true";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onMobileClose?.();
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) onMobileClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      delete document.body.dataset.scrollLocked;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [mobileOpen, onMobileClose]);

  const resolvedActiveItem =
    activeItem ??
    (navSections
      .flatMap((s) => s.items)
      .find(
        (item) =>
          pathname === item.href || pathname.startsWith(`${item.href}/`),
      )?.label as OrganizationNavItem | undefined);

  const navBody = (
    <>
      <div className="pt-5">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center gap-px"
            href="/organizations/dashboard"
            onClick={handleNavClick}
          >
            <img
              alt="Asset Union logo"
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

          <button
            className="hidden size-4 items-center justify-center md:flex"
            type="button"
            aria-label="Collapse sidebar"
          >
            <img
              alt=""
              aria-hidden
              className="size-4"
              src={ADMIN_ASSETS.sidebar.topAction}
            />
          </button>

          <button
            className="inline-flex size-tap items-center justify-center rounded-lg text-[#050a0e] hover:bg-white/60 md:hidden"
            type="button"
            aria-label="Close navigation"
            onClick={onMobileClose}
          >
            <X className="size-6" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mt-4 border-b border-[#cfe2ec]" />

      {memberships.length > 1 ? (
        <label className="mt-4 flex flex-col gap-1 px-[10px]">
          <span className="text-[9px] font-light uppercase leading-none text-[#575757]">
            Organization
          </span>
          <select
            className="h-[34px] rounded-[8px] border border-[#cfe2ec] bg-white px-3 text-[12px] font-light text-[#050a0e] shadow-[0_1px_4px_rgba(12,12,13,0.05)]"
            value={activeOrganizationId ?? ""}
            onChange={(e) => setActiveOrganization(e.target.value)}
          >
            {memberships.map((m) => (
              <option key={m.organizationId} value={m.organizationId}>
                {m.organizationName}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pt-4 pb-4">
        {navSections.map((section) => {
          const items = section.items.filter((item) => item.visible !== false);
          if (items.length === 0) return null;

          return (
            <div className="flex flex-col gap-2" key={section.heading}>
              <div className="flex justify-start px-[10px] py-2">
                <p className="text-[9px] font-light uppercase leading-none text-[#575757]">
                  {section.heading}
                </p>
              </div>
              <nav className="flex flex-col gap-2">
                {items.map((item) => (
                  <NavLinkRow
                    key={item.href}
                    activeItem={resolvedActiveItem}
                    href={item.href}
                    iconSrc={item.iconSrc}
                    label={item.label}
                    onClick={handleNavClick}
                  />
                ))}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="pb-5">
        <button
          className="flex h-[34px] w-full items-center gap-3 rounded-[8px] px-3 py-2 text-left text-[14px] font-light text-[#050a0e] hover:opacity-90"
          type="button"
          onClick={() => {
            onNavigate?.();
            void logout();
          }}
        >
          <img
            alt=""
            aria-hidden
            className="size-4 shrink-0"
            src={ADMIN_ASSETS.sidebar.utility.logout}
            style={{
              filter:
                "brightness(0) saturate(100%) invert(31%) sepia(99%) saturate(2693%) hue-rotate(346deg) brightness(98%) contrast(91%)",
            }}
          />
          <span className="text-[#ec3434]">Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden h-screen w-[282px] flex-col border-r border-[#cfe2ec] bg-[#edf4f8] px-4 md:flex">
        {navBody}
      </aside>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#edf4f8] px-4 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Organization navigation"
        >
          {navBody}
        </div>
      ) : null}
    </>
  );
}
