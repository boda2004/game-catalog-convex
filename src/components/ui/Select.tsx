import * as RadixSelect from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SelectProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  options: ReadonlyArray<SelectOption<T>>;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export function Select<T extends string = string>({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  ariaLabel,
  className,
}: SelectProps<T>) {
  return (
    <RadixSelect.Root
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
    >
      <RadixSelect.Trigger
        aria-label={ariaLabel}
        className={cn(
          "inline-flex h-9 items-center justify-between gap-2 rounded-xl border border-border-strong/80 bg-surface-elevated px-3 text-sm font-medium text-ink transition-colors hover:bg-surface-muted focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/25",
          className,
        )}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon>
          <ChevronDown className="size-3.5 text-ink-muted" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>
      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-border-strong/80 bg-surface-elevated p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.38)]"
        >
          <RadixSelect.Viewport className="max-h-60">
            {options.map((opt) => (
              <RadixSelect.Item
                key={opt.value}
                value={opt.value}
                className="relative flex cursor-pointer select-none items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm text-ink outline-hidden transition-colors data-[highlighted]:bg-surface-muted data-[state=checked]:bg-primary-soft data-[state=checked]:font-semibold data-[state=checked]:text-primary-soft-ink"
              >
                <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                <RadixSelect.ItemIndicator>
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
