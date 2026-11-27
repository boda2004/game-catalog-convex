import { CheckCircle2, Clock, Gamepad2, Play, Store } from "lucide-react";
import {
  STATUS_META,
  STORE_IDS,
  STORE_META,
  formatTotalHours,
  getStoreLabel,
  type GameStatus,
  type StoreFilter,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface CatalogStatsHeaderProps {
  totalGames: number;
  filteredCount: number;
  startIndex: number;
  endIndex: number;
  totalPlaytimeMinutes: number;
  byStore: Record<string, number>;
  byStatus: Record<string, number>;
  noStoreCount: number;
  selectedStores: StoreFilter[];
  selectedStatuses: GameStatus[];
  onToggleStore: (store: StoreFilter) => void;
  onToggleStatus: (status: GameStatus) => void;
}

export function CatalogStatsHeader({
  totalGames,
  filteredCount,
  startIndex,
  endIndex,
  totalPlaytimeMinutes,
  byStore,
  byStatus,
  noStoreCount,
  selectedStores,
  selectedStatuses,
  onToggleStore,
  onToggleStatus,
}: CatalogStatsHeaderProps) {
  const playingCount = byStatus.playing ?? 0;
  const completedCount = byStatus.completed ?? 0;

  // Dynamic heading reflects single active store/status selection
  let heading = "My Games";
  if (selectedStatuses.length === 1 && selectedStores.length === 0) {
    heading = STATUS_META[selectedStatuses[0]].label;
  } else if (selectedStores.length === 1 && selectedStatuses.length === 0) {
    heading = getStoreLabel(selectedStores[0]);
  }

  // Top storefronts for interactive distribution bar
  const storeSegments: Array<{
    id: StoreFilter;
    label: string;
    count: number;
    barClass: string;
    dotClass: string;
  }> = [
    ...STORE_IDS.map((id) => ({
      id,
      label: STORE_META[id].shortLabel,
      count: byStore[id] ?? 0,
      barClass: STORE_META[id].barClass,
      dotClass: STORE_META[id].dotClass,
    })),
    ...(noStoreCount > 0
      ? [
          {
            id: "no_store" as const,
            label: "Unassigned",
            count: noStoreCount,
            barClass: "bg-ink-muted/50",
            dotClass: "bg-ink-muted/60",
          },
        ]
      : []),
  ]
    .filter((s) => s.count > 0)
    .sort((a, b) => b.count - a.count);

  const totalStoreEntries = storeSegments.reduce((sum, s) => sum + s.count, 0);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {heading}
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">
            {filteredCount === 0
              ? totalGames === 0
                ? "Start adding games to populate your personal catalog"
                : "No titles match your active filters"
              : `Showing ${startIndex}–${endIndex} of ${filteredCount} ${filteredCount === 1 ? "title" : "titles"}${filteredCount !== totalGames ? ` · ${totalGames} in library` : ""}`}
          </p>
        </div>
      </div>

      {/* High-signal metric cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border-subtle bg-surface/90 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
            <span>Total Library</span>
            <Gamepad2 className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-extrabold tabular-nums text-ink">
              {totalGames.toLocaleString()}
            </span>
            <span className="text-xs text-ink-muted">
              {totalGames === 1 ? "game" : "games"}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface/90 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
            <span>Tracked Playtime</span>
            <Clock className="size-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-extrabold tabular-nums text-ink">
              {formatTotalHours(totalPlaytimeMinutes)}
            </span>
            <span className="text-xs text-ink-muted">logged</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface/90 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
            <span>Active &amp; Finished</span>
            <CheckCircle2 className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleStatus("playing")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors",
                selectedStatuses.includes("playing")
                  ? "border-sky-400/50 bg-sky-500/20 text-sky-300"
                  : "border-border-subtle bg-surface-subtle text-ink hover:bg-surface-muted",
              )}
            >
              <Play className="size-3 fill-sky-400 text-sky-400" />
              <span className="tabular-nums">{playingCount}</span>
              <span className="text-ink-muted">playing</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleStatus("completed")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors",
                selectedStatuses.includes("completed")
                  ? "border-emerald-400/50 bg-emerald-500/20 text-emerald-300"
                  : "border-border-subtle bg-surface-subtle text-ink hover:bg-surface-muted",
              )}
            >
              <CheckCircle2 className="size-3 text-emerald-400" />
              <span className="tabular-nums">{completedCount}</span>
              <span className="text-ink-muted">done</span>
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface/90 p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted">
            <span>Storefront Split</span>
            <Store className="size-4 text-violet-400" />
          </div>
          {storeSegments.length === 0 ? (
            <p className="mt-3 text-xs text-ink-muted">No storefronts yet</p>
          ) : (
            <div className="mt-2.5 space-y-2">
              <div className="flex h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                {storeSegments.map((seg) => (
                  <button
                    key={seg.id}
                    type="button"
                    title={`${seg.label}: ${seg.count}`}
                    onClick={() => onToggleStore(seg.id)}
                    style={{
                      width: `${(seg.count / Math.max(1, totalStoreEntries)) * 100}%`,
                    }}
                    className={cn(
                      "h-full transition-opacity hover:opacity-80",
                      seg.barClass,
                    )}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                {storeSegments.slice(0, 3).map((seg) => (
                  <button
                    key={seg.id}
                    type="button"
                    onClick={() => onToggleStore(seg.id)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-secondary transition-colors hover:text-ink"
                  >
                    <span className={cn("size-1.5 rounded-full", seg.dotClass)} />
                    <span>{seg.label}</span>
                    <span className="font-mono text-ink-muted tabular-nums">
                      {seg.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
