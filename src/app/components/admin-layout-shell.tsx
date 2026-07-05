"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AdminNavItem, AdminSidebar } from "@/app/components/admin-sidebar";
import {
  AdminTopNav,
  type BreadcrumbSegment,
} from "@/app/components/admin-top-nav";
import {
  LISTING_KIND_LABEL,
  WIZARD_BREADCRUMB_STEP_LABEL,
  isListingKind,
  isStepValidForListingKind,
  isWizardStepSegment,
} from "@/app/(app)/create-listing/create-listing-wizard-data";
import { AdminRoleProvider } from "@/lib/admin-role";
import { useAdminAuth } from "@/contexts/admin-auth-provider";

type AdminLayoutShellProps = {
  children: ReactNode;
};

function getPropertyDetailBreadcrumb(
  pathname: string,
): BreadcrumbSegment[] | null {
  if (pathname === "/property-management") return null;
  const match = /^\/property-management\/([^/]+)$/.exec(pathname);
  if (!match) return null;
  return [
    { label: "Property Management", href: "/property-management" },
    { label: "Property" },
  ];
}

function getNotificationsBreadcrumb(
  pathname: string,
): BreadcrumbSegment[] | null {
  if (pathname !== "/notifications/create-notification") return null;
  return [
    { label: "Notification", href: "/notifications" },
    { label: "Create Notification" },
  ];
}

function getGovernanceBreadcrumb(pathname: string): BreadcrumbSegment[] | null {
  if (pathname === "/governance") return null;
  const base = { label: "Governance", href: "/governance" } as const;
  if (pathname === "/governance/create") {
    return [base, { label: "Create Proposal" }];
  }
  const proposalMatch = /^\/governance\/proposal\/([^/]+)$/.exec(pathname);
  if (proposalMatch) {
    return [base, { label: "Proposal" }];
  }
  return null;
}

function getUserManagementBreadcrumb(
  pathname: string,
): BreadcrumbSegment[] | null {
  if (pathname === "/user-management") return null;
  const match = /^\/user-management\/([^/]+)$/.exec(pathname);
  if (!match) return null;
  return [
    { label: "User Management", href: "/user-management" },
    { label: "User" },
  ];
}

function getRolesAndPermissionsBreadcrumb(
  pathname: string,
): BreadcrumbSegment[] | null {
  if (pathname === "/roles-and-permissions") return null;
  const base = {
    label: "Roles & Permission",
    href: "/roles-and-permissions",
  } as const;
  if (pathname.startsWith("/roles-and-permissions/add-admin-user")) {
    return [base, { label: "Add Admin User" }];
  }
  if (pathname.startsWith("/roles-and-permissions/view-admin-user")) {
    return [base, { label: "View Admin User" }];
  }
  if (pathname.startsWith("/roles-and-permissions/edit-admin-user")) {
    return [base, { label: "Edit Admin User" }];
  }
  return null;
}

function getCreateListingWizardBreadcrumb(
  pathname: string,
): BreadcrumbSegment[] | null {
  const match =
    /^\/create-listing\/(construction-project|rental-property)\/([^/]+)$/.exec(
      pathname,
    );
  if (!match) return null;
  const kindRaw = match[1];
  const step = match[2];
  if (!isListingKind(kindRaw)) return null;
  const kind = kindRaw;
  const isStep =
    (isWizardStepSegment(step) && isStepValidForListingKind(kind, step)) ||
    step === "form-completed";
  if (!isStep) return null;
  const stepLabel = WIZARD_BREADCRUMB_STEP_LABEL[step];
  return [
    { label: "Create Listing", href: "/create-listing" },
    {
      label: LISTING_KIND_LABEL[kind],
      href: `/create-listing/${kind}/basic-property-information`,
    },
    { label: stepLabel },
  ];
}

