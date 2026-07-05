"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useId, useState } from "react";

import { OrgAuthCard } from "@/app/organizations/components/org-auth-card";
import {
  orgAuthErrorClassName,
  orgAuthInputClassName,
} from "@/app/organizations/components/org-auth-styles";
import { Button } from "@/components/ui/button";
import { orgPasswordResetRequest } from "@/lib/api/requests/organization-auth";
import { getOrgAuthErrorMessage } from "@/lib/auth/org-errors";
import { setPendingOrgOtp } from "@/lib/auth/org-otp-pending";

export default function OrganizationForgotPasswordPage() {
  const router = useRouter();
  const emailId = useId();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      const response = await orgPasswordResetRequest(email.trim());

      if ("otpSessionId" in response) {
        setPendingOrgOtp({
          flow: "password-reset",
          otpSessionId: response.otpSessionId,
          expiresAt: response.expiresAt,
          maskedEmail: response.maskedEmail,
        });
        router.push("/organizations/reset-password");
        return;
      }

      setMessage(response.message);
    } catch (error) {
      setErrorMessage(
        getOrgAuthErrorMessage(error, "Unable to send reset code."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrgAuthCard
      title="Reset password"
      description="We will email a verification code if an account exists."
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
        {message ? (
          <p className="rounded-[12px] border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-[12px] text-[#166534]">
            {message}
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor={emailId} className="text-[12px] text-[#050a0e]">
            Email
          </label>
          <input
            id={emailId}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={orgAuthInputClassName}
            disabled={isSubmitting}
          />
        </div>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset code"}
        </Button>
      </form>
    </OrgAuthCard>
  );
}
