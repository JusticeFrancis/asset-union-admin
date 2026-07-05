"use client";

import type { ReactNode } from "react";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type OrgCenteredCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  /** Auth flows use 400px; onboarding forms use a wider card. */
  size?: "auth" | "form";
};

export function OrgCenteredCard({
  title,
  description,
  children,
  size = "auth",
}: OrgCenteredCardProps) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#edf4f8] px-4 py-8">
      <Card
        className={cn(
          "w-full rounded-[20px] border-0 p-6 shadow-[0_1px_4px_rgba(12,12,13,0.05)]",
          size === "form" ? "max-w-xl" : "max-w-[400px]",
        )}
      >
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
                {title}
              </h1>
              <p className="text-[12px] font-light leading-normal text-[#919191]">
                {description}
              </p>
            </div>
          </div>

          <div className="h-px w-full bg-[#cfe2ec]" aria-hidden />

          {children}
        </div>
      </Card>
    </div>
  );
}
