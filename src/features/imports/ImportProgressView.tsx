import { AlertCircle, Check, CheckCircle2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export interface ImportJobSummary {
  type: "bulk" | "steam";
  status: "pending" | "running" | "completed" | "failed";
  total: number;
  completed: number;
  addedCount: number;
  updatedCount: number;
  failedCount: number;
  sourceLabel?: string;
  error?: string;
}

export interface ImportJobItemRecord {
  _id: string;
  queryName: string;
  status: "added" | "updated" | "not_found" | "failed";
  matchedGameName?: string;
  error?: string;
}

export function ImportProgressView({
  job,
  items,
  titleOverride,
}: {
  job?: ImportJobSummary;
  items: ImportJobItemRecord[];
  titleOverride?: string;
}) {
  const progressPct =
    job && job.total > 0 ? Math.round((job.completed / job.total) * 100) : 0;

  const heading =
    titleOverride ??
    (job?.status === "completed"
      ? `${job.type === "steam" ? "Steam" : "Bulk"} import complete`
      : job?.status === "failed"
        ? `${job.type === "steam" ? "Steam" : "Bulk"} import failed`
        : `Importing ${job?.type === "steam" ? "Steam library" : "games"}...`);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border-subtle bg-surface-subtle/75 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="inline-flex items-center gap-2 font-bold text-ink">
            {job?.status === "running" && (
              <Loader2 className="size-4 animate-spin text-primary" />
            )}
            {heading}
          </span>
          <span className="font-mono text-xs font-semibold text-ink-secondary">
            {job?.completed ?? 0} / {job?.total ?? 0} ({progressPct}%)
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              job?.status === "failed"
                ? "bg-danger"
                : job?.status === "completed"
                  ? "bg-success"
                  : "bg-primary",
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {job && (
          <div className="mt-3.5 flex flex-wrap gap-2">
            <Badge tone="success">{job.addedCount} added</Badge>
            <Badge tone="warning">{job.updatedCount} updated</Badge>
            {job.failedCount > 0 && (
              <Badge tone="danger">{job.failedCount} failed / not found</Badge>
            )}
          </div>
        )}

        {job?.error && (
          <p className="mt-2.5 rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">
            {job.error}
          </p>
        )}
      </div>

      {items.length > 0 && (
        <div className="max-h-64 divide-y divide-border-subtle/70 overflow-y-auto rounded-2xl border border-border-subtle bg-surface">
          {items.map((item) => (
            <div
              key={item._id}
              className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">
                  {item.queryName}
                </p>
                {item.matchedGameName &&
                  item.matchedGameName !== item.queryName && (
                    <p className="truncate text-xs text-ink-muted">
                      Matched: {item.matchedGameName}
                    </p>
                  )}
                {item.error && (
                  <p className="truncate text-xs text-danger">{item.error}</p>
                )}
              </div>
              <Badge
                tone={
                  item.status === "added"
                    ? "success"
                    : item.status === "updated"
                      ? "warning"
                      : "danger"
                }
              >
                {item.status === "added" ? (
                  <CheckCircle2 className="size-3" />
                ) : item.status === "updated" ? (
                  <Check className="size-3" />
                ) : (
                  <AlertCircle className="size-3" />
                )}
                {item.status === "added"
                  ? "Added"
                  : item.status === "updated"
                    ? "Updated"
                    : item.status === "not_found"
                      ? "Not found"
                      : "Failed"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
