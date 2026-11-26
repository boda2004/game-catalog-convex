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
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";
import {
  GAME_STATUSES,
  STATUS_META,
  STORE_IDS,
  STORE_META,
  formatReleaseYear,
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
  const [status, setStatus] = useState<GameStatus | "none">("none");

  const searchExternal = useAction(api.catalogActions.searchExternalGames);
  const addGame = useAction(api.catalogActions.addGameByRawgId);
  const updateOwned = useMutation(api.games.updateOwnedGameByRawgId);

  const reset = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setSelected(null);
    setStores([]);
    setStatus("none");
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
      setStatus(existing.status ?? "none");
    } else {
      setStores([]);
      setStatus("none");
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
      const nextStatus = status === "none" ? undefined : status;
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
          <DialogTitle className="text-lg font-semibold text-ink">
            Add or Update Game
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-sm text-ink-secondary">
            Search the RAWG catalog, pick a title, and assign your stores and
            status.
          </DialogDescription>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSearch();
            }}
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by game title..."
                className="input-field pl-9"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? <Spinner className="size-4 border-white/40 border-b-white" /> : "Search"}
            </Button>
          </form>
        </DialogHeader>

        <DialogBody className="space-y-3">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <Spinner />
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
                    "rounded-xl border p-3.5 transition-colors",
                    isSelected
                      ? "border-primary bg-primary-soft/25"
                      : "border-border-subtle bg-surface hover:border-border-strong",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectGame(game)}
                    className="flex w-full items-start gap-3.5 text-left"
                  >
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
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
                        <h3 className="truncate font-semibold text-ink">
                          {game.name}
                        </h3>
                        {isOwned && <Badge tone="success">In library</Badge>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-secondary">
                        {year && <span>{year}</span>}
                        {game.rating !== undefined && game.rating > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Star className="size-3.5 fill-amber-500 text-amber-500" />
                            {game.rating.toFixed(1)}
                          </span>
                        )}
                        {game.platforms.length > 0 && (
                          <span className="truncate">
                            {game.platforms.slice(0, 4).join(", ")}
                            {game.platforms.length > 4 &&
                              ` +${game.platforms.length - 4}`}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  {isSelected && (
                    <div className="mt-3.5 space-y-3 border-t border-border-subtle pt-3.5">
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
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

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                          Status
                        </span>
                        <Select
                          value={status}
                          onValueChange={setStatus}
                          ariaLabel="Play status"
                          className="w-44"
                          options={[
                            { value: "none" as const, label: "No status" },
                            ...GAME_STATUSES.map((s) => ({
                              value: s,
                              label: STATUS_META[s].label,
                            })),
                          ]}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : hasSearched ? (
            <p className="py-10 text-center text-sm text-ink-muted">
              No games found for &ldquo;{query}&rdquo;. Try another title.
            </p>
          ) : (
            <p className="py-10 text-center text-sm text-ink-muted">
              Search for a game above to add it to your collection.
            </p>
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
