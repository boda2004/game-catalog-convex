import { useAction, useQuery } from "convex/react";
import { AlertCircle, Check, CheckCircle2 } from "lucide-react";
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
import { cn } from "@/lib/utils";

export function SteamImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [steamInput, setSteamInput] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [activeJobId, setActiveJobId] = useState<Id<"importJobs"> | null>(null);

  const startSteamImport = useAction(api.imports.startSteamImport);
  const jobDetail = useQuery(
    api.imports.getImportJobDetail,
    activeJobId ? { jobId: activeJobId } : "skip",
  );

  const handleStart = async () => {
    const trimmed = steamInput.trim();
    if (!trimmed) return;

    setIsStarting(true);
    try {
      const { jobId, total } = await startSteamImport({
        steamIdOrProfileUrl: trimmed,
      });
      setActiveJobId(jobId);
      if (total === 0) {
        toast.info(
          "No games returned from Steam. Make sure your Steam Game Details privacy is set to Public.",
        );
      } else {
        toast.success(`Queued ${total} Steam games for background import.`);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Steam import failed",
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
          setSteamInput("");
          setActiveJobId(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-ink">
            Import from Steam
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-sm text-ink-secondary">
            Enter your SteamID64, vanity name, or Steam profile URL. Owned games
            and Steam playtime are imported in durable background chunks.
          </DialogDescription>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {!activeJobId ? (
            <form
              id="steam-import-form"
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                void handleStart();
              }}
            >
              <label className="block space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Steam ID or Profile URL
                </span>
                <input
                  type="text"
                  value={steamInput}
                  onChange={(e) => setSteamInput(e.target.value)}
                  placeholder="https://steamcommunity.com/id/yourname or 7656119XXXXXXXXXX"
                  className="input-field"
                  autoFocus
                />
              </label>
              <p className="text-xs text-ink-muted">
                Requires your Steam profile&apos;s <strong>Game details</strong>{" "}
                privacy setting to be Public. Already-cached games match
                instantly without extra RAWG calls.
              </p>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-border-subtle bg-surface-subtle p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-ink">
                    {job?.status === "completed"
                      ? "Steam import complete"
                      : job?.status === "failed"
                        ? "Steam import failed"
                        : "Importing Steam library..."}
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
                    <Badge tone="warning">{job.updatedCount} updated</Badge>
                    {job.failedCount > 0 && (
                      <Badge tone="danger">
                        {job.failedCount} failed / not found
                      </Badge>
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
              type="submit"
              form="steam-import-form"
              variant="primary"
              disabled={isStarting || !steamInput.trim()}
            >
              {isStarting ? "Connecting to Steam..." : "Start import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
