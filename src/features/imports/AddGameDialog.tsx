import { useAction, useMutation } from "convex/react";
import { Check, Gamepad2, Search, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
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
import {
  GAME_STATUSES,
  STATUS_META,
  STORE_IDS,
  STORE_META,
  formatReleaseYear,
  getMetacriticClass,
  type GameStatus,
  type LibraryGame,
  type StoreId,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface SearchResult {
  rawgId: number;
  name: string;
  slug: string;
  backgroundImage?: string;
  released?: string;
  rating?: number;
  metacritic?: number;
  platforms: string[];
  genres: string[];
}

export interface AddGameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ownedByRawgId: ReadonlyMap<number, LibraryGame>;
}

export function AddGameDialog({
  open,
  onOpenChange,
  ownedByRawgId,
}: AddGameDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selected, setSelected] = useState<SearchResult | null>(null);
  const [stores, setStores] = useState<StoreId[]>([]);
  const [status, setStatus] = useState<GameStatus | null>(null);

  const searchExternal = useAction(api.catalogActions.searchExternalGames);
  const addGame = useAction(api.catalogActions.addGameByRawgId);
  const updateOwned = useMutation(api.games.updateOwnedGameByRawgId);

  const reset = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setSelected(null);
    setStores([]);
    setStatus(null);
  };

  const handleSearch = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setIsSearching(true);
    setSelected(null);
    try {
      const data = await searchExternal({ query: trimmed });
      setResults(data);
      setHasSearched(true);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to search RAWG",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectGame = (game: SearchResult) => {
    setSelected(game);
    const existing = ownedByRawgId.get(game.rawgId);
    if (existing) {
      setStores(existing.stores);
      setStatus(existing.status ?? null);
    } else {
      setStores([]);
      setStatus(null);
    }
  };

  const toggleStore = (store: StoreId) => {
    setStores((prev) =>
      prev.includes(store) ? prev.filter((s) => s !== store) : [...prev, store],
    );
  };

  const handleSave = async () => {
    if (!selected) return;
    setIsSaving(true);
    const isExisting = ownedByRawgId.has(selected.rawgId);
    try {
      const nextStatus = status ?? undefined;
      if (isExisting) {
        await updateOwned({
          rawgId: selected.rawgId,
          stores,
          status: nextStatus,
        });
        toast.success(`Updated "${selected.name}"`);
      } else {
        await addGame({
          rawgId: selected.rawgId,
          stores,
          status: nextStatus,
        });
        toast.success(`Added "${selected.name}" to your library`);
      }
      reset();
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save game",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-lg font-bold text-ink">
            Add or Update Game
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-sm text-ink-secondary">
            Search the RAWG database, pick a title, and assign storefronts and
            play status.
          </DialogDescription>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSearch();
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by game title (e.g. Hades, Elden Ring)..."
                className="input-field pl-10"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? (
                <Spinner className="size-4 border-white/35 border-t-white" />
              ) : (
                "Search"
              )}
            </Button>
          </form>
        </DialogHeader>

        <DialogBody className="space-y-3">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14">
              <Spinner className="size-7" />
              <p className="text-sm text-ink-secondary">Searching RAWG...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((game) => {
              const isSelected = selected?.rawgId === game.rawgId;
              const isOwned = ownedByRawgId.has(game.rawgId);
              const year = formatReleaseYear(game.released);

              return (
                <div
                  key={game.rawgId}
                  className={cn(
                    "overflow-hidden rounded-2xl border transition-all",
                    isSelected
                      ? "border-primary bg-primary-soft/25 ring-1 ring-inset ring-primary/30"
                      : "border-border-subtle bg-surface-subtle/40 hover:border-border-strong",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectGame(game)}
                    className="flex w-full items-center gap-4 p-3.5 text-left"
                  >
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-border-subtle bg-surface-muted">
                      {game.backgroundImage ? (
                        <img
                          src={game.backgroundImage}
                          alt={game.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-ink-muted">
                          <Gamepad2 className="size-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display truncate text-sm font-bold text-ink">
                          {game.name}
                        </h3>
                        {isOwned && <Badge tone="success">In library</Badge>}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-xs text-ink-secondary">
                        {year && <span className="font-mono">{year}</span>}
                        {game.rating !== undefined && game.rating > 0 && (
                          <span className="inline-flex items-center gap-1 font-mono font-semibold text-ink">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            {game.rating.toFixed(1)}
                          </span>
                        )}
                        {game.metacritic !== undefined && (
                          <span
                            className={cn(
                              "rounded px-1.5 py-0.5 font-mono text-[10px] font-bold",
                              getMetacriticClass(game.metacritic),
                            )}
                          >
                            {game.metacritic}
                          </span>
                        )}
                        {game.platforms.length > 0 && (
                          <span className="truncate text-ink-muted">
                            {game.platforms.slice(0, 4).join(", ")}
                            {game.platforms.length > 4 &&
                              ` +${game.platforms.length - 4}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="space-y-4 border-t border-border-subtle/80 bg-surface/70 px-4 py-4">
                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-ink-muted">
                          Owned on stores
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

                      <div>
                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.07em] text-ink-muted">
                          Play status (optional)
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {GAME_STATUSES.map((s) => {
                            const active = status === s;
                            return (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setStatus(active ? null : s)}
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all",
                                  active
                                    ? "border-primary bg-primary text-white"
                                    : "border-border-strong/75 bg-surface text-ink-secondary hover:bg-surface-muted hover:text-ink",
                                )}
                              >
                                <span
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    active
                                      ? "bg-white"
                                      : STATUS_META[s].dotClass,
                                  )}
                                />
                                {STATUS_META[s].label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : hasSearched ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-ink">
                No games found for &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                Try a shorter title or check the spelling.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-surface-subtle text-ink-muted">
                <Search className="size-5" />
              </div>
              <p className="text-sm font-medium text-ink-secondary">
                Search RAWG above to find and add games to your vault.
              </p>
            </div>
          )}
        </DialogBody>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!selected || isSaving}
            onClick={() => void handleSave()}
          >
            {isSaving
              ? "Saving..."
              : selected && ownedByRawgId.has(selected.rawgId)
                ? "Update in library"
                : "Add to library"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
