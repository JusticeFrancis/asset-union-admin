"use client";

import Link from "next/link";
import { Geologica } from "next/font/google";
import { X } from "lucide-react";
import { useEffect } from "react";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { canCreateProperties } from "@/lib/admin-permissions";
import { cn } from "@/lib/utils";

const geologica = Geologica({
  subsets: ["latin"],
  weight: "600",
});

/** Same treatment as user `DashboardSidebar` — SVG `<img>` + filter reads crisply at any DPR. */
const activeIconFilter =
  "brightness(0) saturate(100%) invert(35%) sepia(30%) saturate(1597%) hue-rotate(209deg) brightness(91%) contrast(91%)";
const defaultIconFilter = "brightness(0) saturate(100%)";

type AdminSidebarProps = {
  activeItem?: AdminNavItem;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onNavigate?: () => void;
};

export type AdminNavItem =
  | "Dashboard"
  | "Property Management"
  | "Create Listing"
  | "Rent Submission"
  | "User Management"
  | "Governance"
  | "Compliance Logs"
  | "Notification"
  | "Roles & Permissions"
  | "Settings";

type NavEntry = {
  label: AdminNavItem;
  href: string;
  iconSrc: string;
};

type NavSection = {
  heading: string;
  items: NavEntry[];
};

const navSections: NavSection[] = [
  {
    heading: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        iconSrc: ADMIN_ASSETS.sidebar.nav.dashboard,
      },
    ],
  },
  {
    heading: "Properties",
    items: [
      {
        label: "Property Management",
        href: "/property-management",
        iconSrc: ADMIN_ASSETS.sidebar.nav.propertyManagement,
      },
      {
        label: "Create Listing",
        href: "/create-listing",
        iconSrc: ADMIN_ASSETS.sidebar.nav.createListing,
      },
    ],
  },
  {
    heading: "Finance",
    items: [
      {
        label: "Rent Submission",
        href: "/rent-submission",
        iconSrc: ADMIN_ASSETS.sidebar.nav.rentSubmission,
      },
    ],
  },
  {
    heading: "Users",
    items: [
      {
        label: "User Management",
        href: "/user-management",
        iconSrc: ADMIN_ASSETS.sidebar.nav.userManagement,
      },
    ],
  },
  {
    heading: "Platform",
    items: [
      {
        label: "Governance",
        href: "/governance",
        iconSrc: ADMIN_ASSETS.sidebar.nav.governance,
      },
      {
        label: "Compliance Logs",
        href: "/compliance-logs",
        iconSrc: ADMIN_ASSETS.sidebar.nav.complianceLogs,
      },
      {
        label: "Notification",
        href: "/notifications",
        iconSrc: ADMIN_ASSETS.sidebar.nav.notification,
      },
      {
        label: "Roles & Permissions",
        href: "/roles-and-permissions",
        iconSrc: ADMIN_ASSETS.sidebar.nav.rolesPermissions,
      },
    ],
  },
];

const bottomNav: NavEntry[] = [
  {
    label: "Settings",
    href: "/settings",
    iconSrc: ADMIN_ASSETS.sidebar.utility.settings,
  },
];

function NavLinkRow({
  activeItem,
  href,
  iconSrc,
  label,
  noBg = false,
  onClick,
}: {
  activeItem?: AdminNavItem;
  href: string;
  iconSrc: string;
  label: AdminNavItem;
  noBg?: boolean;
  onClick?: () => void;
}) {
  const isActive = label === activeItem;
  return (
    <Link
      className={cn(
        "flex h-[34px] items-center gap-3 rounded-[8px] px-3 py-2 text-[14px] font-light leading-none",
        isActive ? "text-[#5c60cc]" : "text-[#050a0e]",
        !noBg && isActive
          ? "bg-white shadow-[0_1px_4px_rgba(12,12,13,0.05)]"
          : "",
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

export function AdminSidebar({
  activeItem,
  mobileOpen = false,
  onMobileClose,
  onNavigate,
}: AdminSidebarProps) {
  const { logout, admin } = useAdminAuth();
  const canCreateProperty = canCreateProperties(admin?.roles, admin?.permissions);
  const permissionByLabel: Partial<Record<AdminNavItem, string>> = {
    Dashboard: "dashboard.view",
    "Property Management": "properties.view",
    "Create Listing": "properties.create",
    "Rent Submission": "rents.view",
    "User Management": "users.view",
    Governance: "governance.view",
    "Compliance Logs": "compliance.view",
    Notification: "notifications.view",
    "Roles & Permissions": "admins.view",
    Settings: "settings.view",
  };
  const hasPermission = (label: AdminNavItem) => {
    const permission = permissionByLabel[label];
    return !permission || Boolean(admin?.permissions?.includes(permission));
  };
  const handleNavClick = onNavigate ?? undefined;

  const visibleNavSections = navSections.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => hasPermission(item.label) && (item.label !== "Create Listing" || canCreateProperty),
    ),
  }));

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

  const navBody = (
    <>
      <div className="pt-5">
        <div className="flex items-center justify-between">
          <Link
            className="flex items-center gap-px"
            href="/dashboard"
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

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pt-4 pb-4">
        {visibleNavSections.map((section) => (
          <div className="flex flex-col gap-2" key={section.heading}>
            <div className="flex justify-start px-[10px] py-2">
              <p className="text-[9px] font-light uppercase leading-none text-[#575757]">
                {section.heading}
              </p>
            </div>
            <nav className="flex flex-col gap-2">
              {section.items.map((item) => (
                <NavLinkRow
                  activeItem={activeItem}
                  href={item.href}
                  iconSrc={item.iconSrc}
                  key={item.label}
                  label={item.label}
                  onClick={handleNavClick}
                />
              ))}
            </nav>
          </div>
        ))}
      </div>

      <div className="pb-5">
        <div className="flex flex-col gap-2">
          {bottomNav.filter((item) => hasPermission(item.label)).map((item) => (
            <NavLinkRow
              noBg
              activeItem={activeItem}
              href={item.href}
              iconSrc={item.iconSrc}
              key={item.label}
              label={item.label}
              onClick={handleNavClick}
            />
          ))}
          <button
            className="flex h-[34px] items-center gap-3 rounded-[8px] px-3 py-2 text-left text-[14px] font-light text-[#050a0e] hover:opacity-90"
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
          aria-label="Admin navigation"
        >
          {navBody}
        </div>
      ) : null}
    </>
  );
}
