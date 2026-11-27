import { Clock, Gamepad2, Star } from "lucide-react";
import { motion } from "motion/react";
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {games.map((game, index) => {
        const year = formatReleaseYear(game.released);
        const playtime = formatPlaytime(game.playtimeMinutes);

        return (
          <motion.button
            key={game._id}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.22,
              delay: Math.min(index * 0.02, 0.24),
              ease: [0.16, 1, 0.3, 1],
            }}
            onClick={() => onSelectGame(game._id)}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-[0_14px_34px_rgba(0,0,0,0.28)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/45"
          >
            {/* Cover Art */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-muted">
              {game.backgroundImage ? (
                <img
                  src={game.backgroundImage}
                  alt={game.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-gradient-to-br from-surface-subtle to-surface-muted text-ink-muted">
                  <Gamepad2 className="size-10 opacity-60" />
                </div>
              )}

              {/* Cinematic bottom vignette */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/15" />

              {/* Top-left Status pill */}
              {game.status && (
                <span
                  className={cn(
                    "absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md",
                    STATUS_META[game.status].glassClass,
                  )}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      STATUS_META[game.status].dotClass,
                    )}
                  />
                  {STATUS_META[game.status].label}
                </span>
              )}

              {/* Top-right Ratings */}
              <div className="absolute right-3 top-3 flex items-center gap-1.5">
                {game.metacritic !== undefined && (
                  <span
                    className={cn(
                      "rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[11px] font-bold backdrop-blur-md",
                      game.metacritic >= 75
                        ? "text-emerald-300 ring-1 ring-inset ring-emerald-400/40"
                        : game.metacritic >= 50
                          ? "text-amber-300 ring-1 ring-inset ring-amber-400/40"
                          : "text-rose-300 ring-1 ring-inset ring-rose-400/40",
                    )}
                  >
                    {game.metacritic}
                  </span>
                )}
                {game.rating !== undefined && game.rating > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 font-mono text-[11px] font-bold text-white ring-1 ring-inset ring-white/15 backdrop-blur-md">
                    <Star className="size-3 fill-amber-400 text-amber-400" />
                    {game.rating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Bottom cover metadata strip */}
              <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between gap-2 text-[11px] font-medium text-white/90">
                <div className="flex items-center gap-2">
                  {year && (
                    <span className="rounded bg-black/55 px-1.5 py-0.5 font-mono tabular-nums backdrop-blur-xs">
                      {year}
                    </span>
                  )}
                  {playtime && (
                    <span className="inline-flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 font-mono tabular-nums backdrop-blur-xs">
                      <Clock className="size-3 text-white/75" />
                      {playtime}
                    </span>
                  )}
                </div>
                {game.userRating !== undefined && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-500/25 px-1.5 py-0.5 font-mono font-bold text-amber-200 ring-1 ring-inset ring-amber-400/35 backdrop-blur-xs">
                    <Star className="size-2.5 fill-amber-300 text-amber-300" />
                    {game.userRating}/5
                  </span>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="flex flex-1 flex-col gap-2.5 p-4">
              <div className="min-w-0">
                <h3 className="font-display line-clamp-1 text-[15px] font-bold tracking-tight text-ink transition-colors group-hover:text-primary">
                  {game.name}
                </h3>
                {game.genres.length > 0 && (
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    {game.genres.slice(0, 3).map((genre) => (
                      <span
                        key={genre}
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
                          selectedGenres.includes(genre)
                            ? "bg-primary text-white"
                            : "bg-surface-subtle text-ink-secondary",
                        )}
                      >
                        {genre}
                      </span>
                    ))}
                    {game.genres.length > 3 && (
                      <span className="text-[11px] text-ink-muted">
                        +{game.genres.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Platforms */}
              {game.platforms.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {game.platforms.slice(0, 3).map((platform) => (
                    <span
                      key={platform}
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
                        selectedPlatforms.includes(platform)
                          ? "bg-primary text-white"
                          : "bg-primary-soft/75 text-primary-soft-ink",
                      )}
                    >
                      {platform}
                    </span>
                  ))}
                  {game.platforms.length > 3 && (
                    <span className="rounded-md bg-surface-subtle px-1.5 py-0.5 text-[10px] font-semibold text-ink-muted">
                      +{game.platforms.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Footer: Stores + fallback Metacritic indicator */}
              {game.stores.length > 0 && (
                <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-border-subtle/70 pt-3">
                  {game.stores.map((store) => (
                    <span
                      key={store}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold",
                        STORE_META[store].badgeClass,
                      )}
                    >
                      <span
                        className={cn(
                          "size-1.5 rounded-full",
                          STORE_META[store].dotClass,
                        )}
                      />
                      {STORE_META[store].shortLabel}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
