import { CloudDownload, History, ListPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CatalogStatsHeaderProps {
  totalGames: number;
  filteredCount: number;
  startIndex: number;
  endIndex: number;
  byStore: Record<string, number>;
  noStoreCount: number;
  onOpenSteamImport: () => void;
  onOpenAddGame: () => void;
  onOpenBulkImport: () => void;
  onOpenImportHistory: () => void;
}

export function CatalogStatsHeader({
  totalGames,
  filteredCount,
  startIndex,
  endIndex,
  byStore,
  noStoreCount,
  onOpenSteamImport,
  onOpenAddGame,
  onOpenBulkImport,
  onOpenImportHistory,
}: CatalogStatsHeaderProps) {
  const kpis = [
    { label: "Total", value: totalGames },
    { label: "Steam", value: byStore.steam ?? 0 },
    { label: "Epic", value: byStore.epic ?? 0 },
    { label: "GOG", value: byStore.gog ?? 0 },
    { label: "No store", value: noStoreCount },
  ];

  return (
    <div className="rounded-xl border border-border-subtle bg-surface p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            My Games
          </h1>
          <p className="mt-0.5 text-sm text-ink-secondary">
            {filteredCount === 0
              ? totalGames === 0
                ? "No games in your collection yet"
                : "No games match your active filters"
              : `Showing ${startIndex}–${endIndex} of ${filteredCount} ${filteredCount === 1 ? "game" : "games"}${filteredCount !== totalGames ? ` (${totalGames} total)` : ""}`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:min-w-[540px]">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-lg border border-border-subtle bg-canvas px-3 py-2.5"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.05em] text-ink-muted">
                {kpi.label}
              </div>
              <div className="mt-0.5 text-xl font-bold tabular-nums text-ink">
                {kpi.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile / tablet quick actions */}
      <div className="mt-4 flex flex-wrap gap-2 lg:hidden">
        <Button variant="primary" size="sm" onClick={onOpenSteamImport}>
          <CloudDownload className="size-3.5" />
          Import Steam
        </Button>
        <Button variant="secondary" size="sm" onClick={onOpenAddGame}>
          <Plus className="size-3.5" />
          Add game
        </Button>
        <Button variant="secondary" size="sm" onClick={onOpenBulkImport}>
          <ListPlus className="size-3.5" />
          Bulk import
        </Button>
        <Button variant="ghost" size="sm" onClick={onOpenImportHistory}>
          <History className="size-3.5" />
          Imports
        </Button>
      </div>
    </div>
  );
}
