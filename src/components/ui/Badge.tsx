import * as React from "react";
import { cn, getRiskBadgeColor } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "safe" | "caution" | "highrisk" | "unsafe" | "default" | "outline";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    safe: getRiskBadgeColor("SAFE"),
    caution: getRiskBadgeColor("CAUTION"),
    highrisk: getRiskBadgeColor("HIGH_RISK"),
    unsafe: getRiskBadgeColor("UNSAFE"),
    default: "bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20",
    outline: "border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
