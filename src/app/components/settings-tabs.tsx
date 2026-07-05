"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ScrollableTabRail } from "@/app/components/scrollable-tab-rail";
import { useAdminAuth } from "@/contexts/admin-auth-provider";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Account", href: "/settings/account-information", permission: "settings.view" },
  { label: "Security & Privacy", href: "/settings", permission: "settings.view" },
  // { label: "Platform Fee", href: "/settings/platform-fee", permission: "platform_settings.view" },
] as const;

export function SettingsTabs() {
  const pathname = usePathname();
  const { admin } = useAdminAuth();
  const visibleTabs = tabs.filter((tab) => admin?.permissions.includes(tab.permission));

  return (
    <ScrollableTabRail className="flex w-full min-w-0 justify-center">
      <div className="inline-flex h-10 items-center gap-0.5 rounded-[12px] bg-[#f5f7f8] p-1 sm:gap-1">
        {visibleTabs.map((tab) => {
          const isActive =
            tab.href === "/settings"
              ? pathname === "/settings"
              : pathname.startsWith(tab.href);

          return (
            <Link
              className={cn(
                "inline-flex h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-[8px] px-2 text-[11px] font-medium transition-colors sm:px-3 sm:text-[12px]",
                isActive
                  ? "bg-white text-[#050a0e] shadow-[0_1px_4px_rgba(12,12,13,0.05)]"
                  : "text-[#919191] hover:text-[#050a0e]",
              )}
              href={tab.href}
              key={tab.href}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </ScrollableTabRail>
  );
}
