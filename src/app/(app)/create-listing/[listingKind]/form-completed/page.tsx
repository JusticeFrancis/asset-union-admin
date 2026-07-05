import { notFound } from "next/navigation";

import { isListingKind } from "@/app/(app)/create-listing/create-listing-wizard-data";
import { FormCompletedContent } from "@/app/(app)/create-listing/form-completed/form-completed-content";
import { Card } from "@/components/ui/card";

type PageProps = {
  params: Promise<{ listingKind: string }>;
};

export default async function FormCompletedPage({ params }: PageProps) {
  const { listingKind: raw } = await params;
  if (!isListingKind(raw)) notFound();

  return (
    <div className="flex w-full justify-center">
      <Card className="w-full max-w-lg rounded-[20px] border-0 p-0 shadow-sm">
        <FormCompletedContent listingKind={raw} />
      </Card>
    </div>
  );
}
