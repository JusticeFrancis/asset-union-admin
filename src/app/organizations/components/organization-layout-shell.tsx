"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { OrgStatusBanner } from "@/app/organizations/components/org-status-banner";
import {
  OrganizationSidebar,
  type OrganizationNavItem,
} from "@/app/organizations/components/organization-sidebar";
import { OrganizationTopNav } from "@/app/organizations/components/organization-top-nav";

type OrganizationLayoutShellProps = {
  children: ReactNode;
};

function getPageConfig(pathname: string): {
  title: string;
  activeItem?: OrganizationNavItem;
  contentTopPaddingClass: string;
} {
  if (pathname === "/organizations/dashboard") {
    return {
      title: "Dashboard",
      activeItem: "Dashboard",
      contentTopPaddingClass: "pt-[23px]",
    };
  }
  if (pathname.startsWith("/organizations/onboarding/profile")) {
    return {
      title: "Organization profile",
      activeItem: "Organization profile",
      contentTopPaddingClass: "pt-[23px]",
    };
  }
  if (pathname.startsWith("/organizations/members")) {
    return {
      title: "Team",
      activeItem: "Team",
      contentTopPaddingClass: "pt-[23px]",
    };
  }
  if (pathname.startsWith("/organizations/create-listing")) {
    return {
      title: "Create listing",
      activeItem: "Create listing",
      contentTopPaddingClass: "pt-[23px]",
    };
  }
  if (pathname.startsWith("/organizations/properties")) {
    return {
      title: "Properties",
      activeItem: "Properties",
      contentTopPaddingClass: "pt-[23px]",
    };
  }
  if (pathname.startsWith("/organizations/compliance")) {
    return {
      title: "Compliance log",
      activeItem: "Compliance log",
      contentTopPaddingClass: "pt-[23px]",
    };
  }
  return {
    title: "Organization",
    contentTopPaddingClass: "pt-[23px]",
  };
}

export function OrganizationLayoutShell({
  children,
}: OrganizationLayoutShellProps) {
  const pathname = usePathname();
  const pageConfig = getPageConfig(pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <main className="min-h-screen bg-[#edf4f8]">
      <div className="min-h-screen w-full bg-[#edf4f8]">
        <OrganizationSidebar
          activeItem={pageConfig.activeItem}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
          onNavigate={() => setMobileNavOpen(false)}
        />
        <section className="min-h-screen min-w-0 bg-[#edf4f8] pt-[67px] md:ml-[282px] md:border-l md:border-[#cfe2ec]">
          <OrganizationTopNav
            title={pageConfig.title}
            onOpenMobileNav={() => setMobileNavOpen(true)}
          />
          <div
            className={`px-3 pb-5 sm:px-5 ${pageConfig.contentTopPaddingClass}`}
          >
            <div className="mb-4">
              <OrgStatusBanner />
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
