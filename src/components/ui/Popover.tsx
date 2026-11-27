import * as RadixPopover from "@radix-ui/react-popover";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;

export function PopoverContent({
  className,
  align = "start",
  sideOffset = 8,
  ...props
}: ComponentPropsWithoutRef<typeof RadixPopover.Content>) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-64 overflow-hidden rounded-xl border border-border-strong/80 bg-surface-elevated p-0 shadow-[0_16px_48px_rgba(0,0,0,0.38)] outline-hidden",
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  );
}
