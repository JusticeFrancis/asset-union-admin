import { OrganizationBootstrapGuard } from "@/app/organizations/components/organization-bootstrap-guard";

export default function OrganizationsOnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <OrganizationBootstrapGuard>{children}</OrganizationBootstrapGuard>;
}
