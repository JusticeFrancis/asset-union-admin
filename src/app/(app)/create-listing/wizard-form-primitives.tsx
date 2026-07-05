import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const CHEVRON_SRC = "/compliance-logs/icons/chevron-down.svg";
export const CALENDAR_ICON_SRC = "/rent-submission/detail/icons/calendar.svg";

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[12px] font-medium text-[#050a0e]">{children}</span>
  );
}

export function inputClass(optional?: boolean) {
  return cn(
    "flex h-10 w-full rounded-[12px] border border-[#cfe2ec] bg-white px-4 text-[12px] font-medium outline-none transition-colors placeholder:text-[#919191] focus-visible:ring-2 focus-visible:ring-[#5c60cc]/25 disabled:cursor-not-allowed disabled:bg-[#f9fafb] disabled:opacity-70",
    optional ? "text-[#919191]" : "text-[#050a0e]",
  );
}

type SelectFieldProps = {
  label: string;
  children: React.ReactNode;
} & Omit<SelectHTMLAttributes<HTMLSelectElement>, "children">;

export function SelectField({
  label,
  children,
  className,
  ...selectProps
}: SelectFieldProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          className={cn(inputClass(true), "appearance-none pr-10", className)}
          {...selectProps}
        >
          {children}
        </select>
        <img
          alt=""
          className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 opacity-70"
          src={CHEVRON_SRC}
          width={20}
          height={20}
        />
      </div>
    </div>
  );
}

type DateFieldProps = {
  label: string;
  defaultValue?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue">;

export function DateField({
  label,
  defaultValue,
  className,
  type = "date",
  ...inputProps
}: DateFieldProps) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <input
          type={type}
          defaultValue={defaultValue}
          className={cn(inputClass(true), "pr-10", className)}
          {...inputProps}
        />
        <img
          alt=""
          className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 opacity-70"
          src={CALENDAR_ICON_SRC}
          width={20}
          height={20}
        />
      </div>
    </div>
  );
}
