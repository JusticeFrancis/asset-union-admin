"use client";

import type { ReactNode } from "react";

import { OrgCenteredCard } from "@/app/organizations/components/org-centered-card";

type OrgAuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function OrgAuthCard({
  title,
  description,
  children,
  footer,
}: OrgAuthCardProps) {
  return (
    <OrgCenteredCard title={title} description={description} size="auth">
      {children}
      {footer}
    </OrgCenteredCard>
  );
}
