import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import {
  CloudDownload,
  Gamepad2,
  Layers,
  Moon,
  Sparkles,
  Sun,
} from "lucide-react";
import { MotionConfig } from "motion/react";
import { useCallback, useState } from "react";
import { Toaster } from "sonner";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { AccountDialog } from "@/features/auth/AccountDialog";
import { AuthLinkView } from "@/features/auth/AuthLinkViews";
import { SignInForm } from "@/features/auth/SignInForm";
import { CatalogPage } from "@/features/catalog/CatalogPage";
import { ThemeProvider } from "@/lib/theme";
import { useTheme } from "@/lib/themeContext";
import { getAuthLinkRoute, type AuthLinkRoute } from "@/lib/urlState";
import { ErrorBoundary } from "./ErrorBoundary";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ThemeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <AppShell />
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </MotionConfig>
  );
}

function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const [authLinkRoute, setAuthLinkRoute] = useState<AuthLinkRoute | null>(() =>
    getAuthLinkRoute(),
  );
  const [showAccountDialog, setShowAccountDialog] = useState(false);

  const handleAuthLinkDone = useCallback(() => {
    const basePath = import.meta.env.BASE_URL || "/";
    window.history.replaceState(null, "", basePath);
    setAuthLinkRoute(null);
  }, []);

  return (
    <div className="ambient-backdrop flex min-h-screen flex-col bg-canvas text-ink">
      {authLinkRoute !== null ? (
        <>
          <MinimalHeader theme={theme} onToggleTheme={toggleTheme} />
          <main className="flex flex-1 flex-col">
            <AuthLinkView route={authLinkRoute} onDone={handleAuthLinkDone} />
          </main>
          <MinimalFooter />
        </>
      ) : (
        <MainContent
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpenAccount={() => setShowAccountDialog(true)}
        />
      )}

      <AccountDialog
        open={showAccountDialog}
        onOpenChange={setShowAccountDialog}
      />
      <Toaster
        theme={theme}
        richColors
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast:
              "!rounded-xl !border !border-border-strong/70 !shadow-xl !font-sans",
          },
        }}
      />
    </div>
  );
}

function MinimalHeader({
  theme,
  onToggleTheme,
}: {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border-subtle/70 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-white shadow-[0_4px_16px_color-mix(in_oklab,var(--color-primary)_40%,transparent)]">
            <Gamepad2 className="size-5" />
          </div>
          <span className="font-display text-base font-extrabold tracking-tight text-ink">
            Game Catalog
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
      </div>
    </header>
  );
}

function MinimalFooter() {
  return (
    <footer className="border-t border-border-subtle/60 px-4 py-4 text-xs text-ink-muted sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <span>© {new Date().getFullYear()} Game Catalog</span>
        <span className="font-mono text-[11px]">v{__APP_VERSION__}</span>
      </div>
    </footer>
  );
}

function MainContent({
  theme,
  onToggleTheme,
  onOpenAccount,
}: {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onOpenAccount: () => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-white shadow-lg">
          <Gamepad2 className="size-6" />
        </div>
        <Spinner className="size-6" label="Checking session" />
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <CatalogPage onOpenAccount={onOpenAccount} />
      </Authenticated>

      <Unauthenticated>
        <MinimalHeader theme={theme} onToggleTheme={onToggleTheme} />
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center px-4 py-10 sm:px-6 lg:py-16">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_minmax(0,440px)] lg:gap-16">
            {/* Editorial hero */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-3.5 py-1 text-xs font-semibold text-primary-soft-ink">
                <Sparkles className="size-3.5" />
                Your unified personal game vault
              </div>

              <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
                Every game you own,{" "}
                <span className="bg-gradient-to-r from-primary via-violet-400 to-sky-400 bg-clip-text text-transparent">
                  beautifully organized.
                </span>
              </h1>

              <p className="mx-auto max-w-xl text-base leading-relaxed text-ink-secondary lg:mx-0">
                Unify your Steam, Epic, GOG, PlayStation, Xbox, and Switch
                collections into one instant, filterable catalog enriched with
                RAWG artwork, Metacritic scores, and personal play logs.
              </p>

              <div className="grid grid-cols-1 gap-3 pt-2 text-left sm:grid-cols-3">
                <FeaturePill
                  icon={<CloudDownload className="size-4 text-sky-400" />}
                  title="Steam Sync"
                  desc="Import owned games & playtime in background chunks"
                />
                <FeaturePill
                  icon={<Layers className="size-4 text-violet-400" />}
                  title="10 Storefronts"
                  desc="Track multi-store ownership & play statuses"
                />
                <FeaturePill
                  icon={<Sparkles className="size-4 text-amber-400" />}
                  title="Instant Facets"
                  desc="Filter by platform, genre, rating & shareable URLs"
                />
              </div>
            </div>

            {/* Auth card */}
            <div className="mx-auto w-full max-w-md lg:mx-0">
              <SignInForm />
            </div>
          </div>
        </main>
        <MinimalFooter />
      </Unauthenticated>
    </>
  );
}

function FeaturePill({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface/80 p-3.5 backdrop-blur-xs">
      <div className="mb-2 inline-flex size-8 items-center justify-center rounded-lg bg-surface-muted">
        {icon}
      </div>
      <div className="text-sm font-bold text-ink">{title}</div>
      <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{desc}</p>
    </div>
  );
}

export default App;
