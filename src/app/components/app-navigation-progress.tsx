"use client";

import NextTopLoader from "nextjs-toploader";

export function AppNavigationProgress() {
  return (
    <NextTopLoader
      color="var(--application-base)"
      crawlSpeed={200}
      height={3}
      shadow={false}
      showSpinner={false}
      zIndex={99999}
    />
  );
}
