"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { OrgAuthCard } from "@/app/organizations/components/org-auth-card";
import {
  orgAuthErrorClassName,
  orgAuthInputClassName,
} from "@/app/organizations/components/org-auth-styles";
import { Button } from "@/components/ui/button";
import { orgRegister } from "@/lib/api/requests/organization-auth";
import { getOrgAuthErrorMessage } from "@/lib/auth/org-errors";
import { setPendingOrgOtp } from "@/lib/auth/org-otp-pending";
import { cn } from "@/lib/utils";

export default function OrganizationRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullNameId = useId();
  const emailId = useId();
  const passwordId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await orgRegister({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });
      setPendingOrgOtp({
        flow: "register",
        otpSessionId: response.otpSessionId,
        expiresAt: response.expiresAt,
        maskedEmail: response.maskedEmail,
      });
      router.push("/organizations/register/verify");
    } catch (error) {
      setErrorMessage(
        getOrgAuthErrorMessage(error, "Unable to register. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrgAuthCard
      title="Create organization account"
      description="Register as an asset manager, developer, or agency."
      footer={
        <p className="text-center text-[12px] text-[#919191]">
          Already have an account?{" "}
          <Link
            href="/organizations/login"
            className="font-medium text-[#5c60cc] hover:underline"
          >
            Sign in
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
          <label htmlFor={fullNameId} className="text-[12px] text-[#050a0e]">
            Full name
          </label>
          <input
            id={fullNameId}
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={orgAuthInputClassName}
            disabled={isSubmitting}
          />
        </div>

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

        <div className="flex flex-col gap-1.5">
          <label htmlFor={passwordId} className="text-[12px] text-[#050a0e]">
            Password
          </label>
          <div className="relative">
            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(orgAuthInputClassName, "pr-10")}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191]"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Sending code…" : "Continue"}
        </Button>
      </form>
    </OrgAuthCard>
  );
}
