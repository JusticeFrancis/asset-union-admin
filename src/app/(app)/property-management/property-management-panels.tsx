"use client";

import { useState } from "react";
import { useRouter } from "nextjs-toploader/app";
import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { usePropertyWizardPaths } from "@/contexts/property-wizard-scope";
import { getAdminErrorMessage } from "@/lib/auth/errors";
import {
  usePausePropertyMutation,
  usePublishPropertyMutation,
  useRejectPropertyMutation,
  useResumePropertyMutation,
} from "@/lib/api/mutations/admin-property";
import {
  canApproveProperties,
  canUpdateProperties,
} from "@/lib/admin-permissions";
import type { PropertyTableRow } from "@/lib/property-wizard/mappers";

export function PropertyDetailEditTrigger({
  resumeHref,
}: {
  resumeHref: string;
}) {
  const router = useRouter();
  const pm = ADMIN_ASSETS.propertyManagement;

  return (
    <Button
      type="button"
      className="h-10 gap-1 px-4 sm:px-6"
      onClick={() => router.push(resumeHref)}
    >
      <img
        alt=""
        width={20}
        height={20}
        className="size-5 shrink-0 object-contain"
        src={pm.detailEditIcon}
      />
      Edit
    </Button>
  );
}

export function PropertyManagerEditSection({
  resumeHref,
  canEdit,
}: {
  resumeHref: string;
  canEdit: boolean;
}) {
  const paths = usePropertyWizardPaths();
  const { admin } = useAdminAuth();

  if (!canEdit) return null;
  if (paths.scope === "organization") {
    return <PropertyDetailEditTrigger resumeHref={resumeHref} />;
  }
  if (!canUpdateProperties(admin?.roles, admin?.permissions)) return null;
  return <PropertyDetailEditTrigger resumeHref={resumeHref} />;
}

export function PropertyStatusActions({
  propertyId,
  apiStatus,
}: {
  propertyId: string;
  apiStatus: PropertyTableRow["apiStatus"];
}) {
  const publishMutation = usePublishPropertyMutation();
  const rejectMutation = useRejectPropertyMutation();
  const pauseMutation = usePausePropertyMutation();
  const resumeMutation = useResumePropertyMutation();
  const { admin } = useAdminAuth();
  const canApprove = canApproveProperties(admin?.roles, admin?.permissions);
  const [actionError, setActionError] = useState("");

  if (!canApprove) return null;

  async function publish() {
    setActionError("");
    try {
      await publishMutation.mutateAsync(propertyId);
    } catch (error) {
      setActionError(getAdminErrorMessage(error, "Failed to publish property."));
    }
  }

  async function reject() {
    const reason = window.prompt("Why is this property being rejected?")?.trim();
    if (!reason) return;
    setActionError("");
    try {
      await rejectMutation.mutateAsync({ propertyId, body: { reason } });
    } catch (error) {
      setActionError(getAdminErrorMessage(error, "Failed to reject property."));
    }
  }

  const actions =
    apiStatus === "submitted" ? (
      <>
        <Button
          type="button"
          className="h-10"
          disabled={publishMutation.isPending || rejectMutation.isPending}
          onClick={() => void publish()}
        >
          Approve & publish
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 border-[#B3261E] text-[#B3261E] hover:bg-[#fff1f0] hover:text-[#B3261E]"
          disabled={publishMutation.isPending || rejectMutation.isPending}
          onClick={() => void reject()}
        >
          Reject
        </Button>
      </>
    ) : apiStatus === "active" ? (
      <Button
        type="button"
        variant="outline"
        className="h-10"
        disabled={pauseMutation.isPending}
        onClick={() => void pauseMutation.mutateAsync({ propertyId })}
      >
        Pause property
      </Button>
    ) : apiStatus === "paused" ? (
      <Button
        type="button"
        className="h-10"
        disabled={resumeMutation.isPending}
        onClick={() => void resumeMutation.mutateAsync(propertyId)}
      >
        Resume property
      </Button>
    ) : null;

  if (!actions) return null;
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">{actions}</div>
      {actionError ? (
        <p className="max-w-[360px] text-right text-[11px] text-[#B3261E]">
          {actionError}
        </p>
      ) : null}
    </div>
  );
}
