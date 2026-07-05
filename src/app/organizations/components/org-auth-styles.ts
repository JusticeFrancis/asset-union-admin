import { cn } from "@/lib/utils";

export const orgAuthInputClassName = cn(
  "h-10 w-full rounded-[12px] border border-[#cfe2ec] bg-white px-3 text-[12px] text-[#050a0e]",
  "placeholder:text-[#919191] placeholder:font-light",
  "outline-none transition-colors focus-visible:border-[#5c60cc] focus-visible:ring-2 focus-visible:ring-[#5C60CC]/30",
);

export const orgAuthErrorClassName =
  "rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-[12px] text-[#b91c1c]";
