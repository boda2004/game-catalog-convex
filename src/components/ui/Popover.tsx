import * as RadixPopover from "@radix-ui/react-popover";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;

export function PopoverContent({
  className,
  align = "start",
  sideOffset = 6,
  collisionPadding = 8,
  ...props
}: ComponentPropsWithoutRef<typeof RadixPopover.Content>) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          "popover-surface z-50 w-64 overflow-hidden rounded-xl border border-border-strong/90 bg-surface-elevated p-0 shadow-[0_18px_48px_rgba(0,0,0,0.42)] ring-1 ring-white/[0.04] outline-hidden",
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  );
}
