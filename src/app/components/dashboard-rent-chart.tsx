"use client";

import { useEffect, useMemo, useState } from "react";
import type { TooltipContentProps } from "recharts";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ranges = ["7 Days", "3M", "6M", "1Y"] as const;

type Range = (typeof ranges)[number];

type RentPoint = { label: string; value: number };

const YEARLY: RentPoint[] = [
  { label: "Jan", value: 24_000 },
  { label: "Feb", value: 27_000 },
  { label: "Mar", value: 32_000 },
  { label: "Apr", value: 39_000 },
  { label: "May", value: 46_078 },
  { label: "Jun", value: 43_000 },
  { label: "Jul", value: 41_000 },
  { label: "Aug", value: 48_000 },
  { label: "Sep", value: 45_000 },
  { label: "Oct", value: 50_000 },
  { label: "Nov", value: 47_000 },
  { label: "Dec", value: 52_000 },
];

const WEEKLY: RentPoint[] = [
  { label: "Mon", value: 38_200 },
  { label: "Tue", value: 41_500 },
  { label: "Wed", value: 39_800 },
  { label: "Thu", value: 44_100 },
  { label: "Fri", value: 42_600 },
  { label: "Sat", value: 40_900 },
  { label: "Sun", value: 43_400 },
];

function getDataForRange(range: Range): RentPoint[] {
  switch (range) {
    case "1Y":
      return YEARLY;
    case "6M":
      return YEARLY.slice(6);
    case "3M":
      return YEARLY.slice(9);
    case "7 Days":
      return WEEKLY;
    default:
      return YEARLY;
  }
}

function formatYAxisTick(value: number): string {
  if (value === 0) return "$0";
  if (value >= 1000) return `$${value / 1000}k`;
  return `$${value}`;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

function RentTooltip({
  active,
  payload,
  label,
}: Pick<TooltipContentProps<number, string>, "active" | "payload" | "label">) {
  if (!active || !payload?.length) return null;
  const raw = payload[0]?.value;
  const num =
    typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
  if (!Number.isFinite(num)) return null;

  return (
    <div className="flex items-center gap-1.5 rounded-2xl bg-white py-1.5 pl-2.5 pr-3 shadow-[0px_1px_2px_rgba(0,0,0,0.1),0px_2px_6px_rgba(0,0,0,0.11)] sm:gap-2 sm:py-2 sm:pl-3 sm:pr-[22px]">
      <span className="size-[6px] shrink-0 rounded-full bg-[#5c60cc] sm:size-[7.5px]" />
      <div className="flex flex-col gap-0.5 leading-none">
        <p className="text-[11px] font-light text-[#050a0e] sm:text-[12px]">
          {formatCurrency(num)}
        </p>
        <p className="text-[9px] font-normal uppercase text-[#919191] sm:text-[10px]">
          {label != null ? String(label) : ""}
        </p>
      </div>
    </div>
  );
}

function useDashboardChartLayout() {
  const [layout, setLayout] = useState({
    tick: 9,
    yWidth: 38,
    minH: 220,
    activeDot: 4,
  });

  useEffect(() => {
    function read() {
      const w = window.innerWidth;
      if (w >= 768) {
        setLayout({ tick: 10, yWidth: 44, minH: 280, activeDot: 5 });
      } else if (w >= 640) {
        setLayout({ tick: 10, yWidth: 40, minH: 252, activeDot: 5 });
      } else {
        setLayout({ tick: 8, yWidth: 34, minH: 220, activeDot: 4 });
      }
    }
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);

  return layout;
}

export function DashboardRentChart() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const chartLayout = useDashboardChartLayout();

  const [activeRange, setActiveRange] = useState<Range>("7 Days");

  const data = useMemo(() => getDataForRange(activeRange), [activeRange]);

  const yDomain = useMemo((): [number, number] => {
    const maxVal = Math.max(...data.map((d) => d.value), 1);
    if (activeRange === "7 Days") {
      const ceil = Math.ceil(maxVal / 5000) * 5000;
      return [0, Math.max(ceil, 50_000)];
    }
    return [0, 80_000];
  }, [data, activeRange]);

  const yTicks = useMemo(() => {
    const [, hi] = yDomain;
    if (activeRange === "7 Days") {
      const step = hi <= 50_000 ? 10_000 : 15_000;
      const ticks: number[] = [];
      for (let v = 0; v <= hi; v += step) ticks.push(v);
      if (ticks[ticks.length - 1] !== hi) ticks.push(hi);
      return ticks;
    }
    return [0, 10_000, 20_000, 40_000, 60_000, 80_000];
  }, [yDomain, activeRange]);

  return (
    <Card className="min-w-0 flex-1 rounded-[20px] border-0 bg-white p-4 shadow-[0_1px_4px_rgba(12,12,13,0.05)] sm:p-6">
      <CardContent className="flex flex-col gap-5 p-0 sm:gap-6 md:gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <h2 className="text-[14px] font-medium leading-snug text-[#050a0e] sm:text-[15px] md:text-[16px] md:leading-none">
            Rent Distributions
          </h2>
          <div className="flex min-h-9 w-full flex-wrap items-center gap-0.5 rounded-[12px] bg-[#f5f7f8] p-0.5 sm:min-h-10 sm:gap-1 sm:p-1 md:inline-flex md:h-10 md:w-auto md:flex-nowrap">
            {ranges.map((range) => {
              const isActive = range === activeRange;
              return (
                <button
                  className={cn(
                    "flex h-7 flex-1 items-center justify-center rounded-[8px] px-1.5 text-[10px] font-medium transition-colors sm:h-8 sm:px-2 sm:text-[11px] md:flex-none md:px-3 md:text-[12px]",
                    isActive
                      ? "bg-white text-[#050a0e]"
                      : "text-[#919191] hover:text-[#050a0e]",
                  )}
                  key={range}
                  type="button"
                  onClick={() => setActiveRange(range)}
                >
                  {range}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-[220px] min-h-[220px] w-full min-w-0 sm:h-[252px] sm:min-h-[252px] md:h-[280px] md:min-h-[280px]">
          {mounted ? (
            <ResponsiveContainer
              minHeight={chartLayout.minH}
              minWidth={0}
              width="100%"
              height="100%"
            >
              <AreaChart
                data={data}
                margin={{ top: 6, right: 6, left: 0, bottom: 4 }}
              >
                <defs>
                  <linearGradient
                    id="rentAreaGradient"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#5c60cc" stopOpacity={0.35} />
                    <stop
                      offset="100%"
                      stopColor="#5c60cc"
                      stopOpacity={0.02}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#e8eef2"
                  strokeDasharray="0"
                  vertical={false}
                />
                <XAxis
                  axisLine={false}
                  dataKey="label"
                  dy={6}
                  tick={{
                    fill: "#050a0e",
                    fontSize: chartLayout.tick,
                  }}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  domain={yDomain}
                  tick={{
                    fill: "#050a0e",
                    fontSize: chartLayout.tick,
                  }}
                  tickFormatter={formatYAxisTick}
                  tickLine={false}
                  ticks={yTicks}
                  width={chartLayout.yWidth}
                />
                <Tooltip
                  content={(props) => <RentTooltip {...props} />}
                  cursor={{ stroke: "#5c60cc", strokeWidth: 1 }}
                />
                <Area
                  activeDot={{
                    r: chartLayout.activeDot,
                    fill: "#5c60cc",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  dataKey="value"
                  dot={false}
                  fill="url(#rentAreaGradient)"
                  stroke="#5c60cc"
                  strokeWidth={2}
                  type="monotone"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
