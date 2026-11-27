import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-surface px-6 py-16 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/8 to-transparent"
      />
      <div className="relative mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-border-strong/70 bg-surface-elevated text-primary shadow-sm">
        {icon}
      </div>
      <h3 className="relative text-lg font-bold tracking-tight text-ink">
        {title}
      </h3>
      <p className="relative mx-auto mt-1.5 max-w-md text-sm text-ink-secondary">
        {description}
      </p>
      {action && (
        <div className="relative mt-6 flex flex-wrap justify-center gap-2.5">
          {action}
        </div>
      )}
    </div>
  );
}
