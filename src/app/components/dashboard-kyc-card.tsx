import { Card, CardContent } from "@/components/ui/card";

const legendRows: Array<Array<{ label: string; dotClass: string }>> = [
  [
    { label: "Approved", dotClass: "bg-[#5c60cc]" },
    { label: "Rejected", dotClass: "bg-[#e6c84a]" },
  ],
  [
    { label: "Pending", dotClass: "bg-[#9ec5eb]" },
    { label: "Not Started", dotClass: "bg-[#e85d5d]" },
  ],
];

export function DashboardKycCard() {
  return (
    <Card className="w-full shrink-0 rounded-[20px] border-0 bg-white p-4 shadow-[0_1px_4px_rgba(12,12,13,0.05)] sm:p-6 md:max-w-[321px]">
      <CardContent className="flex flex-col gap-3 p-0 sm:gap-4">
        <h2 className="text-[14px] font-medium leading-snug text-[#050a0e] sm:text-[15px] md:text-[16px]">
          KYC Status Distribution
        </h2>

        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="relative size-[118px] shrink-0 sm:size-[132px] md:size-[148px]">
            <div
              aria-hidden
              className="size-full rounded-full"
              style={{
                background:
                  "conic-gradient(from -90deg, #5c60cc 0% 45.7%, #9ec5eb 45.7% 73%, #e85d5d 73% 92.5%, #e6c84a 92.5% 100%)",
              }}
            />
            <div className="absolute inset-[18%] flex flex-col items-center justify-center rounded-full bg-white px-1">
              <p className="text-[15px] font-medium leading-none text-[#050a0e] sm:text-[17px] md:text-[18px]">
                2,418
              </p>
              <p className="mt-0.5 text-center text-[9px] font-normal leading-tight text-[#919191] sm:mt-1 sm:text-[10px]">
                Total Users
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-1.5 sm:gap-2">
            {legendRows.map((row, i) => (
              <div className="flex gap-1.5 sm:gap-2" key={i}>
                {row.map((item) => (
                  <div
                    className="flex min-h-0 flex-1 flex-col items-center justify-center rounded-[16px] bg-[#f5f7f8] py-2 sm:rounded-[20px] sm:py-3"
                    key={item.label}
                  >
                    <div className="flex items-center gap-1.5 px-1 sm:gap-2 sm:px-0">
                      <span
                        className={`size-[6px] shrink-0 rounded-full sm:size-[7px] ${item.dotClass}`}
                      />
                      <span className="text-center text-[10px] font-normal leading-tight text-[#050a0e] sm:text-[11px] sm:leading-none">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