function getPageConfig(pathname: string): {
  title: string;
  activeItem?: AdminNavItem;
  contentTopPaddingClass: string;
  breadcrumb?: BreadcrumbSegment[] | null;
} {
  if (pathname.startsWith("/dashboard")) {
    return {
      title: "Dashboard",
      activeItem: "Dashboard",
      contentTopPaddingClass: "pt-[23px]",
    };
  }
  if (pathname.startsWith("/property-management")) {
    const breadcrumb = getPropertyDetailBreadcrumb(pathname);
    return {
      title: "Property Management",
      activeItem: "Property Management",
      contentTopPaddingClass: "pt-[23px]",
      breadcrumb,
    };
  }
  const createListingWizardBreadcrumb =
    getCreateListingWizardBreadcrumb(pathname);
  if (createListingWizardBreadcrumb) {
    const stepMatch =
      /^\/create-listing\/(construction-project|rental-property)\/([^/]+)$/.exec(
        pathname,
      );
    const wizardKind = stepMatch?.[1];
    const step = stepMatch?.[2];
    const title =
      step &&
      wizardKind &&
      isListingKind(wizardKind) &&
      (step === "form-completed" ||
        (isWizardStepSegment(step) &&
          isStepValidForListingKind(wizardKind, step)))
        ? WIZARD_BREADCRUMB_STEP_LABEL[step]
        : "Create Listing";
    return {
      title,
      activeItem: "Create Listing",
      contentTopPaddingClass: "pt-[23px]",
      breadcrumb: createListingWizardBreadcrumb,
    };
  }
  if (pathname.startsWith("/create-listing")) {
    return {
      title: "Create Listing",
      activeItem: "Create Listing",
      contentTopPaddingClass: "pt-[23px]",
    };
  }
  if (pathname.startsWith("/rent-submission")) {
    if (pathname === "/rent-submission") {
      return {
        title: "Rent Submission",
        activeItem: "Rent Submission",
        contentTopPaddingClass: "pt-[24px]",
      };
    }
    const rentDetailMatch = /^\/rent-submission\/([^/]+)$/.exec(pathname);
    if (rentDetailMatch) {
      const label = "Rent submission";
      return {
        title: label,
        activeItem: "Rent Submission",
        contentTopPaddingClass: "pt-[24px]",
        breadcrumb: [
          { label: "Rent Submission", href: "/rent-submission" },
          { label },
        ],
      };
    }
    return {
      title: "Rent Submission",
      activeItem: "Rent Submission",
      contentTopPaddingClass: "pt-[24px]",
    };
  }
  if (pathname.startsWith("/user-management")) {
    const breadcrumb = getUserManagementBreadcrumb(pathname);
    const isUserDetail =
      /^\/user-management\/[^/]+$/.exec(pathname) !== null &&
      pathname !== "/user-management";
    return {
      title: isUserDetail ? "User Account" : "User Management",
      activeItem: "User Management",
      contentTopPaddingClass: "pt-[23px]",
      breadcrumb,
    };
  }
  if (pathname.startsWith("/governance")) {
    const breadcrumb = getGovernanceBreadcrumb(pathname);
    if (pathname === "/governance/create") {
      return {
        title: "Create Proposal",
        activeItem: "Governance",
        contentTopPaddingClass: "pt-[23px]",
        breadcrumb,
      };
    }
    const proposalMatch = /^\/governance\/proposal\/([^/]+)$/.exec(pathname);
    if (proposalMatch) {
      return {
        title: "Proposal",
        activeItem: "Governance",
        contentTopPaddingClass: "pt-[23px]",
        breadcrumb,
      };
    }
    return {
      title: "Governance",
      activeItem: "Governance",
      contentTopPaddingClass: "pt-[23px]",
      breadcrumb,
    };
  }
  if (pathname.startsWith("/compliance-logs")) {
    return {
      title: "Compliance Logs",
      activeItem: "Compliance Logs",
      contentTopPaddingClass: "pt-[23px]",
    };
  }
  if (pathname.startsWith("/notifications")) {
    return {
      title: "Notification",
      activeItem: "Notification",
      contentTopPaddingClass: "pt-[23px]",
      breadcrumb: getNotificationsBreadcrumb(pathname),
    };
  }
  if (pathname.startsWith("/roles-and-permissions")) {
    const breadcrumb = getRolesAndPermissionsBreadcrumb(pathname);
    if (pathname.startsWith("/roles-and-permissions/add-admin-user")) {
      return {
        title: "Add Admin User",
        activeItem: "Roles & Permissions",
        contentTopPaddingClass: "pt-[23px]",
        breadcrumb,
      };
    }
    if (pathname.startsWith("/roles-and-permissions/view-admin-user")) {
      return {
        title: "View Admin User",
        activeItem: "Roles & Permissions",
        contentTopPaddingClass: "pt-[23px]",
        breadcrumb,
      };
    }
    if (pathname.startsWith("/roles-and-permissions/edit-admin-user")) {
      return {
        title: "Edit Admin User",
        activeItem: "Roles & Permissions",
        contentTopPaddingClass: "pt-[23px]",
        breadcrumb,
      };
    }
    return {
      title: "Roles & Permission",
      activeItem: "Roles & Permissions",
      contentTopPaddingClass: "pt-[23px]",
      breadcrumb,
    };
  }
  if (pathname.startsWith("/settings")) {
    if (pathname.startsWith("/settings/account-information")) {
      return {
        title: "Account Information",
        activeItem: "Settings",
        contentTopPaddingClass: "pt-[23px]",
      };
    }
    if (pathname.startsWith("/settings/platform-fee")) {
      return {
        title: "Settings",
        activeItem: "Settings",
        contentTopPaddingClass: "pt-[23px]",
      };
    }
    return {
      title: "Settings",
      activeItem: "Settings",
      contentTopPaddingClass: "pt-[23px]",
    };
  }
  if (pathname.startsWith("/account-information")) {
    return {
      title: "Account Information",
      activeItem: "Settings",
      contentTopPaddingClass: "pt-[23px]",
    };
  }
  if (pathname.startsWith("/assets")) {
    return { title: "Admin Assets", contentTopPaddingClass: "pt-[55px]" };
  }
  return { title: "Admin", contentTopPaddingClass: "pt-[55px]" };
}

