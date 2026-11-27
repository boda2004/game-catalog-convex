import { useMutation, useQuery } from "convex/react";
import { Check, ListPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
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
import { ImportProgressView } from "./ImportProgressView";

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

  const parsedLines = useMemo(
    () =>
      text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [text],
  );

  const toggleStore = (store: StoreId) => {
    setStores((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store],
    );
  };

  const handleStart = async () => {
    if (parsedLines.length === 0) return;

    setIsStarting(true);
    try {
      const { jobId, total } = await startBulkImport({
        gameNames: parsedLines,
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
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400 ring-1 ring-inset ring-violet-500/30">
              <ListPlus className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-ink">
                Bulk Import Games
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-secondary">
                Paste one game title per line. Runs in durable background
                chunks—safe to close after starting.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-4">
          {!activeJobId ? (
            <>
              <label className="block space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-muted">
                    Game titles
                  </span>
                  {parsedLines.length > 0 && (
                    <span className="font-mono text-xs font-semibold text-primary-soft-ink">
                      {parsedLines.length}{" "}
                      {parsedLines.length === 1 ? "title" : "titles"}
                    </span>
                  )}
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={7}
                  placeholder={
                    "The Witcher 3: Wild Hunt\nHades\nHollow Knight\nDisco Elysium"
                  }
                  className="input-field resize-y font-normal leading-relaxed"
                />
              </label>

              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-ink-muted">
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
                          "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all",
                          active
                            ? "border-primary bg-primary text-white"
                            : "border-border-strong/75 bg-surface text-ink-secondary hover:bg-surface-muted hover:text-ink",
                        )}
                      >
                        {active ? (
                          <Check className="size-3 stroke-[3]" />
                        ) : (
                          <span
                            className={cn(
                              "size-1.5 rounded-full",
                              STORE_META[storeId].dotClass,
                            )}
                          />
                        )}
                        {STORE_META[storeId].label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <ImportProgressView
              job={jobDetail?.job}
              items={jobDetail?.items ?? []}
            />
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {activeJobId ? "Close" : "Cancel"}
          </Button>
          {!activeJobId && (
            <Button
              variant="primary"
              disabled={isStarting || parsedLines.length === 0}
              onClick={() => void handleStart()}
            >
              {isStarting
                ? "Starting..."
                : `Import ${parsedLines.length > 0 ? parsedLines.length : ""} ${parsedLines.length === 1 ? "title" : "titles"}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
