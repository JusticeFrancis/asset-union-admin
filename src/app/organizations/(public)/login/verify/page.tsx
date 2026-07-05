"use client";

import { Suspense } from "react";

import { OrgOtpVerifyForm } from "@/app/organizations/components/org-otp-verify-form";
import { orgLoginOtpVerify } from "@/lib/api/requests/organization-auth";

function OrganizationLoginVerifyContent() {
  return (
    <OrgOtpVerifyForm
      flow="login"
      title="Verify your sign in"
      description="Enter the 6-digit code we emailed you."
      backHref="/organizations/login"
      onVerify={orgLoginOtpVerify}
    />
  );
}

export default function OrganizationLoginVerifyPage() {
  return (
    <Suspense fallback={null}>
      <OrganizationLoginVerifyContent />
    </Suspense>
  );
}
