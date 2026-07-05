import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border border-transparent font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#edf4f8] text-[#050a0e]",
        positive: "bg-[#AFF4C6] text-[#009951]",
        neutral: "bg-[#e8e8e8] text-[#050a0e]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
