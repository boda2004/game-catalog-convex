import { useQuery } from "convex/react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CloudDownload,
  History,
  ListPlus,
} from "lucide-react";
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
import { ImportProgressView } from "./ImportProgressView";

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
          <div className="flex items-center gap-2.5">
            {selectedJobId && (
              <Button
                variant="ghost"
                size="icon-sm"
                className="-ml-1.5"
                onClick={() => setSelectedJobId(null)}
                aria-label="Back to import history"
              >
                <ChevronLeft className="size-4" />
              </Button>
            )}
            <div>
              <DialogTitle className="font-display text-lg font-bold text-ink">
                {selectedJobId ? "Import Details" : "Import History"}
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-secondary">
                {selectedJobId
                  ? "Per-title import outcomes persisted on the server."
                  : "Track live background imports and inspect past runs."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          {selectedJobId ? (
            !detail ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : (
              <ImportProgressView
                job={detail.job}
                items={detail.items}
                titleOverride={`${detail.job.type === "steam" ? "Steam Import" : "Bulk Import"}${detail.job.sourceLabel ? ` · ${detail.job.sourceLabel}` : ""}`}
              />
            )
          ) : !jobs ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-surface-subtle text-ink-muted">
                <History className="size-5" />
              </div>
              <p className="text-sm font-semibold text-ink">No imports yet</p>
              <p className="mt-1 text-xs text-ink-muted">
                Steam and bulk imports will appear here with full per-title
                logs.
              </p>
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
                    className="group w-full rounded-2xl border border-border-subtle bg-surface-subtle/50 p-4 text-left transition-all hover:border-border-strong hover:bg-surface-subtle"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-elevated text-ink-secondary ring-1 ring-inset ring-border-subtle">
                          {job.type === "steam" ? (
                            <CloudDownload className="size-4 text-sky-400" />
                          ) : (
                            <ListPlus className="size-4 text-violet-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">
                            {job.type === "steam"
                              ? "Steam Import"
                              : "Bulk Import"}
                            {job.sourceLabel ? ` · ${job.sourceLabel}` : ""}
                          </p>
                          <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-ink-muted">
                            <Clock className="size-3" />
                            {new Date(job.createdAt).toLocaleString()}
                            <span>·</span>
                            <span className="font-mono">
                              {job.addedCount} added, {job.updatedCount} updated
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                        <ChevronRight className="size-4 text-ink-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
                      </div>
                    </div>
                    {job.status === "running" && (
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
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
