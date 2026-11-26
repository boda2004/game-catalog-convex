import { useAuthActions } from "@convex-dev/auth/react";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { Gamepad2, LogOut, UserCog } from "lucide-react";
import { useCallback, useState } from "react";
import { Toaster } from "sonner";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { AccountDialog } from "@/features/auth/AccountDialog";
import { AuthLinkView } from "@/features/auth/AuthLinkViews";
import { SignInForm } from "@/features/auth/SignInForm";
import { CatalogPage } from "@/features/catalog/CatalogPage";
import { getAuthLinkRoute, type AuthLinkRoute } from "@/lib/urlState";
import { ErrorBoundary } from "./ErrorBoundary";

export function App() {
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
    <ErrorBoundary>
      <div className="flex min-h-screen flex-col bg-canvas text-ink">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border-subtle bg-surface/95 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-lg border border-border-strong bg-surface-subtle text-primary">
              <Gamepad2 className="size-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-ink">
              Game Catalog
            </span>
          </div>

          <Authenticated>
            <HeaderActions onOpenAccount={() => setShowAccountDialog(true)} />
          </Authenticated>
        </header>

        <main className="flex-1">
          {authLinkRoute !== null ? (
            <AuthLinkView route={authLinkRoute} onDone={handleAuthLinkDone} />
          ) : (
            <MainContent />
          )}
        </main>

        <footer className="border-t border-border-subtle bg-surface/80 px-4 py-3 text-xs text-ink-muted">
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between">
            <span>© {new Date().getFullYear()} Game Catalog</span>
            <span>v{__APP_VERSION__}</span>
          </div>
        </footer>

        <AccountDialog
          open={showAccountDialog}
          onOpenChange={setShowAccountDialog}
        />
        <Toaster richColors position="bottom-right" />
      </div>
    </ErrorBoundary>
  );
}

function HeaderActions({ onOpenAccount }: { onOpenAccount: () => void }) {
  const { signOut } = useAuthActions();

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={onOpenAccount}>
        <UserCog className="size-4" />
        <span className="hidden sm:inline">Account</span>
      </Button>
      <Button variant="secondary" size="sm" onClick={() => void signOut()}>
        <LogOut className="size-3.5" />
        Sign out
      </Button>
    </div>
  );
}

function MainContent() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Spinner className="size-8" label="Checking session" />
      </div>
    );
  }

  return (
    <>
      <Authenticated>
        <CatalogPage />
      </Authenticated>

      <Unauthenticated>
        <div className="mx-auto flex min-h-[calc(100vh-7.5rem)] max-w-5xl flex-col items-center justify-center gap-6 px-4 py-12">
          <div className="max-w-lg text-center">
            <h1 className="text-4xl font-bold tracking-tight text-ink">
              Game Catalog
            </h1>
            <p className="mt-2.5 text-base text-ink-secondary">
              Track, filter, and organize your personal game library across
              every storefront.
            </p>
          </div>
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
    </>
  );
}

export default App;
