import { PropertyDetailPageClient } from "@/app/(app)/property-management/property-detail-page-client";

type PageProps = {
  params: Promise<{ propertyId: string }>;
};

export default async function OrganizationPropertyDetailPage({
  params,
}: PageProps) {
  const { propertyId } = await params;
  return (
    <PropertyDetailPageClient propertyId={propertyId} scope="organization" />
  );
}
