"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useId, useState } from "react";

import { OrgAuthCard } from "@/app/organizations/components/org-auth-card";
import {
  orgAuthErrorClassName,
  orgAuthInputClassName,
} from "@/app/organizations/components/org-auth-styles";
import { Button } from "@/components/ui/button";
import { orgPasswordResetConfirm } from "@/lib/api/requests/organization-auth";
import { getOrgAuthErrorMessage } from "@/lib/auth/org-errors";
import {
  clearPendingOrgOtp,
  getPendingOrgOtp,
} from "@/lib/auth/org-otp-pending";

export default function OrganizationResetPasswordPage() {
  const router = useRouter();
  const codeId = useId();
  const passwordId = useId();

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pending, setPending] = useState(getPendingOrgOtp());

  useEffect(() => {
    const session = getPendingOrgOtp();
    if (!session || session.flow !== "password-reset") {
      router.replace("/organizations/forgot-password");
      return;
    }
    setPending(session);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await orgPasswordResetConfirm({
        otpSessionId: pending.otpSessionId,
        code: code.trim(),
        password,
      });
      clearPendingOrgOtp();
      router.replace("/organizations/login");
    } catch (error) {
      setErrorMessage(
        getOrgAuthErrorMessage(error, "Unable to reset password."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pending) return null;

  return (
    <OrgAuthCard
      title="Choose a new password"
      description={
        pending.maskedEmail
          ? `Enter the code sent to ${pending.maskedEmail} and your new password.`
          : "Enter your verification code and new password."
      }
      footer={
        <p className="text-center text-[12px] text-[#919191]">
          <Link
            href="/organizations/login"
            className="text-[#5c60cc] hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        {errorMessage ? (
          <p className={orgAuthErrorClassName} role="alert">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor={codeId} className="text-[12px] text-[#050a0e]">
            Verification code
          </label>
          <input
            id={codeId}
            inputMode="numeric"
            required
            maxLength={6}
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            className={orgAuthInputClassName}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={passwordId} className="text-[12px] text-[#050a0e]">
            New password
          </label>
          <input
            id={passwordId}
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={orgAuthInputClassName}
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Reset password"}
        </Button>
      </form>
    </OrgAuthCard>
  );
}
