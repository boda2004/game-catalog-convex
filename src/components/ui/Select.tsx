import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

export interface SelectProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  options: ReadonlyArray<SelectOption<T>>;
  placeholder?: string;
  ariaLabel?: string;
  size?: "sm" | "md";
  prefix?: ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
  contentClassName?: string;
}

export function Select<T extends string = string>({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  ariaLabel,
  size = "md",
  prefix,
  align = "start",
  className,
  contentClassName,
}: SelectProps<T>) {
  return (
    <RadixSelect.Root
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
    >
      <RadixSelect.Trigger
        aria-label={ariaLabel}
        className={cn(
          "group inline-flex items-center justify-between gap-2 whitespace-nowrap border border-border-strong/80 bg-surface-elevated font-medium text-ink transition-colors hover:border-border-strong hover:bg-surface-muted/80 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/25 data-[state=open]:border-primary/70 data-[state=open]:bg-surface-muted/70",
          size === "sm"
            ? "h-8 rounded-lg px-2.5 text-xs"
            : "h-9 rounded-xl px-3 text-sm",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          {prefix && <span className="shrink-0 text-ink-muted">{prefix}</span>}
          <span className="truncate">
            <RadixSelect.Value placeholder={placeholder} />
          </span>
        </span>
        <RadixSelect.Icon asChild>
          <ChevronDown className="size-3.5 shrink-0 text-ink-muted transition-transform duration-150 group-data-[state=open]:rotate-180" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          align={align}
          sideOffset={6}
          collisionPadding={8}
          className={cn(
            "popover-surface z-50 min-w-[max(var(--radix-select-trigger-width),7.5rem)] overflow-hidden rounded-xl border border-border-strong/90 bg-surface-elevated p-1 shadow-[0_18px_48px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.04]",
            contentClassName,
          )}
        >
          <RadixSelect.Viewport className="max-h-64 p-0.5">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className="relative flex cursor-pointer select-none items-center whitespace-nowrap rounded-lg py-1.5 pl-2.5 pr-8 text-[13px] font-medium text-ink outline-hidden transition-colors data-[highlighted]:bg-surface-muted data-[state=checked]:bg-primary-soft/80 data-[state=checked]:font-semibold data-[state=checked]:text-primary-soft-ink"
              >
                <div className="flex flex-col">
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  {opt.description && (
                    <span className="text-[11px] font-normal text-ink-muted">
                      {opt.description}
                    </span>
                  )}
                </div>
                <RadixSelect.ItemIndicator className="absolute right-2.5 inline-flex items-center">
                  <Check className="size-3.5 text-primary" />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}
