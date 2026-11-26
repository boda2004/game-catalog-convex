import { ArrowDown, ArrowUp, Gamepad2, Star } from "lucide-react";
import type { ReactNode } from "react";
import {
  STATUS_META,
  STORE_META,
  formatDate,
  formatPlaytime,
  type LibraryGame,
  type SortField,
  type SortOrder,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface GameTableProps {
  games: LibraryGame[];
  visibleFields: string[];
  selectedPlatforms: string[];
  selectedGenres: string[];
  sortBy: SortField;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
  onTogglePlatform: (platform: string) => void;
  onToggleGenre: (genre: string) => void;
  onSelectGame: (gameId: string) => void;
}

interface ColumnConfig {
  id: string;
  header: string;
  sortField?: SortField;
  nowrap?: boolean;
  render: (game: LibraryGame) => ReactNode;
}

export function GameTable({
  games,
  visibleFields,
  selectedPlatforms,
  selectedGenres,
  sortBy,
  sortOrder,
  onSortChange,
  onTogglePlatform,
  onToggleGenre,
  onSelectGame,
}: GameTableProps) {
  const allColumns: ColumnConfig[] = [
    {
      id: "name",
      header: "Name",
      sortField: "name",
      nowrap: false,
      render: (game) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <div className="h-9 w-14 shrink-0 overflow-hidden rounded-md bg-surface-muted">
            {game.backgroundImage ? (
              <img
                src={game.backgroundImage}
                alt={game.name}
                loading="lazy"
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-ink-muted">
                <Gamepad2 className="size-4" />
              </div>
            )}
          </div>
          <span className="font-semibold text-ink">{game.name}</span>
        </div>
      ),
    },
    {
      id: "platforms",
      header: "Platforms",
      nowrap: true,
      render: (game) => (
        <div className="flex flex-wrap gap-1">
          {game.platforms.slice(0, 2).map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlatform(platform);
              }}
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-semibold transition-colors",
                selectedPlatforms.includes(platform)
                  ? "bg-primary text-white"
                  : "bg-primary-soft text-primary-soft-ink hover:opacity-85",
              )}
            >
              {platform}
            </button>
          ))}
          {game.platforms.length > 2 && (
            <span className="rounded-md bg-surface-subtle px-1.5 py-0.5 text-xs font-semibold text-ink-muted">
              +{game.platforms.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "genres",
      header: "Genres",
      nowrap: true,
      render: (game) => (
        <div className="flex flex-wrap gap-1">
          {game.genres.slice(0, 2).map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleGenre(genre);
              }}
              className={cn(
                "rounded-md px-2 py-0.5 text-xs font-semibold transition-colors",
                selectedGenres.includes(genre)
                  ? "bg-ink-secondary text-white"
                  : "bg-surface-subtle text-ink-secondary ring-1 ring-inset ring-border-subtle hover:bg-surface-muted",
              )}
            >
              {genre}
            </button>
          ))}
          {game.genres.length > 2 && (
            <span className="rounded-md bg-surface-subtle px-1.5 py-0.5 text-xs font-semibold text-ink-muted">
              +{game.genres.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "stores",
      header: "Stores",
      nowrap: true,
      render: (game) =>
        game.stores.length === 0 ? (
          <span className="text-xs text-ink-muted">—</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {game.stores.map((store) => (
              <span
                key={store}
                className={cn(
                  "rounded-md px-2 py-0.5 text-xs font-semibold",
                  STORE_META[store].badgeClass,
                )}
              >
                {STORE_META[store].shortLabel}
              </span>
            ))}
          </div>
        ),
    },
    {
      id: "status",
      header: "Status",
      nowrap: true,
      render: (game) =>
        !game.status ? (
          <span className="text-xs text-ink-muted">—</span>
        ) : (
          <span
            className={cn(
              "rounded-md px-2 py-0.5 text-xs font-semibold",
              STATUS_META[game.status].badgeClass,
            )}
          >
            {STATUS_META[game.status].label}
          </span>
        ),
    },
    {
      id: "rating",
      header: "Rating",
      sortField: "rating",
      nowrap: true,
      render: (game) =>
        game.rating ? (
          <span className="inline-flex items-center gap-1 text-sm font-medium tabular-nums text-ink">
            <Star className="size-3.5 fill-amber-500 text-amber-500" />
            {game.rating.toFixed(1)}
          </span>
        ) : (
          <span className="text-xs text-ink-muted">—</span>
        ),
    },
    {
      id: "metacritic",
      header: "Metacritic",
      sortField: "metacritic",
      nowrap: true,
      render: (game) =>
        game.metacritic ? (
          <span className="inline-flex rounded-md bg-success-soft px-2 py-0.5 text-xs font-bold tabular-nums text-success">
            {game.metacritic}
          </span>
        ) : (
          <span className="text-xs text-ink-muted">—</span>
        ),
    },
    {
      id: "userRating",
      header: "My Rating",
      sortField: "userRating",
      nowrap: true,
      render: (game) =>
        game.userRating ? (
          <span className="text-sm font-semibold tabular-nums text-ink">
            {game.userRating}/5
          </span>
        ) : (
          <span className="text-xs text-ink-muted">—</span>
        ),
    },
    {
      id: "playtimeMinutes",
      header: "Playtime",
      sortField: "playtimeMinutes",
      nowrap: true,
      render: (game) => {
        const formatted = formatPlaytime(game.playtimeMinutes);
        return formatted ? (
          <span className="text-sm tabular-nums text-ink-secondary">
            {formatted}
          </span>
        ) : (
          <span className="text-xs text-ink-muted">—</span>
        );
      },
    },
    {
      id: "released",
      header: "Released",
      sortField: "released",
      nowrap: true,
      render: (game) => (
        <span className="text-sm tabular-nums text-ink-secondary">
          {formatDate(game.released) ?? "—"}
        </span>
      ),
    },
    {
      id: "developers",
      header: "Developer",
      nowrap: true,
      render: (game) => (
        <span className="text-sm text-ink-secondary">
          {game.developers.length > 0
            ? `${game.developers.slice(0, 2).join(", ")}${game.developers.length > 2 ? ` +${game.developers.length - 2}` : ""}`
            : "—"}
        </span>
      ),
    },
    {
      id: "publishers",
      header: "Publisher",
      nowrap: true,
      render: (game) => (
        <span className="text-sm text-ink-secondary">
          {game.publishers.length > 0
            ? `${game.publishers.slice(0, 2).join(", ")}${game.publishers.length > 2 ? ` +${game.publishers.length - 2}` : ""}`
            : "—"}
        </span>
      ),
    },
    {
      id: "userAddedAt",
      header: "Added",
      sortField: "userAddedAt",
      nowrap: true,
      render: (game) => (
        <span className="text-sm tabular-nums text-ink-secondary">
          {formatDate(game.userAddedAt) ?? "—"}
        </span>
      ),
    },
  ];

  const visibleSet = new Set(["name", ...visibleFields]);
  const visibleColumns = allColumns.filter((col) => visibleSet.has(col.id));

  const handleHeaderSort = (field?: SortField) => {
    if (!field) return;
    if (sortBy === field) {
      onSortChange(field, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(field, field === "name" ? "asc" : "desc");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border-subtle bg-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-subtle">
          <thead className="bg-surface-subtle">
            <tr>
              {visibleColumns.map((col) => {
                const isSorted = col.sortField === sortBy;
                return (
                  <th
                    key={col.id}
                    scope="col"
                    className={cn(
                      "whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted",
                      col.sortField &&
                        "cursor-pointer select-none hover:bg-surface-muted hover:text-ink",
                    )}
                    onClick={() => handleHeaderSort(col.sortField)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {isSorted &&
                        (sortOrder === "asc" ? (
                          <ArrowUp className="size-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="size-3.5 text-primary" />
                        ))}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle bg-surface">
            {games.map((game) => (
              <tr
                key={game._id}
                onClick={() => onSelectGame(game._id)}
                className="cursor-pointer transition-colors hover:bg-surface-subtle/60"
              >
                {visibleColumns.map((col) => (
                  <td
                    key={col.id}
                    className={cn(
                      "px-4 py-3 text-sm",
                      col.nowrap && "whitespace-nowrap",
                    )}
                  >
                    {col.render(game)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
