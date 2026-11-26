import { useQuery } from "convex/react";
import { ChevronLeft, Clock, History } from "lucide-react";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Spinner } from "@/components/ui/Spinner";
import { cn } from "@/lib/utils";

export function ImportHistoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [selectedJobId, setSelectedJobId] = useState<Id<"importJobs"> | null>(
    null,
  );
  const jobs = useQuery(api.imports.listImportJobs, open ? {} : "skip");
  const detail = useQuery(
    api.imports.getImportJobDetail,
    open && selectedJobId ? { jobId: selectedJobId } : "skip",
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setSelectedJobId(null);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {selectedJobId && (
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 size-8"
                onClick={() => setSelectedJobId(null)}
                aria-label="Back to import history"
              >
                <ChevronLeft className="size-4" />
              </Button>
            )}
            <div>
              <DialogTitle className="text-lg font-semibold text-ink">
                {selectedJobId ? "Import Details" : "Import History"}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-ink-secondary">
                {selectedJobId
                  ? "Per-title import outcomes persisted on the server."
                  : "Track running background imports and review previous runs."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          {selectedJobId ? (
            !detail ? (
              <div className="flex justify-center py-10">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-ink">
                      {detail.job.type === "steam"
                        ? "Steam Import"
                        : "Bulk Import"}
                      {detail.job.sourceLabel
                        ? ` — ${detail.job.sourceLabel}`
                        : ""}
                    </span>
                    <Badge
                      tone={
                        detail.job.status === "completed"
                          ? "success"
                          : detail.job.status === "failed"
                            ? "danger"
                            : "primary"
                      }
                    >
                      {detail.job.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    <Badge tone="neutral">
                      {detail.job.completed}/{detail.job.total} processed
                    </Badge>
                    <Badge tone="success">{detail.job.addedCount} added</Badge>
                    <Badge tone="warning">
                      {detail.job.updatedCount} updated
                    </Badge>
                    {detail.job.failedCount > 0 && (
                      <Badge tone="danger">
                        {detail.job.failedCount} failed
                      </Badge>
                    )}
                  </div>
                  {detail.job.error && (
                    <p className="mt-2 text-xs text-danger">
                      {detail.job.error}
                    </p>
                  )}
                </div>

                {detail.items.length === 0 ? (
                  <p className="py-6 text-center text-sm text-ink-muted">
                    No per-game records stored for this job.
                  </p>
                ) : (
                  <div className="divide-y divide-border-subtle rounded-xl border border-border-subtle">
                    {detail.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm"
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
                            <p className="truncate text-xs text-danger">
                              {item.error}
                            </p>
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
                          {item.status === "not_found"
                            ? "Not found"
                            : item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : !jobs ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : jobs.length === 0 ? (
            <div className="py-10 text-center">
              <History className="mx-auto mb-2 size-8 text-ink-muted" />
              <p className="text-sm text-ink-secondary">No imports yet.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {jobs.map((job) => {
                const pct =
                  job.total > 0
                    ? Math.round((job.completed / job.total) * 100)
                    : 100;
                return (
                  <button
                    key={job._id}
                    type="button"
                    onClick={() => setSelectedJobId(job._id)}
                    className="w-full rounded-xl border border-border-subtle bg-surface p-3.5 text-left transition-colors hover:border-border-strong hover:bg-surface-subtle/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {job.type === "steam"
                            ? "Steam Import"
                            : "Bulk Import"}
                          {job.sourceLabel ? ` · ${job.sourceLabel}` : ""}
                        </p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-ink-muted">
                          <Clock className="size-3" />
                          {new Date(job.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        tone={
                          job.status === "completed"
                            ? "success"
                            : job.status === "failed"
                              ? "danger"
                              : "primary"
                        }
                      >
                        {job.status === "running"
                          ? `${job.completed}/${job.total}`
                          : job.status}
                      </Badge>
                    </div>
                    {job.status === "running" && (
                      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className={cn(
                            "h-full rounded-full bg-primary transition-all",
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
