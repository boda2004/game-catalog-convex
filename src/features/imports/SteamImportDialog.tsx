import { useAction, useQuery } from "convex/react";
import { CloudDownload, Info } from "lucide-react";
import { useState } from "react";
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
import { ImportProgressView } from "./ImportProgressView";

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
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-400 ring-1 ring-inset ring-sky-500/30">
              <CloudDownload className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-ink">
                Import from Steam
              </DialogTitle>
              <DialogDescription className="text-xs text-ink-secondary">
                Sync owned games &amp; playtime via SteamID64, vanity name, or
                profile URL.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody>
          {!activeJobId ? (
            <form
              id="steam-import-form"
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleStart();
              }}
            >
              <label className="block space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-muted">
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

              <div className="flex items-start gap-2.5 rounded-xl border border-border-subtle bg-surface-subtle/70 p-3.5 text-xs leading-relaxed text-ink-secondary">
                <Info className="mt-0.5 size-4 shrink-0 text-sky-400" />
                <p>
                  Make sure your Steam profile&apos;s{" "}
                  <strong className="text-ink">Game details</strong> privacy
                  setting is set to <strong className="text-ink">Public</strong>
                  . Imports run in durable background chunks—you can close this
                  dialog once started.
                </p>
              </div>
            </form>
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
              type="submit"
              form="steam-import-form"
              variant="primary"
              disabled={isStarting || !steamInput.trim()}
            >
              {isStarting ? "Connecting to Steam..." : "Start Steam import"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
