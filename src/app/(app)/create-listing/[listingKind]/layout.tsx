import { notFound } from "next/navigation";

import { isListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ listingKind: string }>;
};

export default async function CreateListingKindLayout({
  children,
  params,
}: LayoutProps) {
  const { listingKind } = await params;
  if (!isListingKind(listingKind)) notFound();
  return children;
}
