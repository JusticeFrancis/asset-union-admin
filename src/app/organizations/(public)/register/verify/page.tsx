"use client";

import { Suspense } from "react";

import { OrgOtpVerifyForm } from "@/app/organizations/components/org-otp-verify-form";
import { orgRegisterOtpVerify } from "@/lib/api/requests/organization-auth";

function OrganizationRegisterVerifyContent() {
  return (
    <OrgOtpVerifyForm
      flow="register"
      title="Verify your email"
      description="Enter the 6-digit code we emailed you."
      backHref="/organizations/register"
      onVerify={orgRegisterOtpVerify}
    />
  );
}

export default function OrganizationRegisterVerifyPage() {
  return (
    <Suspense fallback={null}>
      <OrganizationRegisterVerifyContent />
    </Suspense>
  );
}
