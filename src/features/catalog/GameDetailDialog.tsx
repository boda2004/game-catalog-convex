import { useAction, useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import {
  Calendar,
  Check,
  Clock,
  ExternalLink,
  Gamepad2,
  RefreshCw,
  Save,
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
import { Spinner } from "@/components/ui/Spinner";
import {
  GAME_STATUSES,
  STATUS_META,
  STORE_IDS,
  STORE_META,
  formatDate,
  formatPlaytime,
  formatReleaseYear,
  getMetacriticClass,
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
      <DialogContent
        className="max-w-4xl p-0"
        closeButtonClassName="bg-black/55 border-white/15 text-white hover:bg-black/75 hover:text-white"
      >
        {!game ? (
          <div className="flex h-72 items-center justify-center">
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
  const [status, setStatus] = useState<GameStatus | null>(game.status ?? null);
  const [userRating, setUserRating] = useState<number | null>(
    game.userRating ?? null,
  );
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [notes, setNotes] = useState(game.notes ?? "");
  const [showAllTags, setShowAllTags] = useState(false);
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
        status,
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

  const visibleTags = showAllTags ? game.tags : game.tags.slice(0, 14);
  const displayedRating = hoveredStar ?? userRating ?? 0;

  return (
    <div className="flex max-h-[90vh] flex-col overflow-hidden">
      {/* Cinematic Hero Banner */}
      <div className="relative h-56 shrink-0 overflow-hidden bg-surface-muted sm:h-68">
        {game.backgroundImage ? (
          <img
            src={game.backgroundImage}
            alt={game.name}
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-primary/20 via-surface-subtle to-surface-muted text-ink-muted">
            <Gamepad2 className="size-14 opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-black/45 to-black/25" />

        <div className="absolute inset-x-6 bottom-5 pr-10">
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-white drop-shadow-sm sm:text-3xl">
            {game.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Details, store ownership, and personal notes for {game.name}.
          </DialogDescription>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/95">
            {formatReleaseYear(game.released) && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/55 px-2.5 py-1 font-mono backdrop-blur-md">
                <Calendar className="size-3 text-white/75" />
                {formatReleaseYear(game.released)}
              </span>
            )}
            {game.rating !== undefined && game.rating > 0 && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/55 px-2.5 py-1 font-mono backdrop-blur-md">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {game.rating.toFixed(1)} RAWG
              </span>
            )}
            {game.metacritic !== undefined && (
              <span
                className={cn(
                  "rounded-lg px-2.5 py-1 font-mono font-bold backdrop-blur-md",
                  getMetacriticClass(game.metacritic),
                )}
              >
                Metacritic {game.metacritic}
              </span>
            )}
            {formatPlaytime(game.playtimeMinutes) && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-black/55 px-2.5 py-1 font-mono backdrop-blur-md">
                <Clock className="size-3 text-sky-300" />
                {formatPlaytime(game.playtimeMinutes)} played
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.45fr_1fr]">
          {/* Left column: About, taxonomy, metadata */}
          <div className="space-y-6">
            {game.description && (
              <section>
                <h2 className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
                  About
                </h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-ink-secondary">
                  {game.description}
                </p>
              </section>
            )}

            {game.platforms.length > 0 && (
              <section>
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
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
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
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
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {visibleTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-lg border border-border-subtle bg-surface-subtle/70 px-2 py-0.5 text-xs text-ink-secondary"
                    >
                      {tag}
                    </span>
                  ))}
                  {game.tags.length > 14 && (
                    <button
                      type="button"
                      onClick={() => setShowAllTags((v) => !v)}
                      className="rounded-lg px-2 py-0.5 text-xs font-semibold text-primary hover:underline"
                    >
                      {showAllTags
                        ? "Show less"
                        : `+${game.tags.length - 14} more`}
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Metadata Grid */}
            <section className="rounded-2xl border border-border-subtle bg-surface-subtle/50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
                  Game Metadata
                </h3>
                <button
                  type="button"
                  disabled={isRefreshing}
                  onClick={() => void handleRefreshMetadata()}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-primary-soft-ink transition-colors hover:bg-primary-soft disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn("size-3", isRefreshing && "animate-spin")}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh from RAWG"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
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
                  <DetailRow label="ESRB Rating" value={game.esrbRating} />
                )}
                {game.playtime !== undefined && game.playtime > 0 && (
                  <DetailRow
                    label="Avg. Completion"
                    value={`${game.playtime} hours`}
                  />
                )}
                {formatDate(game.userAddedAt) && (
                  <DetailRow
                    label="Added to Library"
                    value={formatDate(game.userAddedAt)!}
                  />
                )}
              </div>

              {game.website && (
                <a
                  href={game.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface-elevated px-3 text-xs font-semibold text-ink transition-colors hover:bg-surface-muted"
                >
                  <ExternalLink className="size-3.5" />
                  Visit official website
                </a>
              )}
            </section>
          </div>

          {/* Right column: My Collection Inspector */}
          <div className="space-y-4">
            <div className="space-y-5 rounded-2xl border border-border-strong/70 bg-surface-subtle/60 p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-ink">
                  My Collection
                </h3>
                {isDirty && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                    <span className="size-1.5 rounded-full bg-amber-400" />
                    Unsaved
                  </span>
                )}
              </div>

              {/* Tactile Play Status Pill Picker */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold uppercase tracking-[0.07em] text-ink-muted">
                  Play Status
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {GAME_STATUSES.map((s) => {
                    const active = status === s;
                    const meta = STATUS_META[s];
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setStatus(active ? null : s);
                          setIsDirty(true);
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all",
                          active
                            ? "border-primary bg-primary text-white shadow-xs"
                            : "border-border-strong/75 bg-surface text-ink-secondary hover:bg-surface-muted hover:text-ink",
                        )}
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full",
                            active ? "bg-white" : meta.dotClass,
                          )}
                        />
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal 5-Star Rating */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-ink-muted">
                    My Rating
                  </span>
                  {userRating !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setUserRating(null);
                        setIsDirty(true);
                      }}
                      className="text-[11px] font-medium text-ink-muted hover:text-ink"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div
                  className="flex items-center gap-1"
                  onMouseLeave={() => setHoveredStar(null)}
                >
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = displayedRating >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        aria-label={`Rate ${star} out of 5`}
                        onMouseEnter={() => setHoveredStar(star)}
                        onClick={() => {
                          setUserRating(userRating === star ? null : star);
                          setIsDirty(true);
                        }}
                        className="rounded-lg p-1.5 transition-transform hover:scale-110 hover:bg-surface-muted"
                      >
                        <Star
                          className={cn(
                            "size-5 transition-colors",
                            active
                              ? "fill-amber-400 text-amber-400"
                              : "text-border-strong",
                          )}
                        />
                      </button>
                    );
                  })}
                  {userRating !== null && (
                    <span className="ml-2 font-mono text-xs font-bold text-ink">
                      {userRating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* Owned On Storefronts */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold uppercase tracking-[0.07em] text-ink-muted">
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
                          "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all",
                          active
                            ? "border-primary bg-primary text-white shadow-xs"
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
                        {STORE_META[storeId].shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Personal Notes */}
              <label className="block space-y-2">
                <span className="block text-[11px] font-bold uppercase tracking-[0.07em] text-ink-muted">
                  Personal Notes
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setIsDirty(true);
                  }}
                  rows={4}
                  placeholder="Thoughts, mods, playthrough goals, or DLC reminders..."
                  className="input-field resize-y text-xs leading-relaxed"
                />
              </label>

              <Button
                variant="primary"
                className="w-full"
                disabled={!isDirty || isSaving}
                onClick={() => void handleSave()}
              >
                <Save className="size-4" />
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>

            {/* Danger Zone */}
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
              <div className="rounded-2xl border border-danger/35 bg-danger-soft/70 p-4 text-center">
                <p className="text-xs font-semibold text-danger">
                  Remove &ldquo;{game.name}&rdquo; from your library?
                </p>
                <div className="mt-3 flex gap-2">
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
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] font-medium text-ink-muted">{label}</div>
      <div className="mt-0.5 truncate font-semibold text-ink" title={value}>
        {value}
      </div>
    </div>
  );
}
