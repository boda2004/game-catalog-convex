import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const DropdownMenu = RadixDropdown.Root;
export const DropdownMenuTrigger = RadixDropdown.Trigger;
export const DropdownMenuSeparator = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof RadixDropdown.Separator>) => (
  <RadixDropdown.Separator
    className={cn("my-1 h-px bg-border-subtle", className)}
    {...props}
  />
);

export function DropdownMenuContent({
  className,
  align = "end",
  sideOffset = 8,
  ...props
}: ComponentPropsWithoutRef<typeof RadixDropdown.Content>) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 min-w-52 overflow-hidden rounded-xl border border-border-strong/80 bg-surface-elevated p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.4)] outline-hidden",
          className,
        )}
        {...props}
      />
    </RadixDropdown.Portal>
  );
}

export function DropdownMenuItem({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof RadixDropdown.Item>) {
  return (
    <RadixDropdown.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-ink outline-hidden transition-colors data-[highlighted]:bg-surface-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof RadixDropdown.Label>) {
  return (
    <RadixDropdown.Label
      className={cn(
        "px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-muted",
        className,
      )}
      {...props}
    />
  );
}
