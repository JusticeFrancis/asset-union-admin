"use client";

import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";

import { OrgAuthCard } from "@/app/organizations/components/org-auth-card";
import {
  orgAuthErrorClassName,
  orgAuthInputClassName,
} from "@/app/organizations/components/org-auth-styles";
import { Button } from "@/components/ui/button";
import { useOrganizationAuth } from "@/contexts/organization-auth-provider";
import type { OrgOtpFlow } from "@/lib/auth/org-otp-pending";
import {
  clearPendingOrgOtp,
  getPendingOrgOtp,
} from "@/lib/auth/org-otp-pending";
import { getOrgAuthErrorMessage } from "@/lib/auth/org-errors";

type OrgOtpVerifyFormProps = {
  flow: OrgOtpFlow;
  title: string;
  description: string;
  backHref: string;
  onVerify: (payload: {
    otpSessionId: string;
    code: string;
  }) => Promise<
    import("@/lib/api/organization-auth.types").OrganizationTokenResponse
  >;
};

export function OrgOtpVerifyForm({
  flow,
  title,
  description,
  backHref,
  onVerify,
}: OrgOtpVerifyFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { applyTokenResponse } = useOrganizationAuth();
  const codeId = useId();

  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pending, setPending] = useState(getPendingOrgOtp());

  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    const session = getPendingOrgOtp();
    if (!session || session.flow !== flow) {
      router.replace(backHref);
      return;
    }
    setPending(session);
  }, [backHref, flow, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending || code.trim().length < 6) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await onVerify({
        otpSessionId: pending.otpSessionId,
        code: code.trim(),
      });
      clearPendingOrgOtp();
      applyTokenResponse(response, callbackUrl);
    } catch (error) {
      setErrorMessage(
        getOrgAuthErrorMessage(error, "Verification failed. Try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pending) {
    return null;
  }

  return (
    <OrgAuthCard
      title={title}
      description={
        pending.maskedEmail
          ? `${description} Code sent to ${pending.maskedEmail}.`
          : description
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {errorMessage ? (
          <p className={orgAuthErrorClassName} role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={codeId}
            className="text-[12px] font-normal text-[#050a0e]"
          >
            Verification code
          </label>
          <input
            id={codeId}
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className={orgAuthInputClassName}
            placeholder="123456"
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying…" : "Continue"}
        </Button>
      </form>
    </OrgAuthCard>
  );
}
