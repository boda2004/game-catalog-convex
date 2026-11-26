import {
  CloudDownload,
  History,
  ListPlus,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  GAME_STATUSES,
  STATUS_META,
  STORE_META,
  getStoreLabel,
  type GameStatus,
  type StoreFilter,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";

interface CatalogSidebarProps {
  totalGames: number;
  byStore: Record<string, number>;
  noStoreCount: number;
  byStatus: Record<string, number>;
  availableStores: StoreFilter[];
  selectedStores: StoreFilter[];
  selectedStatuses: GameStatus[];
  activeFilterCount: number;
  activeImportCount: number;
  onClearAll: () => void;
  onToggleStore: (store: StoreFilter) => void;
  onToggleStatus: (status: GameStatus) => void;
  onOpenSteamImport: () => void;
  onOpenAddGame: () => void;
  onOpenBulkImport: () => void;
  onOpenImportHistory: () => void;
}

export function CatalogSidebar({
  totalGames,
  byStore,
  noStoreCount,
  byStatus,
  availableStores,
  selectedStores,
  selectedStatuses,
  activeFilterCount,
  activeImportCount,
  onClearAll,
  onToggleStore,
  onToggleStatus,
  onOpenSteamImport,
  onOpenAddGame,
  onOpenBulkImport,
  onOpenImportHistory,
}: CatalogSidebarProps) {
  const sidebarStores: StoreFilter[] =
    availableStores.length > 0
      ? availableStores
      : ["steam", "epic", "gog", "no_store"];

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[4.5rem] space-y-4">
        <div className="rounded-xl border border-border-subtle bg-surface p-3">
          <div className="mb-2 px-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">
            Library
          </div>
          <button
            type="button"
            onClick={onClearAll}
            className={cn(
              "mb-1 flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm font-semibold transition-colors",
              activeFilterCount === 0
                ? "bg-primary-soft text-primary-soft-ink"
                : "text-ink-secondary hover:bg-surface-subtle hover:text-ink",
            )}
          >
            <span>All games</span>
            <span className="tabular-nums">{totalGames}</span>
          </button>

          <div className="my-2 border-t border-border-subtle" />

          <div className="mb-1.5 px-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">
            Stores
          </div>
          <div className="space-y-0.5">
            {sidebarStores.map((store) => {
              const selected = selectedStores.includes(store);
              const count =
                store === "no_store" ? noStoreCount : (byStore[store] ?? 0);
              return (
                <button
                  key={store}
                  type="button"
                  onClick={() => onToggleStore(store)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition-colors",
                    selected
                      ? "bg-primary-soft font-semibold text-primary-soft-ink"
                      : "text-ink-secondary hover:bg-surface-subtle hover:text-ink",
                  )}
                >
                  <span className="truncate">
                    {store === "no_store"
                      ? getStoreLabel(store)
                      : STORE_META[store].label}
                  </span>
                  <span className="text-xs tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="my-2 border-t border-border-subtle" />

          <div className="mb-1.5 px-2.5 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">
            Status
          </div>
          <div className="space-y-0.5">
            {GAME_STATUSES.map((status) => {
              const selected = selectedStatuses.includes(status);
              const count = byStatus[status] ?? 0;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onToggleStatus(status)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm font-medium transition-colors",
                    selected
                      ? "bg-primary-soft font-semibold text-primary-soft-ink"
                      : "text-ink-secondary hover:bg-surface-subtle hover:text-ink",
                  )}
                >
                  <span>{STATUS_META[status].label}</span>
                  <span className="text-xs tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border-subtle bg-surface p-3">
          <div className="mb-2.5 px-2 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-muted">
            Add games
          </div>
          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full justify-start"
              onClick={onOpenSteamImport}
            >
              <CloudDownload className="size-4" />
              Import from Steam
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={onOpenAddGame}
            >
              <Plus className="size-4" />
              Add game
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              onClick={onOpenBulkImport}
            >
              <ListPlus className="size-4" />
              Bulk import
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={onOpenImportHistory}
            >
              <span className="inline-flex items-center gap-2">
                <History className="size-4" />
                Import history
              </span>
              {activeImportCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-bold text-primary-soft-ink">
                  <Sparkles className="size-3" />
                  {activeImportCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
