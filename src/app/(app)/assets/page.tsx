import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type AssetItem = { name: string; url: string };

type AssetGroup = {
  title: string;
  description: string;
  items: AssetItem[];
};

const assetGroups: AssetGroup[] = [
  {
    title: "Branding",
    description: "Global identity assets used in the admin shell.",
    items: [{ name: "Logo Favicon", url: ADMIN_ASSETS.branding.logoFavicon }],
  },
  {
    title: "Sidebar Navigation",
    description: "Primary left-nav icons for dashboard page routing.",
    items: [
      { name: "Dashboard", url: ADMIN_ASSETS.sidebar.nav.dashboard },
      {
        name: "Property Management",
        url: ADMIN_ASSETS.sidebar.nav.propertyManagement,
      },
      { name: "Create Listing", url: ADMIN_ASSETS.sidebar.nav.createListing },
      {
        name: "Rent Submission",
        url: ADMIN_ASSETS.sidebar.nav.rentSubmission,
      },
      { name: "User Management", url: ADMIN_ASSETS.sidebar.nav.userManagement },
      { name: "Governance", url: ADMIN_ASSETS.sidebar.nav.governance },
      { name: "Compliance Logs", url: ADMIN_ASSETS.sidebar.nav.complianceLogs },
      { name: "Notification", url: ADMIN_ASSETS.sidebar.nav.notification },
      {
        name: "Roles & Permissions",
        url: ADMIN_ASSETS.sidebar.nav.rolesPermissions,
      },
    ],
  },
  {
    title: "Sidebar Utility",
    description: "Top utility icon and bottom action icons.",
    items: [
      { name: "Top Action", url: ADMIN_ASSETS.sidebar.topAction },
      { name: "Settings", url: ADMIN_ASSETS.sidebar.utility.settings },
      { name: "Log Out", url: ADMIN_ASSETS.sidebar.utility.logout },
    ],
  },
  {
    title: "Top Navigation",
    description: "Profile and identity media used in the top bar.",
    items: [{ name: "User Avatar", url: ADMIN_ASSETS.topNav.avatar }],
  },
  {
    title: "Dashboard Content",
    description: "Media used in dashboard cards and tables.",
    items: [
      { name: "Property Thumbnail", url: ADMIN_ASSETS.dashboard.propertyThumb },
      { name: "Stat — Total Users", url: ADMIN_ASSETS.dashboard.statUsersIcon },
      {
        name: "Stat — Suspended Accounts",
        url: ADMIN_ASSETS.dashboard.statSuspendedIcon,
      },
      {
        name: "Stat — Third metric",
        url: ADMIN_ASSETS.dashboard.statPropertyIcon,
      },
      {
        name: "Recent activity check",
        url: ADMIN_ASSETS.dashboard.activityCheckIcon,
      },
    ],
  },
];

export default function AdminAssetsPage() {
  return (
    <div className="space-y-5">
      {assetGroups.map((group) => (
        <Card className="w-full p-6" key={group.title}>
          <CardHeader className="mb-4 flex-col items-start gap-1 p-0">
            <h2 className="text-[19px] font-medium text-[#050a0e]">
              {group.title}
            </h2>
            <p className="text-[13px] font-light text-[#787878]">
              {group.description}
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 p-0 md:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => (
              <div
                className="rounded-lg border border-[#dff0f8] bg-white p-3"
                key={item.name}
              >
                <p className="text-[13px] font-medium text-[#050a0e]">
                  {item.name}
                </p>
                <div className="mt-2 flex h-12 w-full items-center justify-center rounded bg-[#f5f7f8]">
                  <img
                    alt={item.name}
                    className="max-h-8 max-w-8 object-contain"
                    src={item.url}
                  />
                </div>
                <p className="mt-2 break-all text-[11px] text-[#787878]">
                  {item.url}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
