import { ADMIN_ASSETS } from "@/app/components/admin-assets";
import { Card, CardContent } from "@/components/ui/card";

const activities = [
  {
    text: "Property Villa 3 – Bali approved & went live",
    time: "2 min ago",
  },
  {
    text: "Williams Bernard wallet flagged",
    time: "14 min ago",
  },
  {
    text: "Rent cycle Q4 2026 is overdue",
    time: "1 hr ago",
  },
] as const;

export function DashboardRecentActivity() {
  return (
    <Card className="w-full rounded-[20px] border-0 bg-white p-4 shadow-[0_1px_4px_rgba(12,12,13,0.05)] sm:p-6">
      <CardContent className="flex flex-col gap-3 p-0 sm:gap-4">
        <h2 className="text-[14px] font-medium leading-snug text-[#050a0e] sm:text-[15px] md:text-[16px] md:leading-none">
          Recent Activity
        </h2>
        <ul className="flex flex-col gap-3 sm:gap-4">
          {activities.map((item) => (
            <li
              className="flex items-start justify-between gap-2 sm:items-center sm:gap-4"
              key={item.text}
            >
              <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center">
                <div className="flex shrink-0 items-center rounded-[153.571px] bg-[rgba(92,96,204,0.15)] p-1.5 sm:p-2">
                  <img
                    alt=""
                    aria-hidden
                    className="size-3.5 object-contain sm:size-4"
                    src={ADMIN_ASSETS.dashboard.activityCheckIcon}
                  />
                </div>
                <p className="min-w-0 text-[11px] font-normal leading-snug break-words text-[#050a0e] sm:text-[12px] sm:leading-normal md:whitespace-normal">
                  {item.text}
                </p>
              </div>
              <p className="max-w-[4.5rem] shrink-0 pt-0.5 text-right text-[10px] font-normal leading-tight text-[#919191] sm:max-w-none sm:pt-0 sm:text-[12px] sm:leading-normal">
                {item.time}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
