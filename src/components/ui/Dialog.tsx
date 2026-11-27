import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Dialog = RadixDialog.Root;
export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;
export const DialogTitle = RadixDialog.Title;
export const DialogDescription = RadixDialog.Description;

export interface DialogContentProps {
  children: ReactNode;
  className?: string;
  hideCloseButton?: boolean;
  closeButtonClassName?: string;
}

export function DialogContent({
  children,
  className,
  hideCloseButton = false,
  closeButtonClassName,
}: DialogContentProps) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-200" />
      <RadixDialog.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 focus:outline-hidden sm:w-[calc(100%-2.5rem)]",
          className,
        )}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-border-strong/70 bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        >
          {children}
          {!hideCloseButton && (
            <RadixDialog.Close
              aria-label="Close dialog"
              className={cn(
                "absolute right-4 top-4 z-20 inline-flex size-8 items-center justify-center rounded-xl border border-border-subtle/80 bg-surface/80 text-ink-secondary backdrop-blur-md transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/45",
                closeButtonClassName,
              )}
            >
              <X className="size-4" />
            </RadixDialog.Close>
          )}
        </motion.div>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-b border-border-subtle px-6 py-5 pr-14",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function DialogBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-5", className)}>
      {children}
    </div>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-2.5 border-t border-border-subtle bg-surface-subtle/60 px-6 py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
