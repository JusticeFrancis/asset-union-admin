"use client";

import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { OrgAuthCard } from "@/app/organizations/components/org-auth-card";
import {
  orgAuthErrorClassName,
  orgAuthInputClassName,
} from "@/app/organizations/components/org-auth-styles";
import { Button } from "@/components/ui/button";
import { useOrganizationAuth } from "@/contexts/organization-auth-provider";
import { orgLogin } from "@/lib/api/requests/organization-auth";
import { getOrgAuthErrorMessage } from "@/lib/auth/org-errors";
import { setPendingOrgOtp } from "@/lib/auth/org-otp-pending";
import { getOrgAccessToken } from "@/lib/auth/org-tokens";
import { cn } from "@/lib/utils";

export function OrgLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    isLoading: isAuthLoading,
    applyTokenResponse,
  } = useOrganizationAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    if (!isAuthLoading && user && getOrgAccessToken()) {
      router.replace("/organizations/dashboard");
    }
  }, [isAuthLoading, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await orgLogin({
        email: email.trim(),
        password,
      });

      if ("otpSessionId" in response) {
        setPendingOrgOtp({
          flow: "login",
          otpSessionId: response.otpSessionId,
          expiresAt: response.expiresAt,
          maskedEmail: response.maskedEmail,
        });
        const verifyUrl = callbackUrl
          ? `/organizations/login/verify?callbackUrl=${encodeURIComponent(callbackUrl)}`
          : "/organizations/login/verify";
        router.push(verifyUrl);
        return;
      }

      if ("accessToken" in response) {
        applyTokenResponse(response, callbackUrl);
      }
    } catch (error) {
      setErrorMessage(
        getOrgAuthErrorMessage(error, "Unable to sign in. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OrgAuthCard
      title="Organization sign in"
      description="Sign in to manage your properties and team."
      footer={
        <p className="text-center text-[12px] text-[#919191]">
          New organization?{" "}
          <Link
            href="/organizations/register"
            className="font-medium text-[#5c60cc] hover:underline"
          >
            Create an account
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
          <label
            htmlFor={emailId}
            className="text-[12px] font-normal text-[#050a0e]"
          >
            Email
          </label>
          <input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={orgAuthInputClassName}
            placeholder="you@company.com"
            disabled={isSubmitting}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={passwordId}
            className="text-[12px] font-normal text-[#050a0e]"
          >
            Password
          </label>
          <div className="relative">
            <input
              id={passwordId}
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(orgAuthInputClassName, "pr-10")}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191] hover:text-[#050a0e]"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={isSubmitting}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden />
              ) : (
                <Eye className="size-4" aria-hidden />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/organizations/forgot-password"
            className="text-[12px] text-[#5c60cc] hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="h-10 w-full" disabled={isSubmitting}>
          {isSubmitting ? "Continuing…" : "Continue"}
        </Button>
      </form>
    </OrgAuthCard>
  );
}
