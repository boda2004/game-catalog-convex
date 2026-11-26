import { Clock, Gamepad2, Star } from "lucide-react";
import {
  STATUS_META,
  STORE_META,
  formatPlaytime,
  formatReleaseYear,
  type LibraryGame,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface GameGridProps {
  games: LibraryGame[];
  selectedPlatforms: string[];
  selectedGenres: string[];
  onSelectGame: (gameId: string) => void;
}

export function GameGrid({
  games,
  selectedPlatforms,
  selectedGenres,
  onSelectGame,
}: GameGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {games.map((game) => {
        const year = formatReleaseYear(game.released);
        const playtime = formatPlaytime(game.playtimeMinutes);

        return (
          <button
            key={game._id}
            type="button"
            onClick={() => onSelectGame(game._id)}
            className="group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface text-left transition-colors hover:border-border-strong focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/35"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
              {game.backgroundImage ? (
                <img
                  src={game.backgroundImage}
                  alt={game.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-ink-muted">
                  <Gamepad2 className="size-10" />
                </div>
              )}

              {game.status && (
                <span
                  className={cn(
                    "absolute left-2.5 top-2.5 rounded-md px-2 py-0.5 text-[11px] font-bold shadow-xs",
                    STATUS_META[game.status].badgeClass,
                  )}
                >
                  {STATUS_META[game.status].label}
                </span>
              )}

              {game.rating !== undefined && game.rating > 0 && (
                <div className="absolute right-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-xs font-bold text-ink ring-1 ring-inset ring-border-subtle">
                  <Star className="size-3 fill-amber-500 text-amber-500" />
                  {game.rating.toFixed(1)}
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col p-3.5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-sm font-bold leading-5 text-ink">
                  {game.name}
                </h3>
                {year && (
                  <span className="shrink-0 rounded-md bg-surface-subtle px-1.5 py-0.5 text-xs font-semibold tabular-nums text-ink-secondary">
                    {year}
                  </span>
                )}
              </div>

              {game.platforms.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1">
                  {game.platforms.slice(0, 3).map((platform) => (
                    <span
                      key={platform}
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                        selectedPlatforms.includes(platform)
                          ? "bg-primary text-white"
                          : "bg-primary-soft text-primary-soft-ink",
                      )}
                    >
                      {platform}
                    </span>
                  ))}
                  {game.platforms.length > 3 && (
                    <span className="rounded-md bg-surface-subtle px-1.5 py-0.5 text-[11px] font-semibold text-ink-secondary">
                      +{game.platforms.length - 3}
                    </span>
                  )}
                </div>
              )}

              {game.genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {game.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className={cn(
                        "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                        selectedGenres.includes(genre)
                          ? "bg-ink-secondary text-white"
                          : "bg-surface-subtle text-ink-secondary ring-1 ring-inset ring-border-subtle",
                      )}
                    >
                      {genre}
                    </span>
                  ))}
                  {game.genres.length > 2 && (
                    <span className="rounded-md bg-surface-subtle px-1.5 py-0.5 text-[11px] font-semibold text-ink-secondary">
                      +{game.genres.length - 2}
                    </span>
                  )}
                </div>
              )}

              {(game.stores.length > 0 || playtime) && (
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-surface-muted pt-2.5 mt-3">
                  <div className="flex flex-wrap gap-1">
                    {game.stores.map((store) => (
                      <span
                        key={store}
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                          STORE_META[store].badgeClass,
                        )}
                      >
                        {STORE_META[store].shortLabel}
                      </span>
                    ))}
                  </div>
                  {playtime && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted">
                      <Clock className="size-3" />
                      {playtime}
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
