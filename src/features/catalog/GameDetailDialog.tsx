import { useAction, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  Check,
  Clock,
  ExternalLink,
  Gamepad2,
  RefreshCw,
  Star,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import {
  GAME_STATUSES,
  STATUS_META,
  STORE_IDS,
  STORE_META,
  formatDate,
  formatPlaytime,
  formatReleaseYear,
  type GameStatus,
  type StoreId,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

type GameDetail = NonNullable<
  FunctionReturnType<typeof api.games.getGameDetail>
>;

interface GameDetailDialogProps {
  gameId: Id<"games"> | null;
  onClose: () => void;
}

export function GameDetailDialog({ gameId, onClose }: GameDetailDialogProps) {
  const game = useQuery(
    api.games.getGameDetail,
    gameId ? { gameId } : "skip",
  );

  return (
    <Dialog open={gameId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl p-0">
        {!game ? (
          <div className="flex h-64 items-center justify-center">
            <DialogTitle className="sr-only">Loading game details</DialogTitle>
            <DialogDescription className="sr-only">
              Loading game details from your library.
            </DialogDescription>
            <Spinner className="size-8" />
          </div>
        ) : (
          <GameDetailContent
            key={`${game._id}:${game.stores.join(",")}:${game.status ?? ""}:${game.userRating ?? ""}:${game.notes ?? ""}`}
            game={game}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function GameDetailContent({
  game,
  onClose,
}: {
  game: GameDetail;
  onClose: () => void;
}) {
  const updateUserGame = useMutation(api.games.updateUserGame);
  const removeFromLibrary = useMutation(api.games.removeFromLibrary);
  const refreshMetadata = useAction(api.catalogActions.refreshGameMetadata);

  const [stores, setStores] = useState<StoreId[]>(game.stores);
  const [status, setStatus] = useState<GameStatus | "none">(
    game.status ?? "none",
  );
  const [userRating, setUserRating] = useState<number | null>(
    game.userRating ?? null,
  );
  const [notes, setNotes] = useState(game.notes ?? "");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const toggleStore = (store: StoreId) => {
    setIsDirty(true);
    setStores((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store],
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserGame({
        gameId: game._id,
        stores,
        status: status === "none" ? null : status,
        userRating,
        notes: notes.trim() ? notes.trim() : null,
      });
      setIsDirty(false);
      toast.success("Changes saved");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save changes",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRefreshMetadata = async () => {
    setIsRefreshing(true);
    try {
      await refreshMetadata({ gameId: game._id });
      toast.success("Game metadata refreshed from RAWG");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to refresh metadata",
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRemove = async () => {
    try {
      await removeFromLibrary({ gameId: game._id });
      toast.success(`Removed "${game.name}" from your collection`);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to remove game",
      );
    }
  };

  return (
    <div className="flex max-h-[88vh] flex-col overflow-hidden">
      {/* Hero header */}
      <div className="relative h-56 shrink-0 bg-surface-muted">
        {game.backgroundImage ? (
          <img
            src={game.backgroundImage}
            alt={game.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-ink-muted">
            <Gamepad2 className="size-12" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-6 right-14">
          <DialogTitle className="text-2xl font-bold text-white sm:text-3xl">
            {game.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Details, store ownership, and personal notes for {game.name}.
          </DialogDescription>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/90">
            {formatReleaseYear(game.released) && (
              <span>{formatReleaseYear(game.released)}</span>
            )}
            {game.rating !== undefined && game.rating > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold">
                <Star className="size-4 fill-amber-400 text-amber-400" />
                {game.rating.toFixed(1)}
              </span>
            )}
            {game.metacritic !== undefined && (
              <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                Metacritic {game.metacritic}
              </span>
            )}
            {formatPlaytime(game.playtimeMinutes) && (
              <span className="inline-flex items-center gap-1 text-xs font-medium">
                <Clock className="size-3.5" />
                {formatPlaytime(game.playtimeMinutes)} played
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-6 lg:col-span-2">
            {game.description && (
              <section>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-muted">
                  About
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-secondary">
                  {game.description}
                </p>
              </section>
            )}

            {game.platforms.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-muted">
                  Platforms
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {game.platforms.map((platform) => (
                    <Badge key={platform} tone="primary">
                      {platform}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {game.genres.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-muted">
                  Genres
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {game.genres.map((genre) => (
                    <Badge key={genre} tone="neutral">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {game.tags.length > 0 && (
              <section>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-muted">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {game.tags.slice(0, 14).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-surface-subtle px-2 py-0.5 text-xs text-ink-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="space-y-4 rounded-xl border border-border-subtle bg-surface-subtle/60 p-4">
              <h3 className="text-sm font-bold text-ink">My Collection</h3>

              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-ink-muted">
                  Play Status
                </span>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    setStatus(v);
                    setIsDirty(true);
                  }}
                  ariaLabel="Play status"
                  className="w-full"
                  options={[
                    { value: "none" as const, label: "No status" },
                    ...GAME_STATUSES.map((s) => ({
                      value: s,
                      label: STATUS_META[s].label,
                    })),
                  ]}
                />
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-ink-muted">
                  My Rating
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (userRating ?? 0) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        aria-label={`Rate ${star} out of 5`}
                        onClick={() => {
                          setUserRating(userRating === star ? null : star);
                          setIsDirty(true);
                        }}
                        className="rounded p-1 transition-colors hover:bg-surface-muted"
                      >
                        <Star
                          className={cn(
                            "size-5",
                            active
                              ? "fill-amber-500 text-amber-500"
                              : "text-border-strong",
                          )}
                        />
                      </button>
                    );
                  })}
                  {userRating && (
                    <span className="ml-1 text-xs font-semibold text-ink-secondary">
                      {userRating}/5
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="block text-xs font-semibold text-ink-muted">
                  Owned On
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {STORE_IDS.map((storeId) => {
                    const active = stores.includes(storeId);
                    return (
                      <button
                        key={storeId}
                        type="button"
                        onClick={() => toggleStore(storeId)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-semibold transition-colors",
                          active
                            ? "border-primary bg-primary text-white"
                            : "border-border-strong bg-surface text-ink-secondary hover:bg-surface-subtle",
                        )}
                      >
                        {active && <Check className="size-3" />}
                        {STORE_META[storeId].shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="block space-y-1.5">
                <span className="block text-xs font-semibold text-ink-muted">
                  Personal Notes
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setIsDirty(true);
                  }}
                  rows={3}
                  placeholder="Add your thoughts, playthrough notes, or DLC reminders..."
                  className="input-field resize-y bg-surface text-xs"
                />
              </label>

              <Button
                variant="primary"
                className="w-full"
                disabled={!isDirty || isSaving}
                onClick={() => void handleSave()}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>

            <div className="space-y-2.5 rounded-xl border border-border-subtle bg-surface p-4 text-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-ink">Details</h3>
                <button
                  type="button"
                  disabled={isRefreshing}
                  onClick={() => void handleRefreshMetadata()}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn("size-3", isRefreshing && "animate-spin")}
                  />
                  Refresh
                </button>
              </div>
              {formatDate(game.released) && (
                <DetailRow
                  label="Released"
                  value={formatDate(game.released)!}
                />
              )}
              {game.developers.length > 0 && (
                <DetailRow
                  label="Developer"
                  value={game.developers.join(", ")}
                />
              )}
              {game.publishers.length > 0 && (
                <DetailRow
                  label="Publisher"
                  value={game.publishers.join(", ")}
                />
              )}
              {game.esrbRating && (
                <DetailRow label="ESRB" value={game.esrbRating} />
              )}
              {game.playtime !== undefined && game.playtime > 0 && (
                <DetailRow
                  label="Avg. Playtime"
                  value={`${game.playtime} hours`}
                />
              )}
              {formatDate(game.userAddedAt) && (
                <DetailRow
                  label="Added"
                  value={formatDate(game.userAddedAt)!}
                />
              )}
            </div>

            <div className="space-y-2">
              {game.website && (
                <a
                  href={game.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-subtle"
                >
                  <ExternalLink className="size-4" />
                  Official website
                </a>
              )}

              {!confirmRemove ? (
                <Button
                  variant="ghost"
                  className="w-full text-danger hover:bg-danger-soft hover:text-danger"
                  onClick={() => setConfirmRemove(true)}
                >
                  <Trash2 className="size-4" />
                  Remove from collection
                </Button>
              ) : (
                <div className="rounded-lg border border-danger/30 bg-danger-soft/50 p-3 text-center">
                  <p className="text-xs font-medium text-danger">
                    Remove this game from your library?
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => void handleRemove()}
                    >
                      Yes, remove
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => setConfirmRemove(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-ink-muted">{label}</div>
      <div className="font-medium text-ink">{value}</div>
    </div>
  );
}
