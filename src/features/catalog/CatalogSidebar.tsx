import {
  CloudDownload,
  Gamepad2,
  History,
  Layers,
  ListPlus,
  Loader2,
  LogOut,
  Plus,
  UserCog,
  X,
} from "lucide-react";
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
  onOpenAccount: () => void;
  onSignOut: () => void;
  onCloseMobile?: () => void;
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
  onOpenAccount,
  onSignOut,
  onCloseMobile,
}: CatalogSidebarProps) {
  const sidebarStores: StoreFilter[] =
    availableStores.length > 0
      ? availableStores
      : ["steam", "epic", "gog", "no_store"];

  return (
    <div className="flex h-full flex-col">
      {/* Brand Header */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border-subtle/70 px-4">
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-2.5 text-left focus-visible:outline-hidden"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-white shadow-[0_4px_16px_color-mix(in_oklab,var(--color-primary)_40%,transparent)]">
            <Gamepad2 className="size-5" />
          </div>
          <div>
            <div className="font-display text-sm font-extrabold leading-tight tracking-tight text-ink">
              Game Catalog
            </div>
            <div className="text-[11px] font-medium text-ink-muted">
              Personal Library
            </div>
          </div>
        </button>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-surface-muted hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Scrollable Navigation Sections */}
      <nav
        aria-label="Library navigation"
        className="flex-1 space-y-6 overflow-y-auto px-3 py-4"
      >
        {/* Library Overview */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={onClearAll}
            className={cn(
              "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold transition-all",
              activeFilterCount === 0
                ? "bg-primary-soft text-primary-soft-ink ring-1 ring-inset ring-primary/25"
                : "text-ink-secondary hover:bg-surface-muted/70 hover:text-ink",
            )}
          >
            <span className="flex items-center gap-2.5">
              <Layers className="size-4" />
              All Games
            </span>
            <span className="font-mono text-xs tabular-nums">{totalGames}</span>
          </button>
        </div>

        {/* Play Statuses */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
            Play Status
          </div>
          <div className="space-y-0.5">
            {GAME_STATUSES.map((status) => {
              const selected = selectedStatuses.includes(status);
              const count = byStatus[status] ?? 0;
              const meta = STATUS_META[status];
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onToggleStatus(status)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-[13px] font-medium transition-all",
                    selected
                      ? "bg-primary-soft font-semibold text-primary-soft-ink ring-1 ring-inset ring-primary/25"
                      : "text-ink-secondary hover:bg-surface-muted/70 hover:text-ink",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full transition-transform group-hover:scale-125",
                        meta.dotClass,
                      )}
                    />
                    <span className="truncate">{meta.label}</span>
                  </span>
                  <span className="font-mono text-[11px] tabular-nums opacity-75">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Storefronts */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
            Storefronts
          </div>
          <div className="space-y-0.5">
            {sidebarStores.map((store) => {
              const selected = selectedStores.includes(store);
              const count =
                store === "no_store" ? noStoreCount : (byStore[store] ?? 0);
              const dotClass =
                store === "no_store"
                  ? "bg-ink-muted/60"
                  : STORE_META[store].dotClass;

              return (
                <button
                  key={store}
                  type="button"
                  onClick={() => onToggleStore(store)}
                  className={cn(
                    "group flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-[13px] font-medium transition-all",
                    selected
                      ? "bg-primary-soft font-semibold text-primary-soft-ink ring-1 ring-inset ring-primary/25"
                      : "text-ink-secondary hover:bg-surface-muted/70 hover:text-ink",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full transition-transform group-hover:scale-125",
                        dotClass,
                      )}
                    />
                    <span className="truncate">
                      {store === "no_store"
                        ? getStoreLabel(store)
                        : STORE_META[store].label}
                    </span>
                  </span>
                  <span className="font-mono text-[11px] tabular-nums opacity-75">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-muted">
            Import &amp; Sync
          </div>
          <div className="space-y-0.5">
            <SidebarActionButton
              icon={<CloudDownload className="size-4 text-sky-400" />}
              label="Import from Steam"
              onClick={onOpenSteamImport}
            />
            <SidebarActionButton
              icon={<Plus className="size-4 text-primary" />}
              label="Add single game"
              onClick={onOpenAddGame}
            />
            <SidebarActionButton
              icon={<ListPlus className="size-4 text-violet-400" />}
              label="Bulk title import"
              onClick={onOpenBulkImport}
            />
            <button
              type="button"
              onClick={onOpenImportHistory}
              className="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface-muted/70 hover:text-ink"
            >
              <span className="flex items-center gap-2.5">
                {activeImportCount > 0 ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <History className="size-4 text-ink-muted" />
                )}
                <span>Import history</span>
              </span>
              {activeImportCount > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                  {activeImportCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Account Footer */}
      <div className="shrink-0 border-t border-border-subtle/70 p-3">
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={onOpenAccount}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-subtle/60 px-2.5 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:bg-surface-muted hover:text-ink"
          >
            <UserCog className="size-3.5" />
            Account
          </button>
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface-subtle/60 px-2.5 py-2 text-xs font-semibold text-ink-secondary transition-colors hover:border-danger/35 hover:bg-danger-soft hover:text-danger"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function SidebarActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-1.5 text-left text-[13px] font-medium text-ink-secondary transition-colors hover:bg-surface-muted/70 hover:text-ink"
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
