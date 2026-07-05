import { Suspense } from "react";

import { OrganizationAcceptInviteContent } from "./accept-invite-content";

export default function OrganizationAcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <OrganizationAcceptInviteContent />
    </Suspense>
  );
}
