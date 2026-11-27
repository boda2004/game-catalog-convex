import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "primary" | "success" | "warning" | "danger";
}

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral:
    "bg-surface-subtle text-ink-secondary ring-1 ring-inset ring-border-subtle",
  primary:
    "bg-primary-soft text-primary-soft-ink ring-1 ring-inset ring-primary/25",
  success:
    "bg-success-soft text-success ring-1 ring-inset ring-success/25",
  warning:
    "bg-warning-soft text-warning ring-1 ring-inset ring-warning/25",
  danger:
    "bg-danger-soft text-danger ring-1 ring-inset ring-danger/25",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-tight",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
