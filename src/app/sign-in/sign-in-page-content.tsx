"use client";

import { useRouter } from "nextjs-toploader/app";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { getAdminAuthErrorMessage } from "@/lib/auth/errors";
import { sanitizeCallbackUrl } from "@/lib/auth/callback-url";
import { ApiError } from "@/lib/api/types";
import { cn } from "@/lib/utils";

const inputClassName = cn(
  "h-10 w-full rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px] text-[#050a0e]",
  "placeholder:text-[#919191] placeholder:font-light",
  "outline-none transition-colors focus-visible:border-[#5c60cc] focus-visible:ring-2 focus-visible:ring-[#5C60CC]/30",
);

export function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, admin, isLoading: isAuthLoading } = useAdminAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const twoFactorId = useId();
  const callbackUrl = searchParams.get("callbackUrl");

  useEffect(() => {
    if (!isAuthLoading && admin) {
      const destination = sanitizeCallbackUrl(callbackUrl) ?? "/dashboard";
      router.replace(destination);
    }
  }, [admin, callbackUrl, isAuthLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || (twoFactorRequired && !twoFactorCode.trim())) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password, ...(twoFactorRequired ? { twoFactorCode: twoFactorCode.trim() } : {}) }, callbackUrl);
    } catch (error) {
      if (error instanceof ApiError && error.code === "TWO_FACTOR_REQUIRED") {
        setTwoFactorRequired(true);
        setErrorMessage("Enter the 6-digit code from your authenticator app.");
      } else {
        setErrorMessage(
          getAdminAuthErrorMessage(error, "Unable to sign in. Please try again."),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#edf4f8] px-4 py-8">
      <Card className="w-full max-w-[400px] rounded-[20px] border-0 p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col items-center gap-4">
            <img
              src={ADMIN_ASSETS.branding.logoFull}
              alt="Asset Union"
              className="h-11 w-auto"
              width={120}
              height={44}
            />
            <div className="flex w-full flex-col gap-1 text-center">
              <h1 className="text-[19px] font-medium leading-none text-[#050a0e]">
                Admin sign in
              </h1>
              <p className="text-[12px] font-light leading-normal text-[#919191]">
                Enter your credentials to access the dashboard.
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-[#cfe2ec]" aria-hidden />

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {errorMessage ? (
              <p
                className="rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]"
                role="alert"
              >
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
                className={inputClassName}
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
                  className={cn(inputClassName, "pr-10")}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#919191] hover:text-[#050a0e]"
                  onClick={() => setShowPassword((value) => !value)}
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

            {twoFactorRequired ? (
              <div className="flex flex-col gap-1.5">
                <label htmlFor={twoFactorId} className="text-[12px] font-normal text-[#050a0e]">
                  Authenticator code
                </label>
                <input
                  id={twoFactorId}
                  name="twoFactorCode"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={inputClassName}
                  placeholder="000000"
                  disabled={isSubmitting}
                />
              </div>
            ) : null}

            <Button
              type="submit"
              className="mt-1 h-10 w-full"
              disabled={isSubmitting || isAuthLoading}
            >
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
