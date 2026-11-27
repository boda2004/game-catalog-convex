import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "soft";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon" | "icon-sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white border border-primary/80 shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-primary-hover hover:shadow-[0_4px_16px_color-mix(in_oklab,var(--color-primary)_35%,transparent)] active:scale-[0.99]",
  secondary:
    "bg-surface-elevated text-ink border border-border-strong/90 shadow-xs hover:bg-surface-muted hover:border-border-strong active:scale-[0.99]",
  soft: "bg-primary-soft text-primary-soft-ink border border-primary/25 hover:bg-primary-soft/80 active:scale-[0.99]",
  ghost:
    "bg-transparent text-ink-secondary border border-transparent hover:bg-surface-muted/70 hover:text-ink",
  danger:
    "bg-danger text-white border border-danger/80 shadow-xs hover:bg-danger-hover active:scale-[0.99]",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "h-7 px-2 text-xs gap-1 rounded-lg",
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-3.5 text-sm gap-2 rounded-xl",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
  icon: "size-9 rounded-xl justify-center",
  "icon-sm": "size-8 rounded-lg justify-center",
};

export function Button({
  variant = "secondary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/45 disabled:pointer-events-none disabled:opacity-45",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
}
