import { Card } from "@/components/ui/card";

import { ADMIN_ASSETS } from "@/app/components/admin-assets";

const stats = [
  {
    label: "Total Users",
    value: "2,418",
    iconSrc: ADMIN_ASSETS.dashboard.statUsersIcon,
  },
  {
    label: "Suspended Accounts",
    value: "2,418",
    iconSrc: ADMIN_ASSETS.dashboard.statSuspendedIcon,
  },
  {
    label: "Active Properties",
    value: "64",
    iconSrc: ADMIN_ASSETS.dashboard.statPropertyIcon,
  },
] as const;

export function DashboardStatsCards() {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5">
      {stats.map((stat) => (
        <Card
          className="flex min-h-0 items-start justify-between gap-3 rounded-[20px] border-0 bg-white py-4 pl-4 pr-4 shadow-[0_1px_4px_rgba(12,12,13,0.05)] sm:min-h-[140px] sm:gap-4 sm:py-6 sm:pl-6 sm:pr-[34px] md:h-[166px] md:min-h-0"
          key={stat.label}
        >
          <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 leading-none sm:gap-4">
            <p className="text-[13px] font-light leading-tight text-[#787878] sm:text-[15px] md:text-[16px]">
              {stat.label}
            </p>
            <p className="text-[22px] font-medium tracking-tight text-[#050a0e] sm:text-[26px] md:text-[30px]">
              {stat.value}
            </p>
          </div>
          <div className="flex shrink-0 items-center rounded-[153.571px] bg-[rgba(92,96,204,0.15)] p-3 sm:p-[18px] md:p-[24.571px]">
            <img
              alt=""
              aria-hidden
              className="size-7 object-contain sm:size-8 md:size-[36.857px]"
              src={stat.iconSrc}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}
