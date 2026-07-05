import { OrganizationBootstrapGuard } from "@/app/organizations/components/organization-bootstrap-guard";
import { OrganizationLayoutShell } from "@/app/organizations/components/organization-layout-shell";

export default function OrganizationsPortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <OrganizationBootstrapGuard>
      <OrganizationLayoutShell>{children}</OrganizationLayoutShell>
    </OrganizationBootstrapGuard>
  );
}
