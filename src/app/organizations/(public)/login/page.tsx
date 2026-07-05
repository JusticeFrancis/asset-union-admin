import { Suspense } from "react";

import { OrgLoginPageContent } from "./org-login-page-content";

export default function OrganizationLoginPage() {
  return (
    <Suspense fallback={null}>
      <OrgLoginPageContent />
    </Suspense>
  );
}
