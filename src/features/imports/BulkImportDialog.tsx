import { useMutation, useQuery } from "convex/react";
import { Check, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import { STORE_IDS, STORE_META, type StoreId } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function BulkImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [stores, setStores] = useState<StoreId[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [activeJobId, setActiveJobId] = useState<Id<"importJobs"> | null>(null);

  const startBulkImport = useMutation(api.imports.startBulkImport);
  const jobDetail = useQuery(
    api.imports.getImportJobDetail,
    activeJobId ? { jobId: activeJobId } : "skip",
  );

  const toggleStore = (store: StoreId) => {
    setStores((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store],
    );
  };

  const handleStart = async () => {
    const names = text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    setIsStarting(true);
    try {
      const { jobId, total } = await startBulkImport({
        gameNames: names,
        stores,
      });
      setActiveJobId(jobId);
      toast.success(`Started importing ${total} titles in the background.`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to start bulk import",
      );
    } finally {
      setIsStarting(false);
    }
  };

  const job = jobDetail?.job;
  const items = jobDetail?.items ?? [];
  const progressPct =
    job && job.total > 0 ? Math.round((job.completed / job.total) * 100) : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setText("");
          setStores([]);
          setActiveJobId(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-ink">
            Bulk Import Games
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-sm text-ink-secondary">
            Paste one game title per line. Imports run in durable background
            chunks—you can safely close this dialog once started.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {!activeJobId ? (
            <>
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Game titles
                </span>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={7}
                  placeholder={
                    "The Witcher 3: Wild Hunt\nHades\nHollow Knight\nDisco Elysium"
                  }
                  className="input-field resize-y font-normal"
                />
              </label>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Mark as owned on (optional)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {STORE_IDS.map((storeId) => {
                    const active = stores.includes(storeId);
                    return (
                      <button
                        key={storeId}
                        type="button"
                        onClick={() => toggleStore(storeId)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                          active
                            ? "border-primary bg-primary text-white"
                            : "border-border-strong bg-surface text-ink-secondary hover:bg-surface-subtle",
                        )}
                      >
                        {active && <Check className="size-3" />}
                        {STORE_META[storeId].label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">
                    {job?.status === "completed"
                      ? "Import complete"
                      : job?.status === "failed"
                        ? "Import failed"
                        : "Importing games..."}
                  </span>
                  <span className="font-medium text-ink-secondary">
                    {job?.completed ?? 0} / {job?.total ?? 0} ({progressPct}%)
                  </span>
                </div>
                <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      job?.status === "failed" ? "bg-danger" : "bg-primary",
                    )}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {job && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="success">{job.addedCount} added</Badge>
                    <Badge tone="warning">{job.updatedCount} already owned</Badge>
                    {job.failedCount > 0 && (
                      <Badge tone="danger">{job.failedCount} failed / not found</Badge>
                    )}
                  </div>
                )}
                {job?.error && (
                  <p className="mt-2 text-xs text-danger">{job.error}</p>
                )}
              </div>

              {items.length > 0 && (
                <div className="max-h-60 divide-y divide-border-subtle overflow-y-auto rounded-xl border border-border-subtle">
                  {items.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-3 px-3.5 py-2 text-sm"
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
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {activeJobId ? "Close" : "Cancel"}
          </Button>
          {!activeJobId && (
            <Button
              variant="primary"
              disabled={isStarting || !text.trim()}
              onClick={() => void handleStart()}
            >
              {isStarting ? "Starting..." : "Start import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