function requiredPermissionForPath(pathname: string): string | null {
  if (pathname.startsWith("/dashboard")) return "dashboard.view";
  if (pathname.startsWith("/create-listing")) return "properties.create";
  if (pathname.startsWith("/property-management")) return "properties.view";
  if (pathname.startsWith("/rent-submission")) return "rents.view";
  if (pathname.startsWith("/user-management")) return "users.view";
  if (pathname === "/governance/create") return "governance.create";
  if (pathname.startsWith("/governance")) return "governance.view";
  if (pathname.startsWith("/compliance-logs")) return "compliance.view";
  if (pathname === "/notifications/create-notification") return "notifications.create";
  if (pathname.startsWith("/notifications")) return "notifications.view";
  if (pathname.startsWith("/roles-and-permissions/add-admin-user")) return "admins.create";
  if (pathname.startsWith("/roles-and-permissions/edit-admin-user")) return "admins.update";
  if (pathname.startsWith("/roles-and-permissions/view-admin-user")) return "admins.view";
  if (pathname.startsWith("/roles-and-permissions")) return "admins.view";
  if (pathname.startsWith("/settings/platform-fee")) return "platform_settings.view";
  if (pathname.startsWith("/settings") || pathname.startsWith("/account-information")) return "settings.view";
  return null;
}

function firstAllowedPath(permissions: string[]) {
  const choices: Array<[string, string]> = [
    ["dashboard.view", "/dashboard"],
    ["properties.view", "/property-management"],
    ["rents.view", "/rent-submission"],
    ["users.view", "/user-management"],
    ["governance.view", "/governance"],
    ["compliance.view", "/compliance-logs"],
    ["notifications.view", "/notifications"],
    ["admins.view", "/roles-and-permissions"],
    ["settings.view", "/settings"],
    ["platform_settings.view", "/settings/platform-fee"],
  ];
  return choices.find(([permission]) => permissions.includes(permission))?.[1] || "/sign-in";
}

export function AdminLayoutShell({ children }: AdminLayoutShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { admin, isLoading } = useAdminAuth();
  const pageConfig = getPageConfig(pathname);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const requiredPermission = requiredPermissionForPath(pathname);
  const isAuthorized = !requiredPermission || Boolean(admin?.permissions?.includes(requiredPermission));

  useEffect(() => {
    if (!isLoading && !admin) {
      router.replace(`/sign-in?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!isLoading && admin && !isAuthorized) {
      router.replace(firstAllowedPath(admin.permissions));
    }
  }, [admin, isAuthorized, isLoading, pathname, router]);

  if (isLoading || !admin || !isAuthorized) {
    return <main className="flex min-h-screen items-center justify-center bg-[#edf4f8]"><div className="size-7 animate-spin rounded-full border-2 border-[#cfe2ec] border-t-[#5c60cc]" aria-label="Loading" /></main>;
  }

  return (
    <AdminRoleProvider>
      <main className="min-h-screen bg-[#edf4f8]">
        <div className="min-h-screen w-full bg-[#edf4f8]">
          <AdminSidebar
            activeItem={pageConfig.activeItem}
            mobileOpen={mobileNavOpen}
            onMobileClose={() => setMobileNavOpen(false)}
            onNavigate={() => setMobileNavOpen(false)}
          />
          <section className="min-h-screen min-w-0 bg-[#edf4f8] pt-[67px] md:ml-[282px] md:border-l md:border-[#cfe2ec]">
            <AdminTopNav
              title={pageConfig.title}
              breadcrumb={pageConfig.breadcrumb}
              onOpenMobileNav={() => setMobileNavOpen(true)}
            />
            <div
              className={`px-3 pb-5 sm:px-5 ${pageConfig.contentTopPaddingClass}`}
            >
              {children}
            </div>
          </section>
        </div>
      </main>
    </AdminRoleProvider>
  );
}
